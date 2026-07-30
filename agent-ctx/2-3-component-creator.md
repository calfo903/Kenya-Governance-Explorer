# Task 2-3: ProjectDetailDrawer Component

## Status: Completed ✅

## Summary
Created `/home/z/my-project/src/components/project-detail-drawer.tsx` — a comprehensive, self-contained React component for the Kenya Governance Explorer project.

## Component Structure

### 1. Project Header
- Project name with status badge (color-coded per status: planning/active/stalled/completed/suspended)
- County, implementing agency, and category metadata
- Date range display (start → end/present)
- Budget utilization progress bar (emerald for normal, red for over-budget)
- SVG-based circular risk score gauge with color transitions

### 2. Vertical Audit Timeline (70% on desktop)
- Chronologically sorted events (newest first)
- Emerald-200 vertical connector line
- Color-coded event dots based on severity: info=blue, warning=amber, critical=red, success=emerald
- Type-specific icons (Target for milestone, FileCheck for audit, GitCompare for budget, AlertTriangle for finding, Zap for action, Flag for lifecycle_start, CheckCircle2 for lifecycle_end)
- **Special treatment** for `lifecycle_start` and `lifecycle_end` events: larger circles (w-10 vs w-8), bolder text
- Verification status badges: green checkmark for verified, amber dot for pending
- Source citations with external link icons

### 3. Sidebar Widgets (30% on desktop)
- **Weather Widget**: Placeholder showing location name with cloud icon, temperature/humidity/wind marked as unavailable
- **Project Velocity Chart**: Recharts LineChart showing audit events per month over the last 6 months with emerald-colored line
- **Risk Forecast Panel**: Calculated stalling probability from riskScore + riskFactors count, factor weights with severity badges, AI recommendation text
- **Citizen Auditor Stats**: Photos verified count, rank, participation badges, recent activity feed

### 4. Oversight Action Hub
- "File Anonymous Whistleblower Report" — red button, links to whistleblower tab via toast
- "Flag for OAG Priority Review" — amber outline, opens oagkenya.go.ke externally
- "Request RTI Information" — blue outline, links to RTI tab via toast
- "Track This Project" — toggle button, shows success toast, persists state
- "Share Report" — copies formatted summary to clipboard with toast feedback

## Technical Details
- **Responsive layout**: `flex-col lg:flex-row` with `w-full lg:w-[70%]` and `w-full lg:w-[30%]`
- **Stone color palette** for backgrounds and borders
- **Emerald** for positive indicators, **amber** for warnings, **red** for critical items
- **Named export**: `export default function ProjectDetailDrawer`
- **Props**: `{ project: ProjectRecord; onClose?: () => void }`
- **All imports** match the specified list exactly
- **Zero TypeScript/ESLint errors** for the component file
- **Recharts** used for the velocity LineChart
- **Sonner** used for toast notifications
- **All types** imported from `@/data/types` match the existing schema
