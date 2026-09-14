const REFERENCES = [
  {
    titre: 'Kandel, L. & Moles, A. (1958)',
    detail: "Adaptation française de la formule de lisibilité de Flesch (1948). Utilisée pour le score global de lisibilité.",
    riss: 'Vérifié via 6 articles du corpus RISS, dont Behnam (2013, hal-01002368) et Fourchon & Colonne (2014, dumas-01086428).',
  },
  {
    titre: 'Manulex — Lété, B., Sprenger-Charolles, L. & Colé, P. (2004)',
    detail: "Base de données de fréquence lexicale calculée sur 54 manuels scolaires FRANÇAIS, pas belges (1,9 million de mots), corpus complet importé sous licence CC BY-NC-SA 3.0 (manulex.org), utilisée pour détecter les mots hors-niveau au primaire (P1-P3). Limites à connaître : (1) le calibrage par niveau reflète les programmes scolaires français, pas nécessairement le rythme d'acquisition FWB — corrigé partiellement pour les belgicismes reconnus (voir BDLP-Belgique ci-dessous), mais pas pour un mot commun aux deux variétés dont la fréquence scolaire diffère sans être un belgicisme répertorié. Manulex ne couvre pas le secondaire : aucune détection de mots hors-niveau n'est possible sur un texte destiné à P4 et au-delà.",
    riss: 'Vérifié via Gala, François, Bernhard & Fairon (2014, hal-01001916) et Grossmann (2018, hal-04807000).',
  },
  {
    titre: 'BDLP-Belgique (Base de données lexicographiques panfrancophone, section Belgique)',
    detail: "2035 formes régionales belges (nonante, septante, farde, essuie, bourgmestre, kot...), produites par le centre Valibel (UCLouvain, dir. Michel Francard), financées par le FNRS et la Communauté Wallonie-Bruxelles, issues du Dictionnaire des belgicismes (Francard et al., De Boeck, 2010). Utilisée pour éviter qu'un mot belge légitime, absent ou mal classé dans Manulex (ex. « nonante », rare en France, classé à tort comme avancé), soit signalé à tort comme hors-niveau. Ce n'est pas une base graduée par année scolaire : elle empêche un faux signalement, elle ne confirme pas un niveau précis.",
    riss: 'Réel, vérifié directement sur bdlp.org le 2026-09-14 — ressource institutionnelle FWB (FNRS, Communauté Wallonie-Bruxelles, UCLouvain), pas un article du corpus RISS.',
  },
  {
    titre: 'Gala, N., François, T., Bernhard, D. & Fairon, C. (2014)',
    detail: "Modèle de prédiction de la complexité lexicale et de graduation des mots par niveau scolaire.",
    riss: 'hal-01001916',
  },
  {
    titre: 'Boggio, C. & Bosse, M.-L. (2022)',
    detail: "Le taux de décodabilité des textes est important pour l'apprentissage de la lecture au CP (système français — équivalent à la 1re primaire, P1, en FWB). Socle scientifique du module de décodabilité, applicable au primaire FWB P1-P3.",
    riss: 'hal-03811405',
  },
  {
    titre: 'Boggio, C., Leclercq-Samson, A. & Bosse, M.-L. (2024)',
    detail: "Complément à l'étude précédente : quelle proportion de mots décodables (faible ou élevée) favorise le mieux l'apprentissage de la lecture — corrobore le seuil de vigilance utilisé pour la décodabilité.",
    riss: 'hal-04659756',
  },
  {
    titre: 'Anagraph (ENS Lyon)',
    detail: "Outil français de calcul de décodabilité pour le CP (1re primaire en FWB). Réel, cité dans le corpus RISS (Deauvieau & Gioia, 2024, halshs-04855104). Pas d'API ni d'export public documenté — LisiblActif construit sa propre table de progression graphème-phonème dans le même esprit scientifique, adaptée au primaire FWB (P1-P3) et éditable par l'enseignant.",
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
