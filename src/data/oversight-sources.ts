/**
 * Reliable oversight sources for Kenyan county governance.
 * Primary UX: in-app structured data. External URLs are citations / deep links only.
 *
 * Last verified: 2026-08-04
 */

export interface OversightSource {
  id: string;
  name: string;
  role: string;
  url: string;
  reportsUrl?: string;
  reliability: 'primary' | 'secondary' | 'civil_society';
  updateCadence: string;
  whatYouGet: string[];
}

/** Constitutional / statutory oversight — prefer these for scores and opinions */
export const PRIMARY_OVERSIGHT: OversightSource[] = [
  {
    id: 'oag',
    name: 'Office of the Auditor-General (OAG)',
    role: 'Constitutional audit of national and county public funds (Art. 229)',
    url: 'https://www.oagkenya.go.ke/',
    reportsUrl: 'https://www.oagkenya.go.ke/2024-2025-county-government-audit-reports/',
    reliability: 'primary',
    updateCadence: 'Annual county executive + assembly reports; summary PDF',
    whatYouGet: [
      'Audit opinions (unmodified / qualified / adverse / disclaimer)',
      'Cross-cutting findings (pending bills, unsupported expenditure)',
      'Per-county executive and assembly reports',
    ],
  },
  {
    id: 'cob',
    name: 'Controller of Budget (CoB)',
    role: 'Budget implementation oversight; authorises withdrawals from public funds',
    url: 'https://cob.go.ke/',
    reliability: 'primary',
    updateCadence: 'Quarterly + annual County Budget Implementation Review Reports',
    whatYouGet: [
      'Absorption rates (recurrent / development)',
      'Own-source revenue performance',
      'Pending bills and exchequer issues',
    ],
  },
  {
    id: 'cra',
    name: 'Commission on Revenue Allocation (CRA)',
    role: 'Recommend vertical and horizontal share of revenue',
    url: 'https://www.crakenya.org/',
    reliability: 'primary',
    updateCadence: 'Annual recommendations; formula reviews',
    whatYouGet: ['Equitable share parameters', 'County allocation basis'],
  },
  {
    id: 'nt',
    name: 'The National Treasury',
    role: 'Exchequer releases, BROP, fiscal policy',
    url: 'https://www.treasury.go.ke/',
    reliability: 'primary',
    updateCadence: 'Budget cycle documents; disbursement data',
    whatYouGet: ['Exchequer issues to counties', 'Macro-fiscal context'],
  },
  {
    id: 'iebc',
    name: 'Independent Electoral and Boundaries Commission (IEBC)',
    role: 'Elections, boundaries, official results',
    url: 'https://www.iebc.or.ke/',
    reliability: 'primary',
    updateCadence: 'Election cycles',
    whatYouGet: ['Governor / MCA election results', 'Ward boundaries'],
  },
  {
    id: 'cog',
    name: 'Council of Governors (CoG)',
    role: 'Intergovernmental coordination among 47 governors',
    url: 'https://cog.go.ke/',
    reliability: 'primary',
    updateCadence: 'Ongoing',
    whatYouGet: ['Current governors list', 'Devolution policy positions'],
  },
  {
    id: 'senate',
    name: 'Senate of Kenya — County oversight',
    role: 'Oversight of county governments; considers OAG reports',
    url: 'https://www.parliament.go.ke/the-senate',
    reliability: 'primary',
    updateCadence: 'Sessional',
    whatYouGet: ['Committee hearings on county audits', 'Hansard'],
  },
  {
    id: 'eacc',
    name: 'Ethics and Anti-Corruption Commission (EACC)',
    role: 'Investigate and prevent corruption',
    url: 'https://www.eacc.go.ke/',
    reliability: 'primary',
    updateCadence: 'Ongoing investigations / reports',
    whatYouGet: ['Corruption cases involving counties', 'Asset recovery'],
  },
];

export const CIVIL_SOCIETY_OVERSIGHT: OversightSource[] = [
  {
    id: 'mzalendo',
    name: 'Mzalendo',
    role: 'Parliamentary and civic transparency',
    url: 'https://mzalendo.com/',
    reliability: 'civil_society',
    updateCadence: 'Ongoing',
    whatYouGet: ['MP / senator profiles', 'Bill tracking', 'Attendance'],
  },
  {
    id: 'ti-kenya',
    name: 'Transparency International Kenya',
    role: 'Anti-corruption research and advocacy',
    url: 'https://tikenya.org/',
    reliability: 'civil_society',
    updateCadence: 'Periodic indices and briefs',
    whatYouGet: ['Corruption perception insights', 'County integrity work'],
  },
  {
    id: 'ibp',
    name: 'International Budget Partnership Kenya',
    role: 'Budget transparency and public participation',
    url: 'https://internationalbudget.org/kenya/',
    reliability: 'civil_society',
    updateCadence: 'Periodic',
    whatYouGet: ['Open Budget metrics', 'Citizen budget tools'],
  },
  {
    id: 'knbs',
    name: 'Kenya National Bureau of Statistics (KNBS)',
    role: 'Official statistics',
    url: 'https://www.knbs.or.ke/',
    reliability: 'secondary',
    updateCadence: 'Census / surveys',
    whatYouGet: ['Population', 'poverty', 'county statistical abstracts'],
  },
];

/** Key published reports (in-app feed prefers structured extracts; links are citations) */
export const KEY_REPORT_CITATIONS = [
  {
    id: 'oag-county-summary-2024-25',
    title: "Auditor-General's Summary Report on County Governments FY 2024/2025",
    publisher: 'OAG',
    url: 'https://www.oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
    landing: 'https://www.oagkenya.go.ke/2024-2025-county-government-audit-reports/',
    financialYear: 'FY 2024/25',
    accessed: '2026-08-04',
    highlights: [
      'County executives: 1 unmodified (Makueni), 44 qualified, 2 adverse (Kericho, Tana River), 0 disclaimer',
      'County assemblies: 9 unmodified opinions (improvement vs prior year)',
      'Cross-cutting issues: pending bills, OSR gaps, project delays',
    ],
  },
  {
    id: 'oag-county-summary-2023-24',
    title: "Auditor-General's Summary Report on County Governments FY 2023/2024",
    publisher: 'OAG',
    url: 'https://www.oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
    financialYear: 'FY 2023/24',
    accessed: '2026-08-04',
    highlights: [
      'All 47 county executives: qualified opinion (0 unmodified, 0 adverse, 0 disclaimer)',
      'County assemblies: 8 unmodified, 37 qualified, 2 adverse',
    ],
  },
  {
    id: 'cob-bir-2024-25',
    title: 'County Governments Budget Implementation Review Report FY 2024/2025',
    publisher: 'Controller of Budget',
    url: 'https://cob.go.ke/',
    financialYear: 'FY 2024/25',
    accessed: '2026-08-04',
    highlights: [
      'Overall county absorption ~78% of ~KES 601.7B annual budget',
      'Development absorption ~57% (spend ~KES 123.8B of ~KES 219B development budget)',
      'Recurrent absorption ~91%',
      'Lowest development absorption examples: Nairobi & Kisumu ~29%; top: Nandi ~90%',
    ],
  },
] as const;

/** National headline stats derived from OAG + CoB public summaries (Aug 2026) */
export const NATIONAL_OVERSIGHT_SNAPSHOT = {
  asOf: '2026-08-04',
  term: '2022\u20132027',
  counties: 47,
  oagFY202425: {
    executives: {
      unmodified: 1, // Makueni
      qualified: 44,
      adverse: 2, // Kericho, Tana River
      disclaimer: 0,
    },
    assemblies: {
      unmodified: 9,
    },
    note: 'Source: OAG Summary Report on County Governments FY 2024/2025',
  },
  oagFY202324: {
    executives: { unmodified: 0, qualified: 47, adverse: 0, disclaimer: 0 },
    assemblies: { unmodified: 8, qualified: 37, adverse: 2, disclaimer: 0 },
    note: 'Source: OAG Summary Report on County Governments FY 2023/2024',
  },
  cobFY202425: {
    totalBudgetKesBn: 601.7,
    totalSpendKesBn: 470.7,
    overallAbsorptionPct: 78,
    developmentBudgetKesBn: 219.0,
    developmentSpendKesBn: 123.8,
    developmentAbsorptionPct: 57,
    recurrentAbsorptionPct: 91,
    note: 'Source: CoB County Budget Implementation Review / National Treasury BROP citing CoB',
  },
};
