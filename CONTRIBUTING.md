# Contributing

## Setup
```bash
git clone https://github.com/calfo903/Kenya-Governance-Explorer.git
cd Kenya-Governance-Explorer
cp .env.example .env   # never commit .env
npm install
npx prisma db push
npm run seed           # baseline from src/data
npm run seed:real      # optional enrichment from data/raw
npm run dev
```

## Security
- Never commit `.env` or API keys.
- Rotate any key that was previously committed.
- Prefer official OAG / CoB / IEBC sources for new data.

## Data
- Static UI data: `src/data/*.ts`
- Scrape staging only: `data/raw/`
- Normalized import format for CECMs/MCAs: see `scripts/seed-real-data.ts`

## PRs
- Run `npm run lint && npm run typecheck && npm test` before opening a PR.
- CI must pass.
