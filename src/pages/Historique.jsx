import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { interpreterScore } from '../lib/lisibilite'

export default function Historique() {
  const [textes, setTextes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function charger() {
      const { data, error } = await supabase
        .from('lisibl_textes')
        .select('id, titre, niveau_cible, score_lisibilite, created_at')
        .order('created_at', { ascending: false })
      if (error) setError(error.message)
      setTextes(data || [])
      setLoading(false)
    }
    charger()
  }, [])

  if (loading) return <div className="plai-empty" role="status">Chargement…</div>

  if (error) {
    // Distinct de "aucun texte" : une erreur de récupération ne doit jamais
    // être présentée comme un historique vide, sous peine de faire croire à
    // l'enseignant que ses textes enregistrés ont disparu.
    return <div className="plai-error" role="alert">Impossible de charger l'historique : {error}</div>
  }

  if (textes.length === 0) {
    return <div className="plai-empty">Aucun texte enregistré pour l'instant.</div>
  }

  return (
    <div className="plai-section">
      <h2>Historique</h2>
      {textes.map(t => (
        <div key={t.id} className="plai-card">
          <p><strong>{t.titre}</strong> — niveau {t.niveau_cible}</p>
          <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
            {t.score_lisibilite != null
              ? `Score : ${t.score_lisibilite} (${interpreterScore(t.score_lisibilite)})`
              : 'Score non disponible'}
            {' — '}{new Date(t.created_at).toLocaleDateString('fr-BE')}
          </p>
        </div>
      ))}
    </div>
  )
}
