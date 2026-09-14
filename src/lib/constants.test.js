import { describe, it, expect } from 'vitest'
import { NIVEAUX_PRIMAIRE, NIVEAUX_SECONDAIRE, seuilPhraseLongue, estNiveauPrecoce } from './constants'

describe('constants', () => {
  it('sépare primaire et secondaire', () => {
    expect(NIVEAUX_PRIMAIRE).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'])
    expect(NIVEAUX_SECONDAIRE).toEqual(['S1', 'S2', 'S3', 'S4', 'S5', 'S6'])
  })

  it('donne un seuil de phrase longue plus bas pour les petites classes', () => {
    expect(seuilPhraseLongue('P1')).toBeLessThan(seuilPhraseLongue('S6'))
  })

  it('identifie P1-P3 comme niveaux précoces (module décodabilité)', () => {
    expect(estNiveauPrecoce('P2')).toBe(true)
    expect(estNiveauPrecoce('P4')).toBe(false)
    expect(estNiveauPrecoce('S1')).toBe(false)
  })
})
