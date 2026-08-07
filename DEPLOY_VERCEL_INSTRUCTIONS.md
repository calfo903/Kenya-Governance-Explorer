# Production Vercel Deployment Guide - Kenya County Governance Explorer

Step-by-step instructions to deploy your customized Next.js 16 app onto Vercel with Supabase.

---

## Step 1: Push Your Changes to GitHub
Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "feat: add whistleblower and tip components, fix build errors"
git push origin main
```

---

## Step 2: Initialize Your Vercel Project
1. Go to https://vercel.com/new
2. Click Add New -> Project
3. Import calfo903/Kenya-Governance-Explorer
4. Vercel will auto-detect Next.js
5. Root Directory: .

---

## Step 3: Configure Environment Variables
In Project Settings -> Environment Variables:

| Variable | Value | Purpose |
|---|---|---|
| DATABASE_URL | Your Supabase Postgres URL | Database connection |
| ADMIN_DECRYPTION_TOKEN | Generate random string | Secures decryption endpoint |
| INGESTION_SECRET_KEY | Generate random string | Protects data pipeline |
| OPENROUTER_API_KEY | From openrouter.ai/keys | Powers AI tools |
| JWT_SECRET | openssl rand -hex 32 | Required for JWT authentication |

Note: Vercel serverless environment is stateless and read-only for local files. Use PostgreSQL (Supabase or Neon) instead of SQLite for production.

---

## Step 4: Build and Deployment
Your vercel.json is configured with:
- Build Command: npx prisma generate && next build
- Install Command: npm install

Click Deploy! Within 2-3 minutes, Vercel will compile the Next.js App Router, generate the Prisma client, and publish your production deployment.

---

## Step 5: Post-Deployment Verification
Verify your deployment:
1. Dynamic Routing: Visit /summary, /whistleblower, /adminDecrypt
2. Integrity Hub: Visit /integrityHub to test whistleblower and tip forms
3. API Endpoints: Test /api/health, /api/counties, /api/budget
4. AI Features: Test /api/ai/chat with a message

---

## Troubleshooting

### Build Error: Module not found
If you see Can not resolve errors:
- Can not resolve @/components/whistleblower-page
- Can not resolve @/components/anonymous-tip-page
- Can not resolve jose

Ensure these files exist:
- src/components/whistleblower-page.tsx
- src/components/anonymous-tip-page.tsx
- package.json (with jose dependency)

### Prisma Schema Error (P1012)
If you see: The datasource property url is no longer supported

Downgrade to Prisma 6.11.1:
```bash
npm install prisma@6.11.1 @prisma/client@6.11.1
```

### npm install fails
Delete node_modules and try again:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Deployment Checklist
- All files committed to main branch
- package.json has jose dependency
- package.json has prisma@6.11.1
- Environment variables configured in Vercel
- Build completes without errors
- Smoke tests pass