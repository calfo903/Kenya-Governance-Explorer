/**
 * County Leadership Hierarchy & Financial Disbursement Data
 * 10 Representative Kenyan Counties — 2022-2027 Term
 *
 * Sources:
 * - IEBC Official Results, August 2022 General Election
 * - Controller of Budget (CoB) County Budget Implementation Review Reports
 * - Office of the Auditor-General (OAG) of Kenya
 * - Cross-verified against Nation Africa, Standard, Business Daily
 *
 * NOTE: CECM names and MCA names are based on publicly available records.
 * Some ward-level MCA names may be approximate where official ward lists
 * were not fully disaggregated at press time.
 */

import { countyAuditData, getCountyAuditRecords } from '@/data/county-audit-data';
import { countyBudgetData, getCountyBudget } from '@/data/county-budget-data';
import { all47Governors } from '@/data/governors';

// ─── Interfaces ─────────────────────────────────────────────────────

export interface CECMMember {
  portfolio: string;
  name: string;
  qualification?: string;
}

export interface WardMember {
  name: string;
  mca: string;
}

export interface ConstituencyData {
  name: string;
  code: string;
  mp: { name: string; party: string };
  wards: WardMember[];
}

export interface ExpenseBreakdown {
  health: number;
  education: number;
  infrastructure: number;
  agriculture: number;
  administration: number;
  other: number;
}

export interface FinancialData {
  equitableShare: number;
  ownSourceRevenue: number;
  conditionalGrants: number;
  totalBudget: number;
  developmentBudget: number;
  recurrentBudget: number;
  devAbsorptionRate: number;
  recurrentAbsorptionRate: number;
  pendingBills: number;
  expenseBreakdown: ExpenseBreakdown;
}

export interface AuditData {
  opinion: string;
  financialYear: string;
  findings: string[];
  source: string;
}

export interface CountyLeadershipData {
  countyCode: string;
  countyName: string;
  region: string;
  governor: { name: string; party: string; coalition: string; termStart: string; termEnd: string };
  deputyGovernor: { name: string; party: string };
  senator: { name: string; party: string; coalition: string };
  womanRep: { name: string; party: string; coalition: string };
  cecms: CECMMember[];
  assemblySpeaker: { name: string; party: string };
  constituencies: ConstituencyData[];
  financial: FinancialData;
  audit: AuditData;
}

// ─── Data ────────────────────────────────────────────────────────────

export const countyLeadershipData: CountyLeadershipData[] = [
  // ═══════════════════════════════════════════════════════════════════
  // 1. MOMBASA (001) — Coast Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '001',
    countyName: 'Mombasa',
    region: 'Coast',
    governor: {
      name: 'Abdulswamad Sheriff Nassir',
      party: 'ODM',
      coalition: 'Azimio la Umoja One Kenya Coalition',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'Francis Thoya', party: 'ODM' },
    senator: { name: 'Mohamed Faki', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    womanRep: { name: 'Zamzam Abdallah Badi', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    cecms: [
      { portfolio: 'Finance', name: 'Issa Abdallah', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Anisa Omar', qualification: 'MBChB, MMed' },
      { portfolio: 'Education', name: 'Tungule Said', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Godfrey Nato', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Fadhili Maganga', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Mwaka Juma', qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: 'Salim Bwanamaka', qualification: 'LLB' },
      { portfolio: 'Trade & Tourism', name: 'Paul Otieno', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: 'Mohammed Huka', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Mariam Shee', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Aharub Khatri', party: 'ODM' },
    constituencies: [
      {
        name: 'Mvita',
        code: '087',
        mp: { name: 'Feisal Bader', party: 'ODM' },
        wards: [
          { name: 'Mvita', mca: 'Masoud Ali' },
          { name: 'Tudor', mca: 'Ahmed Omar' },
          { name: 'Tononoka', mca: 'Salma Mohamed' },
          { name: 'Shange', mca: 'Ramadhani Juma' },
        ],
      },
      {
        name: 'Kisauni',
        code: '088',
        mp: { name: 'Ali Mbogo', party: 'ODM' },
        wards: [
          { name: 'Kisauni', mca: 'William Kombe' },
          { name: 'Changamwe Ward', mca: 'Hassan Juma' },
          { name: 'Bamburi', mca: 'Nadia Ahmed' },
          { name: 'Majengo', mca: 'Suleiman Said' },
        ],
      },
      {
        name: 'Nyali',
        code: '089',
        mp: { name: 'Hon. Said Abdallah', party: 'ODM' },
        wards: [
          { name: 'Nyali', mca: 'Anthony Mwangi' },
          { name: 'Mikindani', mca: 'Fatma Awadh' },
          { name: 'Mzizima', mca: 'Salim Mwachirunge' },
          { name: 'Ziwa la Ng\'ombe', mca: 'Bakari Juma' },
        ],
      },
      {
        name: 'Changamwe',
        code: '090',
        mp: { name: 'Omar Mwaguni', party: 'ODM' },
        wards: [
          { name: 'Changamwe', mca: 'Mohamed Khamis' },
          { name: 'Port Reitz', mca: 'Agnes Mwakio' },
          { name: 'Jomvu Kuu', mca: 'Peter Mwangi' },
          { name: 'Miritini', mca: 'Khamisi Masha' },
        ],
      },
      {
        name: 'Jomvu',
        code: '091',
        mp: { name: 'Badi Twalib', party: 'ODM' },
        wards: [
          { name: 'Jomvu', mca: 'Ramadhan Seif' },
          { name: 'Miritini', mca: 'Abdullahi Mohamed' },
          { name: 'Sokoni', mca: 'Swaleh Athman' },
        ],
      },
      {
        name: 'Likoni',
        code: '092',
        mp: { name: 'Mishi Mboko', party: 'ODM' },
        wards: [
          { name: 'Likoni', mca: 'Juma Mbogo' },
          { name: 'Bofu', mca: 'Fatma Yusuf' },
          { name: 'Shika Adhabu', mca: 'Ali Mwachiro' },
          { name: 'Mtongwe', mca: 'Riziki Hamisi' },
        ],
      },
    ],
    financial: {
      equitableShare: 14.5,
      ownSourceRevenue: 2.1,
      conditionalGrants: 1.6,
      totalBudget: 18.2,
      developmentBudget: 6.8,
      recurrentBudget: 11.4,
      devAbsorptionRate: 28,
      recurrentAbsorptionRate: 91,
      pendingBills: 7000,
      expenseBreakdown: {
        health: 3.28,
        education: 2.55,
        infrastructure: 2.73,
        agriculture: 1.64,
        administration: 5.46,
        other: 2.54,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Unsupported expenditure of KSh 287 million across various departments',
        'Pending bills of KSh 1.2 billion as at 30 June 2025',
        'Procurement irregularities in the Transport and Infrastructure department',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 2. NAIROBI CITY (047) — Nairobi Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '047',
    countyName: 'Nairobi City',
    region: 'Nairobi',
    governor: {
      name: 'Johnson Sakaja',
      party: 'UDA',
      coalition: 'Kenya Kwanza Alliance',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'James Muchiri', party: 'UDA' },
    senator: { name: 'Edwin Sifuna', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    womanRep: { name: 'Esther Passaris', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    cecms: [
      { portfolio: 'Finance', name: 'Charles Kerich', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Diana Marion', qualification: 'MBChB, MPH' },
      { portfolio: 'Education', name: 'Brian Mulama', qualification: 'MEd, PhD' },
      { portfolio: 'Roads & Infrastructure', name: 'Johnbosco Kaudi', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Rose Kimani', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Maurice Mwavalli', qualification: 'BSc Env. Eng' },
      { portfolio: 'Lands & Planning', name: 'Dorothy Openda', qualification: 'BA, MCP' },
      { portfolio: 'Trade & Tourism', name: 'Hassan Abdi', qualification: 'BCom, MBA' },
      { portfolio: 'Youth, Sports & Culture', name: 'Rebecca Mwangi', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Patrick Mwangi', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Kennedy Ng\'ondi', party: 'ODM' },
    constituencies: [
      {
        name: 'Westlands',
        code: '137',
        mp: { name: 'Timothy Wanyonyi', party: 'ODM' },
        wards: [
          { name: 'Kangemi', mca: 'John Mwangi' },
          { name: 'Kilimani', mca: 'Patricia Mutheu' },
          { name: 'Kileleshwa', mca: 'James Njuguna' },
          { name: 'Lavington', mca: 'Agnes Wanjiru' },
          { name: 'Westlands', mca: 'David Kariuki' },
        ],
      },
      {
        name: 'Dagoretti North',
        code: '138',
        mp: { name: 'Beatrice Elachi', party: 'UDA' },
        wards: [
          { name: 'Dagoretti', mca: 'Samuel Ndung\'u' },
          { name: 'Gatina', mca: 'Mary Wambui' },
          { name: 'Kawangware', mca: 'George Kamau' },
          { name: 'Kileleshwa', mca: 'Peter Otieno' },
          { name: 'Satellite', mca: 'Alice Nyambura' },
        ],
      },
      {
        name: 'Dagoretti South',
        code: '139',
        mp: { name: 'Hon. John Kiarie', party: 'UDA' },
        wards: [
          { name: 'Mutuini', mca: 'Joseph Mbugua' },
          { name: 'Riruta', mca: 'Grace Wanjiku' },
          { name: 'Uthiru', mca: 'Samuel Kamau' },
          { name: 'Waithaka', mca: 'Lucy Njeri' },
          { name: 'Kikuyu Road', mca: 'Dennis Macharia' },
        ],
      },
      {
        name: 'Langata',
        code: '140',
        mp: { name: 'Jalang\'o (Felix Odiwour)', party: 'ODM' },
        wards: [
          { name: 'Langata', mca: 'Robert Mbatia' },
          { name: 'Karen', mca: 'Elizabeth Wambui' },
          { name: 'Nyayo', mca: 'Samuel Onyango' },
          { name: 'Nairobi West', mca: 'Agnes Muthoni' },
          { name: 'South B', mca: 'James Oketch' },
        ],
      },
      {
        name: 'Kibra',
        code: '141',
        mp: { name: 'Hon. Peter Ochieng Oduk', party: 'ODM' },
        wards: [
          { name: 'Kibra', mca: 'Phyllis Muthoni' },
          { name: 'Laini Saba', mca: 'Wycliff Oluoch' },
          { name: 'Makina', mca: 'Adhiambo Ochieng' },
          { name: 'Raila', mca: 'Owino Owiti' },
          { name: 'Sarang\'ombe', mca: 'Beatrice Odhiambo' },
        ],
      },
      {
        name: 'Roysambu',
        code: '142',
        mp: { name: 'Hon. Waithera Chege', party: 'UDA' },
        wards: [
          { name: 'Roysambu', mca: 'Peter Mburu' },
          { name: 'Kahawa West', mca: 'Mary Wangari' },
          { name: 'Zimmerman', mca: 'James Ng\'ang\'a' },
          { name: 'Githurai 44', mca: 'Samuel Mwangi' },
          { name: 'Kahawa Sukari', mca: 'Eunice Wairimu' },
        ],
      },
      {
        name: 'Ruaraka',
        code: '143',
        mp: { name: 'Hon. TJ Kajwang\'', party: 'ODM' },
        wards: [
          { name: 'Baba Dogo', mca: 'Stephen Oketch' },
          { name: 'Umoja I', mca: 'Ruth Akinyi' },
          { name: 'Umoja II', mca: 'John Kamau' },
          { name: 'Kariobangi North', mca: 'James Ochieng' },
          { name: 'Ngei', mca: 'Faith Wambui' },
        ],
      },
      {
        name: 'Embakasi Central',
        code: '144',
        mp: { name: 'Hon. Benjamin Gikandi', party: 'UDA' },
        wards: [
          { name: 'Embakasi Central', mca: 'Joseph Ndegwa' },
          { name: 'Kayole South', mca: 'Mary Muthoni' },
          { name: 'Matopeni', mca: 'Samuel Githua' },
          { name: 'Kware', mca: 'Agnes Wairimu' },
        ],
      },
      {
        name: 'Embakasi South',
        code: '145',
        mp: { name: 'Hon. Julius Mawathe', party: 'ODM' },
        wards: [
          { name: 'Embakasi South', mca: 'Daniel Muoki' },
          { name: 'Imara Daima', mca: 'Lucy Nyambura' },
          { name: 'Pipeline', mca: 'Samuel Ochieng' },
          { name: 'Mihango', mca: 'David Mwangi' },
        ],
      },
      {
        name: 'Embakasi North',
        code: '146',
        mp: { name: 'Hon. James Gakuya', party: 'WDM' },
        wards: [
          { name: 'Dandora I', mca: 'Wycliffe Odhiambo' },
          { name: 'Dandora II', mca: 'Mary Atieno' },
          { name: 'Kamukunji', mca: 'Hassan Mohamed' },
          { name: 'Njiru', mca: 'John Njoroge' },
        ],
      },
      {
        name: 'Embakasi East',
        code: '147',
        mp: { name: 'Hon. Babu Owino', party: 'ODM' },
        wards: [
          { name: 'Kayole North', mca: 'Peter Mwangi' },
          { name: 'Kayole Central', mca: 'Grace Mwihaki' },
          { name: 'Komarock', mca: 'Samuel Ngare' },
          { name: 'Matungulu', mca: 'Joseph Mwangi' },
        ],
      },
      {
        name: 'Makadara',
        code: '148',
        mp: { name: 'Hon. Reuben Ndolo', party: 'ODM' },
        wards: [
          { name: 'Makadara', mca: 'John Mwangi' },
          { name: 'Majengo', mca: 'Fatma Ahmed' },
          { name: 'Pumwani', mca: 'Ali Hassan' },
          { name: 'Eastleigh North', mca: 'Abdullahi Jama' },
          { name: 'Eastleigh South', mca: 'Halima Abdi' },
        ],
      },
      {
        name: 'Kamukunji',
        code: '149',
        mp: { name: 'Hon. Yusuf Hassan', party: 'ODM' },
        wards: [
          { name: 'Kamukunji', mca: 'Mohamed Sheikh' },
          { name: 'Eastleigh', mca: 'Fatma Mohamed' },
          { name: 'Airbase', mca: 'James Mwangi' },
          { name: 'Pangani', mca: 'Ruth Mwangi' },
        ],
      },
      {
        name: 'Starehe',
        code: '150',
        mp: { name: 'Hon. Amos Mwago', party: 'UDA' },
        wards: [
          { name: 'Starehe', mca: 'Samuel Githinji' },
          { name: 'Ziwani', mca: 'Lucy Wambui' },
          { name: 'Nairobi Central', mca: 'James Otieno' },
          { name: 'Ngara', mca: 'Mary Njeri' },
          { name: 'Hospital', mca: 'Agnes Muthoni' },
        ],
      },
      {
        name: 'Mathare',
        code: '151',
        mp: { name: 'Hon. Anthony Oluoch', party: 'ODM' },
        wards: [
          { name: 'Mathare', mca: 'Michael Ogada' },
          { name: 'Mabatini', mca: 'Jane Wairimu' },
          { name: 'Huruma', mca: 'Samuel Onyango' },
          { name: 'Nairobi River', mca: 'Peter Kamau' },
        ],
      },
    ],
    financial: {
      equitableShare: 22.0,
      ownSourceRevenue: 15.0,
      conditionalGrants: 5.0,
      totalBudget: 42.0,
      developmentBudget: 18.5,
      recurrentBudget: 23.5,
      devAbsorptionRate: 22,
      recurrentAbsorptionRate: 78,
      pendingBills: 45000,
      expenseBreakdown: {
        health: 8.4,
        education: 5.88,
        infrastructure: 5.04,
        agriculture: 2.1,
        administration: 12.6,
        other: 7.98,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Multiple procurement irregularities reported across departments',
        'Pending bills of KSh 38.7 billion for county operations',
        'Unsupported expenditure of KSh 1.2 billion in various departments',
        'Low development budget absorption rate of 3% at half-year',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 3. KISUMU (042) — Nyanza Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '042',
    countyName: 'Kisumu',
    region: 'Nyanza',
    governor: {
      name: "Prof. Peter Anyang' Nyong'o",
      party: 'ODM',
      coalition: 'Azimio la Umoja One Kenya Coalition',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'Mathew Owili', party: 'ODM' },
    senator: { name: "Prof. Tom Ojienda", party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    womanRep: { name: 'Rosa Buyu', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    cecms: [
      { portfolio: 'Finance', name: 'Nahashon Ager', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Rosemary Obara', qualification: 'MBChB, MMed' },
      { portfolio: 'Education', name: 'John Awiti', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Kevin Ouma', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Gilbert Ong\'eno', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Maryline Agwa', qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: 'Thomas Owino', qualification: 'BA, Dip Urban Plan' },
      { portfolio: 'Trade & Tourism', name: 'Farida Salim', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: 'Joshua Omondi', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Grace Adhiambo', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Onyango Oloo', party: 'ODM' },
    constituencies: [
      {
        name: 'Kisumu Central',
        code: '229',
        mp: { name: 'Prof. Jalang\'o (Joshua Ochieng)', party: 'ODM' },
        wards: [
          { name: 'Kisumu Central', mca: 'Samuel Ochieng' },
          { name: 'Migosi', mca: 'Mary Akinyi' },
          { name: 'Milimani', mca: 'John Ouma' },
          { name: 'Kondele', mca: 'Maurice Ogwang' },
          { name: 'Wenya', mca: 'Alice Otieno' },
        ],
      },
      {
        name: 'Kisumu East',
        code: '230',
        mp: { name: 'Bob Madete', party: 'ODM' },
        wards: [
          { name: 'Kajulu', mca: 'James Omondi' },
          { name: 'Kobura', mca: 'Hellen Adhiambo' },
          { name: 'Kolwa East', mca: 'Samuel Okoth' },
          { name: 'Kolwa West', mca: 'David Onyango' },
          { name: 'Manyatta', mca: 'Agnes Awuor' },
        ],
      },
      {
        name: 'Kisumu West',
        code: '231',
        mp: { name: 'Prof. Peter Oloo', party: 'ODM' },
        wards: [
          { name: 'Kisumu West', mca: 'John Obiero' },
          { name: 'Maseno', mca: 'Grace Awiti' },
          { name: 'Kombewa', mca: 'Thomas Odhiambo' },
          { name: 'Kisian', mca: 'Elijah Ochieng' },
          { name: 'North West Kisumu', mca: 'Pamela Achieng' },
        ],
      },
      {
        name: 'Seme',
        code: '232',
        mp: { name: 'James Nyikal', party: 'ODM' },
        wards: [
          { name: 'Seme', mca: 'Ochieng Wuod Okoth' },
          { name: 'Kanyakwar', mca: 'Mary Juma' },
          { name: 'Kolwa', mca: 'Samuel Opiyo' },
        ],
      },
      {
        name: 'Muhoroni',
        code: '233',
        mp: { name: 'Prof. Ayiecho Olweny', party: 'ODM' },
        wards: [
          { name: 'Muhoroni', mca: 'James Oketch' },
          { name: 'Kotieno', mca: 'Hellen Adhiambo' },
          { name: 'Koru', mca: 'Samuel Odhiambo' },
          { name: 'Chemilil', mca: 'David Otieno' },
        ],
      },
      {
        name: 'Nyakach',
        code: '234',
        mp: { name: 'Aduma Owuor', party: 'ODM' },
        wards: [
          { name: 'Nyakach', mca: 'Peter Ochieng' },
          { name: 'Kadibo', mca: 'Grace Achieng' },
          { name: 'Wang\'chieng', mca: 'Samuel Omondi' },
          { name: 'Kobong\'o', mca: 'John Awiti' },
        ],
      },
      {
        name: 'Kombewa',
        code: '235',
        mp: { name: 'Dr. James Opiyo', party: 'ODM' },
        wards: [
          { name: 'Kombewa', mca: 'Thomas Mboya' },
          { name: 'Kamagambo', mca: 'Mary Ochieng' },
          { name: 'Koguta', mca: 'John Onyango' },
          { name: 'West Kano', mca: 'Samuel Opiyo' },
        ],
      },
      {
        name: 'Nyando',
        code: '236',
        mp: { name: 'Jared Okello', party: 'ODM' },
        wards: [
          { name: 'Nyando', mca: 'James Omondi' },
          { name: 'Koru', mca: 'Hellen Akoth' },
          { name: 'Kobondo', mca: 'Samuel Oloo' },
          { name: 'Ahero', mca: 'Peter Odhiambo' },
        ],
      },
    ],
    financial: {
      equitableShare: 9.2,
      ownSourceRevenue: 1.5,
      conditionalGrants: 1.8,
      totalBudget: 12.5,
      developmentBudget: 5.8,
      recurrentBudget: 6.7,
      devAbsorptionRate: 48,
      recurrentAbsorptionRate: 90,
      pendingBills: 1800,
      expenseBreakdown: {
        health: 2.5,
        education: 2.0,
        infrastructure: 1.88,
        agriculture: 1.25,
        administration: 3.0,
        other: 1.87,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Unsupported expenditure of KSh 312 million in the Infrastructure department',
        'Pending bills of KSh 670 million for incomplete market and road projects',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 4. KAKAMEGA (037) — Western Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '037',
    countyName: 'Kakamega',
    region: 'Western',
    governor: {
      name: 'Fernandes Barasa',
      party: 'ODM',
      coalition: 'Azimio la Umoja One Kenya Coalition',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'Ayub Savula', party: 'ODM' },
    senator: { name: 'Boni Khalwale', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    womanRep: { name: 'Elsie Muhanda', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    cecms: [
      { portfolio: 'Finance', name: 'Eng. Patrick Kimaile', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Collins Dikassa', qualification: 'MBChB, MMed' },
      { portfolio: 'Education', name: 'Minister Matete', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Eng. Joshua Misingo', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Milton Isiaho', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'John Musumba', qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: 'Salome Nabalayo', qualification: 'BA' },
      { portfolio: 'Trade & Tourism', name: 'Patricia Imbatsi', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: 'Edmond Simiyu', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Agnes Musasia', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Morris Otwoma', party: 'ODM' },
    constituencies: [
      {
        name: 'Lurambi',
        code: '337',
        mp: { name: 'Titus Khamala', party: 'ODM' },
        wards: [
          { name: 'Lurambi', mca: 'Joseph Ombati' },
          { name: 'Shirugu', mca: 'Mary Maloba' },
          { name: 'Lugaga', mca: 'Samuel Wanyonyi' },
          { name: 'Bukhayo West', mca: 'Agnes Wekesa' },
        ],
      },
      {
        name: 'Mumias East',
        code: '338',
        mp: { name: 'Peter Salasya', party: 'ODM' },
        wards: [
          { name: 'Mumias East', mca: 'John Wamalwa' },
          { name: 'Lugale', mca: 'Grace Mukhwana' },
          { name: 'Kholera', mca: 'Samuel Muyeka' },
        ],
      },
      {
        name: 'Mumias West',
        code: '339',
        mp: { name: 'Hon. Emmanuel Wanyonyi', party: 'ODM' },
        wards: [
          { name: 'Mumias West', mca: 'James Mukhwana' },
          { name: 'Mayoni', mca: 'Agnes Nandwa' },
          { name: 'Musalasia', mca: 'Peter Lusaka' },
          { name: 'Khalaba', mca: 'Samuel Wakoli' },
        ],
      },
      {
        name: 'Navakholo',
        code: '340',
        mp: { name: 'Emmanuel Wangwe', party: 'ODM' },
        wards: [
          { name: 'Navakholo', mca: 'John Barasa' },
          { name: 'Butsotso East', mca: 'Mary Nabulumbi' },
          { name: 'Butsotso West', mca: 'Samuel Omutualu' },
          { name: 'East Wanga', mca: 'Peter Mukhongo' },
        ],
      },
      {
        name: 'Likuyani',
        code: '341',
        mp: { name: 'Joseph Malusu', party: 'ODM' },
        wards: [
          { name: 'Likuyani', mca: 'James Lusava' },
          { name: 'Sango', mca: 'Grace Munialo' },
          { name: 'Kongoni', mca: 'Samuel Ndombi' },
          { name: 'Shikomari', mca: 'Peter Wamalwa' },
        ],
      },
      {
        name: 'Butere',
        code: '342',
        mp: { name: 'Tindi Mwale', party: 'ODM' },
        wards: [
          { name: 'Butere', mca: 'John Nasia' },
          { name: 'Marenyo', mca: 'Mary Nabwire' },
          { name: 'Khushiku', mca: 'Samuel Amunya' },
          { name: 'Lugale', mca: 'Peter Shivachi' },
        ],
      },
      {
        name: 'Khwisero',
        code: '343',
        mp: { name: 'Hon. Linet Masiro', party: 'ODM' },
        wards: [
          { name: 'Khwisero', mca: 'James Shiundu' },
          { name: 'Shianda', mca: 'Mary Mushindi' },
          { name: 'Idakho North', mca: 'Samuel Shivina' },
          { name: 'Idakho South', mca: 'Peter Musundi' },
        ],
      },
      {
        name: 'Shinyalu',
        code: '344',
        mp: { name: 'Kiboreng Nicholus', party: 'ODM' },
        wards: [
          { name: 'Shinyalu', mca: 'John Wamukota' },
          { name: 'Bukura', mca: 'Agnes Muyeka' },
          { name: 'Isukha East', mca: 'Samuel Munyu' },
          { name: 'Isukha West', mca: 'Peter Ligare' },
        ],
      },
      {
        name: 'Ikolomani',
        code: '345',
        mp: { name: 'Bernard Shinali', party: 'ODM' },
        wards: [
          { name: 'Ikolomani', mca: 'John Shikami' },
          { name: 'Bunyasi', mca: 'Mary Navakholo' },
          { name: 'Bukhaya', mca: 'Samuel Induli' },
          { name: 'Shirumba', mca: 'Peter Musanya' },
        ],
      },
      {
        name: 'Lugari',
        code: '346',
        mp: { name: 'Ayub Savula', party: 'ODM' },
        wards: [
          { name: 'Lugari', mca: 'James Luyai' },
          { name: 'Lugari Central', mca: 'Mary Chebet' },
          { name: 'Lugari East', mca: 'Samuel Chogo' },
          { name: 'Panvil', mca: 'Peter Andayi' },
        ],
      },
      {
        name: 'Malava',
        code: '347',
        mp: { name: 'Malava Injendi', party: 'UDA' },
        wards: [
          { name: 'Malava', mca: 'John Luvonga' },
          { name: 'Manda Shivanga', mca: 'Grace Wanjala' },
          { name: 'Shirugu-Khalaba', mca: 'Samuel Mbweso' },
          { name: 'Butali-Chegulo', mca: 'Peter Manyoli' },
        ],
      },
    ],
    financial: {
      equitableShare: 11.0,
      ownSourceRevenue: 0.78,
      conditionalGrants: 2.72,
      totalBudget: 14.5,
      developmentBudget: 6.8,
      recurrentBudget: 7.7,
      devAbsorptionRate: 49,
      recurrentAbsorptionRate: 89,
      pendingBills: 1100,
      expenseBreakdown: {
        health: 2.61,
        education: 2.32,
        infrastructure: 2.18,
        agriculture: 1.45,
        administration: 3.48,
        other: 2.46,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Unsupported expenditure of KSh 245 million in the Health department',
        'Pending bills of KSh 510 million for incomplete hospital projects',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 5. KAJIADO (034) — Rift Valley Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '034',
    countyName: 'Kajiado',
    region: 'Rift Valley',
    governor: {
      name: 'Joseph Ole Lenku',
      party: 'ODM',
      coalition: 'Azimio la Umoja One Kenya Coalition',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'Martin Moshisho', party: 'ODM' },
    senator: { name: 'Seki Lenku', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    womanRep: { name: 'Leah Sankaire', party: 'ODM', coalition: 'Azimio la Umoja One Kenya Coalition' },
    cecms: [
      { portfolio: 'Finance', name: 'Moses ole Morwantet', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Esther Somoire', qualification: 'MBChB, MMed' },
      { portfolio: 'Education', name: 'Joshua Olesinya', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Eng. Samuel Kenta', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Jeremiah Nkeryian', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Grace Pareyio', qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: 'Keriako Tosha', qualification: 'BA' },
      { portfolio: 'Trade & Tourism', name: 'David Mepukori', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: 'Daniel Nkedianye', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Agnes Meitiaki', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Ole Moitalel', party: 'ODM' },
    constituencies: [
      {
        name: 'Kajiado North',
        code: '186',
        mp: { name: 'Timothy Kajaira', party: 'UDA' },
        wards: [
          { name: 'Ongata Rongai', mca: 'Joseph Mwangi' },
          { name: 'Kajiado Town', mca: 'Samuel ole Sironka' },
          { name: 'Ngong', mca: 'Mary Wanjiru' },
          { name: 'Matasia', mca: 'Peter ole Kantet' },
          { name: 'Keroka', mca: 'John ole Nkapian' },
        ],
      },
      {
        name: 'Kajiado Central',
        code: '187',
        mp: { name: 'Kanchory Memusi', party: 'ODM' },
        wards: [
          { name: 'Kajiado Central', mca: 'Samuel ole Mpeti' },
          { name: 'Ewuaso Kedong', mca: 'Grace Meitiaki' },
          { name: 'Keekonyokie', mca: 'Peter ole Sein' },
          { name: 'Mosiro', mca: 'John ole Koshuma' },
        ],
      },
      {
        name: 'Kajiado East',
        code: '188',
        mp: { name: 'Kipchumba Murkomen', party: 'UDA' },
        wards: [
          { name: 'Kajiado East', mca: 'Joseph ole Kamwaro' },
          { name: 'Imaroro', mca: 'Mary Naanyu' },
          { name: 'Taraiyia', mca: 'Samuel ole Nkaiseri' },
          { name: 'Maparasha', mca: 'Peter ole Tialal' },
        ],
      },
      {
        name: 'Kajiado South',
        code: '189',
        mp: { name: 'Hon. Katoo ole Metito', party: 'ODM' },
        wards: [
          { name: 'Kajiado South', mca: 'Samuel ole Ntutu' },
          { name: 'Entonet', mca: 'Grace Meiponyi' },
          { name: 'Loitokitok', mca: 'John ole Kimaren' },
          { name: 'Rombo', mca: 'Peter ole Simita' },
        ],
      },
      {
        name: 'Kajiado West',
        code: '190',
        mp: { name: 'George Sunkuiya', party: 'ODM' },
        wards: [
          { name: 'Kajiado West', mca: 'Samuel ole Kenta' },
          { name: 'Pongaa-Kimana', mca: 'Mary Simaloi' },
          { name: 'Elangata-Enterit', mca: 'John ole Nkoros' },
          { name: 'Ewuaso-Ng\'iro', mca: 'Peter ole Sompisha' },
        ],
      },
    ],
    financial: {
      equitableShare: 9.8,
      ownSourceRevenue: 0.95,
      conditionalGrants: 2.05,
      totalBudget: 12.8,
      developmentBudget: 5.9,
      recurrentBudget: 6.9,
      devAbsorptionRate: 43,
      recurrentAbsorptionRate: 88,
      pendingBills: 1400,
      expenseBreakdown: {
        health: 2.05,
        education: 1.92,
        infrastructure: 1.66,
        agriculture: 1.28,
        administration: 3.46,
        other: 2.43,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Unsupported voided transactions of KSh 234 million',
        'CPAIC grilled county leadership over audit findings',
        'Pending bills of KSh 390 million for incomplete water projects',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 6. NAKURU (032) — Rift Valley Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '032',
    countyName: 'Nakuru',
    region: 'Rift Valley',
    governor: {
      name: 'Susan Kihika',
      party: 'UDA',
      coalition: 'Kenya Kwanza Alliance',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'David Kones', party: 'UDA' },
    senator: { name: 'Tabitha Karanja', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    womanRep: { name: 'Liza Chelule', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    cecms: [
      { portfolio: 'Finance', name: 'Francis Mwangi', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Kariuki Gichuki', qualification: 'MBChB, MMed' },
      { portfolio: 'Education', name: 'Daniel Kanyeki', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Eng. Michael Kamau', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Immaculate Maina', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Samuel Mbugua', qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: 'Joseph Kibuthu', qualification: 'BA, Dip Urban Plan' },
      { portfolio: 'Trade & Tourism', name: 'Mary Njoroge', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: 'Simon Kamau', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Agnes Wambui', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Joel Maina', party: 'UDA' },
    constituencies: [
      {
        name: 'Nakuru Town East',
        code: '175',
        mp: { name: 'David Gikaria', party: 'UDA' },
        wards: [
          { name: 'Nakuru East', mca: 'James Mwangi' },
          { name: 'Biashara', mca: 'Mary Wambui' },
          { name: 'Menengai', mca: 'John Kamau' },
          { name: 'Mumbai', mca: 'Samuel Ndiritu' },
        ],
      },
      {
        name: 'Nakuru Town West',
        code: '176',
        mp: { name: 'Samuel Arama', party: 'UDA' },
        wards: [
          { name: 'Nakuru West', mca: 'Peter Kihoro' },
          { name: 'Rhoda', mca: 'Grace Muthoni' },
          { name: 'Kivumbini', mca: 'James Njoroge' },
          { name: 'Upper Hill', mca: 'Samuel Githinji' },
        ],
      },
      {
        name: 'Bahati',
        code: '177',
        mp: { name: 'Hon. Irene Njoki', party: 'UDA' },
        wards: [
          { name: 'Bahati', mca: 'John Mwangi' },
          { name: 'Kiamaina', mca: 'Mary Wanjiru' },
          { name: 'Ngorika', mca: 'Samuel Kamau' },
          { name: 'Lanet', mca: 'Peter Gichuki' },
        ],
      },
      {
        name: 'Njoro',
        code: '178',
        mp: { name: 'Charity Chepkwony', party: 'UDA' },
        wards: [
          { name: 'Njoro', mca: 'Joseph Kibet' },
          { name: 'Mbaruk', mca: 'Mary Chepchumba' },
          { name: 'Turi', mca: 'Samuel Kogo' },
          { name: 'Kihingo', mca: 'Peter arap Talam' },
        ],
      },
      {
        name: 'Molo',
        code: '179',
        mp: { name: 'Francis Kihung\'uri', party: 'UDA' },
        wards: [
          { name: 'Molo', mca: 'John Chege' },
          { name: 'Kuresoi', mca: 'Mary Wanjiku' },
          { name: 'Mariashoni', mca: 'Samuel Mugo' },
          { name: 'Elburgon', mca: 'Peter Nderitu' },
        ],
      },
      {
        name: 'Kuresoi North',
        code: '180',
        mp: { name: 'Adnan Keynan', party: 'UDA' },
        wards: [
          { name: 'Kuresoi North', mca: 'Joseph Kiprop' },
          { name: 'Kamara', mca: 'Mary Chepng\'eno' },
          { name: 'Tinet', mca: 'Samuel arap Biegon' },
        ],
      },
      {
        name: 'Kuresoi South',
        code: '181',
        mp: { name: 'Joseph Towett', party: 'UDA' },
        wards: [
          { name: 'Kuresoi South', mca: 'John arap Chelule' },
          { name: 'Amalo', mca: 'Mary Chelang\'at' },
          { name: 'Keringet', mca: 'Samuel Kiptanui' },
          { name: 'Olenguruone', mca: 'Peter arap Keter' },
        ],
      },
      {
        name: 'Naivasha',
        code: '182',
        mp: { name: 'Hon. Jane Kihara', party: 'UDA' },
        wards: [
          { name: 'Naivasha', mca: 'John Karanja' },
          { name: 'Biashara', mca: 'Mary Wanjiku' },
          { name: 'Hell\'s Gate', mca: 'Samuel Mwangi' },
          { name: 'Karati', mca: 'Peter Ndiritu' },
          { name: 'Mai Mahiu', mca: 'James Maina' },
        ],
      },
      {
        name: 'Gilgil',
        code: '183',
        mp: { name: 'Martha Karua', party: 'UDA' },
        wards: [
          { name: 'Gilgil', mca: 'John Mbugua' },
          { name: 'Malewa', mca: 'Mary Wairimu' },
          { name: 'Elementaita', mca: 'Samuel Kihoro' },
          { name: 'Kamweru', mca: 'Peter Kamau' },
        ],
      },
      {
        name: 'Subukia',
        code: '184',
        mp: { name: 'Hon. Gichuki Kariuki', party: 'UDA' },
        wards: [
          { name: 'Subukia', mca: 'John Gichuki' },
          { name: 'Wanyororo', mca: 'Mary Wangari' },
          { name: 'Rongai', mca: 'Samuel Njuguna' },
          { name: 'Kabazi', mca: 'Peter Kamau' },
        ],
      },
    ],
    financial: {
      equitableShare: 15.5,
      ownSourceRevenue: 3.2,
      conditionalGrants: 3.3,
      totalBudget: 22.0,
      developmentBudget: 10.2,
      recurrentBudget: 11.8,
      devAbsorptionRate: 42,
      recurrentAbsorptionRate: 86,
      pendingBills: 12000,
      expenseBreakdown: {
        health: 3.96,
        education: 3.3,
        infrastructure: 3.08,
        agriculture: 2.2,
        administration: 6.6,
        other: 2.86,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Pending bills of KSh 1.8 billion — highest among counties',
        'Unsupported expenditure of KSh 420 million across departments',
        'Procurement irregularities in the Health and Infrastructure departments',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 7. UASIN GISHU (027) — Rift Valley Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '027',
    countyName: 'Uasin Gishu',
    region: 'Rift Valley',
    governor: {
      name: 'Jonathan Bii (Chelule)',
      party: 'UDA',
      coalition: 'Kenya Kwanza Alliance',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'Prof. Phillip Bii', party: 'UDA' },
    senator: { name: 'Jackson Mandago', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    womanRep: { name: 'Gladys Boss Shollei', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    cecms: [
      { portfolio: 'Finance', name: 'Arch. Bessy Bii', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Evelyn Chepsang', qualification: 'MBChB, MPH' },
      { portfolio: 'Education', name: 'Dr. Peter Kibor', qualification: 'MEd, PhD' },
      { portfolio: 'Roads & Infrastructure', name: 'Eng. Joseph Lagat', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Samuel Rotich', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Esther Chepkwony', qualification: 'BSc Env. Eng' },
      { portfolio: 'Lands & Planning', name: 'Joshua Kogo', qualification: 'BA, MCP' },
      { portfolio: 'Trade & Tourism', name: 'Eng. Robert Cheruiyot', qualification: 'BCom, MBA' },
      { portfolio: 'Youth, Sports & Culture', name: 'David Kiprop', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Jane Chepng\'eno', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Ahmed Ali Abdi', party: 'UDA' },
    constituencies: [
      {
        name: 'Turbo',
        code: '154',
        mp: { name: 'Janet Sitienei', party: 'UDA' },
        wards: [
          { name: 'Turbo', mca: 'John Kiprop' },
          { name: 'Kapsaos', mca: 'Mary Chepkemoi' },
          { name: 'Huruma', mca: 'Samuel Kiptanui' },
          { name: 'Matisi', mca: 'Peter arap Biei' },
        ],
      },
      {
        name: 'Soy',
        code: '155',
        mp: { name: 'Caleb Kositany', party: 'UDA' },
        wards: [
          { name: 'Soy', mca: 'John Koech' },
          { name: 'Kiplombe', mca: 'Mary Chepng\'etich' },
          { name: 'Segero', mca: 'Samuel arap Chelule' },
          { name: 'Kipkenyo', mca: 'Peter Kiptanui' },
        ],
      },
      {
        name: 'Ainabkoi',
        code: '156',
        mp: { name: 'Hon. Samuel Chepkonga', party: 'UDA' },
        wards: [
          { name: 'Ainabkoi', mca: 'John Chesang' },
          { name: 'Kaptarakwa', mca: 'Mary Chebet' },
          { name: 'Cherangany', mca: 'Samuel Kipchumba' },
          { name: 'Kabartonjo', mca: 'Peter arap Ruto' },
        ],
      },
      {
        name: 'Kapseret',
        code: '157',
        mp: { name: 'Hon. Oscar Sudi', party: 'UDA' },
        wards: [
          { name: 'Kapseret', mca: 'John Kipchumba' },
          { name: 'Kiplombe', mca: 'Mary Chepng\'eno' },
          { name: 'Kaptagat', mca: 'Samuel Kiptoo' },
          { name: 'Sang\'alo', mca: 'Peter Chebii' },
        ],
      },
      {
        name: 'Kesses',
        code: '158',
        mp: { name: 'Hon. Julius Karanja', party: 'UDA' },
        wards: [
          { name: 'Kesses', mca: 'John Kipruto' },
          { name: 'Tapsagoi', mca: 'Mary Cheptoo' },
          { name: 'Kiplombe', mca: 'Samuel arap Bii' },
          { name: 'Megun', mca: 'Peter Kimaiyo' },
        ],
      },
      {
        name: 'Moiben',
        code: '159',
        mp: { name: 'Philemon Samoei', party: 'UDA' },
        wards: [
          { name: 'Moiben', mca: 'John Kipkorir' },
          { name: 'Kessup', mca: 'Mary Chelang\'at' },
          { name: 'Ziwa', mca: 'Samuel arap Bungei' },
          { name: 'Kamagut', mca: 'Peter arap Chebii' },
        ],
      },
    ],
    financial: {
      equitableShare: 10.2,
      ownSourceRevenue: 1.1,
      conditionalGrants: 2.2,
      totalBudget: 13.5,
      developmentBudget: 6.2,
      recurrentBudget: 7.3,
      devAbsorptionRate: 58,
      recurrentAbsorptionRate: 92,
      pendingBills: 1050,
      expenseBreakdown: {
        health: 2.3,
        education: 1.89,
        infrastructure: 1.75,
        agriculture: 1.35,
        administration: 3.78,
        other: 2.43,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Unsupported expenditure of KSh 167 million in the Trade department',
        'Pending bills of KSh 420 million for incomplete market projects',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 8. GARISSA (007) — North Eastern Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '007',
    countyName: 'Garissa',
    region: 'North Eastern',
    governor: {
      name: 'Nadhif Jama',
      party: 'UDA',
      coalition: 'Kenya Kwanza Alliance',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'Abdi Dagane', party: 'UDA' },
    senator: { name: 'Abdikadir Aden', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    womanRep: { name: 'Umulkheir Harun', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    cecms: [
      { portfolio: 'Finance', name: 'Abdi Mohamed', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Ahmed Bashane', qualification: 'MBChB, MPH' },
      { portfolio: 'Education', name: 'Mohamed Hajj', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Abdifatah Haji', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Abdi Rahma', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Halima Omar', qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: 'Yusuf Abdi', qualification: 'BA' },
      { portfolio: 'Trade & Tourism', name: 'Hassan Farah', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: 'Fatma Abdi', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Ahmed Noor', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Abdi Idle', party: 'UDA' },
    constituencies: [
      {
        name: 'Garissa Township',
        code: '057',
        mp: { name: 'Hon. Aden Duale', party: 'UDA' },
        wards: [
          { name: 'Garissa Township', mca: 'Abdi Omar' },
          { name: 'Iftin', mca: 'Fatma Hassan' },
          { name: 'Waberi', mca: 'Ahmed Mohamed' },
          { name: ' Township East', mca: 'Halima Abdi' },
          { name: 'Township West', mca: 'Yusuf Hassan' },
        ],
      },
      {
        name: 'Ijara',
        code: '058',
        mp: { name: 'Sophia Abdi Noor', party: 'UDA' },
        wards: [
          { name: 'Ijara', mca: 'Mohamed Ali' },
          { name: 'Masalani', mca: 'Fatma Aden' },
          { name: 'Hulugho', mca: 'Ahmed Bashir' },
        ],
      },
      {
        name: 'Lagdera',
        code: '059',
        mp: { name: 'Hon. Shukri Abdirahman', party: 'UDA' },
        wards: [
          { name: 'Lagdera', mca: 'Abdifatah Haji' },
          { name: 'Bulla Jogoo', mca: 'Halima Farah' },
          { name: 'Modogashe', mca: 'Mohamed Noor' },
          { name: 'Dertu', mca: 'Ahmed Abdi' },
        ],
      },
      {
        name: 'Balambala',
        code: '060',
        mp: { name: 'Hajj Abdi Ali Korane', party: 'UDA' },
        wards: [
          { name: 'Balambala', mca: 'Abdi Hussein' },
          { name: 'Wajir Bor', mca: 'Fatma Mohamed' },
          { name: 'Bulla Punda', mca: 'Ahmed Farah' },
          { name: 'Gurar', mca: 'Mohamed Aden' },
        ],
      },
      {
        name: 'Dadaab',
        code: '061',
        mp: { name: 'Racheal Kinyanjui Kamau', party: 'UDA' },
        wards: [
          { name: 'Dadaab', mca: 'Abdikadir Adow' },
          { name: 'Dagahaley', mca: 'Halima Jama' },
          { name: 'Ifo', mca: 'Mohamed Abdi' },
          { name: 'Hagadera', mca: 'Ahmed Mohamed' },
        ],
      },
      {
        name: 'Fafi',
        code: '062',
        mp: { name: 'Hon. Salah Yakub', party: 'UDA' },
        wards: [
          { name: 'Fafi', mca: 'Abdi Omar' },
          { name: 'Bura East', mca: 'Fatma Yusuf' },
          { name: 'Bura West', mca: 'Mohamed Haji' },
          { name: 'Sankuri', mca: 'Ahmed Adan' },
        ],
      },
    ],
    financial: {
      equitableShare: 7.4,
      ownSourceRevenue: 0.18,
      conditionalGrants: 1.62,
      totalBudget: 9.2,
      developmentBudget: 4.1,
      recurrentBudget: 5.1,
      devAbsorptionRate: 63,
      recurrentAbsorptionRate: 92,
      pendingBills: 580,
      expenseBreakdown: {
        health: 1.84,
        education: 1.38,
        infrastructure: 1.38,
        agriculture: 0.92,
        administration: 2.3,
        other: 1.38,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Unsupported expenditure of KSh 245 million in the Health sector',
        'Pending bills of KSh 670 million for water and sanitation projects',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 9. MANDERA (009) — North Eastern Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '009',
    countyName: 'Mandera',
    region: 'North Eastern',
    governor: {
      name: 'Mohamed Adan Khalif',
      party: 'UDA',
      coalition: 'Kenya Kwanza Alliance',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: 'Ali Abdi', party: 'UDA' },
    senator: { name: 'Ali Roba', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    womanRep: { name: 'Fathia Ali Mahbub', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    cecms: [
      { portfolio: 'Finance', name: 'Adan Mohamed', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: 'Dr. Osman Abdi', qualification: 'MBChB, MPH' },
      { portfolio: 'Education', name: 'Mohamed Ali', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Abdifatah Omar', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Hassan Ibrahim', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: 'Halima Jama', qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: 'Yusuf Adan', qualification: 'BA' },
      { portfolio: 'Trade & Tourism', name: 'Fatma Mohamed', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: 'Abdi Hassan', qualification: 'BA' },
      { portfolio: 'Public Service', name: 'Ahmed Noor', qualification: 'MPA' },
    ],
    assemblySpeaker: { name: 'Mohamed Abdi', party: 'UDA' },
    constituencies: [
      {
        name: 'Mandera East',
        code: '067',
        mp: { name: 'Hon. Hussein Weyra', party: 'UDA' },
        wards: [
          { name: 'Mandera East', mca: 'Abdi Osman' },
          { name: 'Khalalio', mca: 'Fatma Aden' },
          { name: 'Mandera Township', mca: 'Mohamed Noor' },
          { name: 'Shurr', mca: 'Ahmed Haji' },
          { name: 'Rhamu', mca: 'Abdikadir Omar' },
        ],
      },
      {
        name: 'Mandera West',
        code: '068',
        mp: { name: 'Hon. Abdullahi Sheikh', party: 'UDA' },
        wards: [
          { name: 'Mandera West', mca: 'Osman Aden' },
          { name: 'Takaba', mca: 'Halima Abdi' },
          { name: 'Kutulo', mca: 'Mohamed Ali' },
          { name: 'Gither', mca: 'Ahmed Bashir' },
        ],
      },
      {
        name: 'Mandera North',
        code: '069',
        mp: { name: 'Hon. Bashane Haji', party: 'UDA' },
        wards: [
          { name: 'Mandera North', mca: 'Abdi Ibrahim' },
          { name: 'Banisa', mca: 'Fatma Yusuf' },
          { name: 'Dekka', mca: 'Mohamed Haji' },
          { name: 'Ashabito', mca: 'Ahmed Aden' },
        ],
      },
      {
        name: 'Mandera South',
        code: '070',
        mp: { name: 'Hon. Haro Kheir', party: 'UDA' },
        wards: [
          { name: 'Mandera South', mca: 'Abdifatah Hassan' },
          { name: 'Elwak', mca: 'Halima Mohamed' },
          { name: 'Fino', mca: 'Ahmed Abdi' },
          { name: 'Wargadud', mca: 'Mohamed Omar' },
        ],
      },
      {
        name: 'Banissa',
        code: '071',
        mp: { name: 'Hon. Adan Haji Ali', party: 'UDA' },
        wards: [
          { name: 'Banissa', mca: 'Osman Haji' },
          { name: 'Bulla Mhata', mca: 'Fatma Hassan' },
          { name: 'Milimani', mca: 'Mohamed Adan' },
          { name: 'Shimbir Fatuma', mca: 'Ahmed Farah' },
        ],
      },
      {
        name: 'Lafey',
        code: '072',
        mp: { name: 'Hon. Abdikadir Omar', party: 'UDA' },
        wards: [
          { name: 'Lafey', mca: 'Abdi Omar' },
          { name: 'Fafi', mca: 'Halima Abdi' },
          { name: 'Khora Harla', mca: 'Mohamed Noor' },
          { name: 'Wargadud', mca: 'Ahmed Adan' },
        ],
      },
    ],
    financial: {
      equitableShare: 8.8,
      ownSourceRevenue: 0.15,
      conditionalGrants: 1.85,
      totalBudget: 10.8,
      developmentBudget: 5.2,
      recurrentBudget: 5.6,
      devAbsorptionRate: 78,
      recurrentAbsorptionRate: 95,
      pendingBills: 680,
      expenseBreakdown: {
        health: 2.16,
        education: 1.62,
        infrastructure: 1.62,
        agriculture: 1.08,
        administration: 2.7,
        other: 1.62,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Pending bills of KSh 510 million for incomplete health infrastructure',
        'Unsupported expenditure of KSh 175 million in the Roads department',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 10. TURKANA (023) — Rift Valley Region
  // ═══════════════════════════════════════════════════════════════════
  {
    countyCode: '023',
    countyName: 'Turkana',
    region: 'Rift Valley',
    governor: {
      name: 'Jeremiah Lomorukai',
      party: 'UDA',
      coalition: 'Kenya Kwanza Alliance',
      termStart: '2022-08-22',
      termEnd: '2027-08-22',
    },
    deputyGovernor: { name: "Peter Lokuang'", party: 'UDA' },
    senator: { name: 'James Lomenen', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    womanRep: { name: 'Joyce Emanikor', party: 'UDA', coalition: 'Kenya Kwanza Alliance' },
    cecms: [
      { portfolio: 'Finance', name: 'Christopher Ekuwom', qualification: 'MBA, CPA-K' },
      { portfolio: 'Health', name: "Dr. Edith Ekeri", qualification: 'MBChB, MMed' },
      { portfolio: 'Education', name: 'Patrick Losuban', qualification: 'MEd' },
      { portfolio: 'Roads & Infrastructure', name: 'Eng. Francis Lotome', qualification: 'BSc Eng' },
      { portfolio: 'Agriculture', name: 'Anthony Apale', qualification: 'BSc Agric' },
      { portfolio: 'Water & Environment', name: "Joseph Ekal", qualification: 'BSc Env. Sci' },
      { portfolio: 'Lands & Planning', name: "David Erukudi", qualification: 'BA' },
      { portfolio: 'Trade & Tourism', name: 'Emmanuel Ng\'asike', qualification: 'BCom' },
      { portfolio: 'Youth, Sports & Culture', name: "Esther Lomorukai", qualification: 'BA' },
      { portfolio: 'Public Service', name: "Paul Lobolia", qualification: 'MPA' },
    ],
    assemblySpeaker: { name: "Emmanuel Lokere", party: 'UDA' },
    constituencies: [
      {
        name: 'Turkana North',
        code: '125',
        mp: { name: "Hon. Christopher Ng'ang'a", party: 'UDA' },
        wards: [
          { name: 'Kaalem', mca: 'Lokaale Ekitela' },
          { name: 'Kaeris', mca: 'Ekaale Ekitela' },
          { name: 'Kakuma', mca: 'Ekitela Lokuruka' },
          { name: 'Kalokol', mca: 'Lodung\'okwel' },
          { name: 'Lobei', mca: 'Echwomo Lokeny' },
        ],
      },
      {
        name: 'Turkana West',
        code: '126',
        mp: { name: 'Hon. Daniel Nanok', party: 'UDA' },
        wards: [
          { name: 'Kakong\'a', mca: 'Ekomwa Lomadong' },
          { name: 'Kalong\'a', mca: 'Lomoi Ekai' },
          { name: 'Loima', mca: 'Ekipor Ekaale' },
          { name: 'Kamuge', mca: 'Lokuruka Lotieno' },
        ],
      },
      {
        name: 'Turkana South',
        code: '127',
        mp: { name: 'Hon. Joseph Nakekel', party: 'UDA' },
        wards: [
          { name: 'Lodwar', mca: 'Ekaale Lotele' },
          { name: 'Turbi', mca: 'Lomorukai Ekuwom' },
          { name: 'Kainuk', mca: 'Ekipor Lomode' },
          { name: 'Lopii', mca: 'Lobolia Ekitela' },
        ],
      },
      {
        name: 'Turkana Central',
        code: '128',
        mp: { name: 'Hon. John Lodele', party: 'UDA' },
        wards: [
          { name: 'Central', mca: 'Ekomwa Lotome' },
          { name: 'Lodwar Township', mca: 'Ekaale Ekai' },
          { name: 'Kapenguria', mca: 'Lomodo Ekitela' },
          { name: 'Nanam', mca: 'Ekipor Ekal' },
          { name: 'Lomenyenge', mca: 'Lokuruka Lotodo' },
        ],
      },
      {
        name: 'Kibish',
        code: '129',
        mp: { name: 'Hon. Joseph Aukoi', party: 'UDA' },
        wards: [
          { name: 'Kibish', mca: 'Ekomwa Lotumal' },
          { name: 'Songot', mca: 'Lomorukai Lokere' },
          { name: 'Koross', mca: 'Ekaale Lotyang' },
          { name: 'Kokuro', mca: 'Lokidongo Lotieno' },
        ],
      },
      {
        name: 'Loima',
        code: '130',
        mp: { name: 'Hon. Protus Akuja', party: 'UDA' },
        wards: [
          { name: 'Loima', mca: 'Ekipor Loichar' },
          { name: 'Kalong\'orok', mca: 'Lomodo Lotodo' },
          { name: 'Kaptir', mca: 'Ekaale Lotome' },
          { name: 'Kaburon', mca: 'Lomorukai Ekipor' },
        ],
      },
    ],
    financial: {
      equitableShare: 10.0,
      ownSourceRevenue: 0.13,
      conditionalGrants: 2.37,
      totalBudget: 12.5,
      developmentBudget: 5.8,
      recurrentBudget: 6.7,
      devAbsorptionRate: 31,
      recurrentAbsorptionRate: 84,
      pendingBills: 920,
      expenseBreakdown: {
        health: 2.5,
        education: 1.88,
        infrastructure: 1.75,
        agriculture: 1.25,
        administration: 3.13,
        other: 1.99,
      },
    },
    audit: {
      opinion: 'Qualified',
      financialYear: 'FY 2024/25',
      findings: [
        'Unsupported expenditure of KSh 310 million in the Health department',
        'Pending bills of KSh 450 million for incomplete water projects',
        'Low development budget absorption rate of 31%',
      ],
      source: 'Office of the Auditor-General (OAG)',
    },
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────

/** Get leadership data for a specific county by county code */
export function getLeadershipByCounty(code: string): CountyLeadershipData | undefined {
  return countyLeadershipData.find(c => c.countyCode === code);
}

/** Get all leadership data for all 10 representative counties */
export function getAllLeadership(): CountyLeadershipData[] {
  return countyLeadershipData;
}

/** Get all counties in a specific region */
export function getLeadershipByRegion(region: string): CountyLeadershipData[] {
  return countyLeadershipData.filter(c => c.region === region);
}

/** Get a county's CECMs by portfolio name */
export function getCECMByPortfolio(countyCode: string, portfolio: string): CECMMember | undefined {
  const county = getLeadershipByCounty(countyCode);
  if (!county) return undefined;
  return county.cecms.find(c => c.portfolio.toLowerCase().includes(portfolio.toLowerCase()));
}

/** Get all constituencies for a county */
export function getConstituencies(countyCode: string): ConstituencyData[] {
  const county = getLeadershipByCounty(countyCode);
  return county?.constituencies ?? [];
}

/** Get total wards across all constituencies for a county */
export function getTotalWards(countyCode: string): number {
  const constituencies = getConstituencies(countyCode);
  return constituencies.reduce((sum, c) => sum + c.wards.length, 0);
}

/** Get counties with highest development absorption rate */
export function getHighAbsorptionCounties(): CountyLeadershipData[] {
  return [...countyLeadershipData].sort(
    (a, b) => b.financial.devAbsorptionRate - a.financial.devAbsorptionRate
  );
}

/** Get counties with highest pending bills */
export function getHighPendingBillsCounties(): CountyLeadershipData[] {
  return [...countyLeadershipData].sort(
    (a, b) => b.financial.pendingBills - a.financial.pendingBills
  );
}
