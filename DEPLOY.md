# Deploy to Vercel

PR #2 is merged into main. Deploy from main.

## 1. Import on Vercel
1. Go to https://vercel.com/new
2. Import calfo903/Kenya-Governance-Explorer (branch: main)
3. Framework: Next.js (auto-detected)
4. Root directory: .
5. Build uses vercel.json -> npx prisma generate && next build

## 2. Environment variables

| Name | Value | Required |
|------|--------|----------|
| DATABASE_URL | Postgres URL (Neon / Supabase / Vercel Postgres) | Yes for DB features |
| OPENROUTER_API_KEY | from https://openrouter.ai/keys | Yes for AI Hub |
| JWT_SECRET | openssl rand -hex 32 | Yes for JWT auth |
| NEXTAUTH_URL | https://your-app.vercel.app | If auth enabled |
| NEXTAUTH_SECRET | long random string (openssl rand -base64 32) | If auth enabled |

Do not use SQLite on Vercel (read-only FS). Static TypeScript data modules (audits, budgets, governors, projects, OAG reports) still work without a DB.

## 3. Deploy
Click Deploy. After success open the .vercel.app URL.

## 4. Smoke tests
- / — national summary loads
- /integrityHub — integrity and whistleblowing hub
- /whistleblower — whistleblower reporting form
- /tiptsubmit — anonymous tip submission
- /api/health
- /api/reports — in-app OAG/CoB feed
- AI Chat with body { "message": "How is Makueni doing?", "countyCode": "017" }

## 5. Security
- .env must never be committed (removed from git)
- Rotate any secrets that were ever in the old committed .env
- Set keys only in Vercel Project -> Settings -> Environment Variables

## 6. Troubleshooting

### Build Error: Module not found
If you see:
- Can not resolve @/components/whistleblower-page
- Can not resolve @/components/anonymous-tip-page
- Can not resolve jose

Ensure these files exist:
- src/components/whistleblower-page.tsx
- src/components/anonymous-tip-page.tsx
- package.json (with jose dependency)