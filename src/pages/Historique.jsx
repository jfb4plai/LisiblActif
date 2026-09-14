import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { interpreterScore } from '../lib/lisibilite'

export default function Historique() {
  const [textes, setTextes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ouvertId, setOuvertId] = useState(null)
  const [details, setDetails] = useState({}) // id -> { texte_original, reecritures, loading, error }
  const navigate = useNavigate()

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

  async function basculerOuverture(id) {
    if (ouvertId === id) {
      setOuvertId(null)
      return
    }
    setOuvertId(id)

    if (details[id]) return // déjà chargé, pas de nouvel appel réseau

    setDetails(d => ({ ...d, [id]: { loading: true } }))

    const [{ data: texteRow, error: errTexte }, { data: reecritures, error: errReecritures }] = await Promise.all([
      supabase.from('lisibl_textes').select('texte_original').eq('id', id).single(),
      supabase.from('lisibl_reecritures').select('texte_reecrit, edite_par_enseignant, created_at')
        .eq('texte_id', id).order('created_at', { ascending: false }),
    ])

    if (errTexte || errReecritures) {
      setDetails(d => ({ ...d, [id]: { loading: false, error: (errTexte || errReecritures).message } }))
      return
    }

    setDetails(d => ({
      ...d,
      [id]: { loading: false, texteOriginal: texteRow.texte_original, reecritures: reecritures || [] },
    }))
  }

  function reanalyser(id, niveauCible) {
    const detail = details[id]
    if (!detail?.texteOriginal) return
    navigate('/dashboard', { state: { texte: detail.texteOriginal, niveau: niveauCible } })
  }

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
      <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '1rem' }}>
        Cliquez sur un texte pour revoir son contenu, ses réécritures enregistrées, et le renvoyer vers l'analyseur.
      </p>
      {textes.map(t => {
        const ouvert = ouvertId === t.id
        const detail = details[t.id]
        return (
          <div key={t.id} className="plai-card">
            <button
              onClick={() => basculerOuverture(t.id)}
              aria-expanded={ouvert}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', width: '100%', cursor: 'pointer' }}
            >
              <p><strong>{t.titre}</strong> — niveau {t.niveau_cible}</p>
              <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
                {t.score_lisibilite != null
                  ? `Score : ${t.score_lisibilite} (${interpreterScore(t.score_lisibilite)})`
                  : 'Score non disponible'}
                {' — '}{new Date(t.created_at).toLocaleDateString('fr-BE')}
                {' — '}{ouvert ? 'Masquer' : 'Voir le texte'}
              </p>
            </button>

            {ouvert && (
              <div role="status" aria-live="polite" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                {detail?.loading && <p style={{ fontSize: '13px', color: 'var(--text2)' }}>Chargement du texte…</p>}
                {detail?.error && <div className="plai-error" role="alert">Impossible de charger le détail : {detail.error}</div>}
                {detail?.texteOriginal && (
                  <>
                    <p className="plai-label">Texte original</p>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{detail.texteOriginal}</p>

                    {detail.reecritures.length > 0 ? (
                      detail.reecritures.map((r, i) => (
                        <div key={i} style={{ marginTop: '0.75rem' }}>
                          <p className="plai-label">
                            Réécriture enregistrée{r.edite_par_enseignant ? ' (modifiée par l\'enseignant)' : ''}
                          </p>
                          <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{r.texte_reecrit}</p>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '0.5rem' }}>
                        Aucune réécriture enregistrée pour ce texte.
                      </p>
                    )}

                    <button
                      className="plai-btn" style={{ marginTop: '0.75rem' }}
                      onClick={() => reanalyser(t.id, t.niveau_cible)}
                    >
                      Renvoyer ce texte vers l'analyseur
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
