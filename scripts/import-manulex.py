#!/usr/bin/env python3
"""
Convertit le fichier Excel officiel Manulex (Lété, Sprenger-Charolles & Colé,
2004) en src/data/frequenceLexicale.json, au format attendu par
src/lib/manulex.js : { motNormalise: 'P1' | 'P2' | 'P3' }.

Source : https://www.manulex.org/fr/downloads.html — "Fichier Excel de Manulex"
(licence Creative Commons BY-NC-SA 3.0 — non-commercial, paternité obligatoire,
partage à l'identique). Citer Lété, B., Sprenger-Charolles, L. & Colé, P. (2004)
partout où ces données sont utilisées.

Format réel de la feuille LEMMES (vérifié le 2026-09-14, 23 813 lignes) :
colonnes LEMMES, NLET, SYNT, puis pour chaque tranche CP / CE1 / CE2-CM2 :
F (fréquence brute), D (dispersion), U (fréquence/million), SFI. Il n'y a PAS
de colonne par année scolaire individuelle : CE2, CM1 et CM2 sont regroupés
en une seule tranche "CE2-CM2".

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

Un mot n'est retenu à un niveau que s'il y apparaît au moins SEUIL_FREQUENCE
fois dans l'échantillon Manulex de cette tranche, pour écarter le bruit des
occurrences isolées (nom de personnage dans un seul manuel, coquille...).

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
from pathlib import Path

SEUIL_FREQUENCE = 3

NIVEAUX_COLONNES = [
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
    sh = wb.sheet_by_name('LEMMES')
    en_tete = sh.row_values(0)

    try:
        idx_lemme = en_tete.index('LEMMES')
        idx_colonnes = [(niveau, en_tete.index(col)) for niveau, col in NIVEAUX_COLONNES]
    except ValueError as exc:
        raise SystemExit(
            f"Colonne attendue absente de l'en-tête ({exc}). "
            f"En-tête trouvé : {en_tete}\n"
            "Le format du fichier Manulex a peut-être changé depuis l'écriture de ce script."
        )

    resultat = {}
    lignes_ignorees = 0
    for r in range(1, sh.nrows):
        row = sh.row_values(r)
        lemme = normaliser(str(row[idx_lemme]))
        if not lemme:
            lignes_ignorees += 1
            continue

        trouve = False
        for niveau, idx in idx_colonnes:
            frequence = row[idx]
            if isinstance(frequence, (int, float)) and frequence >= SEUIL_FREQUENCE:
                resultat.setdefault(lemme, niveau)
                trouve = True
                break
        if not trouve:
            lignes_ignorees += 1

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
    print(f"{lignes_ignorees} ligne(s) ignorée(s) (lemme vide ou fréquence < {SEUIL_FREQUENCE} partout).")


if __name__ == '__main__':
    main()
