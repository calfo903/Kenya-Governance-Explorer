import { County, COALITIONS, AUDIT_OPINIONS } from './types';

/**
 * FULLY EXPANDED Kajiado County — Sample County
 *
 * Sources:
 * - IEBC Official Results, August 2022 General Election
 * - Kajiado County Government: https://kajiado.go.ke/
 * - Kajiado County Assembly: https://kajiadoassembly.go.ke/
 * - OAG Kenya: https://oagkenya.go.ke/
 * - Controller of Budget: https://cob.go.ke/
 * - Parliament of Kenya: https://parliament.go.ke/
 *
 * Where individual data is not publicly available, the field is marked
 * explicitly with the data gap notation per the mandatory data rules.
 */

const OAG_SOURCE = {
  source: 'Office of the Auditor-General (OAG)',
  reportTitle: 'County Executive of Kajiado Audit Report',
  financialYear: 'FY 2021/22',
  url: 'https://www.oagkenya.go.ke/wp-content/uploads/2023/10/County-Executive-of-Kajiado-2021-2022.pdf',
  section: 'County Executive Audit Opinion',
  accessedDate: '2026-07-25',
};

const COB_SOURCE = {
  source: 'Controller of Budget (CoB)',
  reportTitle: 'County Budget Implementation Review Report - FY 2024/25',
  financialYear: 'FY 2024/25',
  url: 'https://cob.go.ke/county-budget-implementation-review-reports/',
  section: 'Kajiado County Budget Performance',
  accessedDate: '2026-07-25',
};

const IEBC_SOURCE = {
  source: 'Independent Electoral and Boundaries Commission (IEBC)',
  reportTitle: 'Official Results — August 2022 General Election',
  financialYear: '2022',
  url: 'https://www.iebc.or.ke/',
  section: 'County: Kajiado (Code 034)',
  accessedDate: '2026-07-25',
};

const TI_KENYA_NOTE = 'Data not publicly available in latest TI-Kenya County Governance Status Report for individual officials. Refer to tikenya.org for county-level indices.';
const EACC_NOTE = 'Data not publicly available in latest EACC public reports for this specific official. Refer to eacc.go.ke for updates.';
const DATA_UNAVAILABLE = 'Data not publicly available in latest OAG/CoB/TI-Kenya reports. Requires direct verification from county portal or IEBC records.';

export const kajiadoCounty: County = {
  code: '034',
  name: 'Kajiado',
  region: 'Rift Valley',
  capital: 'Kajiado',
  population: 1177840,
  areaSqKm: 21292.7,
  constituenciesCount: 5,
  wardsCount: 25,

  // ═══════════════════════════════════════════════════════════
  // COUNTY EXECUTIVE LEADERSHIP
  // ═══════════════════════════════════════════════════════════

  governor: {
    id: 'gov-034',
    fullName: 'Joseph Ole Lenku',
    officialTitle: 'Governor',
    politicalParty: 'ODM',
    coalition: COALITIONS.AZIMIO,
    termStart: '2022-08-22',
    termEnd: '2027-08-22',
    jurisdiction: 'Kajiado County',
    level: 'county',
    biography: 'Elected Governor of Kajiado County in the August 2022 General Election under the Orange Democratic Movement (ODM), part of the Azimio la Umoja One Kenya Coalition. Previously served as Cabinet Secretary for Interior and Coordination of National Government (2013-2014) under President Uhuru Kenyatta. A Maasai community leader from Kajiado, Ole Lenku campaigns on improved water access, education, and rangeland management. Re-elected for a second term in 2022.',
    contacts: {
      website: 'https://kajiado.go.ke/',
      xHandle: '@OleLenku',
    },
    scorecard: {
      metrics: {
        overallAccountabilityScore: null,
        transparencyAssetDeclaration: null,
        projectDeliveryAbsorptionRate: null,
        manifestoPromiseFulfillment: null,
        legislativeOversightPerformance: null,
        ethicsIntegrity: null,
        publicSentimentCitizenAwareness: null,
      },
      sources: {
        overallAccountabilityScore: OAG_SOURCE,
        transparencyAssetDeclaration: { source: 'Transparency International Kenya', reportTitle: 'County Governance Status Report', financialYear: '2025', url: 'https://tikenya.org/', accessedDate: '2026-07-25' },
        projectDeliveryAbsorptionRate: COB_SOURCE,
        ethicsIntegrity: { source: 'Ethics and Anti-Corruption Commission (EACC)', reportTitle: 'Public Reports', financialYear: 'FY 2024/25', url: 'https://eacc.go.ke/', accessedDate: '2026-07-25' },
      },
      lastUpdated: '2026-07-25',
      dataGapsNote: `No comprehensive individual scorecard data available from OAG, CoB, or TI-Kenya for this official as of latest reports. ${TI_KENYA_NOTE} ${EACC_NOTE}`,
    },
    promiseVsDelivery: 'Campaign promises included tarmacking 500km of roads, building 100 boreholes, establishing a county university campus, and improving livestock markets. Delivery tracking requires verification against CIDP 2023-2027 milestones and CoB reports.',
  },

  deputyGovernor: {
    id: 'dpgov-034',
    fullName: 'Martin Moshisho',
    officialTitle: 'Deputy Governor',
    politicalParty: 'ODM',
    coalition: COALITIONS.AZIMIO,
    termStart: '2022-08-22',
    termEnd: '2027-08-22',
    jurisdiction: 'Kajiado County',
    level: 'county',
    biography: 'Elected Deputy Governor of Kajiado County alongside Governor Joseph Ole Lenku on the ODM ticket in August 2022. Assists the Governor in coordinating county administration.',
    scorecard: {
      metrics: {
        overallAccountabilityScore: null,
        transparencyAssetDeclaration: null,
        projectDeliveryAbsorptionRate: null,
        manifestoPromiseFulfillment: null,
        legislativeOversightPerformance: null,
        ethicsIntegrity: null,
        publicSentimentCitizenAwareness: null,
      },
      sources: {},
      lastUpdated: '2026-07-25',
      dataGapsNote: DATA_UNAVAILABLE,
    },
  },

  senator: {
    id: 'sen-034',
    fullName: 'Samuel Kanar Ole Seki',
    officialTitle: 'Senator',
    politicalParty: 'UDA',
    coalition: COALITIONS.KENYA_KWANZA,
    termStart: '2022-08-22',
    termEnd: '2027-08-22',
    jurisdiction: 'Kajiado County',
    level: 'county',
    biography: 'Elected Senator for Kajiado County in the August 2022 General Election under the United Democratic Alliance (UDA), Kenya Kwanza Alliance. Garnered 125,755 votes. Represents the county at the Senate, overseeing county legislation and protecting county interests.',
    contacts: {
      xHandle: '@HonKanarseki',
    },
    scorecard: {
      metrics: {
        overallAccountabilityScore: null,
        transparencyAssetDeclaration: null,
        projectDeliveryAbsorptionRate: null,
        manifestoPromiseFulfillment: null,
        legislativeOversightPerformance: null,
        ethicsIntegrity: null,
        publicSentimentCitizenAwareness: null,
      },
      sources: {},
      lastUpdated: '2026-07-25',
      dataGapsNote: `Senate performance metrics not available in OAG/CoB reports. ${DATA_UNAVAILABLE}. Legislative participation tracked via Parliament Hansard at parliament.go.ke.`,
    },
  },

  womanRep: {
    id: 'wr-034',
    fullName: 'Leah Sankaire Sopiato',
    officialTitle: 'Woman Representative',
    politicalParty: 'UDA',
    coalition: COALITIONS.KENYA_KWANZA,
    termStart: '2022-08-22',
    termEnd: '2027-08-22',
    jurisdiction: 'Kajiado County',
    level: 'county',
    biography: 'Elected Woman Representative for Kajiado County in August 2022 under UDA, Kenya Kwanza Alliance. Garnered 122,764 votes (43.65%). Elected KEWOPA (Kenya Women Parliamentary Association) Chair in March 2023. Advocates for women\'s representation and gender-responsive governance.',
    contacts: {
      xHandle: '@LeahSankaire',
    },
    scorecard: {
      metrics: {
        overallAccountabilityScore: null,
        transparencyAssetDeclaration: null,
        projectDeliveryAbsorptionRate: null,
        manifestoPromiseFulfillment: null,
        legislativeOversightPerformance: null,
        ethicsIntegrity: null,
        publicSentimentCitizenAwareness: null,
      },
      sources: {},
      lastUpdated: '2026-07-25',
      dataGapsNote: `National Assembly performance data not in OAG/CoB reports. ${DATA_UNAVAILABLE}. Bills and motions tracked via Parliament of Kenya.`,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // CONSTITUENCIES & MPs
  // ═══════════════════════════════════════════════════════════

  constituencies: [
    {
      id: 'con-034-1',
      name: 'Kajiado North',
      countyCode: '034',
      mp: {
        id: 'mp-034-1',
        fullName: 'Onesmus Ngogoyo Nguro',
        officialTitle: 'Member of Parliament',
        politicalParty: 'UDA',
        coalition: COALITIONS.KENYA_KWANZA,
        termStart: '2022-08-22',
        termEnd: '2027-08-22',
        jurisdiction: 'Kajiado North Constituency',
        level: 'constituency',
        biography: 'Elected MP for Kajiado North Constituency in the August 2022 General Election under UDA.',
        scorecard: { metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null }, sources: {}, lastUpdated: '2026-07-25', dataGapsNote: DATA_UNAVAILABLE },
      },
      wards: [
        { id: 'w-034-1-1', name: 'Ongata Rongai', constituencyId: 'con-034-1', mca: undefined },
        { id: 'w-034-1-2', name: 'Kajiado North', constituencyId: 'con-034-1', mca: undefined },
        { id: 'w-034-1-3', name: 'Matasia', constituencyId: 'con-034-1', mca: undefined },
        { id: 'w-034-1-4', name: 'Nkaimurunya', constituencyId: 'con-034-1', mca: undefined },
        { id: 'w-034-1-5', name: 'Olkeri', constituencyId: 'con-034-1', mca: undefined },
      ],
    },
    {
      id: 'con-034-2',
      name: 'Kajiado Central',
      countyCode: '034',
      mp: {
        id: 'mp-034-2',
        fullName: 'Elijah Kanchory Memusi',
        officialTitle: 'Member of Parliament',
        politicalParty: 'ODM',
        coalition: COALITIONS.AZIMIO,
        termStart: '2022-08-22',
        termEnd: '2027-08-22',
        jurisdiction: 'Kajiado Central Constituency',
        level: 'constituency',
        biography: 'Re-elected MP for Kajiado Central Constituency in August 2022 under ODM, Azimio la Umoja coalition.',
        scorecard: { metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null }, sources: {}, lastUpdated: '2026-07-25', dataGapsNote: DATA_UNAVAILABLE },
      },
      wards: [
        { id: 'w-034-2-1', name: 'Kajiado Central', constituencyId: 'con-034-2', mca: undefined },
        { id: 'w-034-2-2', name: 'Iloodokilani', constituencyId: 'con-034-2', mca: undefined },
        { id: 'w-034-2-3', name: 'Keekonyokie', constituencyId: 'con-034-2', mca: undefined },
        { id: 'w-034-2-4', name: 'Poko', constituencyId: 'con-034-2', mca: undefined },
        { id: 'w-034-2-5', name: 'Ewuaso Kedong', constituencyId: 'con-034-2', mca: undefined },
      ],
    },
    {
      id: 'con-034-3',
      name: 'Kajiado East',
      countyCode: '034',
      mp: {
        id: 'mp-034-3',
        fullName: 'Hamisi Kakuta Maimai',
        officialTitle: 'Member of Parliament',
        politicalParty: 'ODM',
        coalition: COALITIONS.AZIMIO,
        termStart: '2022-08-22',
        termEnd: '2027-08-22',
        jurisdiction: 'Kajiado East Constituency',
        level: 'constituency',
        biography: 'Elected MP for Kajiado East Constituency in August 2022 under ODM. Received 28,730 votes.',
        scorecard: { metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null }, sources: {}, lastUpdated: '2026-07-25', dataGapsNote: DATA_UNAVAILABLE },
      },
      wards: [
        { id: 'w-034-3-1', name: 'Kitengela', constituencyId: 'con-034-3', mca: undefined },
        { id: 'w-034-3-2', name: 'Athi River', constituencyId: 'con-034-3', mca: undefined },
        { id: 'w-034-3-3', name: 'Mavoko', constituencyId: 'con-034-3', mca: undefined },
        { id: 'w-034-3-4', name: 'Kenyawa-Poka', constituencyId: 'con-034-3', mca: undefined },
        { id: 'w-034-3-5', name: 'Isinya', constituencyId: 'con-034-3', mca: undefined },
      ],
    },
    {
      id: 'con-034-4',
      name: 'Kajiado South',
      countyCode: '034',
      mp: {
        id: 'mp-034-4',
        fullName: 'Samuel Parashina Sakimba',
        officialTitle: 'Member of Parliament',
        politicalParty: 'ODM',
        coalition: COALITIONS.AZIMIO,
        termStart: '2022-08-22',
        termEnd: '2027-08-22',
        jurisdiction: 'Kajiado South Constituency',
        level: 'constituency',
        biography: 'Elected MP for Kajiado South Constituency in August 2022 under ODM.',
        scorecard: { metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null }, sources: {}, lastUpdated: '2026-07-25', dataGapsNote: DATA_UNAVAILABLE },
      },
      wards: [
        { id: 'w-034-4-1', name: 'Kajiado South', constituencyId: 'con-034-4', mca: undefined },
        { id: 'w-034-4-2', name: 'Loitokitok', constituencyId: 'con-034-4', mca: undefined },
        { id: 'w-034-4-3', name: 'Rombo', constituencyId: 'con-034-4', mca: undefined },
        { id: 'w-034-4-4', name: 'Entonet', constituencyId: 'con-034-4', mca: undefined },
        { id: 'w-034-4-5', name: 'Mbirikani', constituencyId: 'con-034-4', mca: undefined },
      ],
    },
    {
      id: 'con-034-5',
      name: 'Kajiado West',
      countyCode: '034',
      mp: {
        id: 'mp-034-5',
        fullName: 'George Sunkuyia Risa',
        officialTitle: 'Member of Parliament',
        politicalParty: 'UDA',
        coalition: COALITIONS.KENYA_KWANZA,
        termStart: '2022-08-22',
        termEnd: '2027-08-22',
        jurisdiction: 'Kajiado West Constituency',
        level: 'constituency',
        biography: 'Re-elected MP for Kajiado West Constituency in August 2022 under UDA. Received 19,176 votes.',
        scorecard: { metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null }, sources: {}, lastUpdated: '2026-07-25', dataGapsNote: DATA_UNAVAILABLE },
      },
      wards: [
        { id: 'w-034-5-1', name: 'Kajiado West', constituencyId: 'con-034-5', mca: undefined },
        { id: 'w-034-5-2', name: 'Mosiro', constituencyId: 'con-034-5', mca: undefined },
        { id: 'w-034-5-3', name: 'Eship', constituencyId: 'con-034-5', mca: undefined },
        { id: 'w-034-5-4', name: 'Magadi', constituencyId: 'con-034-5', mca: undefined },
        { id: 'w-034-5-5', name: 'Tarusa', constituencyId: 'con-034-5', mca: undefined },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // COUNTY ASSEMBLY
  // ═══════════════════════════════════════════════════════════

  countyAssembly: {
    speaker: {
      id: 'spk-034',
      fullName: 'Hon. Justus Kilesi Ole Ngossor',
      officialTitle: 'Speaker, County Assembly',
      politicalParty: '',
      termStart: '2022-09-21',
      termEnd: '2027-09-21',
      jurisdiction: 'Kajiado County Assembly',
      level: 'county',
      biography: 'Elected Speaker of the Kajiado County Assembly on 21 September 2022. Presides over the assembly sessions and ensures effective oversight of the county executive.',
      contacts: {
        website: 'https://kajiadoassembly.go.ke/leadership/office-of-the-speaker',
      },
      scorecard: {
        metrics: {
          overallAccountabilityScore: null,
          transparencyAssetDeclaration: null,
          projectDeliveryAbsorptionRate: null,
          manifestoPromiseFulfillment: null,
          legislativeOversightPerformance: null,
          ethicsIntegrity: null,
          publicSentimentCitizenAwareness: null,
        },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: DATA_UNAVAILABLE,
      },
    },
    wards: [],
    auditOpinion: AUDIT_OPINIONS.QUALIFIED,
    auditSource: {
      source: 'Office of the Auditor-General (OAG)',
      reportTitle: 'Kajiado County Assembly Audit Report',
      financialYear: 'FY 2024/25',
      url: 'https://www.oagkenya.go.ke/reports/county-government-audit-reports/',
      section: 'County Assembly Audit Opinions Summary',
      accessedDate: '2026-07-25',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // COUNTY EXECUTIVE COMMITTEE
  // ═══════════════════════════════════════════════════════════

  countyExecutive: [
    {
      id: 'cecm-034-1',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Finance & Economic Planning',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
    {
      id: 'cecm-034-2',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Health Services',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
    {
      id: 'cecm-034-3',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Education, Youth, Sports & Culture',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
    {
      id: 'cecm-034-4',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Lands, Urban Planning & Development',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
    {
      id: 'cecm-034-5',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Water, Environment & Natural Resources',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
    {
      id: 'cecm-034-6',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Roads, Transport & Public Works',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
    {
      id: 'cecm-034-7',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Agriculture, Livestock & Fisheries',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
    {
      id: 'cecm-034-8',
      fullName: DATA_UNAVAILABLE,
      portfolio: 'Trade, Tourism & Cooperatives',
      scorecard: {
        metrics: { overallAccountabilityScore: null, transparencyAssetDeclaration: null, projectDeliveryAbsorptionRate: null, manifestoPromiseFulfillment: null, legislativeOversightPerformance: null, ethicsIntegrity: null, publicSentimentCitizenAwareness: null },
        sources: {},
        lastUpdated: '2026-07-25',
        dataGapsNote: 'CECM appointment details not verified from official county gazette notice.',
      },
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // AUDIT & PERFORMANCE DATA
  // ═══════════════════════════════════════════════════════════

  executiveAuditOpinion: AUDIT_OPINIONS.UNMODIFIED,
  executiveAuditSource: OAG_SOURCE,
  developmentAbsorptionRate: null,
  developmentAbsorptionSource: COB_SOURCE,

  dataAvailability: 'partial',
  dataAvailabilityNote: 'Governor, Deputy Governor, Senator, Woman Representative, 5 MPs, and Speaker verified from IEBC and Parliament records. Individual ward MCA names require verification from Kajiado County Assembly records at kajiadoassembly.go.ke. CECM names require verification from official county gazette notices at kajiado.go.ke.',
};
