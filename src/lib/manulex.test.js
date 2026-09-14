import { describe, it, expect } from 'vitest'
import { estConnuAuNiveau, detecterMotsHorsNiveau, FREQUENCE_LEXICALE, NIVEAUX_ORDRE } from './manulex'

// Jeu de données isolé pour tester la logique indépendamment du contenu réel
// de Manulex — un futur ré-import avec un autre seuil de fréquence ne doit
// pas casser ces tests.
const DATASET_TEST = {
  chat: 'P1',
  ecole: 'P1',
  gouvernement: 'P3',
}

describe('NIVEAUX_ORDRE', () => {
  it('couvre le primaire puis le secondaire dans l\'ordre', () => {
    expect(NIVEAUX_ORDRE).toEqual(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'])
  })
})

describe('estConnuAuNiveau', () => {
  it('un mot introduit tôt est connu à un niveau plus tardif', () => {
    expect(estConnuAuNiveau('chat', 'P3', DATASET_TEST)).toBe(true)
  })

  it('un mot introduit tard n\'est pas connu à un niveau précoce', () => {
    expect(estConnuAuNiveau('gouvernement', 'P2', DATASET_TEST)).toBe(false)
  })

  it('un mot absent du référentiel retourne null (non évalué, pas signalé comme rare)', () => {
    expect(estConnuAuNiveau('zyzzyva', 'P3', DATASET_TEST)).toBeNull()
  })

  it('ignore la casse et les accents', () => {
    expect(estConnuAuNiveau('École', 'P1', DATASET_TEST)).toBe(true)
  })

  it('un mot introduit exactement au niveau cible est connu', () => {
    expect(estConnuAuNiveau('gouvernement', 'P3', DATASET_TEST)).toBe(true)
  })
})

describe('detecterMotsHorsNiveau', () => {
  it('ne signale que les mots confirmés au-dessus du niveau cible', () => {
    const resultat = detecterMotsHorsNiveau('Le chat et le gouvernement', 'P2', DATASET_TEST)
    expect(resultat).toEqual(['gouvernement'])
  })

  it('découpe sur les apostrophes pour ne pas fusionner une élision avec le mot suivant', () => {
    const resultat = detecterMotsHorsNiveau("L'école est fermée", 'P2', { ecole: 'P3' })
    expect(resultat).toEqual(['école'])
  })
})

describe('FREQUENCE_LEXICALE (corpus Manulex réel)', () => {
  it('charge le corpus complet, pas une liste de démarrage', () => {
    // Import réel : > 10 000 mots (vs. ~35 pour l'ancienne liste de
    // démarrage codée en dur) — vérifie que le JSON importé est bien utilisé.
    expect(Object.keys(FREQUENCE_LEXICALE).length).toBeGreaterThan(10000)
  })

  it('un mot extrêmement fréquent est classé P1', () => {
    expect(FREQUENCE_LEXICALE.le).toBe('P1')
  })

  it('ne contient aucun niveau secondaire — Manulex ne couvre que le primaire', () => {
    const niveaux = new Set(Object.values(FREQUENCE_LEXICALE))
    for (const niveau of niveaux) {
      expect(niveau).toMatch(/^P[1-3]$/)
    }
  })
})
