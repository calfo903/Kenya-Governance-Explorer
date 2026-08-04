# Deploy to Vercel

## 1. Merge the PR
https://github.com/calfo903/Kenya-Governance-Explorer/pull/2

## 2. Import on Vercel
1. Go to https://vercel.com/new
2. Import `calfo903/Kenya-Governance-Explorer`
3. Framework: **Next.js** (auto-detected)
4. Root directory: `.`
5. Build: uses `vercel.json` → `npx prisma generate && next build`

## 3. Environment variables (Project → Settings → Environment Variables)

| Name | Value | Required |
|------|--------|----------|
| `DATABASE_URL` | `file:./db/custom.db` for demo **or** a Postgres URL (recommended for production) | Yes |
| `OPENROUTER_API_KEY` | from https://openrouter.ai/keys | For AI features |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | If auth enabled |
| `NEXTAUTH_SECRET` | long random string | If auth enabled |

**SQLite on Vercel:** the filesystem is read-only at runtime except `/tmp`. Prefer **Vercel Postgres**, Neon, or Supabase for production. Static TS data modules still work without a DB.

## 4. Deploy
Push to `main` or click Deploy. Open the `.vercel.app` URL.

## 5. Post-deploy check
- `/` loads national summary
- `/api/health`
- AI Hub → set `OPENROUTER_API_KEY` or features fall back / error gracefully
