export const NIVEAUX_PRIMAIRE = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
export const NIVEAUX_SECONDAIRE = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']
export const TOUS_NIVEAUX = [...NIVEAUX_PRIMAIRE, ...NIVEAUX_SECONDAIRE]

// Seuil de longueur (nombre de mots) au-delà duquel une phrase est
// surlignée comme "trop longue" pour le niveau — décision de conception
// produit, pas une donnée issue de la recherche.
const SEUILS_PHRASE_LONGUE = {
  P1: 6, P2: 8, P3: 10, P4: 12, P5: 14, P6: 15,
  S1: 18, S2: 20, S3: 22, S4: 24, S5: 25, S6: 25,
}

export function seuilPhraseLongue(niveau) {
  return SEUILS_PHRASE_LONGUE[niveau] ?? 15
}

export const NIVEAUX_PRECOCES = NIVEAUX_PRIMAIRE.slice(0, 3)

export function estNiveauPrecoce(niveau) {
  return NIVEAUX_PRECOCES.includes(niveau)
}
