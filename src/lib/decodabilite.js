// Décodabilité graphophonémique — logique inspirée d'Anagraph (ENS Lyon,
// anagraph.ens-lyon.fr), socle scientifique vérifié dans le corpus RISS
// (Boggio & Bosse, 2022, hal-03811405 ; Boggio, Leclercq-Samson & Bosse,
// 2024, hal-04659756). Anagraph n'a pas d'export/API public documenté
// (vérifié par WebFetch le 2026-09-14) : cette table de progression est
// une construction propre à LisiblActif, éditable par l'enseignant dans
// l'UI plutôt qu'importée depuis Anagraph.
//
// Nommage FWB : pas de "CP" (Cours Préparatoire, système français) — cette
// progression couvre le début de l'apprentissage de la lecture en primaire
// FWB (P1-P3, voir NIVEAUX_PRECOCES dans constants.js), sans être rattachée
// à une seule année ; l'enseignant règle lui-même l'étape via le curseur.

export const PROGRESSION_GRAPHEMES_DEFAUT = [
  { etape: 1, graphemes: ['a', 'i', 'o', 'u', 'l', 'm', 'r'] },
  { etape: 2, graphemes: ['e', 't', 'p', 'n', 'f'] },
  { etape: 3, graphemes: ['s', 'd', 'c', 'v', 'ou'] },
  { etape: 4, graphemes: ['on', 'an', 'in', 'b', 'j'] },
  { etape: 5, graphemes: ['ch', 'qu', 'g', 'eu', 'oi'] },
  { etape: 6, graphemes: ['gn', 'ai', 'au', 'eau', 'ille'] },
]

export function graphemesJusquaEtape(etape, progression = PROGRESSION_GRAPHEMES_DEFAUT) {
  return progression
    .filter(p => p.etape <= etape)
    .flatMap(p => p.graphemes)
}

// Réduit le mot aux lettres a-z, accents retirés (comme les graphèmes de
// PROGRESSION_GRAPHEMES_DEFAUT sont tous non accentués). Sans ça, "école" ne
// pourrait jamais matcher le graphème "e" et serait à tort jugé
// indécodable — même limitation que la normalisation utilisée dans
// manulex.js, appliquée ici pour la même raison.
function nettoyerMot(mot) {
  return mot
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '')
}

// Vérifie si `reste` peut être entièrement découpé en graphèmes connus.
// Essaie CHAQUE graphème qui préfixe `reste` (pas seulement le plus long)
// et rebrousse chemin si un choix mène à une impasse — un simple choix
// glouton du plus long préfixe peut échouer sur un mot pourtant décodable
// quand deux graphèmes connus partagent un préfixe (ex. graphèmes ['ab',
// 'bb', 'a'] sur le mot "abb" : gloutonnement "ab" puis "b" échoue, alors
// que "a" + "bb" est une segmentation valide).
function peutSegmenter(reste, tokens, memo) {
  if (reste.length === 0) return true
  if (memo.has(reste)) return memo.get(reste)

  const possible = tokens.some(t => reste.startsWith(t) && peutSegmenter(reste.slice(t.length), tokens, memo))
  memo.set(reste, possible)
  return possible
}

export function motEstDecodable(mot, graphemesConnus) {
  const nettoye = nettoyerMot(mot)
  if (!nettoye) return true

  const tokens = [...new Set(graphemesConnus)].filter(Boolean)
  return peutSegmenter(nettoye, tokens, new Map())
}

export function tauxDecodabilite(texte, graphemesConnus) {
  const mots = texte.trim().split(/\s+/).filter(Boolean)
  if (mots.length === 0) return null
  const decodables = mots.filter(mot => motEstDecodable(mot, graphemesConnus))
  return Math.round((decodables.length / mots.length) * 100)
}
