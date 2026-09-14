import { describe, it, expect } from 'vitest'
import { estConnuAuNiveau, detecterMotsHorsNiveau, NIVEAUX_ORDRE } from './manulex'

describe('NIVEAUX_ORDRE', () => {
  it('couvre le primaire puis le secondaire dans l\'ordre', () => {
    expect(NIVEAUX_ORDRE).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'])
  })
})

describe('estConnuAuNiveau', () => {
  it('un mot introduit tôt est connu à un niveau plus tardif', () => {
    expect(estConnuAuNiveau('maman', 'P3')).toBe(true)
  })

  it('un mot introduit tard n\'est pas connu à un niveau précoce', () => {
    expect(estConnuAuNiveau('hypothese', 'P2')).toBe(false)
  })

  it('un mot absent du référentiel retourne null (non évalué, pas signalé comme rare)', () => {
    expect(estConnuAuNiveau('zyzzyva', 'P3')).toBeNull()
  })

  it('ignore la casse et les accents', () => {
    expect(estConnuAuNiveau('École', 'P1')).toBe(true)
  })

  it('un mot introduit exactement au niveau cible est connu', () => {
    expect(estConnuAuNiveau('paradoxe', 'S2')).toBe(true)
  })
})

describe('detecterMotsHorsNiveau', () => {
  it('ne signale que les mots confirmés au-dessus du niveau cible', () => {
    const resultat = detecterMotsHorsNiveau('Le chat et le paradoxe', 'P2')
    expect(resultat).toEqual(['paradoxe'])
  })

  it('découpe sur les apostrophes pour ne pas fusionner une élision avec le mot suivant', () => {
    const resultat = detecterMotsHorsNiveau("L'hypothese est fausse", 'P2')
    expect(resultat).toEqual(['hypothese'])
  })
})
