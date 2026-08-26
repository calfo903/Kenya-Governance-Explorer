import { County, COALITIONS, AUDIT_OPINIONS, Region } from './types';

/**
 * Complete list of 47 County Governors — 2022-2027 Term
 *
 * Source: IEBC Official Results, August 2022 General Election
 * Verified against: IGRTC official list, Parliament of Kenya records
 * Coalition affiliations based on pre-election coalition agreements
 *
 * NOTE: Coalition alignments may have shifted post-election.
 * The coalition listed reflects the 2022 election coalition alignment.
 */

export interface GovernorEntry {
  code: string;
  name: string;
  county: string;
  party: string;
  coalition: typeof COALITIONS[keyof typeof COALITIONS];
  region: Region;
  capital: string;
  population: number;
  areaSqKm: number;
  constituenciesCount: number;
  wardsCount: number;
  termStart: string;
  termEnd: string;
}

export const all47Governors: GovernorEntry[] = [
  // ─── COAST REGION ───────────────────────────────────
  { code: '001', name: 'Abdulswamad Sheriff Nassir', county: 'Mombasa', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Coast', capital: 'Mombasa', population: 1208333, areaSqKm: 212.5, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '002', name: 'Fatuma Achani', county: 'Kwale', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Coast', capital: 'Kwale', population: 686531, areaSqKm: 8270.2, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '003', name: 'Gideon Mung\'aro', county: 'Kilifi', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Coast', capital: 'Kilifi', population: 1454270, areaSqKm: 12409.6, constituenciesCount: 7, wardsCount: 35, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '004', name: 'Maj. (Rtd) Dhadho Godhana', county: 'Tana River', party: 'WDM', coalition: COALITIONS.KENYA_KWANZA, region: 'Coast', capital: 'Hola', population: 315943, areaSqKm: 38462.6, constituenciesCount: 3, wardsCount: 15, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '005', name: 'Issa Timamy', county: 'Lamu', party: 'ANC', coalition: COALITIONS.AZIMIO, region: 'Coast', capital: 'Lamu', population: 143920, areaSqKm: 6273.1, constituenciesCount: 2, wardsCount: 10, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '006', name: 'Andrew Mwadime', county: 'Taita Taveta', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Coast', capital: 'Mwatate', population: 340671, areaSqKm: 17083.5, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },

  // ─── NORTH EASTERN REGION ───────────────────────────
  { code: '007', name: 'Nadhif Jama', county: 'Garissa', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'North Eastern', capital: 'Garissa', population: 841353, areaSqKm: 44175.3, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '008', name: 'Ahmed Abdi Mohamud', county: 'Wajir', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'North Eastern', capital: 'Wajir', population: 781383, areaSqKm: 55840.6, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '009', name: 'Mohamed Adan Khalif', county: 'Mandera', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'North Eastern', capital: 'Mandera', population: 862856, areaSqKm: 25791.0, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '010', name: 'Mohamud Ali', county: 'Marsabit', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'North Eastern', capital: 'Marsabit', population: 459785, areaSqKm: 66923.1, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '011', name: 'Abdi Ibrahim Guyo', county: 'Isiolo', party: 'Independent', coalition: COALITIONS.INDEPENDENT, region: 'North Eastern', capital: 'Isiolo', population: 268002, areaSqKm: 25695.6, constituenciesCount: 2, wardsCount: 10, termStart: '2022-08-22', termEnd: '2027-08-22' },

  // ─── EASTERN REGION ─────────────────────────────────
  { code: '012', name: 'Kawira Mwangaza', county: 'Meru', party: 'Independent', coalition: COALITIONS.INDEPENDENT, region: 'Eastern', capital: 'Meru', population: 1545274, areaSqKm: 6936.5, constituenciesCount: 9, wardsCount: 45, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '013', name: 'Muthomi Njuki', county: 'Tharaka Nithi', party: 'UDP', coalition: COALITIONS.AZIMIO, region: 'Eastern', capital: 'Chuka', population: 393177, areaSqKm: 2406.3, constituenciesCount: 3, wardsCount: 15, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '014', name: 'Cecily Mbarire', county: 'Embu', party: 'PNU', coalition: COALITIONS.KENYA_KWANZA, region: 'Eastern', capital: 'Embu', population: 608595, areaSqKm: 2818.1, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '015', name: 'Julius Malombe', county: 'Kitui', party: 'Wiper', coalition: COALITIONS.AZIMIO, region: 'Eastern', capital: 'Kitui', population: 1160161, areaSqKm: 30305.7, constituenciesCount: 8, wardsCount: 40, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '016', name: 'Wavinya Ndeti', county: 'Machakos', party: 'Wiper', coalition: COALITIONS.AZIMIO, region: 'Eastern', capital: 'Machakos', population: 1453940, areaSqKm: 5952.9, constituenciesCount: 8, wardsCount: 40, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '017', name: 'Mutula Kilonzo Jr', county: 'Makueni', party: 'Wiper', coalition: COALITIONS.AZIMIO, region: 'Eastern', capital: 'Wote', population: 987653, areaSqKm: 8218.3, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },

  // ─── CENTRAL REGION ────────────────────────────────
  { code: '018', name: 'Dr. Kiarie Badalisha', county: 'Nyandarua', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Central', capital: 'Ol Kalou', population: 696682, areaSqKm: 3245.0, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '019', name: 'Mutahi Kahiga', county: 'Nyeri', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Central', capital: 'Nyeri', population: 759164, areaSqKm: 2357.1, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '020', name: 'Anne Waiguru', county: 'Kirinyaga', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Central', capital: 'Kerugoya', population: 610411, areaSqKm: 1479.0, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '021', name: 'Irungu Kang\'ata', county: 'Murang\'a', party: 'Independent', coalition: COALITIONS.INDEPENDENT, region: 'Central', capital: 'Murang\'a', population: 1056440, areaSqKm: 2324.6, constituenciesCount: 7, wardsCount: 35, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '022', name: 'Kimani Wamatangi', county: 'Kiambu', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Central', capital: 'Kiambu', population: 2481581, areaSqKm: 2519.5, constituenciesCount: 12, wardsCount: 60, termStart: '2022-08-22', termEnd: '2027-08-22' },

  // ─── RIFT VALLEY REGION ─────────────────────────────
  { code: '023', name: 'Jeremiah Lomorukai', county: 'Turkana', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Lodwar', population: 926976, areaSqKm: 68823.0, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '024', name: 'Simon Kachapin', county: 'West Pokot', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Kapenguria', population: 621843, areaSqKm: 8307.8, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '025', name: 'Jonathan Lati Lelelit', county: 'Samburu', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Maralal', population: 310327, areaSqKm: 21033.0, constituenciesCount: 3, wardsCount: 15, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '026', name: 'George Natembeya', county: 'Trans Nzoia', party: 'DAP-K', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Kitale', population: 990676, areaSqKm: 2494.5, constituenciesCount: 5, wardsCount: 25, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '027', name: 'Jonathan Bii (Chelule)', county: 'Uasin Gishu', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Eldoret', population: 1592888, areaSqKm: 2952.5, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '028', name: 'Wisley Rotich', county: 'Elgeyo Marakwet', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Iten', population: 454480, areaSqKm: 3026.6, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '029', name: 'Stephen Sang', county: 'Nandi', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Kapsabet', population: 885683, areaSqKm: 2834.0, constituenciesCount: 5, wardsCount: 25, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '030', name: 'Benjamin Cheboi', county: 'Baringo', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Kabarnet', population: 666763, areaSqKm: 11032.0, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '031', name: 'Joshua Irungu', county: 'Laikipia', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Nanyuki', population: 572267, areaSqKm: 8689.3, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '032', name: 'Susan Kihika', county: 'Nakuru', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Nakuru', population: 2161944, areaSqKm: 7096.3, constituenciesCount: 11, wardsCount: 55, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '033', name: 'Patrick Ole Ntutu', county: 'Narok', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Narok', population: 1150516, areaSqKm: 17337.4, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '034', name: 'Joseph Ole Lenku', county: 'Kajiado', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Rift Valley', capital: 'Kajiado', population: 1177840, areaSqKm: 21292.7, constituenciesCount: 5, wardsCount: 25, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '035', name: 'Dr. Erick Mutai', county: 'Kericho', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Kericho', population: 901777, areaSqKm: 2440.5, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '036', name: 'Hillary Barchok', county: 'Bomet', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Rift Valley', capital: 'Bomet', population: 875643, areaSqKm: 2018.1, constituenciesCount: 5, wardsCount: 25, termStart: '2022-08-22', termEnd: '2027-08-22' },

  // ─── WESTERN REGION ────────────────────────────────
  { code: '037', name: 'Fernandes Barasa', county: 'Kakamega', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Western', capital: 'Kakamega', population: 1694164, areaSqKm: 3025.2, constituenciesCount: 12, wardsCount: 60, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '038', name: 'Wilber Ottichilo', county: 'Vihiga', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Western', capital: 'Vihiga', population: 590013, areaSqKm: 1298.8, constituenciesCount: 5, wardsCount: 25, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '039', name: 'Kenneth Lusaka', county: 'Bungoma', party: 'Ford Kenya', coalition: COALITIONS.KENYA_KWANZA, region: 'Western', capital: 'Bungoma', population: 1675352, areaSqKm: 3034.3, constituenciesCount: 9, wardsCount: 45, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '040', name: 'Paul Otuoma', county: 'Busia', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Western', capital: 'Busia', population: 893681, areaSqKm: 1623.1, constituenciesCount: 7, wardsCount: 35, termStart: '2022-08-22', termEnd: '2027-08-22' },

  // ─── NYANZA REGION ──────────────────────────────────
  { code: '041', name: 'James Orengo', county: 'Siaya', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Nyanza', capital: 'Siaya', population: 993183, areaSqKm: 2530.5, constituenciesCount: 6, wardsCount: 30, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '042', name: 'Prof. Peter Anyang\' Nyong\'o', county: 'Kisumu', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Nyanza', capital: 'Kisumu', population: 1215566, areaSqKm: 2085.9, constituenciesCount: 7, wardsCount: 35, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '043', name: 'Gladys Wanga', county: 'Homa Bay', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Nyanza', capital: 'Homa Bay', population: 1163178, areaSqKm: 3188.4, constituenciesCount: 8, wardsCount: 40, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '044', name: 'Ochilo Ayacko', county: 'Migori', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Nyanza', capital: 'Migori', population: 1145800, areaSqKm: 2594.4, constituenciesCount: 8, wardsCount: 40, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '045', name: 'Simba Arati', county: 'Kisii', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Nyanza', capital: 'Kisii', population: 1291660, areaSqKm: 1325.0, constituenciesCount: 9, wardsCount: 45, termStart: '2022-08-22', termEnd: '2027-08-22' },
  { code: '046', name: 'Amos Nyaribo', county: 'Nyamira', party: 'ODM', coalition: COALITIONS.AZIMIO, region: 'Nyanza', capital: 'Nyamira', population: 605576, areaSqKm: 912.3, constituenciesCount: 4, wardsCount: 20, termStart: '2022-08-22', termEnd: '2027-08-22' },

  // ─── NAIROBI REGION ──────────────────────────────────
  { code: '047', name: 'Johnson Sakaja', county: 'Nairobi City', party: 'UDA', coalition: COALITIONS.KENYA_KWANZA, region: 'Nairobi', capital: 'Nairobi', population: 4397073, areaSqKm: 696.1, constituenciesCount: 17, wardsCount: 85, termStart: '2022-08-22', termEnd: '2027-08-22' },
];

/**
 * Generate placeholder County records from governor list
 * Full expansion requires pulling data from OAG, CoB, TI-Kenya, IEBC
 */
export function getPlaceholderCounties(): County[] {
  return all47Governors.map((g) => ({
    code: g.code,
    name: g.county,
    region: g.region,
    capital: g.capital,
    population: g.population,
    areaSqKm: g.areaSqKm,
    constituenciesCount: g.constituenciesCount,
    wardsCount: g.wardsCount,
    governor: {
      id: `gov-${g.code}`,
      fullName: g.name,
      officialTitle: 'Governor',
      politicalParty: g.party,
      coalition: g.coalition,
      termStart: g.termStart,
      termEnd: g.termEnd,
      jurisdiction: g.county,
      level: 'county' as const,
      biography: `Elected Governor of ${g.county} County in the August 2022 General Election under the ${g.party} party (${g.coalition} coalition).`,
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
        dataGapsNote: 'Individual scorecard data not publicly available in latest OAG/CoB/TI-Kenya reports. Expand this county to pull latest data from mandated sources.',
      },
    },
    constituencies: [],
    dataAvailability: 'placeholder' as const,
    dataAvailabilityNote: 'Placeholder data. Expand to pull latest data from oagkenya.go.ke, cob.go.ke, tikenya.org, and county portals.',
  }));
}
