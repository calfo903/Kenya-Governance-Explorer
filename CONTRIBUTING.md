# Contributing

## Data updates
- Prefer structured TypeScript modules under `src/data/` over external PDF links as primary UX.
- Source every figure (OAG, CoB, CRA, etc.) and keep `oversight-sources.ts` current.
- No sample/placeholder projects in production paths — use `county-projects.ts`.

## Security
- Never commit `.env`. Use `.env.example` only.
- Rotate any token that was ever committed.

## Seeds
```bash
npm run seed
npm run seed:projects
```

## PRs
Target `main`. Keep commits focused (data vs UI vs infra).
