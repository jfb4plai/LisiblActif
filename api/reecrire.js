import { requireUser } from './_auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API manquante (ANTHROPIC_API_KEY)' })
  }

  const { texte, niveauCible } = req.body
  if (!texte || !niveauCible) {
    return res.status(400).json({ error: 'texte et niveauCible sont requis' })
  }

  const systemPrompt = `Tu réécris un texte pour des élèves de niveau ${niveauCible} de la Fédération Wallonie-Bruxelles.

RÈGLES D'ÉCRITURE ABSOLUES :
- Tu écris directement le texte réécrit, sans introduction ni commentaire autour.
- Jamais "Voici", "Bien sûr", ou toute formule de transition.
- Conserve le sens et les informations essentielles du texte original.
- Simplifie le vocabulaire et raccourcis les phrases pour correspondre au niveau ${niveauCible}.
- N'ajoute aucune note, aucune explication après le texte.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        temperature: 0,
        system: systemPrompt,
        messages: [{ role: 'user', content: texte }],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      if (response.status === 529 || err.error?.type === 'overloaded_error') {
        return res.status(503).json({ error: 'API surchargée — réessayez dans quelques secondes.' })
      }
      return res.status(500).json({ error: err.error?.message ?? 'Erreur API Anthropic' })
    }

    const data = await response.json()
    const texteReecrit = data.content?.[0]?.text ?? ''
    return res.status(200).json({ texteReecrit })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
