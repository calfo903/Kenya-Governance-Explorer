/**
 * Assembly Hansard Links — County Assembly Records Directory
 *
 * Provides links to Kenya's 47 county assembly websites and their Hansard pages.
 * Hansard records are the official proceedings of county assembly sessions,
 * documenting debates, motions, votes, and questions — essential for
 * oversight accountability under Article 185 of the Constitution.
 */

export interface AssemblyHansardEntry {
  countyCode: string;
  countyName: string;
  region: string;
  assemblyName: string;
  website: string;
  hansardUrl: string;
  hasHansard: boolean;
  hasWebsite: boolean;
}

export const assemblyHansardData: AssemblyHansardEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // COAST REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '001', countyName: 'Mombasa', region: 'Coast', assemblyName: 'Mombasa County Assembly', website: 'https://mombasaassembly.go.ke/', hansardUrl: 'https://mombasaassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '002', countyName: 'Kwale', region: 'Coast', assemblyName: 'Kwale County Assembly', website: 'https://kwaleassembly.go.ke/', hansardUrl: 'https://kwaleassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '003', countyName: 'Kilifi', region: 'Coast', assemblyName: 'Kilifi County Assembly', website: 'https://kilifiassembly.go.ke/', hansardUrl: 'https://kilifiassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '004', countyName: 'Tana River', region: 'Coast', assemblyName: 'Tana River County Assembly', website: 'https://tanariverassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '005', countyName: 'Lamu', region: 'Coast', assemblyName: 'Lamu County Assembly', website: 'https://lamuassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '006', countyName: 'Taita Taveta', region: 'Coast', assemblyName: 'Taita Taveta County Assembly', website: 'https://taitatavetaassembly.go.ke/', hansardUrl: 'https://taitatavetaassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },

  // ═══════════════════════════════════════════════════════════════
  // NORTH EASTERN REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '007', countyName: 'Garissa', region: 'North Eastern', assemblyName: 'Garissa County Assembly', website: 'https://garissaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '008', countyName: 'Wajir', region: 'North Eastern', assemblyName: 'Wajir County Assembly', website: 'https://wajirassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '009', countyName: 'Mandera', region: 'North Eastern', assemblyName: 'Mandera County Assembly', website: 'https://manderaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '010', countyName: 'Marsabit', region: 'North Eastern', assemblyName: 'Marsabit County Assembly', website: 'https://marsabitassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '011', countyName: 'Isiolo', region: 'North Eastern', assemblyName: 'Isiolo County Assembly', website: 'https://isioloassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },

  // ═══════════════════════════════════════════════════════════════
  // EASTERN REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '012', countyName: 'Meru', region: 'Eastern', assemblyName: 'Meru County Assembly', website: 'https://meruassembly.go.ke/', hansardUrl: 'https://meruassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '013', countyName: 'Tharaka Nithi', region: 'Eastern', assemblyName: 'Tharaka Nithi County Assembly', website: 'https://tharakanithiassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '014', countyName: 'Embu', region: 'Eastern', assemblyName: 'Embu County Assembly', website: 'https://embuassembly.go.ke/', hansardUrl: 'https://embuassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '015', countyName: 'Kitui', region: 'Eastern', assemblyName: 'Kitui County Assembly', website: 'https://kituiassembly.go.ke/', hansardUrl: 'https://kituiassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '016', countyName: 'Machakos', region: 'Eastern', assemblyName: 'Machakos County Assembly', website: 'https://machakosassembly.go.ke/', hansardUrl: 'https://machakosassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '017', countyName: 'Makueni', region: 'Eastern', assemblyName: 'Makueni County Assembly', website: 'https://makueniassembly.go.ke/', hansardUrl: 'https://makueniassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },

  // ═══════════════════════════════════════════════════════════════
  // CENTRAL REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '018', countyName: 'Nyandarua', region: 'Central', assemblyName: 'Nyandarua County Assembly', website: 'https://nyandaruaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '019', countyName: 'Nyeri', region: 'Central', assemblyName: 'Nyeri County Assembly', website: 'https://nyeriassembly.go.ke/', hansardUrl: 'https://nyeriassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '020', countyName: 'Kirinyaga', region: 'Central', assemblyName: 'Kirinyaga County Assembly', website: 'https://kirinyagaassembly.go.ke/', hansardUrl: 'https://kirinyagaassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '021', countyName: "Murang'a", region: 'Central', assemblyName: "Murang'a County Assembly", website: "https://murangaassembly.go.ke/", hansardUrl: "https://murangaassembly.go.ke/hansard/", hasHansard: true, hasWebsite: true },
  { countyCode: '022', countyName: 'Kiambu', region: 'Central', assemblyName: 'Kiambu County Assembly', website: 'https://kiambuassembly.go.ke/', hansardUrl: 'https://kiambuassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },

  // ═══════════════════════════════════════════════════════════════
  // RIFT VALLEY REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '023', countyName: 'Turkana', region: 'Rift Valley', assemblyName: 'Turkana County Assembly', website: 'https://turkanaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '024', countyName: 'West Pokot', region: 'Rift Valley', assemblyName: 'West Pokot County Assembly', website: 'https://westpokotassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '025', countyName: 'Samburu', region: 'Rift Valley', assemblyName: 'Samburu County Assembly', website: 'https://samburuassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '026', countyName: 'Trans Nzoia', region: 'Rift Valley', assemblyName: 'Trans Nzoia County Assembly', website: 'https://transnzoiaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '027', countyName: 'Uasin Gishu', region: 'Rift Valley', assemblyName: 'Uasin Gishu County Assembly', website: 'https://uasingishuassembly.go.ke/', hansardUrl: 'https://uasingishuassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '028', countyName: 'Elgeyo Marakwet', region: 'Rift Valley', assemblyName: 'Elgeyo Marakwet County Assembly', website: 'https://elgeyomarakwetassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '029', countyName: 'Nandi', region: 'Rift Valley', assemblyName: 'Nandi County Assembly', website: 'https://nandiassembly.go.ke/', hansardUrl: 'https://nandiassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '030', countyName: 'Baringo', region: 'Rift Valley', assemblyName: 'Baringo County Assembly', website: 'https://baringoassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '031', countyName: 'Laikipia', region: 'Rift Valley', assemblyName: 'Laikipia County Assembly', website: 'https://laikipiaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '032', countyName: 'Nakuru', region: 'Rift Valley', assemblyName: 'Nakuru County Assembly', website: 'https://nakuruassembly.go.ke/', hansardUrl: 'https://nakuruassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '033', countyName: 'Narok', region: 'Rift Valley', assemblyName: 'Narok County Assembly', website: 'https://narokassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '034', countyName: 'Kajiado', region: 'Rift Valley', assemblyName: 'Kajiado County Assembly', website: 'https://kajiadoassembly.go.ke/', hansardUrl: 'https://kajiadoassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '035', countyName: 'Kericho', region: 'Rift Valley', assemblyName: 'Kericho County Assembly', website: 'https://kerichoassembly.go.ke/', hansardUrl: 'https://kerichoassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '036', countyName: 'Bomet', region: 'Rift Valley', assemblyName: 'Bomet County Assembly', website: 'https://bometassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },

  // ═══════════════════════════════════════════════════════════════
  // WESTERN REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '037', countyName: 'Kakamega', region: 'Western', assemblyName: 'Kakamega County Assembly', website: 'https://kakamegaassembly.go.ke/', hansardUrl: 'https://kakamegaassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '038', countyName: 'Vihiga', region: 'Western', assemblyName: 'Vihiga County Assembly', website: 'https://vihigaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '039', countyName: 'Bungoma', region: 'Western', assemblyName: 'Bungoma County Assembly', website: 'https://bungomaassembly.go.ke/', hansardUrl: 'https://bungomaassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '040', countyName: 'Busia', region: 'Western', assemblyName: 'Busia County Assembly', website: 'https://busiaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },

  // ═══════════════════════════════════════════════════════════════
  // NYANZA REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '041', countyName: 'Siaya', region: 'Nyanza', assemblyName: 'Siaya County Assembly', website: 'https://siayaassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '042', countyName: 'Kisumu', region: 'Nyanza', assemblyName: 'Kisumu County Assembly', website: 'https://kisumuassembly.go.ke/', hansardUrl: 'https://kisumuassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '043', countyName: 'Homa Bay', region: 'Nyanza', assemblyName: 'Homa Bay County Assembly', website: 'https://homabayassembly.go.ke/', hansardUrl: 'https://homabayassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '044', countyName: 'Migori', region: 'Nyanza', assemblyName: 'Migori County Assembly', website: 'https://migoriassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },
  { countyCode: '045', countyName: 'Kisii', region: 'Nyanza', assemblyName: 'Kisii County Assembly', website: 'https://kisiiassembly.go.ke/', hansardUrl: 'https://kisiiassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
  { countyCode: '046', countyName: 'Nyamira', region: 'Nyanza', assemblyName: 'Nyamira County Assembly', website: 'https://nyamiraassembly.go.ke/', hansardUrl: '', hasHansard: false, hasWebsite: true },

  // ═══════════════════════════════════════════════════════════════
  // NAIROBI REGION
  // ═══════════════════════════════════════════════════════════════
  { countyCode: '047', countyName: 'Nairobi City', region: 'Nairobi', assemblyName: 'Nairobi City County Assembly', website: 'https://nairobicityassembly.go.ke/', hansardUrl: 'https://nairobicityassembly.go.ke/hansard/', hasHansard: true, hasWebsite: true },
];

/** Get Hansard entry by county code */
export function getAssemblyHansard(countyCode: string): AssemblyHansardEntry | undefined {
  return assemblyHansardData.find(e => e.countyCode === countyCode);
}

/** Get Hansard entry by county name */
export function getAssemblyHansardByName(countyName: string): AssemblyHansardEntry | undefined {
  return assemblyHansardData.find(e => e.countyName.toLowerCase() === countyName.toLowerCase());
}

/** Get stats about Hansard availability */
export function getHansardStats() {
  const total = assemblyHansardData.length;
  const withHansard = assemblyHansardData.filter(e => e.hasHansard).length;
  const withWebsite = assemblyHansardData.filter(e => e.hasWebsite).length;
  return { total, withHansard, withWebsite, withoutHansard: total - withHansard };
}
