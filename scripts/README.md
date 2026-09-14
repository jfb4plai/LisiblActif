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
- **Limite importante** : Manulex ne couvre que les manuels de lecture du
  primaire français (CP à CM2). Il n'y a **aucune donnée secondaire**
  (S1-S6) — `detecterMotsHorsNiveau` ne peut signaler des mots hors-niveau
  que sur des textes destinés au primaire FWB (P1-P3), jamais au secondaire.

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
