// Score de lisibilité — Kandel, L. & Moles, A. (1958), adaptation française
// de la formule de Flesch (1948). Formule et grille d'interprétation
// vérifiées dans le corpus RISS (Behnam, 2013, hal-01002368 ;
// Fourchon & Colonne, 2014, dumas-01086428).
//
// Lisibilité = 207 - 1.015 * (mots par phrase) - 0.736 * (syllabes pour 100 mots)

const VOYELLES = 'aeiouyàâäéèêëïîôöùûüœæ'
const RE_GROUPES_VOYELLES = new RegExp(`[${VOYELLES}]+`, 'gi')

// Approximation par comptage de groupes vocaliques (pas une syllabation
// phonétique réelle : ignore le e muet, l'élision, etc.) — suffisant pour
// la formule de lisibilité, qui utilise cette même convention de comptage.
export function compterSyllabes(mot) {
  const groupes = mot.match(RE_GROUPES_VOYELLES)
  return groupes ? groupes.length : 1
}

// Découpage naïf sur .!?… — suppose un texte sans abréviations à points
// (M., etc., p.ex.) ni nombres décimaux, qui seraient lus à tort comme des
// fins de phrase et fausseraient le score.
export function decouperPhrases(texte) {
  return texte
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .filter(p => p.trim().length > 0)
}

function decouperMots(texte) {
  return texte.trim().split(/\s+/).filter(Boolean)
}

export function scoreKandelMoles(texte) {
  const mots = decouperMots(texte)
  const phrases = decouperPhrases(texte)
  if (mots.length === 0 || phrases.length === 0) return null

  const motsParPhrase = mots.length / phrases.length
  const nbSyllabes = mots.reduce((total, mot) => total + compterSyllabes(mot), 0)
  const syllabesPour100Mots = (nbSyllabes / mots.length) * 100

  const score = 207 - 1.015 * motsParPhrase - 0.736 * syllabesPour100Mots
  return Math.max(0, Math.min(100, Math.round(score)))
}

const GRILLE_INTERPRETATION = [
  { min: 90, label: 'très facile' },
  { min: 80, label: 'facile' },
  { min: 70, label: 'assez facile' },
  { min: 60, label: 'standard' },
  { min: 50, label: 'assez difficile' },
  { min: 30, label: 'difficile' },
  { min: 0,  label: 'très difficile' },
]

export function interpreterScore(score) {
  if (score === null || score === undefined) return null
  return GRILLE_INTERPRETATION.find(niveau => score >= niveau.min).label
}
