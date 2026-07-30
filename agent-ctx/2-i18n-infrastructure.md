# Task §2: Swahili Localization (i18n)

## Approach Used
Used **next-intl v4** (already installed) with a **Zustand store** for locale state management. Since this is a single-page app (only `/` route), I used the **non-routing approach**: `NextIntlClientProvider` wraps the app content, and `useTranslations()` provides translation hooks.

## Files Created

### i18n Infrastructure
- `/src/i18n/index.ts` — Locale type definitions, locale names, message registry
- `/src/i18n/locale-store.ts` — Zustand store for `locale` state with `setLocale` action
- `/src/i18n/i18n-provider.tsx` — Client component wrapping `NextIntlClientProvider` with dynamic messages

### Message Files
- `/src/messages/en.json` — English translation dictionary (source of truth)
- `/src/messages/sw.json` — Kenyan Swahili translation dictionary

### UI Component
- `/src/components/language-toggle.tsx` — Globe icon button in header, toggles EN↔SW

## Files Modified

### `/src/app/page.tsx`
- Added imports: `useTranslations`, `I18nProvider`, `LanguageToggle`, `useLocaleStore`
- Split `KenyaGovernancePage` into outer wrapper (provides I18n) and inner `PageContent` (uses translations)
- Converted static `navItems` to `navItemDefs` with `labelKey`/`sectionKey` for i18n
- Added `renderSidebarSection()` and `renderMobileSidebarSection()` helper functions
- Translated: header title/subtitle, comparison badge, shortcut tooltips, Constitution link, language toggle placement
- Translated: all 7 sidebar section headers, Quick Stats labels, Live Widgets, Primary Sources
- Translated: mobile bottom nav (Home, Map, Counties, Reps, Alerts)
- Translated: footer section headers, footer tagline

### `/src/components/national-summary-dashboard.tsx`
- Translated: dashboard title, subtitle, export button, compare button
- Translated: 4 quick stats (Counties, Clean Audits, Avg Dev Absorption, Unspent Funds)
- Translated: audit opinion labels (Unmodified, Qualified, Adverse, Disclaimer)
- Translated: County Executives/Assemblies section headers, view report link
- Translated: Development/Recurrent labels, Total Unspent, Top/Bottom Performers
- Translated: Year-over-Year Trend, Governor Coalition Split, Score Legend

### `/src/components/county-explorer.tsx`
- Translated: county header, code/region/capital labels
- Translated: Population, Area, Constituencies, Wards, Term stats grid
- Translated: Assembly Audit, Report link, Compare button, Website link
- Translated: Constituencies & Wards section, placeholder text, MCA pending text
- Translated: County Executive Committee section, name pending verification
- Translated: scorecard labels (Accountability, Transparency, etc.), Scorecard header

### `/src/components/representative-profiles-page.tsx`
- Translated: page title, subtitle
- Translated: stat bar labels (Governors, Senators, Women Reps, MPs, MCAs)
- Translated: tab labels using dynamic `t('representatives.${key}')` pattern
- Translated: search placeholder, county selector, clear filters
- Translated: results count, no reps found, try adjusting
- Translated: constitutional duties toggle, Kenya Constitution reference card
- Translated: devolution chapter description

### `/src/components/county-map-page.tsx`
- Translated: page hero title/subtitle, badge counts
- Translated: search placeholder, all select dropdowns (Coalition, Region, Audit Opinion, Budget, Population)
- Translated: quick filter chips (Adverse Audit, Top 5 Budget Absorption, Largest Population)
- Translated: Financial Year selector
- Translated: county details panel labels (Governor, Party/Coalition, Capital, Population, Area, Constituencies, Wards)
- Translated: data labels (OAG Audit Opinion, Dev Budget Absorption, Total Budget, Pending Bills)
- Translated: Deep Dive button, click prompt
- Translated: comparison bar labels, footer stats cards
- Translated: disclaimer text

## Build Status
✅ `bun run lint` — Passed with no errors
✅ `npx next build` — Compiled successfully, all 19 pages generated

## Translation Coverage
- **~150+ unique translation keys** across both locales
- **All 5 target components** fully translated
- **Navigation**: All 36 sidebar items + 7 section headers + 5 mobile nav items
- **County data**: All field labels (Population, Area, Constituencies, Wards, Term, Region, Capital, Party, Coalition)
- **Representative types**: Governor, Senator, Women Representative, MP, MCA
- **Audit opinions**: Unmodified, Qualified, Adverse, Disclaimer
- **Budget labels**: Total Budget, Development, Recurrent, Absorption Rate, Pending Bills, etc.
- **Constitutional duties**: All 7 duties per representative type × 5 types = 35 duty strings
- **Common UI**: Search, Filter, Compare, Export, Close, Back, Next, Previous, Loading, No Data, Error, Submit, Cancel, Save, Delete, Edit, Clear Filters, Clear All, Navigation, Constitution, Report, Website, etc.
