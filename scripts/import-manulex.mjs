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

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const NIVEAUX_COLONNES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

function normaliser(mot) {
  return mot
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z-]/g, '')
}

// Nombre de colonnes attendu : lemme + une colonne de fréquence par niveau.
const NB_COLONNES_ATTENDU = 1 + NIVEAUX_COLONNES.length

function convertir(cheminCsv) {
  const contenu = readFileSync(cheminCsv, 'utf-8').replace(/\r/g, '')
  const lignes = contenu.split('\n').filter(Boolean)
  const [enTete, ...donnees] = lignes

  // Le format exact du fichier source (délimiteur, colonnes) dépend de ce
  // que l'export académique fournit réellement — non vérifiable tant
  // qu'aucun fichier réel n'a été obtenu. Un en-tête au mauvais nombre de
  // colonnes est le signe le plus probable d'un mauvais délimiteur (ex.
  // point-virgule au lieu de virgule) : on arrête plutôt que de produire un
  // dataset silencieusement corrompu.
  const colonnesEnTete = enTete.split(',')
  if (colonnesEnTete.length !== NB_COLONNES_ATTENDU) {
    console.error(
      `En-tête inattendu : ${colonnesEnTete.length} colonne(s) trouvée(s), ${NB_COLONNES_ATTENDU} attendue(s) ` +
      `(lemme + ${NIVEAUX_COLONNES.join(', ')}). Le fichier utilise peut-être un autre délimiteur que la virgule.`
    )
    process.exit(1)
  }

  const resultat = {}
  let lignesIgnorees = 0
  for (const ligne of donnees) {
    const colonnes = ligne.split(',')
    if (colonnes.length !== NB_COLONNES_ATTENDU) {
      lignesIgnorees++
      continue
    }

    const lemme = normaliser(colonnes[0])
    if (!lemme) {
      lignesIgnorees++
      continue
    }

    for (let i = 0; i < NIVEAUX_COLONNES.length; i++) {
      const frequence = Number(colonnes[i + 1])
      if (Number.isFinite(frequence) && frequence > 0) {
        resultat[lemme] = NIVEAUX_COLONNES[i]
        break
      }
    }
  }
  return { resultat, lignesIgnorees }
}

const [, , cheminCsv] = process.argv
if (!cheminCsv) {
  console.error('Usage : node scripts/import-manulex.mjs chemin/vers/export-manulex.csv')
  process.exit(1)
}

let dataset, lignesIgnorees
try {
  ;({ resultat: dataset, lignesIgnorees } = convertir(cheminCsv))
} catch (err) {
  console.error(`Impossible de lire ${cheminCsv} : ${err.message}`)
  process.exit(1)
}

mkdirSync('src/data', { recursive: true })
writeFileSync('src/data/frequenceLexicale.json', JSON.stringify(dataset, null, 2))
console.log(`${Object.keys(dataset).length} mots exportés vers src/data/frequenceLexicale.json`)
if (lignesIgnorees > 0) {
  console.log(`${lignesIgnorees} ligne(s) ignorée(s) (colonnes manquantes ou lemme vide).`)
}
