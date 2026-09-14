import { describe, it, expect } from 'vitest'
import { motEstDecodable, tauxDecodabilite, graphemesJusquaEtape, PROGRESSION_GRAPHEMES_DEFAUT } from './decodabilite'

describe('motEstDecodable', () => {
  it('un mot est décodable si chaque lettre est un graphème connu', () => {
    expect(motEstDecodable('lili', ['l', 'i'])).toBe(true)
  })

  it('un mot n\'est pas décodable si une lettre est inconnue', () => {
    expect(motEstDecodable('chat', ['a', 't'])).toBe(false)
  })

  it('priorise les digraphes connus sur les lettres simples', () => {
    expect(motEstDecodable('chat', ['ch', 'a', 't'])).toBe(true)
  })

  it('retire les accents avant de comparer aux graphèmes (tous non accentués)', () => {
    expect(motEstDecodable('ecole', ['e', 'c', 'o', 'l'])).toBe(true)
    expect(motEstDecodable('école', ['e', 'c', 'o', 'l'])).toBe(true)
  })

  it('rebrousse chemin quand le plus long préfixe mène à une impasse', () => {
    // "ab" (glouton) laisserait "b" non reconnu ; "a" + "bb" est une
    // segmentation valide que seul un algorithme avec retour en arrière trouve.
    expect(motEstDecodable('abb', ['ab', 'bb', 'a'])).toBe(true)
  })
})

describe('graphemesJusquaEtape', () => {
  it('cumule les graphèmes des étapes précédentes', () => {
    const graphemes = graphemesJusquaEtape(2, PROGRESSION_GRAPHEMES_DEFAUT)
    expect(graphemes).toContain('a')
    expect(graphemes).toContain('t')
    expect(graphemes).not.toContain('ch')
  })
})

describe('tauxDecodabilite', () => {
  it('calcule le pourcentage de mots décodables avec les graphèmes fournis', () => {
    const graphemes = graphemesJusquaEtape(2, PROGRESSION_GRAPHEMES_DEFAUT)
    expect(tauxDecodabilite('il a chat', graphemes)).toBe(67) // 2 mots décodables sur 3
  })

  it('retourne null pour un texte vide', () => {
    expect(tauxDecodabilite('', ['a'])).toBeNull()
  })
})
