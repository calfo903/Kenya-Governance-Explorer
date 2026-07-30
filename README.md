# Kenya County Governance Explorer

**Interactive devolved governance dashboard for Kenya's 47 counties (2022–2027 term).**

Evidence-based scorecards, budget tracking, audit opinions, AI-powered insights, and civic action tools — all sourced from the Office of the Auditor General (OAG), Controller of Budget (CoB), TI-Kenya, IEBC, and Mzalendo.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)

---

## Features

### Governance Dashboard
- **National Summary** — Key stats: 47 counties, audit opinions, budget absorption rates, unspent funds
- **47-County Tree** — Hierarchical navigation of all county leadership
- **Interactive County Map** — SVG choropleth with zoom/pan, color-coded by region, coalition, audit opinion, budget absorption, CECM performance, or population density
- **County Deep-Dive** — Per-county explorer with officials, constituencies, wards, and scorecards
- **County Rankings** — Ranked tables across multiple governance metrics
- **Devolution Timeline** — Key milestones in Kenya's devolution journey
- **Manifesto Tracker** — Track campaign promises vs. delivery

### Budget & Finance
- **Budget Allocations** — All 47 counties with total/dev/recurrent budgets, absorption rates, own-source revenue, pending bills. Year-over-year comparison (FY 2024/25 vs FY 2025/26) with expandable detail rows
- **FY Comparison** — Side-by-side financial year analysis
- **Budget Scatter Plots** — Visual analysis of budget vs. absorption correlations
- **Budget Simulator** — Interactive "what-if" budget allocation tool

### Audit & Accountability
- **Audit Trends** — OAG opinion trends across multiple financial years
- **Risk Heatmap** — County-level risk visualization
- **Red Flags** — Automated detection of procurement irregularities
- **Governor Report Cards** — Performance scorecards per governor
- **CECM Performance** — County Executive Committee Member tracking

### Civic Action Tools
- **Whistleblower** — Secure and anonymous corruption reporting
- **RTI Generator** — Right to Information letter generator (AI-enhanced)
- **Petition Builder** — Build and format petitions
- **Service Rating** — Rate county government services
- **Citizen Stories** — Share governance experiences
- **CBEF Meetings** — County Budget and Economic Forum tracking
- **Constitution Reference** — Browse the Constitution of Kenya 2010

### AI-Powered Tools (12 features)
- **AI Chat Assistant** — Ask questions about Kenyan governance
- **Budget Anomaly Detection** — AI-identified budget irregularities
- **News Briefing** — AI-curated governance news digest
- **RTI Letter Writer** — AI-drafted Right to Information requests
- **Report Intelligence** — AI analysis of governance reports
- **County Comparison Insights** — AI-powered county comparisons
- **Hansard Summary** — AI-summarized assembly proceedings
- **Devolution Quiz** — AI-generated quiz questions
- **Smart Web Search** — AI-enhanced search across governance sources
- **Sentiment Analysis** — Governor approval sentiment tracking
- **County Profile Generator** — AI-generated county profiles
- **Procurement Risk AI** — AI-flagged procurement risks

### Platform Features
- **Bilingual** — English and Swahili (switchable)
- **Dark Mode** — Full dark/light theme support
- **PWA** — Installable, offline-capable progressive web app
- **Command Palette** — `Ctrl+K` / `Cmd+K` to navigate anywhere
- **Responsive** — Mobile-first with bottom nav, desktop sidebar
- **Data Export** — Export data as CSV/PDF

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| UI | React 19, shadcn/ui, Radix Primitives |
| Styling | Tailwind CSS 4, CSS custom properties |
| Icons | Lucide React |
| State | Zustand 5, TanStack Query 5 |
| Database | SQLite via Prisma 6 ORM |
| AI | z-ai-web-dev-sdk (LLM chat + web search) |
| Forms | React Hook Form 7, Zod 4 |
| Charts | Recharts 2 |
| i18n | next-intl (English + Swahili) |
| Dark Mode | next-themes |
| Animations | Framer Motion 12, tailwindcss-animate |
| Maps | react-zoom-pan-pinch (SVG choropleth) |
| PWA | Custom service worker, manifest.json |
| Testing | Vitest 4 |
| Runtime | Node.js / Bun |
| Reverse Proxy | Caddy |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17+ or **Bun** latest
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd my-project

# Install dependencies
npm install

# Set up database
npx prisma db push
npx prisma generate

# (Optional) Seed the database
npm run seed

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | SQLite database path (default: `file:./db/custom.db`) | Yes |
| AI SDK env vars | Required for AI features (z-ai-web-dev-sdk configuration) | For AI features |

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Production build with standalone output |
| `npm run start` | Start production server (Bun) |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:reset` | Reset database |
| `npm run seed` | Seed database with sample data |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main SPA page (tab navigation)
│   ├── globals.css             # Tailwind + theme variables
│   └── api/                    # 25 API route handlers
│       ├── ai/                 # 12 AI-powered endpoints
│       ├── db/                 # Database CRUD endpoints
│       ├── budget.ts           # Budget data API
│       ├── counties.ts         # County data API
│       ├── audits.ts           # Audit data API
│       ├── news.ts             # News API
│       ├── weather.ts          # Weather widget API
│       └── ...
├── components/                 # 109 components total
│   ├── ui/                     # 39 shadcn/ui primitives
│   ├── national-summary-dashboard.tsx
│   ├── county-map-page.tsx
│   ├── kenya-county-map.tsx    # SVG map with zoom/pan
│   ├── budget-allocation-page.tsx
│   ├── budget-simulator-page.tsx
│   ├── audit-trends-page.tsx
│   ├── ai-chat-page.tsx        # AI features (12)
│   ├── command-palette.tsx     # Ctrl+K navigation
│   ├── sidebar-widgets.tsx     # Weather, AI, risk widgets
│   └── ...
├── data/                       # 18 static data modules
│   ├── governors.ts            # 47 governors
│   ├── county-budget-data.ts   # Budget records (2 FY years)
│   ├── county-audit-data.ts   # Audit opinions (3 FY years)
│   ├── county-leadership.ts    # Senators, Women Reps, MCAs
│   ├── constitution.ts         # Kenya Constitution 2010
│   ├── sources.ts             # Data source citations
│   ├── national-summary.ts     # National aggregates
│   ├── regions/                # 8 regional data files
│   └── ...
├── hooks/                      # Custom React hooks
├── i18n/                       # Internationalization
├── lib/                        # Utilities
│   ├── ai.ts                   # z-ai-web-dev-sdk wrapper
│   ├── db.ts                   # Prisma client
│   └── utils.ts                # Helpers
├── messages/
│   ├── en.json                 # English translations
│   └── sw.json                 # Swahili translations
├── providers/                  # React context providers
└── __tests__/                  # Test files
```

---

## API Routes

### Data APIs
| Method | Route | Description |
|---|---|---|
| GET | `/api/counties` | All 47 counties with metadata |
| GET | `/api/budget` | Budget data per county per FY |
| GET | `/api/audits` | OAG audit opinion records |
| GET | `/api/scorecards` | County performance scorecards |
| GET | `/api/news` | Governance news feed |
| GET | `/api/weather` | Weather data for widgets |
| GET | `/api/rss` | RSS feed |
| GET | `/api/mzalendo` | Parliamentary profiles |
| GET | `/api/health` | Health check |

### AI APIs
| Method | Route | Description |
|---|---|---|
| POST | `/api/ai/chat` | AI governance chat |
| POST | `/api/ai/search` | AI web search |
| POST | `/api/ai/budget-anomaly` | Budget anomaly detection |
| POST | `/api/ai/news` | AI news briefing |
| POST | `/api/ai/rti-letter` | AI RTI letter generation |
| POST | `/api/ai/report-intel` | Report intelligence |
| POST | `/api/ai/compare-insights` | County comparison |
| POST | `/api/ai/hansard-summary` | Hansard summarization |
| POST | `/api/ai/quiz` | Quiz generation |
| POST | `/api/ai/sentiment` | Sentiment analysis |
| POST | `/api/ai/profile` | County profile generation |
| POST | `/api/ai/procurement-risk` | Procurement risk analysis |

### Database CRUD APIs
| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/db/counties` | Counties in database |
| GET | `/api/db/counties/[code]` | Single county details |
| GET | `/api/db/budget` | Budget records |
| GET | `/api/db/audits` | Audit records |
| GET | `/api/db/summary` | National summary |
| GET/POST | `/api/db/stories` | Citizen stories |
| PATCH | `/api/db/stories/[id]/status` | Update story status |
| GET/POST | `/api/db/tips` | Anonymous tips |
| PATCH | `/api/db/tips/[id]/status` | Update tip status |

---

## Data Sources

All data is sourced from publicly verifiable Kenyan government and civil society sources:

| Source | Data Provided |
|---|---|
| **Office of the Auditor General (OAG)** | County audit opinions (FY 2022/23 – FY 2024/25) |
| **Controller of Budget (CoB)** | Budget implementation reviews, absorption rates, pending bills |
| **IEBC** | Election results, governor affiliations |
| **TI-Kenya** | Corruption perception data, whistleblower insights |
| **Mzalendo** | Parliamentary profiles, hansard records |
| **Kenya Constitution 2010** | Constitutional references, devolution framework |
| **County Budget Documents** | Per-county budget estimates and appropriations |

Every data point includes a `source` citation with report title, URL, and access date.

---

## Database Schema

SQLite database managed via Prisma ORM with 11 models:

- **County** — Core county entity with geographic and demographic data
- **Governor** — Governor profiles with party and coalition affiliations
- **CountyLeadership** — Deputy governors, senators, women reps, assembly speakers
- **CountyCECM** — County Executive Committee Members by portfolio
- **CountyMCA** — Members of County Assembly by constituency/ward
- **CountyAuditRecord** — OAG audit opinions per county per financial year
- **CountyBudgetRecord** — Budget allocations, absorption, revenue, pending bills
- **ProjectRecord** — County development projects with budgets and risk scores
- **WhistleblowerReport** — Encrypted whistleblower submissions
- **CitizenStory** — Citizen experience reports with ratings
- **CitizenTip** — Anonymous tips with admin tracking

---

## Internationalization

The app supports **English** and **Swahili** via `next-intl`:

- Toggle via the language switcher in the header
- All navigation labels, section headings, and UI chrome translated
- Message files: `src/messages/en.json` (English), `src/messages/sw.json` (Swahili)

---

## PWA Support

The app is a fully installable Progressive Web App:

- **Manifest**: `public/manifest.json` — standalone display mode
- **Service Worker**: `public/sw.js` — three-tier caching strategy
  - Cache-first for static assets
  - Network-first for API calls
  - Stale-while-revalidate for HTML
- **Offline Indicator**: Visual indicator when offline
- **Install Prompt**: Custom install prompt for supported browsers

---

## Deployment

### Production Build

```bash
npm run build
```

The build outputs to `.next/standalone/` with copied static assets and public files.

### Running in Production

```bash
npm run start
# or
NODE_ENV=production bun .next/standalone/server.js
```

### Reverse Proxy (Caddy)

A `Caddyfile` is included for reverse proxy configuration:

```
:3000 {
    reverse_proxy localhost:3000
}
```

---

## Architecture Notes

- **Single-Page App**: The entire app runs as a single Next.js page (`/`) with client-side tab navigation managed by `useState<TabId>`
- **42 Tab Views**: Each tab renders its own component with full functionality
- **Static Data + API**: Core data is embedded in TypeScript modules for instant loading; API routes serve dynamic and AI-powered data
- **AI Service Layer**: `src/lib/ai.ts` provides a singleton wrapper around `z-ai-web-dev-sdk` with `chatCompletion()`, `structuredCompletion<T>()`, `webSearch()`, and `searchAndSummarize()` functions
- **Component Design**: Dark-mode-aware, responsive, skeleton-loading states, error boundaries

---

## License

Private — All rights reserved.
