// Décodabilité graphophonémique — logique inspirée d'Anagraph (ENS Lyon,
// anagraph.ens-lyon.fr), socle scientifique vérifié dans le corpus RISS
// (Boggio & Bosse, 2022, hal-03811405 ; Boggio, Leclercq-Samson & Bosse,
// 2024, hal-04659756). Anagraph n'a pas d'export/API public documenté
// (vérifié par WebFetch le 2026-09-14) : cette table de progression est
// une construction propre à LisiblActif, éditable par l'enseignant dans
// l'UI plutôt qu'importée depuis Anagraph.

export const PROGRESSION_CP_DEFAUT = [
  { etape: 1, graphemes: ['a', 'i', 'o', 'u', 'l', 'm', 'r'] },
  { etape: 2, graphemes: ['e', 't', 'p', 'n', 'f'] },
  { etape: 3, graphemes: ['s', 'd', 'c', 'v', 'ou'] },
  { etape: 4, graphemes: ['on', 'an', 'in', 'b', 'j'] },
  { etape: 5, graphemes: ['ch', 'qu', 'g', 'eu', 'oi'] },
  { etape: 6, graphemes: ['gn', 'ai', 'au', 'eau', 'ille'] },
]

export function graphemesJusquaEtape(etape, progression = PROGRESSION_CP_DEFAUT) {
  return progression
    .filter(p => p.etape <= etape)
    .flatMap(p => p.graphemes)
}

export function motEstDecodable(mot, graphemesConnus) {
  const nettoye = mot.toLowerCase().replace(/[^a-zàâäéèêëïîôöùûüœæç]/g, '')
  if (!nettoye) return true

  const tokens = [...graphemesConnus].sort((a, b) => b.length - a.length)
  let reste = nettoye
  while (reste.length > 0) {
    const trouve = tokens.find(t => reste.startsWith(t))
    if (!trouve) return false
    reste = reste.slice(trouve.length)
  }
  return true
}

export function tauxDecodabilite(texte, graphemesConnus) {
  const mots = texte.trim().split(/\s+/).filter(Boolean)
  if (mots.length === 0) return null
  const decodables = mots.filter(mot => motEstDecodable(mot, graphemesConnus))
  return Math.round((decodables.length / mots.length) * 100)
}
