const REFERENCES = [
  {
    titre: 'Kandel, L. & Moles, A. (1958)',
    detail: "Adaptation française de la formule de lisibilité de Flesch (1948). Utilisée pour le score global de lisibilité.",
    riss: 'Vérifié via 6 articles du corpus RISS, dont Behnam (2013, hal-01002368) et Fourchon & Colonne (2014, dumas-01086428).',
  },
  {
    titre: 'Manulex — Lété, B., Sprenger-Charolles, L. & Colé, P. (2004)',
    detail: 'Base de données de fréquence lexicale calculée sur 54 manuels scolaires français, utilisée pour détecter les mots hors-niveau.',
    riss: 'Vérifié via Gala, François, Bernhard & Fairon (2014, hal-01001916) et Grossmann (2018, hal-04807000).',
  },
  {
    titre: 'Gala, N., François, T., Bernhard, D. & Fairon, C. (2014)',
    detail: "Modèle de prédiction de la complexité lexicale et de graduation des mots par niveau scolaire.",
    riss: 'hal-01001916',
  },
  {
    titre: 'Boggio, C. & Bosse, M.-L. (2022)',
    detail: "Le taux de décodabilité des textes est important pour l'apprentissage de la lecture au CP — socle scientifique du module de décodabilité (P1-P3).",
    riss: 'hal-03811405',
  },
  {
    titre: 'Anagraph (ENS Lyon)',
    detail: "Outil de calcul de décodabilité pour le CP. Réel, cité dans le corpus RISS (Deauvieau & Gioia, 2024, halshs-04855104). Pas d'API ni d'export public documenté — LisiblActif construit sa propre table de progression graphème-phonème dans le même esprit scientifique, éditable par l'enseignant.",
    riss: 'halshs-04855104 (mention) — vérifié directement sur anagraph.ens-lyon.fr le 2026-09-14',
  },
]

export default function References() {
  return (
    <div className="plai-section">
      <h2>Références scientifiques</h2>
      <p style={{ color: 'var(--text2)', marginBottom: '1.5rem' }}>
        Toutes les références ci-dessous ont été vérifiées dans le corpus RISS avant d'être utilisées dans LisiblActif.
      </p>
      {REFERENCES.map((ref, i) => (
        <div key={i} className="plai-card">
          <p><strong>{ref.titre}</strong></p>
          <p style={{ fontSize: '14px' }}>{ref.detail}</p>
          <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{ref.riss}</p>
        </div>
      ))}
    </div>
  )
}
