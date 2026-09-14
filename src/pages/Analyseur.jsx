import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scoreKandelMoles, interpreterScore, decouperPhrases } from '../lib/lisibilite'
import { detecterMotsHorsNiveau } from '../lib/manulex'
import { tauxDecodabilite, graphemesJusquaEtape, PROGRESSION_GRAPHEMES_DEFAUT } from '../lib/decodabilite'
import { NIVEAUX_PRIMAIRE, NIVEAUX_SECONDAIRE, seuilPhraseLongue, estNiveauPrecoce } from '../lib/constants'
import { extractFile } from '../lib/extractFile'

export default function Analyseur() {
  // Réanalyse depuis l'historique : Historique.jsx navigue ici avec
  // { texte, niveau } dans le state pour pré-remplir le formulaire.
  const { state } = useLocation()
  const [texte, setTexte] = useState(state?.texte ?? '')
  const [niveau, setNiveau] = useState(state?.niveau ?? 'P4')
  const [etapeLecture, setEtapeLecture] = useState(PROGRESSION_GRAPHEMES_DEFAUT.length)
  const [erreurImport, setErreurImport] = useState('')
  const navigate = useNavigate()

  async function importerFichier(e) {
    const fichier = e.target.files?.[0]
    e.target.value = '' // permet de réimporter le même fichier après une erreur
    if (!fichier) return
    setErreurImport('')
    try {
      setTexte(await extractFile(fichier))
    } catch (err) {
      setErreurImport(err.message)
    }
  }

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
      const graphemes = graphemesJusquaEtape(etapeLecture)
      decodabilite = tauxDecodabilite(texte, graphemes)
    }

    return { score, label: interpreterScore(score), phrasesLongues, motsHorsNiveau, decodabilite }
  }, [texte, niveau, etapeLecture, texteTropCourt, nbMots])

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
          <label className="plai-label" htmlFor="etape-lecture">
            Sons/graphèmes déjà enseignés (étape {etapeLecture}/{PROGRESSION_GRAPHEMES_DEFAUT.length})
          </label>
          <input
            id="etape-lecture" name="etape-lecture"
            type="range" min={1} max={PROGRESSION_GRAPHEMES_DEFAUT.length} value={etapeLecture}
            onChange={e => setEtapeLecture(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: '13px', color: 'var(--text2)' }}>
            Graphèmes connus : {graphemesJusquaEtape(etapeLecture).join(', ')}. Réglez ce curseur sur la
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
          Collez le texte de lecture ou de dictée à évaluer (minimum {motsMin} mots), ou importez-le
          ci-dessous. Il sert uniquement au diagnostic — rien n'est enregistré tant que vous ne
          demandez pas explicitement une réécriture et ne l'enregistrez pas dans l'historique.
        </p>
      </div>

      <div className="plai-field">
        <label className="plai-label" htmlFor="import-fichier">Importer un fichier (facultatif)</label>
        <input
          id="import-fichier" name="import-fichier"
          className="plai-input" type="file" accept=".docx,.txt"
          onChange={importerFichier}
        />
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>
          Formats acceptés : .docx et .txt — le texte extrait remplace le contenu de la zone
          ci-dessus. Le PDF n'est pas encore pris en charge : copiez son contenu manuellement.
        </p>
        {erreurImport && <div className="plai-error" role="alert" style={{ marginTop: '0.5rem' }}>{erreurImport}</div>}
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
