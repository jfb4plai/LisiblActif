import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { scoreKandelMoles, interpreterScore, decouperPhrases } from '../lib/lisibilite'
import { detecterMotsHorsNiveau } from '../lib/manulex'
import { tauxDecodabilite, graphemesJusquaEtape, PROGRESSION_CP_DEFAUT } from '../lib/decodabilite'
import { NIVEAUX_PRIMAIRE, NIVEAUX_SECONDAIRE, seuilPhraseLongue, estNiveauPrecoce } from '../lib/constants'

export default function Analyseur() {
  const [texte, setTexte] = useState('')
  const [niveau, setNiveau] = useState('P4')
  const [etapeCP, setEtapeCP] = useState(PROGRESSION_CP_DEFAUT.length)
  const navigate = useNavigate()

  const motsMin = 20
  const nbMots = texte.trim().split(/\s+/).filter(Boolean).length
  const texteTropCourt = nbMots > 0 && nbMots < motsMin

  const diagnostic = useMemo(() => {
    if (texteTropCourt || nbMots === 0) return null

    const score = scoreKandelMoles(texte)
    const phrases = decouperPhrases(texte)
    const seuil = seuilPhraseLongue(niveau)
    const phrasesLongues = phrases.filter(p => p.trim().split(/\s+/).filter(Boolean).length > seuil)
    const motsHorsNiveau = detecterMotsHorsNiveau(texte, niveau)

    let decodabilite = null
    if (estNiveauPrecoce(niveau)) {
      const graphemes = graphemesJusquaEtape(etapeCP)
      decodabilite = tauxDecodabilite(texte, graphemes)
    }

    return { score, label: interpreterScore(score), phrasesLongues, motsHorsNiveau, decodabilite }
  }, [texte, niveau, etapeCP, texteTropCourt, nbMots])

  return (
    <div className="plai-section">
      <h2>Analyser un texte</h2>

      <div className="plai-field">
        <label className="plai-label" htmlFor="niveau-cible">Niveau cible</label>
        <select
          id="niveau-cible" name="niveau-cible"
          className="plai-input" value={niveau} onChange={e => setNiveau(e.target.value)}
        >
          <optgroup label="Primaire">
            {NIVEAUX_PRIMAIRE.map(n => <option key={n} value={n}>{n}</option>)}
          </optgroup>
          <optgroup label="Secondaire">
            {NIVEAUX_SECONDAIRE.map(n => <option key={n} value={n}>{n}</option>)}
          </optgroup>
        </select>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>
          Détermine le seuil de longueur de phrase toléré et la liste de vocabulaire de référence
          utilisés pour signaler les phrases trop longues et les mots hors-niveau ci-dessous.
        </p>
      </div>

      {estNiveauPrecoce(niveau) && (
        <div className="plai-field">
          <label className="plai-label" htmlFor="etape-cp">
            Sons/graphèmes déjà enseignés (étape {etapeCP}/{PROGRESSION_CP_DEFAUT.length})
          </label>
          <input
            id="etape-cp" name="etape-cp"
            type="range" min={1} max={PROGRESSION_CP_DEFAUT.length} value={etapeCP}
            onChange={e => setEtapeCP(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
            Graphèmes connus : {graphemesJusquaEtape(etapeCP).join(', ')}. Réglez ce curseur sur la
            progression réellement enseignée en classe — le taux de décodabilité ci-dessous n'est
            fiable que si cette liste correspond à ce que les élèves ont déjà appris.
          </p>
        </div>
      )}

      <div className="plai-field">
        <label className="plai-label" htmlFor="texte-a-analyser">Texte à analyser</label>
        <textarea
          id="texte-a-analyser" name="texte-a-analyser"
          className="plai-input" rows={10}
          value={texte} onChange={e => setTexte(e.target.value)}
          placeholder="Ex. : « Le petit chat noir dort sur le tapis du salon. Il attend que sa maîtresse rentre de l'école pour jouer avec sa balle rouge. »"
        />
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>
          Collez le texte de lecture ou de dictée à évaluer (minimum {motsMin} mots). Il sert
          uniquement au diagnostic ci-dessous — rien n'est enregistré tant que vous ne demandez pas
          explicitement une réécriture et ne l'enregistrez pas dans l'historique.
        </p>
      </div>

      {texteTropCourt && (
        <div className="plai-error" role="alert">Texte trop court ({nbMots} mots) — minimum {motsMin} mots pour un diagnostic fiable.</div>
      )}

      {diagnostic && (
        <div className="plai-card" role="status" aria-live="polite">
          <p><strong>Score de lisibilité (Kandel-Moles) :</strong> {diagnostic.score} — {diagnostic.label}</p>

          {diagnostic.phrasesLongues.length > 0 && (
            <div>
              <strong>Phrases trop longues pour ce niveau :</strong>
              <ul>
                {diagnostic.phrasesLongues.map((p, i) => <li key={`${i}-${p.slice(0, 20)}`}>{p}</li>)}
              </ul>
            </div>
          )}

          {diagnostic.motsHorsNiveau.length > 0 && (
            <p><strong>Mots probablement hors-niveau :</strong> {diagnostic.motsHorsNiveau.join(', ')}</p>
          )}

          {diagnostic.decodabilite !== null && (
            <p>
              <strong>Décodabilité (sons connus) :</strong> {diagnostic.decodabilite}%
              {diagnostic.decodabilite < 60 && (
                <span className="plai-error" style={{ display: 'block', marginTop: '0.5rem' }}>
                  Sous le seuil de 60% recommandé pour une dictée à ce stade.
                </span>
              )}
            </p>
          )}

          <button
            className="plai-btn"
            style={{ marginTop: '1rem' }}
            onClick={() => navigate('/reecriture', { state: { texte, niveau } })}
          >
            Proposer une réécriture adaptée
          </button>
        </div>
      )}
    </div>
  )
}
