# Import du corpus Manulex

`src/data/frequenceLexicale.json` est généré depuis le corpus Manulex complet
(Lété, Sprenger-Charolles & Colé, 2004), importé le 2026-09-14.

- **Source** : [manulex.org/fr/downloads.html](https://www.manulex.org/fr/downloads.html)
  — « Fichier Excel de Manulex » (`Manulex.xls`, ~18 Mo, feuille `FORMES ORTHO`
  — PAS la feuille `LEMMES` : celle-ci lemmatise les verbes conjugués sous
  leur infinitif, "est" y a une fréquence quasi nulle car compté sous "être" ;
  `FORMES ORTHO` compte les formes telles qu'écrites, ce qu'il faut pour
  comparer des mots d'un texte tel quel — piégé une première fois par cette
  différence, voir le commentaire en tête du script).
- **Licence** : Creative Commons BY-NC-SA 3.0 — usage non commercial, citer
  Lété, Sprenger-Charolles & Colé (2004) partout où ces données apparaissent
  (déjà fait sur `src/pages/References.jsx`), toute redistribution du jeu de
  données dérivé doit rester sous la même licence.
- **Limites importantes** :
  - Corpus **français, pas belge** — 54 manuels de lecture du primaire
    français (CP à CM2). Le calibrage par niveau reflète les programmes
    scolaires français, pas nécessairement le rythme d'acquisition FWB, et
    les belgicismes (nonante, septante, farde, essuie...) sont probablement
    absents du corpus : un mot belge courant ne sera pas signalé, non pas
    parce qu'il est jugé connu, mais parce qu'il est simplement absent des
    données Manulex. Aucune base lexicale FWB équivalente n'a été identifiée
    à ce jour — à rechercher si le sujet redevient prioritaire.
  - Il n'y a **aucune donnée secondaire** (S1-S6) — `detecterMotsHorsNiveau`
    ne peut signaler des mots hors-niveau que sur des textes destinés au
    primaire FWB (P1-P3), jamais au secondaire.

## Ré-exécuter l'import (si le fichier source est mis à jour par eManulex)

1. Télécharger `Manulex.xls` depuis la page ci-dessus.
2. `pip install xlrd` (une fois — nécessaire pour lire le format `.xls`
   binaire historique ; le paquet npm `xlsx`/SheetJS a été écarté : failles
   connues sans correctif, prototype pollution et ReDoS).
3. `python scripts/import-manulex.py chemin/vers/Manulex.xls`
   — régénère `src/data/frequenceLexicale.json`. Le mapping exact
   (CP→P1, CE1→P2, CE2-CM2→P3, seuil de fréquence ≥ 3) est documenté en
   commentaire dans le script.
4. Vérifier `npm run test` (le fichier de test ne dépend pas du contenu
   exact du corpus, seulement de sa taille et de sa forme) puis `npm run build`.

## Étendre à une base P4-P6 / secondaire

Manulex ne le permet pas — il faudrait une autre base lexicale couvrant ces
niveaux (voir par exemple FLELex pour le vocabulaire FLE, mentionné comme
piste d'extension non encore vérifiée RISS). Ne pas extrapoler les données
Manulex au-delà de P3 : ce serait présenter comme mesuré ce qui ne l'est pas.

---

# Import des belgicismes (BDLP-Belgique)

`src/data/belgicismes.json` corrige un angle mort de Manulex (corpus
français) : un mot belge courant (nonante, farde, bourgmestre...) que Manulex
classe à tort comme rare/avancé n'est plus signalé comme "hors-niveau" — voir
le commentaire dans `src/lib/manulex.js` (fonction `estConnuAuNiveau`) pour
la sémantique exacte (ça évite un faux signalement, ça ne confirme pas un
niveau).

- **Source** : [bdlp.org/recherche?bases[]=BE](https://www.bdlp.org/recherche?bases[]=BE)
  — 2143 entrées (mots-vedettes + variantes), 2035 formes normalisées
  uniques. Produite par le centre Valibel (UCLouvain, dir. Michel Francard),
  financée par le FNRS et la Communauté Wallonie-Bruxelles.
- **Licence** : contenu public en ligne, pas de licence ouverte affichée,
  issu du *Dictionnaire des belgicismes* (Francard et al., De Boeck, 2010).
  Utilisé comme simple liste de mots (aucune définition ni citation
  reprise), usage non commercial d'intérêt pédagogique FWB.
- **Limite** : ce n'est PAS une base de fréquence graduée par année scolaire
  — impossible d'affirmer "ce mot belge est connu dès P1". Ne sert qu'à
  éviter un faux positif, pas à en tirer un niveau.

## Ré-exécuter l'import

```bash
pip install requests   # une fois
python scripts/import-belgicismes.py
npm run test && npm run build
```
