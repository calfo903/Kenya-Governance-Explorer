# Production Vercel Deployment Guide — Upgraded Kenya County Governance Explorer
**Step-by-step instructions to deploy your newly customized, high-security, dynamic-routed Next.js 16 app onto Vercel.**

Since we have upgraded the platform with **Asymmetric Cryptography, Merkle-Ledgers, dynamic routes, and live API integrations**, this guide outlines how to configure your production Vercel project successfully.

---

## 🚀 Step 1: Push Your Local Upgrades to GitHub
Make sure all our newly implemented features, routes, and optimizations are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: upgrade to public-key cryptography, dynamic routing, Merkle ledger, and USSD gateway"
git push origin main
```

---

## ☁️ Step 2: Initialize Your Vercel Project
1.  Go to your **[Vercel Dashboard](https://vercel.com/new)** and click **Add New** $\rightarrow$ **Project**.
2.  Import your repository: **`calfo903/Kenya-Governance-Explorer`** (or your matching fork).
3.  Vercel will automatically detect **Next.js** as the framework.
4.  Leave the **Root Directory** as `.` (root).

---

## 🔒 Step 3: Configure Your Production Environment Variables
In **Project Settings $\rightarrow$ Environment Variables**, configure the following variables. 

| Variable Name | Recommended Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `file:./db/custom.db` *or* Postgres URL (e.g. Supabase / Neon) | Stores citizen tips, stories, and custom budgets. |
| `ADMIN_DECRYPTION_TOKEN` | `kenya-governance-ombudsman-seckey-2026` *(or custom random string)* | Secures the unredacted whistleblower retrieval endpoint. |
| `INGESTION_SECRET_KEY` | `kenya-governance-explorer-secret-ingest-token-2026` | Protects the OAG and CoB continuous data pipeline webhook. |
| `OPENROUTER_API_KEY` | *Your OpenRouter API Key* (from [openrouter.ai](https://openrouter.ai/keys)) | Powers the 12 AI tools (budget anomalies, PIL writers). |
| `OPENAI_API_KEY` | *Your OpenAI API Key* (from [platform.openai.com](https://platform.openai.com)) | Powers real Swahili voice transcription (Whisper-1). |
| `AFRICAS_TALKING_API_KEY` | *Your Africa's Talking API Key* (optional) | Sends real SMS alerts and handles USSD menus. |
| `AFRICAS_TALKING_USERNAME` | *Your Africa's Talking Username* (optional) | Authenticates real USSD/SMS callbacks. |

> **⚠️ Database Portability Note on Vercel:** 
> Vercel's serverless environment is **stateless and read-only** for local files. If you use SQLite (`file:./db/custom.db`), database modifications (like newly submitted whistleblower tips or citizen budget recommendations) will be reset every time your serverless function spins down. 
> For **production write-concurrency**, change your Prisma provider to **PostgreSQL** (e.g., [Supabase](https://supabase.com) or [Neon](https://neon.tech)) in your database dashboard.

---

## 🏗️ Step 4: Build & Deployment Commands
Your project's `vercel.json` is already perfectly optimized! Vercel will automatically read it and run:
*   **Build Command:** `npx prisma generate && next build`
*   **Install Command:** `npm install`

Click **Deploy**! Within 2–3 minutes, Vercel will compile the NextJS App Router, generate the standalone static assets, build the Prisma client, and publish your production deployment URL (e.g., `https://kenya-governance-explorer.vercel.app`).

---

## 🔍 Step 5: Post-Deployment Verification (Smoke Tests)
Once deployed, verify your real-world systems are operational by visiting these paths:

1.  **Dynamic Web Routing:** Visit `https://your-domain.com/summary`, `https://your-domain.com/whistleblower`, or `https://your-domain.com/adminDecrypt`. Refreshing the page or clicking browser back/forward buttons should transition seamlessly.
2.  **Continuous Ingestion Webhook:** Trigger a data pipeline upload using a tool like Postman or Curl:
    ```bash
    curl -X POST https://your-domain.com/api/db/ingest \
      -H "Content-Type: application/json" \
      -d '{
        "secretKey": "kenya-governance-explorer-secret-ingest-token-2026",
        "countyData": {
          "code": "047", "name": "Nairobi", "region": "Nairobi", "capital": "Nairobi",
          "population": 4397073, "areaSqKm": 696, "constituencies": 17, "wards": 85
        }
      }'
    ```
3.  **End-to-End Cryptography:** 
    *   Open `/whistleblower` on your deployed site, submit an asymmetrically encrypted report, and copy the transaction hash.
    *   Navigate to `/adminDecrypt`, enter your generated private key, and load the registers to watch the local in-browser WebCrypto engine safely decrypt the real database-fetched tip!
