# Task 14: Projects Browser Page

## Work Summary

Created `/home/z/my-project/src/components/projects-browser-page.tsx` — a comprehensive project browsing component for the Kenya Governance Explorer.

## What was built

### Features Implemented

1. **Summary Stats Bar** (6 cards in a responsive grid):
   - Total projects, Active count, Stalled count, Completed count, Total Budget (formatted KSh), Average Risk Score

2. **Filters Section** (inside a Card):
   - **Search input** — filters by project name or county name (case-insensitive)
   - **Status filter** — All / Planning / Active / Stalled / Completed / Suspended
   - **Category filter** — All / Water / Infrastructure / Health / Education / Agriculture
   - **Risk level filter** — All / Low (<25) / Medium (25–60) / High (>60)
   - **Sort by** — Risk Score (both directions), Budget (both directions), Status, County Name
   - **Clear filters** button (appears only when filters are active)

3. **Projects Grid** (responsive 1/2/3 columns):
   - Each card shows: project name, county badge with MapPin icon, category badge with category-specific icon
   - **Status badge** with color coding: planning=blue, active=green, stalled=red, completed=gray, suspended=amber
   - **Risk score badge** with color coding: Low=emerald, Medium=amber, High=red
   - **Audit opinion badge** (only shown if available) with color coding
   - **Budget progress bar** showing allocated vs spent with percentage
   - **Citizen photos count** with Camera icon
   - Cards are clickable (keyboard accessible) to open the detail drawer

4. **Project Detail Drawer**:
   - Slides in from the right with CSS transition (300ms ease-in-out)
   - 80% width on mobile, 50% on desktop (`max-w-[80vw] sm:max-w-[50vw]`)
   - Semi-transparent backdrop with blur (`bg-black/40 backdrop-blur-sm`)
   - Closes by clicking backdrop, pressing Escape, or clicking X button
   - Body scroll locked when drawer is open
   - Uses `ScrollArea` for drawer content
   - Renders the existing `ProjectDetailDrawer` component

5. **Empty state** when no projects match filters, with a "Clear all filters" button

### Imports
- `ProjectRecord` from `@/data/types`
- `getAllProjects` from `@/data/sample-projects`
- `ProjectDetailDrawer` from `@/components/project-detail-drawer`
- All required shadcn/ui components (Card, Badge, Button, Input, Progress, Select, ScrollArea)
- Lucide icons: Search, MapPin, ArrowUpDown, TrendingUp, X, ChevronRight, DollarSign, AlertTriangle, CheckCircle2, Clock, Camera, Layers, Building2, Droplets, Heart, GraduationCap, Leaf

### Export
- Named default export: `export default function ProjectsBrowserPage()`

## Compilation Status
- ✅ `bun run lint` passes with no errors
- ✅ Dev server compiles successfully