# Import du corpus Manulex complet

La liste de fréquence lexicale livrée dans `src/lib/manulex.js` (V1) est une
liste de démarrage, pas le corpus Manulex complet. Pour l'étendre :

1. Obtenir l'export du corpus Manulex (Lété, Sprenger-Charolles & Colé, 2004)
   auprès des auteurs ou d'un dépôt académique — vérifier les conditions de
   licence pour un usage dans une app pédagogique publique avant de l'intégrer.
2. Convertir l'export en CSV avec les colonnes : lemme, fréquence niveau 1
   (P1), fréquence niveau 2 (P2), ... fréquence niveau 6 (P6).
3. Lancer `node scripts/import-manulex.mjs chemin/vers/export.csv`.
4. Remplacer l'objet `FREQUENCE_LEXICALE` codé en dur dans `src/lib/manulex.js`
   par un chargement de `src/data/frequenceLexicale.json`, sans changer la
   signature des fonctions exportées (les tests de `manulex.test.js` doivent
   continuer à passer sans modification).
