/**
 * Comprehensive Sources Catalog
 * Government Integrity + Public Resources
 *
 * Every source is a real, publicly accessible institution or platform.
 * Links verified as of 2026-07-25.
 */

export interface SourceEntry {
  id: string;
  name: string;
  url: string;
  description: string;
  /** What you can find here */
  dataTypes: string[];
  category: SourceCategory;
}

export type SourceCategory =
  | 'audit_oversight'    // Constitutional oversight bodies
  | 'budget_finance'     // Budget, revenue, expenditure tracking
  | 'procurement'        // Tenders, contracts, procurement portals
  | 'anti_corruption'    // EACC, DCI, courts
  | 'parliament'         // Parliamentary records
  | 'statistics'         // KNBS, surveys, indices
  | 'natural_resources'  // Land, minerals, water, forests
  | 'infrastructure'     // Roads, energy, public assets
  | 'civil_society'      // CSOs, think tanks, media
  | 'open_data'          // Open data portals, tech platforms
  | 'legal_tools'        // RTI, court search, citizen tools
  | 'media_monitoring';   // Social media, community radio, alerts

export interface SourceCategoryGroup {
  id: SourceCategory;
  label: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class
  sources: SourceEntry[];
}

export const allSources: SourceEntry[] = [
  // ════════════════════════════════════════════════════
  // AUDIT & OVERSIGHT (Constitutional Bodies)
  // ════════════════════════════════════════════════════
  {
    id: 'oag',
    name: 'Office of the Auditor-General (OAG)',
    url: 'https://oagkenya.go.ke/',
    description: 'Produces annual audit reports on all 47 county governments per Article 229 of the Constitution.',
    dataTypes: ['County audit opinions', 'Special reports on pending bills', 'Conditional grants', 'Unaccounted funds'],
    category: 'audit_oversight',
  },
  {
    id: 'cob',
    name: 'Controller of Budget (CoB)',
    url: 'https://cob.go.ke/',
    description: 'Quarterly County Budget Implementation Review Reports tracking how counties spend their allocations.',
    dataTypes: ['Budget absorption rates', 'Pending bills', 'Own-source revenue', 'Development vs recurrent spending'],
    category: 'audit_oversight',
  },
  {
    id: 'psc',
    name: 'Public Service Commission (PSC)',
    url: 'https://psc.go.ke/',
    description: 'County staff audits, vacancies, and HR integrity reports.',
    dataTypes: ['Staff audits', 'Ghost worker detection', 'Unapproved positions'],
    category: 'audit_oversight',
  },
  {
    id: 'caj',
    name: 'Commission on Admin. Justice / Ombudsman (CAJ)',
    url: 'https://caj.go.ke/',
    description: 'Public complaints against county officials and maladministration findings.',
    dataTypes: ['Complaint records', 'Maladministration findings', 'County-level complaint trends'],
    category: 'audit_oversight',
  },
  {
    id: 'cicc',
    name: 'Commission for Implementation of the Constitution (CICC)',
    url: 'https://cickenya.org/',
    description: 'Monitors implementation of constitutional provisions on devolution.',
    dataTypes: ['Devolution progress reports', 'Constitutional compliance assessments'],
    category: 'audit_oversight',
  },
  {
    id: 'cra',
    name: 'Commission on Revenue Allocation (CRA)',
    url: 'https://cra.go.ke/',
    description: 'Revenue sharing formulas, equitable share computations, and county revenue data.',
    dataTypes: ['Revenue sharing formulas', 'County allocations', 'Own-source revenue collection', 'Marginalization index'],
    category: 'budget_finance',
  },

  // ════════════════════════════════════════════════════
  // BUDGET & FINANCE
  // ════════════════════════════════════════════════════
  {
    id: 'treasury',
    name: 'National Treasury — PBB Reports',
    url: 'https://treasury.go.ke/',
    description: 'Program-Based Budgeting outputs for national and county governments, sector-by-sector allocations.',
    dataTypes: ['Sector allocations', 'Program-based budgeting', 'County transfers'],
    category: 'budget_finance',
  },
  {
    id: 'iea',
    name: 'Institute of Economic Affairs (IEA Kenya)',
    url: 'https://ieakenya.or.ke/',
    description: 'Annual County Budget Handbook — analysis of all 47 county budgets with trend data.',
    dataTypes: ['County budget analysis', 'Revenue trends', 'Expenditure comparisons'],
    category: 'budget_finance',
  },
  {
    id: 'ifmis',
    name: 'IFMIS — Integrated Financial Management',
    url: 'https://ifmis.go.ke/',
    description: 'Government financial management system with payment vouchers and commitment registers.',
    dataTypes: ['Payment vouchers', 'Commitment registers', 'Cash books'],
    category: 'budget_finance',
  },
  {
    id: 'ibp',
    name: 'International Budget Partnership (IBP)',
    url: 'https://internationalbudget.org/openbudgetsurvey/',
    description: 'Open Budget Survey scores and County Budget Transparency Survey data.',
    dataTypes: ['Budget transparency scores', 'Open budget index'],
    category: 'budget_finance',
  },

  // ════════════════════════════════════════════════════
  // PROCUREMENT
  // ════════════════════════════════════════════════════
  {
    id: 'ppra',
    name: 'Public Procurement Regulatory Authority (PPRA)',
    url: 'https://ppra.go.ke/',
    description: 'Tender notices, awards, contract values, and procuring entity information.',
    dataTypes: ['Tender awards', 'Contract values', 'Supplier patterns', 'Single-sourcing flags'],
    category: 'procurement',
  },
  {
    id: 'ppip',
    name: 'Public Procurement Information Portal (PPIP)',
    url: 'https://ppip.go.ke/',
    description: 'Searchable database of county-level procurement — tenders, awards, and contracts.',
    dataTypes: ['County tender awards', 'Contract search', 'Procurement plans'],
    category: 'procurement',
  },

  // ════════════════════════════════════════════════════
  // ANTI-CORRUPTION & LAW ENFORCEMENT
  // ════════════════════════════════════════════════════
  {
    id: 'eacc',
    name: 'Ethics & Anti-Corruption Commission (EACC)',
    url: 'https://eacc.go.ke/',
    description: 'Public reports, asset recovery updates, and investigation status of county officials.',
    dataTypes: ['Investigation reports', 'Asset recovery', 'Prosecution updates', 'Integrity declarations'],
    category: 'anti_corruption',
  },
  {
    id: 'dci',
    name: 'Directorate of Criminal Investigations (DCI)',
    url: 'https://dci.go.ke/',
    description: 'Press releases on investigations into county officials and asset recovery operations.',
    dataTypes: ['Investigation press releases', 'Asset recovery operations', 'Forensic audit reports'],
    category: 'anti_corruption',
  },
  {
    id: 'judiciary',
    name: 'Judiciary — eFiling Case Search',
    url: 'https://efile.judiciary.go.ke/',
    description: 'Search for court cases involving county officials — anti-corruption, procurement disputes.',
    dataTypes: ['Court cases', 'Corruption prosecutions', 'Procurement disputes'],
    category: 'anti_corruption',
  },

  // ════════════════════════════════════════════════════
  // PARLIAMENT
  // ════════════════════════════════════════════════════
  {
    id: 'parliament-hansard',
    name: 'Parliament of Kenya — Hansard',
    url: 'https://parliament.go.ke/',
    description: 'Verbatim records of Senate and National Assembly debates on county governance.',
    dataTypes: ['Senate debates', 'Budget interrogations', 'Oversight proceedings'],
    category: 'parliament',
  },
  {
    id: 'cpaic',
    name: 'Senate CPAIC Committee Reports',
    url: 'https://parliament.go.ke/committees',
    description: 'County Public Accounts & Investments Committee — interrogates audit findings with governors.',
    dataTypes: ['Audit interrogation reports', 'Governor summonses', 'Pending bills hearings'],
    category: 'parliament',
  },
  {
    id: 'mzalendo',
    name: 'Mzalendo Trust — Parliament Tracker',
    url: 'https://mzalendo.com/',
    description: 'Tracks Parliament activity, bills, committee proceedings, and Senate oversight.',
    dataTypes: ['Bill tracking', 'Committee proceedings', 'Senate oversight activity'],
    category: 'parliament',
  },

  // ════════════════════════════════════════════════════
  // STATISTICS & INDICES
  // ════════════════════════════════════════════════════
  {
    id: 'knbs',
    name: 'Kenya National Bureau of Statistics (KNBS)',
    url: 'https://www.knbs.or.ke/',
    description: 'Economic surveys, county-specific development indicators, and census data.',
    dataTypes: ['Economic surveys', 'Census data', 'County development indicators', 'Poverty rates'],
    category: 'statistics',
  },
  {
    id: 'tikenya',
    name: 'Transparency International Kenya (TI-Kenya)',
    url: 'https://tikenya.org/',
    description: 'County Governance Status Reports, integrity scorecards, and anti-corruption indices.',
    dataTypes: ['County governance scores', 'Budget transparency', 'Integrity indices'],
    category: 'statistics',
  },
  {
    id: 'unuwatifu',
    name: 'Unuwatifu — TI-Kenya Integrity Platform',
    url: 'https://unuwatifu.tikenya.org/',
    description: 'County integrity scorecards and corruption risk mapping.',
    dataTypes: ['Integrity scorecards', 'Corruption risk maps'],
    category: 'statistics',
  },
  {
    id: 'moibrahim',
    name: 'Mo Ibrahim Foundation — Index of African Governance',
    url: 'https://moibrahimfoundation.org/',
    description: 'Country-level governance scores with sub-categories for accountability and corruption.',
    dataTypes: ['Governance scores', 'Accountability sub-index'],
    category: 'statistics',
  },
  {
    id: 'worldbank-gov',
    name: 'World Bank Governance Indicators',
    url: 'https://info.worldbank.org/governance/wgi/',
    description: 'Cross-country governance metrics including control of corruption.',
    dataTypes: ['Control of corruption index', 'Government effectiveness', 'Voice and accountability'],
    category: 'statistics',
  },

  // ════════════════════════════════════════════════════
  // NATURAL RESOURCES
  // ════════════════════════════════════════════════════
  {
    id: 'nlc',
    name: 'National Land Commission (NLC)',
    url: 'https://nlc.go.ke/',
    description: 'Public land alienation records, historical land injustices, county land use plans.',
    dataTypes: ['Public land records', 'Alienation notices', 'Land use plans', 'Compensation data'],
    category: 'natural_resources',
  },
  {
    id: 'lands',
    name: 'Ministry of Lands & Physical Planning',
    url: 'https://lands.go.ke/',
    description: 'Lands Commission records, title deeds, gazette notices, and land registries.',
    dataTypes: ['Title deeds', 'Gazette notices', 'Public land inventory'],
    category: 'natural_resources',
  },
  {
    id: 'mining',
    name: 'State Department for Mining',
    url: 'https://mining.go.ke/',
    description: 'Mining licenses, royalties collected, geological surveys, and county benefit-sharing.',
    dataTypes: ['Mining licenses', 'Royalty distributions', 'Geological surveys'],
    category: 'natural_resources',
  },
  {
    id: 'wasreb',
    name: 'Water Services Regulatory Board (WASREB)',
    url: 'https://wasreb.go.ke/',
    description: 'Annual Water Services Performance Report — county water utilities and coverage data.',
    dataTypes: ['Water coverage statistics', 'Non-revenue water losses', 'Utility performance'],
    category: 'natural_resources',
  },
  {
    id: 'kfs',
    name: 'Kenya Forest Service (KFS)',
    url: 'https://kenyaforestservice.org/',
    description: 'Forest cover change data, logging licenses, excision gazettes, and management plans.',
    dataTypes: ['Forest cover data', 'Logging licenses', 'Excision notices', 'Forest plans'],
    category: 'natural_resources',
  },
  {
    id: 'nema',
    name: 'National Environment Management Authority (NEMA)',
    url: 'https://nema.go.ke/',
    description: 'Environmental Impact Assessments for county projects and environmental audits.',
    dataTypes: ['EIA reports', 'Environmental audits', 'Compliance certificates'],
    category: 'natural_resources',
  },
  {
    id: 'kws',
    name: 'Kenya Wildlife Service (KWS)',
    url: 'https://kws.go.ke/',
    description: 'Wildlife census data, human-wildlife conflict statistics, park revenue.',
    dataTypes: ['Wildlife census', 'Conflict statistics', 'Conservancy revenue'],
    category: 'natural_resources',
  },
  {
    id: 'water-ministry',
    name: 'Ministry of Water & Sanitation',
    url: 'https://water.go.ke/',
    description: 'Borehole databases, dam construction status, and irrigation projects per county.',
    dataTypes: ['Borehole databases', 'Dam projects', 'Irrigation status'],
    category: 'natural_resources',
  },

  // ════════════════════════════════════════════════════
  // INFRASTRUCTURE & PUBLIC ASSETS
  // ════════════════════════════════════════════════════
  {
    id: 'kenha',
    name: 'Kenya National Highways Authority (KeNHA)',
    url: 'https://kenha.co.ke/',
    description: 'Road condition surveys, contractor performance, project timelines.',
    dataTypes: ['Road conditions', 'Contractor ratings', 'Project timelines'],
    category: 'infrastructure',
  },
  {
    id: 'keria',
    name: 'Kenya Rural Roads Authority (KeRRA)',
    url: 'https://keria.go.ke/',
    description: 'Rural roads per county, funding status, and completion rates.',
    dataTypes: ['Rural road status', 'Funding data', 'Completion rates'],
    category: 'infrastructure',
  },
  {
    id: 'kura',
    name: 'Kenya Urban Roads Authority (KURA)',
    url: 'https://kura.go.ke/',
    description: 'Urban road inventories and maintenance schedules.',
    dataTypes: ['Urban road inventories', 'Maintenance schedules'],
    category: 'infrastructure',
  },
  {
    id: 'epc',
    name: 'Energy & Petroleum Regulatory Authority (EPRA)',
    url: 'https://epra.go.ke/',
    description: 'Energy access statistics, rural electrification progress per county.',
    dataTypes: ['Electrification rates', 'Energy access data'],
    category: 'infrastructure',
  },
  {
    id: 'kppra',
    name: 'Kenya Public-Private Partnerships Unit (KPPRA)',
    url: 'https://pppunit.go.ke/',
    description: 'PPP projects at county level — public assets built with private capital.',
    dataTypes: ['PPP project registers', 'Contract values', 'County PPP projects'],
    category: 'infrastructure',
  },

  // ════════════════════════════════════════════════════
  // CIVIL SOCIETY & THINK TANKS
  // ════════════════════════════════════════════════════
  {
    id: 'pesacheck',
    name: 'PesaCheck — Africa Fact-Check',
    url: 'https://pesacheck.africa/',
    description: 'Fact-checks on government spending claims, including county-level claims.',
    dataTypes: ['Spending fact-checks', 'Inflated project costs', 'Phantom achievements'],
    category: 'civil_society',
  },
  {
    id: 'katiba',
    name: 'Katiba Institute',
    url: 'https://katibainstitute.org/',
    description: 'Constitutional compliance analysis of county governance.',
    dataTypes: ['Constitutional compliance', 'Devolution analysis'],
    category: 'civil_society',
  },
  {
    id: 'africog',
    name: 'Africa Centre for Open Governance (AfriCOG)',
    url: 'https://africog.org/',
    description: 'Research on public finance integrity and devolution challenges.',
    dataTypes: ['Finance integrity research', 'Devolution reports'],
    category: 'civil_society',
  },
  {
    id: 'bajetihub',
    name: 'Bajeti Hub — Budget Transparency',
    url: 'https://bajeti.go.ke/',
    description: 'County Budget Transparency Survey scores and Citizens Budget Guides.',
    dataTypes: ['Transparency survey scores', 'Citizens budget guides'],
    category: 'civil_society',
  },
  {
    id: 'iebc',
    name: 'IEBC — Elections & Boundaries',
    url: 'https://www.iebc.or.ke/',
    description: 'Official election results, voter registration, boundary reviews.',
    dataTypes: ['Election results', 'Voter registers', 'Boundary reviews'],
    category: 'legal_tools',
  },

  // ════════════════════════════════════════════════════
  // OPEN DATA & TECH PLATFORMS
  // ════════════════════════════════════════════════════
  {
    id: 'opendata',
    name: 'Kenya Open Data Portal',
    url: 'https://opendata.go.ke/',
    description: 'Government datasets including county budgets, procurement, and demographics.',
    dataTypes: ['County budgets (CSV)', 'Procurement data', 'Demographics'],
    category: 'open_data',
  },
  {
    id: 'google-alerts',
    name: 'Google Alerts (Custom Monitoring)',
    url: 'https://google.com/alerts',
    description: 'Set alerts for: "[CountyName] governor" audit, "OAG Kenya" county report, "EACC" investigation.',
    dataTypes: ['Automated news alerts', 'Audit release notifications', 'Investigation coverage'],
    category: 'media_monitoring',
  },

  // ════════════════════════════════════════════════════
  // LEGAL & CITIZEN TOOLS
  // ════════════════════════════════════════════════════
  {
    id: 'cbef',
    name: 'County Budget & Economic Forums (CBEFs)',
    url: 'https://cra.go.ke/',
    description: 'Public participation forums mandated by law — attend or request minutes from each county.',
    dataTypes: ['Public forum minutes', 'Budget input records', 'Citizen priorities'],
    category: 'legal_tools',
  },
  {
    id: 'rti',
    name: 'Right to Information Requests (Art. 35)',
    url: 'https://ag.go.ke/',
    description: 'File formal RTI requests with county departments — legally obligated to respond within 21 days.',
    dataTypes: ['RTI request templates', 'Response tracking'],
    category: 'legal_tools',
  },
];

export const sourceCategories: SourceCategoryGroup[] = [
  {
    id: 'audit_oversight',
    label: 'Audit & Oversight',
    icon: 'Scale',
    color: 'text-emerald-600',
    sources: allSources.filter(s => s.category === 'audit_oversight'),
  },
  {
    id: 'budget_finance',
    label: 'Budget & Finance',
    icon: 'BarChart3',
    color: 'text-blue-600',
    sources: allSources.filter(s => s.category === 'budget_finance'),
  },
  {
    id: 'procurement',
    label: 'Procurement & Contracts',
    icon: 'FileText',
    color: 'text-amber-600',
    sources: allSources.filter(s => s.category === 'procurement'),
  },
  {
    id: 'anti_corruption',
    label: 'Anti-Corruption & Justice',
    icon: 'Shield',
    color: 'text-red-600',
    sources: allSources.filter(s => s.category === 'anti_corruption'),
  },
  {
    id: 'parliament',
    label: 'Parliamentary Records',
    icon: 'Landmark',
    color: 'text-indigo-600',
    sources: allSources.filter(s => s.category === 'parliament'),
  },
  {
    id: 'statistics',
    label: 'Statistics & Indices',
    icon: 'BarChart3',
    color: 'text-purple-600',
    sources: allSources.filter(s => s.category === 'statistics'),
  },
  {
    id: 'natural_resources',
    label: 'Natural Resources',
    icon: 'Globe',
    color: 'text-green-600',
    sources: allSources.filter(s => s.category === 'natural_resources'),
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure & Assets',
    icon: 'Building2',
    color: 'text-orange-600',
    sources: allSources.filter(s => s.category === 'infrastructure'),
  },
  {
    id: 'civil_society',
    label: 'Civil Society & Media',
    icon: 'Users',
    color: 'text-teal-600',
    sources: allSources.filter(s => s.category === 'civil_society'),
  },
  {
    id: 'open_data',
    label: 'Open Data & Tech',
    icon: 'Database',
    color: 'text-sky-600',
    sources: allSources.filter(s => s.category === 'open_data'),
  },
  {
    id: 'legal_tools',
    label: 'Legal & Citizen Tools',
    icon: 'CheckCircle2',
    color: 'text-rose-600',
    sources: allSources.filter(s => s.category === 'legal_tools'),
  },
  {
    id: 'media_monitoring',
    label: 'Media Monitoring',
    icon: 'Search',
    color: 'text-pink-600',
    sources: allSources.filter(s => s.category === 'media_monitoring'),
  },
];
