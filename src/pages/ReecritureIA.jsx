import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/apiFetch'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { scoreKandelMoles } from '../lib/lisibilite'

// Titre affiché dans l'historique : première phrase (ou début du texte),
// tronquée — l'enseignant ne saisit pas de titre séparément, ce texte doit
// suffire à distinguer deux entrées dans la liste.
function deriverTitre(texte) {
  const premiereLigne = texte.trim().split(/[.!?\n]/)[0].trim()
  const base = premiereLigne || texte.trim()
  return base.length > 60 ? `${base.slice(0, 60)}…` : base
}

export default function ReecritureIA() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { texte = '', niveau = 'P4' } = location.state || {}

  const [texteReecrit, setTexteReecrit] = useState('')
  const [edite, setEdite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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
    if (saving || saved) return
    setSaving(true)
    setError('')

    const { data: texteInsere, error: err1 } = await supabase
      .from('lisibl_textes')
      .insert({
        user_id: user.id,
        titre: deriverTitre(texte),
        texte_original: texte,
        niveau_cible: niveau,
        score_lisibilite: scoreKandelMoles(texte),
      })
      .select()
      .single()

    if (err1) { setError(err1.message); setSaving(false); return }

    const { error: err2 } = await supabase
      .from('lisibl_reecritures')
      .insert({
        texte_id: texteInsere.id,
        texte_reecrit: texteReecrit,
        edite_par_enseignant: edite,
      })

    if (err2) {
      // Le texte est enregistré mais sans réécriture attachée — on retire la
      // ligne orpheline plutôt que de laisser un lisibl_textes sans rewrite,
      // et pour qu'un nouvel essai ne crée pas de doublon à chaque clic.
      await supabase.from('lisibl_textes').delete().eq('id', texteInsere.id)
      setError(err2.message)
      setSaving(false)
      return
    }

    setSaving(false)
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

      <div role="status" aria-live="polite">
        {error && <div className="plai-error">{error}</div>}
        {saved && <div className="plai-success">Enregistré dans votre historique.</div>}
      </div>

      {!texteReecrit && (
        <button className="plai-btn" onClick={genererReecriture} disabled={loading}>
          {loading ? 'Génération…' : 'Proposer une réécriture adaptée'}
        </button>
      )}

      {texteReecrit && (
        <div className="plai-field" role="status" aria-live="polite">
          <label className="plai-label" htmlFor="texte-reecrit">
            Réécriture proposée par l'IA
          </label>
          <textarea
            id="texte-reecrit" name="texte-reecrit"
            className="plai-input" rows={12}
            value={texteReecrit} disabled={saved}
            onChange={e => { setTexteReecrit(e.target.value); setEdite(true) }}
            placeholder="Ex. : « Le petit chat dort sur le tapis. Il attend sa maîtresse pour jouer. »"
          />
          <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>
            Ajustez le style, le vocabulaire de classe et les exemples réels de vos élèves avant
            d'enregistrer — rien n'est utilisé tel quel : c'est cette version modifiée, pas la
            proposition brute de l'IA, qui sera sauvegardée dans l'historique.
          </p>
          <button
            className="plai-btn" style={{ marginTop: '0.75rem' }}
            onClick={enregistrer} disabled={saving || saved}
          >
            {saved ? 'Enregistré' : saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}
