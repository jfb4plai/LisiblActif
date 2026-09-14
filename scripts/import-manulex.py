#!/usr/bin/env python3
"""
Convertit le fichier Excel officiel Manulex (Lété, Sprenger-Charolles & Colé,
2004) en src/data/frequenceLexicale.json, au format attendu par
src/lib/manulex.js : { motNormalise: 'P1' | 'P2' | 'P3' }.

Source : https://www.manulex.org/fr/downloads.html — "Fichier Excel de Manulex"
(licence Creative Commons BY-NC-SA 3.0 — non-commercial, paternité obligatoire,
partage à l'identique). Citer Lété, B., Sprenger-Charolles, L. & Colé, P. (2004)
partout où ces données sont utilisées.

Feuille utilisée : FORMES ORTHO (formes orthographiques telles qu'elles
apparaissent réellement dans un texte), PAS la feuille LEMMES (dictionnaire).
Une première version de ce script utilisait LEMMES : Manulex y lemmatise les
verbes conjugués sous leur infinitif ("est" n'existe pas comme lemme verbal,
la fréquence est comptée sous "être"), et un mot comme "est" n'y apparaît que
comme trois homographes rares (adjectif, nom commun, nom propre "l'Est") —
résultat : "est" aurait été classé P3 (quasiment jamais vu) alors que c'est
un des mots les plus fréquents du français. FORMES ORTHO compte les formes
telles qu'écrites, ce qui correspond à l'usage de cette app (elle compare des
mots d'un texte tels quels, pas des lemmes).

Chaque forme orthographique peut apparaître sur plusieurs lignes de FORMES
ORTHO (une par catégorie grammaticale — homographes comme "est" verbe /
"Est" nom propre). Les fréquences de toutes les lignes partageant la même
forme normalisée sont additionnées avant de déterminer le niveau, pour ne
pas retomber sur le même problème avec un homographe rare qui masquerait un
homographe très fréquent.

Format réel de la feuille (vérifié le 2026-09-14, 48 887 lignes) : colonnes
FORMES ORTHOGRAPHIQUES, NLET, SYNT, puis pour chaque tranche CP / CE1 /
CE2-CM2 : F (fréquence brute), D (dispersion), U (fréquence/million), SFI.
Pas de colonne par année scolaire individuelle : CE2, CM1 et CM2 sont
regroupés en une seule tranche "CE2-CM2".

Mapping vers les niveaux FWB :
  CP       -> P1  (CP = système français, équivalent 1re primaire en FWB)
  CE1      -> P2
  CE2-CM2  -> P3  (première année de la tranche, faute de détail par année ;
                    un mot qui n'apparaît qu'en CM2 sera donc traité comme
                    "connu dès P3", légèrement optimiste pour un enseignant
                    de P3 strict)

LIMITE IMPORTANTE : Manulex ne couvre que les manuels de lecture du primaire
français (CP à CM2, donc P1 à P3-P5 FWB). Il n'y a AUCUNE donnée secondaire
(S1-S6) dans cette base — la détection de mots hors-niveau restera sans effet
pour les textes destinés au secondaire, quel que soit l'import réalisé ici.

Une forme n'est retenue à un niveau que si la somme de ses occurrences (tous
homographes confondus) atteint SEUIL_FREQUENCE dans l'échantillon Manulex de
cette tranche, pour écarter le bruit des occurrences isolées.

Usage : python scripts/import-manulex.py chemin/vers/Manulex.xls
Nécessite le paquet xlrd (pip install xlrd) — pas de nouvelle dépendance npm :
le fichier xls de Manulex est au format binaire historique (BIFF/OLE2), et le
paquet npm 'xlsx' (SheetJS) a des failles connues sans correctif disponible
(prototype pollution, ReDoS) — écarté pour cette raison.
"""

import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

SEUIL_FREQUENCE = 3

COLONNES_NIVEAUX = [
    ('P1', 'CP F'),
    ('P2', 'CE1 F'),
    ('P3', 'CE2-CM2 F'),
]


def normaliser(mot):
    mot = mot.lower()
    mot = ''.join(c for c in unicodedata.normalize('NFD', mot) if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z-]', '', mot)


def convertir(chemin_xls):
    import xlrd

    wb = xlrd.open_workbook(chemin_xls)
    sh = wb.sheet_by_name('FORMES ORTHO')
    en_tete = sh.row_values(0)

    try:
        idx_forme = 0
        idx_colonnes = [(niveau, en_tete.index(col)) for niveau, col in COLONNES_NIVEAUX]
    except ValueError as exc:
        raise SystemExit(
            f"Colonne attendue absente de l'en-tête ({exc}). "
            f"En-tête trouvé : {en_tete}\n"
            "Le format du fichier Manulex a peut-être changé depuis l'écriture de ce script."
        )

    # Somme les fréquences de toutes les lignes (homographes) partageant la
    # même forme normalisée, par tranche de niveau.
    frequences = defaultdict(lambda: [0, 0, 0])
    lignes_ignorees = 0
    for r in range(1, sh.nrows):
        row = sh.row_values(r)
        forme = normaliser(str(row[idx_forme]))
        if not forme:
            lignes_ignorees += 1
            continue
        for i, (_, idx) in enumerate(idx_colonnes):
            valeur = row[idx]
            if isinstance(valeur, (int, float)):
                frequences[forme][i] += valeur

    resultat = {}
    for forme, valeurs in frequences.items():
        for i, (niveau, _) in enumerate(idx_colonnes):
            if valeurs[i] >= SEUIL_FREQUENCE:
                resultat[forme] = niveau
                break

    return resultat, lignes_ignorees


def main():
    if len(sys.argv) != 2:
        print('Usage : python scripts/import-manulex.py chemin/vers/Manulex.xls', file=sys.stderr)
        sys.exit(1)

    chemin_xls = sys.argv[1]
    resultat, lignes_ignorees = convertir(chemin_xls)

    sortie = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'frequenceLexicale.json'
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text(json.dumps(resultat, ensure_ascii=False, indent=2, sort_keys=True), encoding='utf-8')

    print(f"{len(resultat)} mots exportés vers {sortie}")
    print(f"{lignes_ignorees} ligne(s) ignorée(s) (forme vide).")


if __name__ == '__main__':
    main()
