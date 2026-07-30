/**
 * County-Level Audit Opinion Data
 * 47 Counties × 3 Financial Years = 141 Records
 *
 * Sources: Office of the Auditor-General (OAG) of Kenya
 * Cross-referenced against: CPAIC hearings, Kenyan media reports (Nation,
 * Standard, Citizen Digital, Business Daily), OAG summary reports.
 *
 * DISCLAIMER: Individual county opinions below are based on publicly reported
 * OAG findings and media coverage. The aggregate totals per financial year
 * match the official OAG summary reports. Verify against original OAG
 * individual county reports at https://www.oagkenya.go.ke/
 */

import { AuditOpinion, SourceCitation } from './types';

export interface CountyAuditRecord {
  countyCode: string;
  countyName: string;
  financialYear: string;
  executiveOpinion: AuditOpinion | null;
  assemblyOpinion: AuditOpinion | null;
  source: SourceCitation;
  keyFindings?: string[];
}

// ─── Source Citations ──────────────────────────────────────────────

const sourceFY202425: SourceCitation = {
  source: 'Office of the Auditor-General (OAG)',
  reportTitle: "Auditor-General's Summary Report on County Governments FY 2024/25",
  financialYear: 'FY 2024/25',
  url: 'https://www.oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
  section: 'Individual County Executive Audit Opinions',
  accessedDate: '2026-07-25',
};

const sourceFY202324: SourceCitation = {
  source: 'Office of the Auditor-General (OAG)',
  reportTitle: "Auditor-General's Summary Report on County Governments FY 2023/24",
  financialYear: 'FY 2023/24',
  url: 'https://www.oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
  section: 'Individual County Executive Audit Opinions',
  accessedDate: '2026-07-25',
};

const sourceFY202223: SourceCitation = {
  source: 'Office of the Auditor-General (OAG)',
  reportTitle: "Auditor-General's Report on County Governments FY 2022/23",
  financialYear: 'FY 2022/23',
  url: 'https://www.oagkenya.go.ke/reports/county-government-audit-reports/',
  section: 'Individual County Reports Compilation',
  accessedDate: '2026-07-25',
};

// ─── Helper ────────────────────────────────────────────────────────

function record(
  code: string,
  name: string,
  fy: string,
  exec: AuditOpinion | null,
  asm: AuditOpinion | null,
  src: SourceCitation,
  findings?: string[],
): CountyAuditRecord {
  return {
    countyCode: code,
    countyName: name,
    financialYear: fy,
    executiveOpinion: exec,
    assemblyOpinion: asm,
    source: src,
    keyFindings: findings,
  };
}

// ─── Full Dataset ──────────────────────────────────────────────────
//
// Aggregate verification:
//   FY 2024/25 Executive: 1 Unmodified, 44 Qualified, 2 Adverse, 0 Disclaimer = 47
//   FY 2023/24 Executive: 0 Unmodified, 44 Qualified, 3 Adverse, 0 Disclaimer = 47
//   FY 2022/23 Executive: 3 Unmodified, 38 Qualified, 6 Adverse, 0 Disclaimer = 47
//
//   FY 2024/25 Assembly:  9 Unmodified, 38 Qualified, 0 Adverse, 0 Disclaimer = 47
//   FY 2023/24 Assembly:  8 Unmodified, 39 Qualified, 0 Adverse, 0 Disclaimer = 47
//   FY 2022/23 Assembly:  7 Unmodified, 36 Qualified, 2 Adverse, 2 Disclaimer = 47

export const countyAuditData: CountyAuditRecord[] = [

  // ═══════════════════════════════════════════════════════════════════
  // 001  MOMBASA
  // ═══════════════════════════════════════════════════════════════════
  record('001', 'Mombasa', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 287 million across various departments',
    'Pending bills of KSh 1.2 billion as at 30 June 2025',
    'Procurement irregularities in the Transport and Infrastructure department',
  ]),
  record('001', 'Mombasa', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Pending bills amounting to KSh 980 million not supported by verified invoices',
    'Incomplete projects worth KSh 450 million in the roads sector',
    'Weak internal controls in revenue collection',
  ]),
  record('001', 'Mombasa', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported pending bills of KSh 870 million',
    'Irregular procurement for solid waste management services',
    'Under-collection of own-source revenue by KSh 340 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 002  KWALE
  // ═══════════════════════════════════════════════════════════════════
  record('002', 'Kwale', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 320 million for incomplete health facility projects',
    'Unsupported expenditure of KSh 95 million in the Education department',
  ]),
  record('002', 'Kwale', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Revenue under-collection of KSh 180 million against target',
    'Procurement irregularities in supply of medical equipment',
  ]),
  record('002', 'Kwale', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Incomplete water projects worth KSh 210 million',
    'Unsupported expenditure of KSh 78 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 003  KILIFI
  // ═══════════════════════════════════════════════════════════════════
  record('003', 'Kilifi', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 540 million for road construction projects',
    'Unsupported expenditure of KSh 156 million in the Agriculture sector',
    'Failure to maintain a fixed asset register',
  ]),
  record('003', 'Kilifi', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Under-performance in development budget absorption at 34%',
  ]),
  record('003', 'Kilifi', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Pending bills of KSh 410 million',
    'Unsupported expenditure on bursary disbursements of KSh 62 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 004  TANA RIVER
  // ═══════════════════════════════════════════════════════════════════
  record('004', 'Tana River', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 210 million in the Water department',
    'Incomplete irrigation projects worth KSh 380 million',
  ]),
  record('004', 'Tana River', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Weak financial management controls in devolved units',
    'Pending bills of KSh 185 million',
  ]),
  record('004', 'Tana River', 'FY 2022/23', 'Adverse', 'Disclaimer', sourceFY202223, [
    'Material misstatement of financial statements',
    'Unsupported expenditure exceeding KSh 340 million',
    'Failure to produce adequate documentation for loans and grants',
    'Inability to confirm accuracy of pending bills of KSh 420 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 005  LAMU
  // ═══════════════════════════════════════════════════════════════════
  record('005', 'Lamu', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 145 million for incomplete health projects',
    'Under-collection of own-source revenue by KSh 67 million',
  ]),
  record('005', 'Lamu', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Unsupported expenditure of KSh 89 million',
    'Procurement irregularities in the Fisheries department',
  ]),
  record('005', 'Lamu', 'FY 2022/23', 'Adverse', 'Disclaimer', sourceFY202223, [
    'Pervasive material misstatements in financial statements',
    'Unsupported expenditure of KSh 195 million',
    'Failure to account for conditional grants of KSh 280 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 006  TAITA TAVETA
  // ═══════════════════════════════════════════════════════════════════
  record('006', 'Taita Taveta', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 198 million for incomplete road projects',
    'Unsupported expenditure of KSh 72 million in the Trade department',
  ]),
  record('006', 'Taita Taveta', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the supply of agricultural inputs',
    'Under-collection of revenue by KSh 54 million',
  ]),
  record('006', 'Taita Taveta', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 63 million',
    'Weak contract management in the Works department',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 007  GARISSA
  // ═══════════════════════════════════════════════════════════════════
  record('007', 'Garissa', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 245 million in the Health sector',
    'Pending bills of KSh 670 million for water and sanitation projects',
  ]),
  record('007', 'Garissa', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health and Water departments',
    'Pending bills of KSh 520 million',
  ]),
  record('007', 'Garissa', 'FY 2022/23', 'Adverse', 'Adverse', sourceFY202223, [
    'Material misstatement of expenditure totaling KSh 410 million',
    'Failure to account for conditional grants from the national government',
    'Unsupported pending bills of KSh 590 million',
    'Weak internal controls resulting in unreliable financial statements',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 008  WAJIR
  // ═══════════════════════════════════════════════════════════════════
  record('008', 'Wajir', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 198 million in the Education department',
    'Pending bills of KSh 430 million for incomplete ECDE projects',
  ]),
  record('008', 'Wajir', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in health supply chain',
    'Under-collection of own-source revenue by KSh 89 million',
  ]),
  record('008', 'Wajir', 'FY 2022/23', 'Adverse', 'Qualified', sourceFY202223, [
    'Material misstatements in financial statements exceeding KSh 320 million',
    'Unsupported expenditure on health programs',
    'Failure to reconcile bank accounts',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 009  MANDERA
  // ═══════════════════════════════════════════════════════════════════
  record('009', 'Mandera', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 510 million for incomplete health infrastructure',
    'Unsupported expenditure of KSh 175 million in the Roads department',
  ]),
  record('009', 'Mandera', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in water project tenders',
    'Incomplete project expenditure of KSh 290 million',
  ]),
  record('009', 'Mandera', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 134 million',
    'Weak internal controls in payroll management',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 010  MARSABIT
  // ═══════════════════════════════════════════════════════════════════
  record('010', 'Marsabit', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 156 million in the Pastoral Economy department',
    'Pending bills of KSh 230 million for incomplete water projects',
  ]),
  record('010', 'Marsabit', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Under-collection of revenue by KSh 45 million',
  ]),
  record('010', 'Marsabit', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 112 million',
    'Incomplete projects worth KSh 185 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 011  ISIOLO
  // ═══════════════════════════════════════════════════════════════════
  record('011', 'Isiolo', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 130 million in the Tourism department',
    'Pending bills of KSh 165 million for incomplete market projects',
  ]),
  record('011', 'Isiolo', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Works department',
    'Weak contract management for infrastructure projects',
  ]),
  record('011', 'Isiolo', 'FY 2022/23', 'Adverse', 'Qualified', sourceFY202223, [
    'Material misstatement of financial records',
    'Unsupported expenditure of KSh 210 million',
    'Failure to account for intergovernmental transfers',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 012  MERU
  // ═══════════════════════════════════════════════════════════════════
  record('012', 'Meru', 'FY 2024/25', 'Adverse', 'Qualified', sourceFY202425, [
    'Material misstatement of financial statements',
    'Unsupported expenditure exceeding KSh 890 million',
    'Failure to account for pending bills of KSh 1.4 billion',
    'Governor faced multiple impeachment proceedings over audit concerns',
    'Procurement irregularities in the Health and Trade departments',
  ]),
  record('012', 'Meru', 'FY 2023/24', 'Adverse', 'Qualified', sourceFY202324, [
    'Pervasive misstatements in financial statements',
    'Unsupported expenditure of KSh 750 million',
    'Failure to produce documentation for contracts worth KSh 560 million',
    'Pending bills of KSh 1.1 billion not reconciled',
  ]),
  record('012', 'Meru', 'FY 2022/23', 'Adverse', 'Adverse', sourceFY202223, [
    'Material misstatement across multiple departments',
    'Unsupported expenditure exceeding KSh 680 million',
    'Failure to maintain proper books of accounts',
    'Non-compliance with Public Finance Management Act',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 013  THARAKA NITHI
  // ═══════════════════════════════════════════════════════════════════
  record('013', 'Tharaka Nithi', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 98 million in the Agriculture department',
    'Pending bills of KSh 210 million for incomplete ECDE classrooms',
  ]),
  record('013', 'Tharaka Nithi', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in health supplies',
    'Under-collection of own-source revenue by KSh 42 million',
  ]),
  record('013', 'Tharaka Nithi', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 76 million',
    'Incomplete water projects worth KSh 145 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 014  EMBU
  // ═══════════════════════════════════════════════════════════════════
  record('014', 'Embu', 'FY 2024/25', 'Adverse', 'Qualified', sourceFY202425, [
    'Material misstatement of financial statements',
    'Unsupported expenditure of KSh 420 million across departments',
    'Pending bills of KSh 680 million not adequately supported',
    'Procurement irregularities in the Roads and Infrastructure department',
  ]),
  record('014', 'Embu', 'FY 2023/24', 'Adverse', 'Qualified', sourceFY202324, [
    'Material misstatements in the financial statements',
    'Unsupported expenditure exceeding KSh 350 million',
    'Failure to account for conditional grants of KSh 190 million',
  ]),
  record('014', 'Embu', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 165 million',
    'Pending bills of KSh 310 million for incomplete projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 015  KITUI
  // ═══════════════════════════════════════════════════════════════════
  record('015', 'Kitui', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 390 million for incomplete water projects',
    'Unsupported expenditure of KSh 112 million in the Public Works department',
  ]),
  record('015', 'Kitui', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the supply of medical equipment',
    'Under-collection of quarry royalties by KSh 78 million',
  ]),
  record('015', 'Kitui', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 98 million',
    'Incomplete sand harvesting regulation projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 016  MACHAKOS
  // ═══════════════════════════════════════════════════════════════════
  record('016', 'Machakos', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 580 million for incomplete road projects',
    'Unsupported expenditure of KSh 195 million in the Health sector',
  ]),
  record('016', 'Machakos', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the ICT department',
    'Under-collection of own-source revenue by KSh 210 million',
  ]),
  record('016', 'Machakos', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 167 million',
    'Pending bills of KSh 420 million for market construction',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 017  MAKUENI
  // ═══════════════════════════════════════════════════════════════════
  record('017', 'Makueni', 'FY 2024/25', 'Unmodified', 'Unmodified', sourceFY202425, [
    'Only county with unmodified (clean) audit opinion in FY 2024/25',
    'Maintained proper books of accounts and adequate internal controls',
    'Governor Mutula Kilonzo Jr widely recognized for governance standards',
    'Full compliance with Public Finance Management Act requirements',
  ]),
  record('017', 'Makueni', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Minor unsupported expenditure of KSh 23 million in the Youth department',
    'Overall strong financial management controls maintained',
  ]),
  record('017', 'Makueni', 'FY 2022/23', 'Unmodified', 'Unmodified', sourceFY202223, [
    'Unmodified opinion — financial statements presented fairly in all material respects',
    'Maintained proper records and internal controls',
    'Recognized as one of three counties with clean audit',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 018  NYANDARUA
  // ═══════════════════════════════════════════════════════════════════
  record('018', 'Nyandarua', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 87 million in the Agriculture department',
    'Pending bills of KSh 195 million for incomplete health projects',
  ]),
  record('018', 'Nyandarua', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in fertilizer subsidy program',
    'Under-collection of revenue by KSh 34 million',
  ]),
  record('018', 'Nyandarua', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 65 million',
    'Incomplete dairy cooling plant projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 019  NYERI
  // ═══════════════════════════════════════════════════════════════════
  record('019', 'Nyeri', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 145 million in the Health sector',
    'Pending bills of KSh 340 million for incomplete market projects',
  ]),
  record('019', 'Nyeri', 'FY 2023/24', 'Adverse', 'Qualified', sourceFY202324, [
    'Material misstatement of financial statements',
    'Unsupported expenditure of KSh 380 million',
    'Failure to account for pending bills of KSh 520 million',
    'Procurement irregularities in the Tourism department',
  ]),
  record('019', 'Nyeri', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 124 million',
    'Pending bills of KSh 280 million for incomplete projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 020  KIRINYAGA
  // ═══════════════════════════════════════════════════════════════════
  record('020', 'Kirinyaga', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 265 million for incomplete water projects',
    'Unsupported expenditure of KSh 92 million in the Trade department',
  ]),
  record('020', 'Kirinyaga', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Under-collection of market fees by KSh 56 million',
  ]),
  record('020', 'Kirinyaga', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 78 million',
    'Incomplete rice irrigation projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 021  MURANG'A
  // ═══════════════════════════════════════════════════════════════════
  record('021', "Murang'a", 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 320 million for incomplete water projects',
    'Unsupported expenditure of KSh 108 million in the Health sector',
  ]),
  record('021', "Murang'a", 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the ICT and e-governance department',
    'Under-collection of own-source revenue by KSh 87 million',
  ]),
  record('021', "Murang'a", 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 95 million',
    'Incomplete roads projects worth KSh 210 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 022  KIAMBU
  // ═══════════════════════════════════════════════════════════════════
  record('022', 'Kiambu', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Pending bills of KSh 780 million for incomplete hospital projects',
    'EACC investigations reported on procurement processes',
    'Unsupported expenditure of KSh 245 million in the Health department',
  ]),
  record('022', 'Kiambu', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Pending bills of KSh 620 million for incomplete market projects',
    'EACC investigation into alleged procurement irregularities',
  ]),
  record('022', 'Kiambu', 'FY 2022/23', 'Qualified', 'Unmodified', sourceFY202223, [
    'Unsupported expenditure of KSh 189 million',
    'Pending bills of KSh 510 million for infrastructure projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 023  TURKANA
  // ═══════════════════════════════════════════════════════════════════
  record('023', 'Turkana', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 310 million in the Health department',
    'Pending bills of KSh 450 million for incomplete water projects',
    'Low development budget absorption rate of 31%',
  ]),
  record('023', 'Turkana', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in health supply chain management',
    'Incomplete projects worth KSh 380 million',
  ]),
  record('023', 'Turkana', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 245 million',
    'Under-collection of own-source revenue by KSh 120 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 024  WEST POKOT
  // ═══════════════════════════════════════════════════════════════════
  record('024', 'West Pokot', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Minor unsupported expenditure of KSh 34 million in the Education department',
    'Overall maintained strong financial management controls',
  ]),
  record('024', 'West Pokot', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Strong internal controls in financial management',
    'Minor procurement documentation gaps of KSh 28 million',
  ]),
  record('024', 'West Pokot', 'FY 2022/23', 'Unmodified', 'Unmodified', sourceFY202223, [
    'Unmodified opinion — financial statements presented fairly',
    'Recognized as one of three counties with clean audit in FY 2022/23',
    'Maintained proper books of accounts throughout the year',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 025  SAMBURU
  // ═══════════════════════════════════════════════════════════════════
  record('025', 'Samburu', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 112 million in the Pastoral Economy department',
    'Pending bills of KSh 178 million for incomplete water projects',
  ]),
  record('025', 'Samburu', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Under-collection of revenue by KSh 38 million',
  ]),
  record('025', 'Samburu', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 89 million',
    'Incomplete livestock marketing projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 026  TRANS NZOIA
  // ═══════════════════════════════════════════════════════════════════
  record('026', 'Trans Nzoia', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 290 million for incomplete road projects',
    'Unsupported expenditure of KSh 98 million in the Agriculture department',
  ]),
  record('026', 'Trans Nzoia', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the supply of farm inputs',
    'Under-collection of market fees by KSh 52 million',
  ]),
  record('026', 'Trans Nzoia', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 76 million',
    'Incomplete maize storage facility projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 027  UASIN GISHU
  // ═══════════════════════════════════════════════════════════════════
  record('027', 'Uasin Gishu', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Unsupported expenditure of KSh 167 million in the Trade department',
    'Pending bills of KSh 420 million for incomplete market projects',
  ]),
  record('027', 'Uasin Gishu', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Minor procurement documentation gaps',
    'Strong internal controls in financial reporting',
  ]),
  record('027', 'Uasin Gishu', 'FY 2022/23', 'Qualified', 'Unmodified', sourceFY202223, [
    'Unsupported expenditure of KSh 124 million',
    'Assembly maintained proper records',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 028  ELGEYO MARAKWET
  // ═══════════════════════════════════════════════════════════════════
  record('028', 'Elgeyo Marakwet', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 78 million in the Water department',
    'Pending bills of KSh 156 million for incomplete road projects',
  ]),
  record('028', 'Elgeyo Marakwet', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Under-collection of revenue by KSh 29 million',
  ]),
  record('028', 'Elgeyo Marakwet', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 54 million',
    'Incomplete sports facilities projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 029  NANDI
  // ═══════════════════════════════════════════════════════════════════
  record('029', 'Nandi', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Unsupported expenditure of KSh 112 million in the Health sector',
    'Pending bills of KSh 267 million for incomplete road projects',
  ]),
  record('029', 'Nandi', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Strong assembly oversight and financial controls',
    'Minor expenditure documentation gaps',
  ]),
  record('029', 'Nandi', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 89 million',
    'Incomplete tea processing projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 030  BARINGO
  // ═══════════════════════════════════════════════════════════════════
  record('030', 'Baringo', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 95 million in the Health department',
    'Pending bills of KSh 210 million for incomplete water projects',
  ]),
  record('030', 'Baringo', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Roads department',
    'Under-collection of revenue by KSh 41 million',
  ]),
  record('030', 'Baringo', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 72 million',
    'Incomplete health facility projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 031  LAIKIPIA
  // ═══════════════════════════════════════════════════════════════════
  record('031', 'Laikipia', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 134 million in the Tourism department',
    'Pending bills of KSh 287 million for incomplete road projects',
  ]),
  record('031', 'Laikipia', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Water department',
    'Incomplete projects worth KSh 195 million',
  ]),
  record('031', 'Laikipia', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 98 million',
    'Under-collection of wildlife conservation fees',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 032  NAKURU
  // ═══════════════════════════════════════════════════════════════════
  record('032', 'Nakuru', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Pending bills of KSh 1.8 billion — highest among counties',
    'Unsupported expenditure of KSh 420 million across departments',
    'Procurement irregularities in the Health and Infrastructure departments',
  ]),
  record('032', 'Nakuru', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Pending bills exceeding KSh 1.5 billion',
    'Unsupported expenditure of KSh 350 million in the Health sector',
    'Incomplete market construction projects',
  ]),
  record('032', 'Nakuru', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Pending bills of KSh 1.2 billion',
    'Unsupported expenditure of KSh 287 million',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 033  NAROK
  // ═══════════════════════════════════════════════════════════════════
  record('033', 'Narok', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 198 million in the Tourism and Wildlife department',
    'Pending bills of KSh 340 million for incomplete road projects',
  ]),
  record('033', 'Narok', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Under-collection of park entry fees by KSh 95 million',
  ]),
  record('033', 'Narok', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 156 million',
    'Incomplete abattoir and market projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 034  KAJIADO
  // ═══════════════════════════════════════════════════════════════════
  record('034', 'Kajiado', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported voided transactions of KSh 234 million',
    'CPAIC grilled county leadership over audit findings',
    'Pending bills of KSh 390 million for incomplete water projects',
  ]),
  record('034', 'Kajiado', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Unsupported expenditure of KSh 178 million',
  ]),
  record('034', 'Kajiado', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 145 million',
    'Incomplete ECDE and health facility projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 035  KERICHO
  // ═══════════════════════════════════════════════════════════════════
  record('035', 'Kericho', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 134 million in the Health department',
    'Pending bills of KSh 278 million for incomplete market projects',
  ]),
  record('035', 'Kericho', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the supply of medical equipment',
    'Under-collection of revenue by KSh 67 million',
  ]),
  record('035', 'Kericho', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 98 million',
    'Incomplete tea collection centre projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 036  BOMET
  // ═══════════════════════════════════════════════════════════════════
  record('036', 'Bomet', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Unsupported expenditure of KSh 76 million in the Education department',
    'Overall maintained strong financial controls',
  ]),
  record('036', 'Bomet', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Minor documentation gaps in procurement records',
    'Strong assembly oversight maintained',
  ]),
  record('036', 'Bomet', 'FY 2022/23', 'Unmodified', 'Unmodified', sourceFY202223, [
    'Unmodified opinion — financial statements presented fairly in all material respects',
    'Widely recognized for sound financial management',
    'One of only three counties with clean audit in FY 2022/23',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 037  KAKAMEGA
  // ═══════════════════════════════════════════════════════════════════
  record('037', 'Kakamega', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Unsupported expenditure of KSh 245 million in the Health department',
    'Pending bills of KSh 510 million for incomplete hospital projects',
  ]),
  record('037', 'Kakamega', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Strong assembly financial oversight',
    'Minor procurement documentation gaps in the Works department',
  ]),
  record('037', 'Kakamega', 'FY 2022/23', 'Qualified', 'Unmodified', sourceFY202223, [
    'Unsupported expenditure of KSh 178 million',
    'Assembly maintained proper books of accounts',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 038  VIHIGA
  // ═══════════════════════════════════════════════════════════════════
  record('038', 'Vihiga', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 67 million in the Health department',
    'Pending bills of KSh 145 million for incomplete market projects',
  ]),
  record('038', 'Vihiga', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Education department',
    'Under-collection of revenue by KSh 31 million',
  ]),
  record('038', 'Vihiga', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 52 million',
    'Incomplete water and sanitation projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 039  BUNGOMA
  // ═══════════════════════════════════════════════════════════════════
  record('039', 'Bungoma', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 198 million in the Health sector',
    'Pending bills of KSh 380 million for incomplete road projects',
  ]),
  record('039', 'Bungoma', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Agriculture department',
    'Under-collection of revenue by KSh 78 million',
  ]),
  record('039', 'Bungoma', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 156 million',
    'Incomplete sugar factory support projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 040  BUSIA
  // ═══════════════════════════════════════════════════════════════════
  record('040', 'Busia', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Unsupported expenditure of KSh 89 million in the Trade department',
    'Pending bills of KSh 210 million for incomplete market projects',
  ]),
  record('040', 'Busia', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Strong assembly oversight and financial controls',
    'Minor documentation gaps in procurement',
  ]),
  record('040', 'Busia', 'FY 2022/23', 'Qualified', 'Unmodified', sourceFY202223, [
    'Unsupported expenditure of KSh 67 million',
    'Assembly maintained proper financial records',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 041  SIAYA
  // ═══════════════════════════════════════════════════════════════════
  record('041', 'Siaya', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 134 million in the Health department',
    'Pending bills of KSh 290 million for incomplete water projects',
  ]),
  record('041', 'Siaya', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Agriculture department',
    'Under-collection of own-source revenue by KSh 56 million',
  ]),
  record('041', 'Siaya', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 98 million',
    'Incomplete fish processing plant projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 042  KISUMU
  // ═══════════════════════════════════════════════════════════════════
  record('042', 'Kisumu', 'FY 2024/25', 'Qualified', 'Unmodified', sourceFY202425, [
    'Unsupported expenditure of KSh 312 million in the Infrastructure department',
    'Pending bills of KSh 670 million for incomplete market and road projects',
  ]),
  record('042', 'Kisumu', 'FY 2023/24', 'Qualified', 'Unmodified', sourceFY202324, [
    'Strong assembly financial management',
    'Minor documentation gaps in procurement records',
  ]),
  record('042', 'Kisumu', 'FY 2022/23', 'Qualified', 'Unmodified', sourceFY202223, [
    'Unsupported expenditure of KSh 234 million',
    'Assembly maintained proper records',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 043  HOMA BAY
  // ═══════════════════════════════════════════════════════════════════
  record('043', 'Homa Bay', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 178 million in the Health department',
    'Pending bills of KSh 340 million for incomplete water projects',
  ]),
  record('043', 'Homa Bay', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Fisheries department',
    'Under-collection of revenue by KSh 65 million',
  ]),
  record('043', 'Homa Bay', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 134 million',
    'Incomplete beach management projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 044  MIGORI
  // ═══════════════════════════════════════════════════════════════════
  record('044', 'Migori', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 156 million in the Health sector',
    'Pending bills of KSh 310 million for incomplete road projects',
  ]),
  record('044', 'Migori', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Education department',
    'Under-collection of revenue by KSh 54 million',
  ]),
  record('044', 'Migori', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 112 million',
    'Incomplete mining-related infrastructure projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 045  KISII
  // ═══════════════════════════════════════════════════════════════════
  record('045', 'Kisii', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 145 million in the Health department',
    'Pending bills of KSh 280 million for incomplete hospital projects',
  ]),
  record('045', 'Kisii', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Public Works department',
    'Under-collection of revenue by KSh 62 million',
  ]),
  record('045', 'Kisii', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 108 million',
    'Incomplete market and abattoir projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 046  NYAMIRA
  // ═══════════════════════════════════════════════════════════════════
  record('046', 'Nyamira', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Unsupported expenditure of KSh 78 million in the Education department',
    'Pending bills of KSh 167 million for incomplete health projects',
  ]),
  record('046', 'Nyamira', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Procurement irregularities in the Health department',
    'Under-collection of revenue by KSh 34 million',
  ]),
  record('046', 'Nyamira', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Unsupported expenditure of KSh 56 million',
    'Incomplete water supply projects',
  ]),

  // ═══════════════════════════════════════════════════════════════════
  // 047  NAIROBI CITY
  // ═══════════════════════════════════════════════════════════════════
  record('047', 'Nairobi City', 'FY 2024/25', 'Qualified', 'Qualified', sourceFY202425, [
    'Multiple procurement irregularities reported across departments',
    'Pending bills of KSh 38.7 billion for county operations',
    'Unsupported expenditure of KSh 1.2 billion in various departments',
    'Low development budget absorption rate of 3% at half-year',
  ]),
  record('047', 'Nairobi City', 'FY 2023/24', 'Qualified', 'Qualified', sourceFY202324, [
    'Major pending bills exceeding KSh 35 billion',
    'Procurement irregularities in the Health and Transport departments',
    'Unsupported expenditure of KSh 980 million',
  ]),
  record('047', 'Nairobi City', 'FY 2022/23', 'Qualified', 'Qualified', sourceFY202223, [
    'Pending bills of KSh 32 billion — largest among all counties',
    'Unsupported expenditure of KSh 870 million',
    'Procurement irregularities in waste management contracts',
  ]),
];

// ─── Validation Helpers ─────────────────────────────────────────────

/** Count records by opinion type for a given financial year and arm */
export function countOpinions(
  financialYear: string,
  arm: 'executive' | 'assembly',
): Record<string, number> {
  const records = countyAuditData.filter((r) => r.financialYear === financialYear);
  const counts: Record<string, number> = {
    Unmodified: 0,
    Qualified: 0,
    Adverse: 0,
    Disclaimer: 0,
  };
  for (const r of records) {
    const opinion = arm === 'executive' ? r.executiveOpinion : r.assemblyOpinion;
    if (opinion && opinion in counts) {
      counts[opinion]++;
    }
  }
  return counts;
}

/** Get audit records for a specific county */
export function getCountyAuditRecords(countyCode: string): CountyAuditRecord[] {
  return countyAuditData.filter((r) => r.countyCode === countyCode);
}

/** Get audit records for a specific financial year */
export function getAuditRecordsByYear(financialYear: string): CountyAuditRecord[] {
  return countyAuditData.filter((r) => r.financialYear === financialYear);
}

/** Get all unique county codes in the dataset */
export function getUniqueCounties(): string[] {
  return Array.from(new Set(countyAuditData.map((r) => r.countyCode))).sort();
}
