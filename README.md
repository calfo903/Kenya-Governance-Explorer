# Kenya County Governance Explorer

**Interactive devolved governance dashboard for Kenya's 47 counties (2022-2027 term).**

Evidence-based scorecards, budget tracking, audit opinions, AI-powered insights, and civic action tools.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)

---

## Features

### Governance Dashboard
- National Summary with key stats for 47 counties
- 47-County Tree with hierarchical navigation
- Interactive County Map with SVG choropleth
- County Deep-Dive with officials and scorecards
- County Rankings across governance metrics

### Budget & Finance
- Budget Allocations for all counties
- FY Comparison analysis
- Budget Scatter Plots
- Budget Simulator tool

### Audit & Accountability
- Audit Trends across financial years
- Risk Heatmap visualization
- Red Flags detection
- Governor Report Cards

### Civic Action Tools
- Whistleblower Portal for secure reporting
- Anonymous Tips submission
- Secure Tip Submission with encryption
- RTI Generator
- Petition Builder
- Citizen Stories

### AI-Powered Tools
- AI Chat Assistant
- Budget Anomaly Detection
- News Briefing
- RTI Letter Writer

---

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma 6 ORM
- z-ai-web-dev-sdk (AI)
- jose (JWT authentication)
- Recharts 2
- next-intl (i18n)

---

## Getting Started

### Installation

git clone https://github.com/calfo903/Kenya-Governance-Explorer.git
cd Kenya-Governance-Explorer
npm install
npx prisma db push
npx prisma generate
npm run dev

The app will be available at http://localhost:3000

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| DATABASE_URL | SQLite path or Postgres URL | Yes |
| JWT_SECRET | Signs session tokens | Yes |
| OPENROUTER_API_KEY | OpenRouter key for AI | For AI features |
| ADMIN_EMAIL | Admin email | For admin features |
| ADMIN_DECRYPTION_TOKEN | Decryption token | For admin decryption |

---

## Project Structure

src/
├── app/
│   └── [[...tab]]/page.tsx     # Main page with tab navigation
├── components/
│   ├── whistleblower-page.tsx  # NEW: Whistleblower form
│   ├── anonymous-tip-page.tsx # NEW: Anonymous tip form
│   └── integrity-hub.tsx       # UPDATED: Integrity hub
└── lib/
    └── auth.ts                 # Uses jose

---

## Deployment

### Vercel
1. Go to vercel.com/new
2. Import calfo903/Kenya-Governance-Explorer
3. Add environment variables
4. Click Deploy

### Supabase (Recommended for Production)
1. Create project at supabase.com
2. Copy PostgreSQL connection string
3. Set as DATABASE_URL in Vercel
4. Update prisma/schema.prisma to use postgresql provider

---

## Recent Updates (August 2026)

- Added whistleblower-page.tsx component
- Added anonymous-tip-page.tsx component
- Updated integrity-hub.tsx
- Added jose dependency for JWT
- Fixed Vercel build errors
- Reverted to Prisma 6.11.1 for compatibility

---

## License

[MIT](./LICENSE) - Copyright 2024-2026 Kenya Governance Explorer contributors.