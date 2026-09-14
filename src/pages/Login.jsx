import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LogoPlai from '../components/LogoPlai'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError('Email ou mot de passe incorrect.')
      else navigate('/dashboard')
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setSuccess('Compte créé. Vérifiez votre email pour confirmer votre inscription.')
    }
    setLoading(false)
  }

  return (
    <div className="plai-container" style={{ maxWidth: '420px', paddingTop: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <LogoPlai size="lg" />
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '28px', marginTop: '1rem' }}>
          LisiblActif
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Lisibilité des textes — PLAI</p>
      </div>

      <div className="plai-card">
        {error && <div className="plai-error" role="alert">{error}</div>}
        {success && <div className="plai-success" role="alert">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="plai-field">
            <label className="plai-label" htmlFor="email">Email</label>
            <input
              id="email" name="email" autoComplete="email"
              className="plai-input" type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="prenom.nom@etablissement.be"
            />
          </div>
          <div className="plai-field">
            <label className="plai-label" htmlFor="password">Mot de passe</label>
            <input
              id="password" name="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="plai-input" type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button className="plai-btn" type="submit" disabled={loading} style={{ width: '100%' }}>
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <button
          className="plai-btn-ghost"
          style={{ width: '100%', marginTop: '0.75rem' }}
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  )
}
