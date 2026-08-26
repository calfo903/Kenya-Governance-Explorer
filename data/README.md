# Data directory

## `raw/`
Unprocessed scrapes and intermediate JSON dumps (CECM lists, MCA lists, OAG PDF metadata, search results).

These are **not** imported at runtime. Use the seed scripts to normalize them into:

- `src/data/*.ts` (static TypeScript modules used by the UI)
- Prisma SQLite / Postgres tables (via `npm run seed` / `npm run seed:real`)

## Sources of truth (priority order)
1. Official OAG / CoB / IEBC / CRA publications
2. Typed modules under `src/data/`
3. Prisma database after seeding
4. `data/raw/` only as staging for new scrapes

Do not commit secrets or full production DB dumps here.
