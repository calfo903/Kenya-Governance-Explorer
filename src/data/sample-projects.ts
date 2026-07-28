import { ProjectRecord, AuditTimelineEvent } from '@/data/types';

export const sampleProjects: ProjectRecord[] = [
  // Kajiado Water Project
  {
    id: 'PRJ-034-001',
    name: 'Kajiado County Water Supply Enhancement',
    countyCode: '034',
    category: 'Water & Sanitation',
    status: 'active',
    budgetAllocated: 450000000,
    budgetSpent: 198000000,
    startDate: '2023-07-01',
    location: { lat: -1.8515, lng: 36.7822, name: 'Kajiado Town' },
    implementingAgency: 'Kajiado County Water & Sanitation Department',
    auditOpinion: 'Qualified',
    timeline: [
      { id: 'TL-001', date: '2023-07-01', title: 'Project Inception & Budget Allocation', description: 'County Assembly approved KSh 450M for water supply enhancement across 12 wards in Kajiado.', type: 'lifecycle_start', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-034-001' },
      { id: 'TL-002', date: '2023-09-15', title: 'Environmental Impact Assessment Filed', description: 'EIA submitted to NEMA for the water pipeline extension and borehole drilling program.', type: 'milestone', severity: 'info', verificationStatus: 'verified', projectRef: 'PRJ-034-001' },
      { id: 'TL-003', date: '2024-01-20', title: 'Phase 1 Construction Begins', description: 'Pipeline construction from Kajiado Town to Isinya commenced with contractor mobilization.', type: 'milestone', severity: 'info', verificationStatus: 'verified', projectRef: 'PRJ-034-001' },
      { id: 'TL-004', date: '2024-06-30', title: 'Qualified Audit Opinion Issued', description: 'OAG flagged unsupported voided transactions amounting to KSh 12.3M and incomplete project documentation for 3 boreholes.', type: 'audit', severity: 'warning', verificationStatus: 'verified', source: { source: 'OAG Kenya', reportTitle: 'Special Audit: Kajiado County Water Projects', financialYear: 'FY 2023/24', url: 'https://oagkenya.go.ke/', accessedDate: '2025-03-15' }, projectRef: 'PRJ-034-001' },
      { id: 'TL-005', date: '2024-09-10', title: 'Budget Absorption Rate 44%', description: 'CoB reported only 44% development budget absorption rate against an annual target of 80%.', type: 'budget', severity: 'critical', verificationStatus: 'verified', projectRef: 'PRJ-034-001' },
      { id: 'TL-006', date: '2025-02-01', title: 'Community Reports Dry Taps', description: 'Citizen feedback platform received 47 reports of non-functional water points in Kipeto and Matapato wards.', type: 'finding', severity: 'critical', verificationStatus: 'pending', projectRef: 'PRJ-034-001' },
      { id: 'TL-007', date: '2025-06-01', title: 'Current Verification Status', description: 'Project ongoing. 3 of 12 wards served. Multiple audit findings unresolved. Risk of further delays due to pending bills of KSh 67M.', type: 'lifecycle_end', severity: 'warning', verificationStatus: 'pending', projectRef: 'PRJ-034-001' },
    ],
    riskScore: 62,
    riskFactors: ['Low budget absorption', 'Qualified audit opinion', 'Community complaints', 'Pending bills'],
    citizenPhotos: 23,
  },
  // Mombasa Road project
  {
    id: 'PRJ-001-002',
    name: 'Mombasa County Dongo Kundu Bypass Link Roads',
    countyCode: '001',
    category: 'Infrastructure',
    status: 'stalled',
    budgetAllocated: 1200000000,
    budgetSpent: 780000000,
    startDate: '2022-08-15',
    endDate: '2024-12-31',
    location: { lat: -4.0435, lng: 39.6682, name: 'Mombasa, Likoni' },
    implementingAgency: 'Mombasa County Department of Roads',
    auditOpinion: 'Adverse',
    timeline: [
      { id: 'TL-010', date: '2022-08-15', title: 'Project Inception & Budget Allocation', description: 'KSh 1.2B allocated by County Assembly for bypass link road construction connecting Dongo Kundu to mainland.', type: 'lifecycle_start', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-001-002' },
      { id: 'TL-011', date: '2023-03-01', title: 'Contract Awarded', description: 'Tender awarded to H. Young & Co. for Phase 1 earthworks and drainage.', type: 'milestone', severity: 'info', verificationStatus: 'verified', projectRef: 'PRJ-001-002' },
      { id: 'TL-012', date: '2024-03-15', title: 'Adverse Audit Opinion', description: 'OAG issued adverse opinion citing KSh 340M in unsupported expenditures, inflated contract variations, and failure to complete deliverables per schedule.', type: 'audit', severity: 'critical', verificationStatus: 'verified', projectRef: 'PRJ-001-002' },
      { id: 'TL-013', date: '2024-08-01', title: 'Project Stalled', description: 'Construction halted due to contractor dispute and pending bills of KSh 290M. County yet to resolve payment.', type: 'action', severity: 'critical', verificationStatus: 'pending', projectRef: 'PRJ-001-002' },
      { id: 'TL-014', date: '2025-01-01', title: 'Current Verification Status', description: 'Project stalled since August 2024. 65% complete. No resolution timeline provided. Citizens continue to use alternative routes adding 45min commute.', type: 'lifecycle_end', severity: 'critical', verificationStatus: 'pending', projectRef: 'PRJ-001-002' },
    ],
    riskScore: 85,
    riskFactors: ['Adverse audit opinion', 'Project stalled', 'KSh 290M pending bills', 'Contractor dispute'],
    citizenPhotos: 56,
  },
  // Nairobi Health
  {
    id: 'PRJ-047-001',
    name: 'Nairobi County Maternal Health Ward Upgrades',
    countyCode: '047',
    category: 'Health',
    status: 'active',
    budgetAllocated: 280000000,
    budgetSpent: 252000000,
    startDate: '2023-01-15',
    location: { lat: -1.2864, lng: 36.8172, name: 'Nairobi, Kenyatta Hospital Area' },
    implementingAgency: 'Nairobi City County Department of Health',
    timeline: [
      { id: 'TL-020', date: '2023-01-15', title: 'Project Inception & Budget Allocation', description: 'KSh 280M allocated for upgrading maternal health wards at 4 county hospitals.', type: 'lifecycle_start', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-047-001' },
      { id: 'TL-021', date: '2023-06-01', title: 'Equipment Procurement Complete', description: 'All medical equipment procured through open tender. Delivery verified at Mama Lucy, Pumwani, and Mbagathi hospitals.', type: 'milestone', severity: 'info', verificationStatus: 'verified', projectRef: 'PRJ-047-001' },
      { id: 'TL-022', date: '2024-01-10', title: 'Ward Renovations Complete (3/4)', description: 'Three hospital ward renovations completed. Mama Lucy ward delayed due to structural concerns.', type: 'milestone', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-047-001' },
      { id: 'TL-023', date: '2024-07-15', title: 'Unmodified Audit Opinion', description: 'OAG issued unmodified opinion. Commended transparent procurement and 90% budget absorption rate.', type: 'audit', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-047-001' },
      { id: 'TL-024', date: '2025-03-01', title: 'Mama Lucy Ward Reopened', description: 'Final ward reopened with full maternal health services. 4/4 complete. Project on track for formal closure.', type: 'milestone', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-047-001' },
      { id: 'TL-025', date: '2025-06-01', title: 'Current Verification Status', description: 'Project substantially complete. 4/4 wards operational. Awaiting final handover from contractor. Excellent audit record maintained.', type: 'lifecycle_end', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-047-001' },
    ],
    riskScore: 12,
    riskFactors: [],
    citizenPhotos: 8,
  },
  // Kisumu Education
  {
    id: 'PRJ-022-001',
    name: 'Kisumu County ECD Classroom Construction Programme',
    countyCode: '022',
    category: 'Education',
    status: 'active',
    budgetAllocated: 180000000,
    budgetSpent: 108000000,
    startDate: '2023-09-01',
    location: { lat: -0.1022, lng: 34.7617, name: 'Kisumu CBD' },
    implementingAgency: 'Kisumu County Department of Education',
    timeline: [
      { id: 'TL-030', date: '2023-09-01', title: 'Project Inception & Budget Allocation', description: 'KSh 180M approved for construction of 30 Early Childhood Development centres across Kisumu.', type: 'lifecycle_start', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-022-001' },
      { id: 'TL-031', date: '2024-02-15', title: 'First 10 ECD Centres Completed', description: 'Phase 1 complete: 10 ECD centres operational in Seme, Kisumu Central, and Muhoroni sub-counties.', type: 'milestone', severity: 'info', verificationStatus: 'verified', projectRef: 'PRJ-022-001' },
      { id: 'TL-032', date: '2024-09-01', title: 'Qualified Audit: Incomplete Records', description: 'OAG noted missing procurement records for KSh 8.5M in furniture supplies. County asked to provide documentation.', type: 'audit', severity: 'warning', verificationStatus: 'verified', projectRef: 'PRJ-022-001' },
      { id: 'TL-033', date: '2025-03-01', title: 'Phase 2 Underway', description: 'Construction of next 12 centres began. Community volunteers participating in site monitoring.', type: 'milestone', severity: 'info', verificationStatus: 'verified', projectRef: 'PRJ-022-001' },
      { id: 'TL-034', date: '2025-06-01', title: 'Current Verification Status', description: '22/30 centres complete. On track despite minor audit findings. Community engagement strong with 41 citizen site photos submitted.', type: 'lifecycle_end', severity: 'success', verificationStatus: 'pending', projectRef: 'PRJ-022-001' },
    ],
    riskScore: 28,
    riskFactors: ['Missing procurement records'],
    citizenPhotos: 41,
  },
  // Garissa Livestock
  {
    id: 'PRJ-008-001',
    name: 'Garissa County Livestock Market & Slaughterhouse Modernization',
    countyCode: '008',
    category: 'Agriculture',
    status: 'planning',
    budgetAllocated: 95000000,
    budgetSpent: 0,
    startDate: '2025-04-01',
    location: { lat: -0.4531, lng: 39.6589, name: 'Garissa Town' },
    implementingAgency: 'Garissa County Department of Agriculture & Livestock',
    timeline: [
      { id: 'TL-040', date: '2025-04-01', title: 'Project Inception & Budget Allocation', description: 'KSh 95M approved for modernization of Garissa livestock market and new slaughterhouse facility.', type: 'lifecycle_start', severity: 'success', verificationStatus: 'verified', projectRef: 'PRJ-008-001' },
      { id: 'TL-041', date: '2025-05-15', title: 'Public Participation Forums', description: '5 public participation forums held across Garissa sub-counties. Community priorities documented.', type: 'action', severity: 'info', verificationStatus: 'verified', projectRef: 'PRJ-008-001' },
      { id: 'TL-042', date: '2025-06-01', title: 'Current Verification Status', description: 'Project in planning phase. EIA underway. Tender process expected Q3 2025. No audit activity yet.', type: 'lifecycle_end', severity: 'info', verificationStatus: 'pending', projectRef: 'PRJ-008-001' },
    ],
    riskScore: 15,
    riskFactors: [],
    citizenPhotos: 2,
  },
];

export function getProjectById(id: string): ProjectRecord | undefined {
  return sampleProjects.find(p => p.id === id);
}

export function getProjectsByCounty(countyCode: string): ProjectRecord[] {
  return sampleProjects.filter(p => p.countyCode === countyCode);
}

export function getAllProjects(): ProjectRecord[] {
  return sampleProjects;
}
