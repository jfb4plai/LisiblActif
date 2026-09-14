# LisiblActif

Diagnostic de lisibilité (score Kandel-Moles, phrases longues, mots hors-niveau)
et réécriture IA adaptée par niveau scolaire, avec module de décodabilité
graphophonémique pour le primaire P1-P3 (logique inspirée d'Anagraph, ENS Lyon).

- Design : [docs/superpowers/specs/2026-09-14-lisiblactif-design.md](../../docs/superpowers/specs/2026-09-14-lisiblactif-design.md)
- Stack : React 18 + Vite + Tailwind v3 + Supabase (RLS, tables préfixées `lisibl_`)
- Déploiement cible : `lisiblactif.jfb4plai.com`

## Développement local

```bash
npm install
cp .env.example .env.local   # renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

Le parcours de réécriture IA repose sur `/api/reecrire.js` : comme pour les
autres apps PLAI, `npm run dev` seul ne fait pas tourner cette route —
utiliser `vercel dev` pour la tester en local.

## Déploiement

- Vercel, projet lié au dépôt GitHub `jfb4plai/LisiblActif`, branche `main`.
- Variables d'environnement Vercel (jamais dans le code) :
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (pour `api/_auth.js`)
  - `ANTHROPIC_API_KEY` (pour `api/reecrire.js`)
- Sous-domaine cible : `lisiblactif.jfb4plai.com`.

Avant tout `git push` sur `main` :

```bash
npm run test
npm run build
```
