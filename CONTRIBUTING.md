# Contributing

## Data updates
- Prefer structured TypeScript modules under src/data/ over external PDF links as primary UX.
- Source every figure (OAG, CoB, CRA, etc.) and keep oversight-sources.ts current.
- No sample/placeholder projects in production paths - use county-projects.ts.

## Security
- Never commit .env. Use .env.example only.
- Rotate any token that was ever committed.
- JWT_SECRET is required for authentication (uses jose library)

## New Components (August 2026)
- whistleblower-page.tsx: Whistleblower reporting form component
- anonymous-tip-page.tsx: Anonymous tip submission form component
- integrity-hub.tsx: Updated to use the new components (removed SecureWhistleblowerModal reference)

## Seeds
```bash
npm run seed
npm run seed:real
npm run seed:projects
```

## PRs
Target main. Keep commits focused (data vs UI vs infra).

## Project Structure Notes
- All civic action components are in src/components/
- Integrity hub (integrity-hub.tsx) manages whistleblower and tip tabs
- Use lazy loading for heavy components to improve performance
- All new components use Radix UI for consistent styling