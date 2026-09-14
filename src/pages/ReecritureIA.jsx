import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { scoreKandelMoles } from '../lib/lisibilite'

export default function ReecritureIA() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { texte = '', niveau = 'P4' } = location.state || {}

  const [texteReecrit, setTexteReecrit] = useState('')
  const [edite, setEdite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function genererReecriture() {
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch('/api/reecrire', { texte, niveauCible: niveau })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur inattendue')
      setTexteReecrit(data.texteReecrit)
      setEdite(false)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function enregistrer() {
    const { data: texteInsere, error: err1 } = await supabase
      .from('lisibl_textes')
      .insert({
        user_id: user.id,
        texte_original: texte,
        niveau_cible: niveau,
        score_lisibilite: scoreKandelMoles(texte),
      })
      .select()
      .single()

    if (err1) { setError(err1.message); return }

    const { error: err2 } = await supabase
      .from('lisibl_reecritures')
      .insert({
        texte_id: texteInsere.id,
        texte_reecrit: texteReecrit,
        edite_par_enseignant: edite,
      })

    if (err2) { setError(err2.message); return }
    setSaved(true)
  }

  if (!texte) {
    return (
      <div className="plai-section">
        <p className="plai-error">Aucun texte à réécrire — retournez à l'analyseur.</p>
        <button className="plai-btn" onClick={() => navigate('/dashboard')}>Retour à l'analyseur</button>
      </div>
    )
  }

  return (
    <div className="plai-section">
      <h2>Réécriture adaptée — niveau {niveau}</h2>

      {error && <div className="plai-error">{error}</div>}
      {saved && <div className="plai-success">Enregistré dans votre historique.</div>}

      {!texteReecrit && (
        <button className="plai-btn" onClick={genererReecriture} disabled={loading}>
          {loading ? 'Génération…' : 'Proposer une réécriture adaptée'}
        </button>
      )}

      {texteReecrit && (
        <div className="plai-field">
          <label className="plai-label">
            Réécriture proposée — ajustez votre style, votre vocabulaire de classe, avant d'enregistrer
          </label>
          <textarea
            className="plai-input" rows={12}
            value={texteReecrit}
            onChange={e => { setTexteReecrit(e.target.value); setEdite(true) }}
          />
          <button className="plai-btn" onClick={enregistrer} style={{ marginTop: '0.75rem' }}>
            Enregistrer
          </button>
        </div>
      )}
    </div>
  )
}
