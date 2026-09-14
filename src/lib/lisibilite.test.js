import { describe, it, expect } from 'vitest'
import { compterSyllabes, decouperPhrases, scoreKandelMoles, interpreterScore } from './lisibilite'

describe('compterSyllabes', () => {
  it('compte un groupe de voyelles consécutives comme une seule syllabe', () => {
    expect(compterSyllabes('chaque')).toBe(2) // a, ue
    expect(compterSyllabes('silencieuse')).toBe(4) // i, e, ieu, e
  })

  it('retourne au moins 1 pour un mot sans voyelle reconnue', () => {
    expect(compterSyllabes('brrr')).toBe(1)
  })
})

describe('decouperPhrases', () => {
  it('découpe sur les points, points d\'exclamation et d\'interrogation', () => {
    const phrases = decouperPhrases('Il pleut. Tu sors ? Attends !')
    expect(phrases).toEqual(['Il pleut.', 'Tu sors ?', 'Attends !'])
  })
})

describe('scoreKandelMoles', () => {
  it('calcule le score selon la formule 207 - 1.015*(mots/phrase) - 0.736*(syllabes/100mots)', () => {
    const texte = 'Les enfants apprennent patiemment la lecture silencieuse chaque matin studieusement.'
    // 1 phrase, 10 mots, 25 syllabes (groupes de voyelles) → 207 - 10.15 - 184 = 12.85 → 13
    expect(scoreKandelMoles(texte)).toBe(13)
  })

  it('retourne null pour un texte vide', () => {
    expect(scoreKandelMoles('')).toBeNull()
  })

  it('plafonne le score à 100', () => {
    const texte = 'Le chat dort.'
    expect(scoreKandelMoles(texte)).toBeLessThanOrEqual(100)
  })
})

describe('interpreterScore', () => {
  it('classe un score de 13 comme très difficile', () => {
    expect(interpreterScore(13)).toBe('très difficile')
  })

  it('classe un score de 95 comme très facile', () => {
    expect(interpreterScore(95)).toBe('très facile')
  })
})
