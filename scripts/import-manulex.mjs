// Convertit un export brut Manulex (colonnes : lemme, niveau_1, ... niveau_6,
// une valeur de fréquence par colonne — format distribué par les auteurs
// pour usage académique) en src/data/frequenceLexicale.json, au format
// attendu par src/lib/manulex.js : { motNormalise: 'P1' | 'P2' | ... }
//
// Usage : node scripts/import-manulex.mjs chemin/vers/export-manulex.csv
//
// Le fichier source n'est pas fourni avec ce dépôt : il doit être obtenu
// séparément (voir scripts/README.md) sous licence académique auprès du
// projet Manulex.

import { readFileSync, writeFileSync } from 'node:fs'

const NIVEAUX_COLONNES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

function normaliser(mot) {
  return mot
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z-]/g, '')
}

function convertir(cheminCsv) {
  const contenu = readFileSync(cheminCsv, 'utf-8')
  const lignes = contenu.split('\n').filter(Boolean)
  const [enTete, ...donnees] = lignes

  const resultat = {}
  for (const ligne of donnees) {
    const colonnes = ligne.split(',')
    const lemme = normaliser(colonnes[0])
    if (!lemme) continue

    for (let i = 0; i < NIVEAUX_COLONNES.length; i++) {
      const frequence = Number(colonnes[i + 1] || 0)
      if (frequence > 0) {
        resultat[lemme] = NIVEAUX_COLONNES[i]
        break
      }
    }
  }
  return resultat
}

const [, , cheminCsv] = process.argv
if (!cheminCsv) {
  console.error('Usage : node scripts/import-manulex.mjs chemin/vers/export-manulex.csv')
  process.exit(1)
}

const dataset = convertir(cheminCsv)
writeFileSync('src/data/frequenceLexicale.json', JSON.stringify(dataset, null, 2))
console.log(`${Object.keys(dataset).length} mots exportés vers src/data/frequenceLexicale.json`)
