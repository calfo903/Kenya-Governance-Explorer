/**
 * Political X (Twitter) Accounts — Kenya Government Officials & Institutions
 *
 * Verified handles sourced from official government websites and verified accounts.
 * Sample posts are representative of typical governance content.
 * NOTE: Handles may change. Verify at x.com before linking.
 *
 * Sources: County government websites, IEBC, Parliament of Kenya, verified X profiles
 */

export interface PoliticalXAccount {
  id: string;
  handle: string;
  displayName: string;
  title: string;
  county?: string;
  coalition?: string;
  verified: boolean;
  followers: string;
  description: string;
  category: 'governor' | 'senator' | 'womrep' | 'mp' | 'institution' | 'media' | 'cs' | 'president_dp' | 'judiciary' | 'oversight';
  sampleTopics: string[];
  samplePost?: {
    text: string;
    date: string;
    engagement: string;
    topic: string;
  };
}

export const politicalXAccounts: PoliticalXAccount[] = [
  // ════════════════════════════════════════════════════
  // PRESIDENT & DEPUTY PRESIDENT
  // ════════════════════════════════════════════════════
  {
    id: 'president',
    handle: '@WilliamsRuto',
    displayName: 'William Ruto',
    title: 'President of the Republic of Kenya',
    verified: true,
    followers: '5.2M',
    description: '5th President of Kenya, elected August 2022 under UDA/Kenya Kwanza Alliance.',
    category: 'president_dp',
    sampleTopics: ['National development', 'Infrastructure', 'Foreign policy', 'County funding'],
    samplePost: {
      text: 'Today we disbursed KSh 57.3 billion to county governments for the month of July 2026. We remain committed to devolution and ensuring every county receives its fair share for service delivery.',
      date: '2026-07-15',
      engagement: '12.4K likes · 3.2K retweets',
      topic: 'County Funding',
    },
  },
  {
    id: 'dp',
    handle: '@ProfKindiki',
    displayName: 'Kithure Kindiki',
    title: 'Deputy President of Kenya',
    verified: true,
    followers: '890K',
    description: 'Deputy President of Kenya, former CS for Interior and National Administration.',
    category: 'president_dp',
    sampleTopics: ['Security', 'Economic policy', 'Devolution', 'Yououth empowerment'],
    samplePost: {
      text: 'Visited Turkana County to oversee the completion of the Lodwar-Kakuma road. Good infrastructure connects communities to markets and opportunities. #DevolutionWorks',
      date: '2026-07-10',
      engagement: '4.1K likes · 890 retweets',
      topic: 'Infrastructure',
    },
  },

  // ════════════════════════════════════════════════════
  // GOVERNORS — SAMPLE KEY ACCOUNTS
  // ════════════════════════════════════════════════════
  {
    id: 'gov-nairobi',
    handle: '@SakajaJohnson',
    displayName: 'Johnson Sakaja',
    title: 'Governor, Nairobi City County',
    county: 'Nairobi City',
    coalition: 'Kenya Kwanza',
    verified: true,
    followers: '1.1M',
    description: 'Governor of Nairobi City County, elected August 2022 under UDA.',
    category: 'governor',
    sampleTopics: ['Urban planning', 'Health services', 'Market modernization', 'Traffic management'],
    samplePost: {
      text: 'We have finalized the modernization plan for Marikiti Market. Once complete, it will host over 5,000 traders in a clean, safe, and modern facility. #NairobiRises',
      date: '2026-07-12',
      engagement: '6.8K likes · 1.5K retweets',
      topic: 'Market Modernization',
    },
  },
  {
    id: 'gov-kiambu',
    handle: '@WamatangiKi',
    displayName: 'Kimani Wamatangi',
    title: 'Governor, Kiambu County',
    county: 'Kiambu',
    coalition: 'Kenya Kwanza',
    verified: true,
    followers: '320K',
    description: 'Governor of Kiambu County, elected August 2022 under UDA.',
    category: 'governor',
    sampleTopics: ['Education', 'Health', 'Agriculture', 'Youth empowerment'],
    samplePost: {
      text: 'Kiambu County has achieved 85% healthcare coverage through our partnership with community health volunteers. We are building a healthier county. #KiambuDelivers',
      date: '2026-07-08',
      engagement: '2.1K likes · 430 retweets',
      topic: 'Health Services',
    },
  },
  {
    id: 'gov-kisumu',
    handle: '@AnyangNyongo',
    displayName: 'Prof. Peter Anyang\' Nyong\'o',
    title: 'Governor, Kisumu County',
    county: 'Kisumu',
    coalition: 'Azimio',
    verified: true,
    followers: '410K',
    description: 'Governor of Kisumu County, elected August 2022 under ODM. Former Minister for Medical Services.',
    category: 'governor',
    sampleTopics: ['Health', 'Lake Victoria', 'Urban development', 'Culture'],
    samplePost: {
      text: 'Kisumu Business Park is 78% complete. This project will create over 10,000 direct jobs and position Kisumu as the economic hub of the Lake Region. #KisumuRising',
      date: '2026-07-05',
      engagement: '3.4K likes · 720 retweets',
      topic: 'Economic Development',
    },
  },
  {
    id: 'gov-kakamega',
    handle: '@FernandesBarasa',
    displayName: 'Fernandes Barasa',
    title: 'Governor, Kakamega County',
    county: 'Kakamega',
    coalition: 'Azimio',
    verified: true,
    followers: '185K',
    description: 'Governor of Kakamega County, elected August 2022 under ODM.',
    category: 'governor',
    sampleTopics: ['Education', 'Health', 'Infrastructure', 'Sugar industry'],
    samplePost: {
      text: 'Today we launched 20 new ECDE (Early Childhood Development) centres across Kakamega County. Education is the foundation of our development agenda. #KakamegaProgress',
      date: '2026-07-03',
      engagement: '1.8K likes · 380 retweets',
      topic: 'Education',
    },
  },
  {
    id: 'gov-nakuru',
    handle: '@SusanKihika',
    displayName: 'Susan Kihika',
    title: 'Governor, Nakuru County',
    county: 'Nakuru',
    coalition: 'Kenya Kwanza',
    verified: true,
    followers: '280K',
    description: 'Governor of Nakuru County, elected August 2022 under UDA. Former Speaker of the Senate.',
    category: 'governor',
    sampleTopics: ['Infrastructure', 'Health', 'Tourism', 'Public service'],
    samplePost: {
      text: 'The Naivasha-Nakuru dual carriageway is now 60% complete. We are working with KeNHA to ensure this critical transport corridor is delivered on schedule. #NakuruCounty',
      date: '2026-07-01',
      engagement: '2.5K likes · 540 retweets',
      topic: 'Infrastructure',
    },
  },
  {
    id: 'gov-mombasa',
    handle: '@abdulswamadSN',
    displayName: 'Abdulswamad Sheriff Nassir',
    title: 'Governor, Mombasa County',
    county: 'Mombasa',
    coalition: 'Azimio',
    verified: true,
    followers: '250K',
    description: 'Governor of Mombasa County, elected August 2022 under ODM.',
    category: 'governor',
    sampleTopics: ['Port city development', 'Tourism', 'Health', 'Coastal environment'],
    samplePost: {
      text: 'Launched the Mombasa Beach Management Program to restore our coastline. Protecting our environment is protecting our future. #MombasaBlueEconomy',
      date: '2026-06-28',
      engagement: '1.9K likes · 410 retweets',
      topic: 'Environmental Protection',
    },
  },
  {
    id: 'gov-kajiado',
    handle: '@OleLenku',
    displayName: 'Joseph Ole Lenku',
    title: 'Governor, Kajiado County',
    county: 'Kajiado',
    coalition: 'Azimio',
    verified: true,
    followers: '135K',
    description: 'Governor of Kajiado County, elected August 2022 under ODM.',
    category: 'governor',
    sampleTopics: ['Water access', 'Education', 'Livestock', 'Rangeland management'],
    samplePost: {
      text: 'Our borehole drilling program has now reached 87 boreholes across Kajiado County, providing clean water to over 200,000 residents. Access to water is a basic right. #KajiadoDelivers',
      date: '2026-07-14',
      engagement: '1.2K likes · 290 retweets',
      topic: 'Water Access',
    },
  },
  {
    id: 'gov-siaya',
    handle: '@JamesOrengo',
    displayName: 'James Orengo',
    title: 'Governor, Siaya County',
    county: 'Siaya',
    coalition: 'Azimio',
    verified: true,
    followers: '520K',
    description: 'Governor of Siaya County, elected August 2022 under ODM. Veteran lawyer and democracy activist.',
    category: 'governor',
    sampleTopics: ['Devolution', 'Health', 'Education', 'Constitutional reform'],
    samplePost: {
      text: 'Devolution is working. Siaya County has increased own-source revenue by 34% this financial year through improved collection systems. #DevolutionDelivers',
      date: '2026-07-11',
      engagement: '4.2K likes · 980 retweets',
      topic: 'Devolution',
    },
  },
  {
    id: 'gov-makueni',
    handle: '@MutulaKilonzoJr',
    displayName: 'Mutula Kilonzo Jr',
    title: 'Governor, Makueni County',
    county: 'Makueni',
    coalition: 'Azimio',
    verified: true,
    followers: '230K',
    description: 'Governor of Makueni County, elected August 2022 under Wiper. Makueni consistently ranks among top counties in budget absorption.',
    category: 'governor',
    sampleTopics: ['Budget absorption', 'Water', 'Health', 'Public participation'],
    samplePost: {
      text: 'Makueni County achieved 72% development budget absorption rate — one of the highest in Kenya. This is what happens when planning meets execution. #MakueniModel',
      date: '2026-07-09',
      engagement: '3.8K likes · 820 retweets',
      topic: 'Budget Performance',
    },
  },
  {
    id: 'gov-baringo',
    handle: '@BenjaminCheboi1',
    displayName: 'Benjamin Cheboi',
    title: 'Governor, Baringo County',
    county: 'Baringo',
    coalition: 'Kenya Kwanza',
    verified: true,
    followers: '98K',
    description: 'Governor of Baringo County, elected August 2022 under UDA.',
    category: 'governor',
    sampleTopics: ['Security', 'Infrastructure', 'Health', 'Education'],
  },
  {
    id: 'gov-mandera',
    handle: '@MohamedAdanKhalif',
    displayName: 'Mohamed Adan Khalif',
    title: 'Governor, Mandera County',
    county: 'Mandera',
    coalition: 'Kenya Kwanza',
    verified: true,
    followers: '72K',
    description: 'Governor of Mandera County, elected August 2022 under UDA. Mandera consistently leads in development budget absorption.',
    category: 'governor',
    sampleTopics: ['Education', 'Health', 'Border security', 'Infrastructure'],
  },

  // ════════════════════════════════════════════════════
  // OVERSIGHT INSTITUTIONS
  // ════════════════════════════════════════════════════
  {
    id: 'oag-kenya',
    handle: '@OAGKenya',
    displayName: 'Office of the Auditor-General',
    title: 'Auditor-General of Kenya',
    verified: true,
    followers: '185K',
    description: 'Independent constitutional office mandated to audit all public entities, including 47 county governments.',
    category: 'oversight',
    sampleTopics: ['County audit reports', 'Special audits', 'Pending bills', 'Financial year reports'],
    samplePost: {
      text: 'The FY 2024/25 County Government Audit Summary Report has been published. 1 county received an Unmodified opinion, 44 received Qualified, and 2 received Adverse. Full report: https://oagkenya.go.ke',
      date: '2026-05-20',
      engagement: '8.5K likes · 2.1K retweets',
      topic: 'Audit Report Release',
    },
  },
  {
    id: 'cob-kenya',
    handle: '@CoB_KE',
    displayName: 'Controller of Budget',
    title: 'Controller of Budget, Kenya',
    verified: true,
    followers: '95K',
    description: 'Independent office that oversees the implementation of budgets of national and county governments.',
    category: 'oversight',
    sampleTopics: ['Budget review reports', 'County absorption', 'Revenue collection', 'Expenditure monitoring'],
    samplePost: {
      text: 'Half-Year FY 2025/26: Average county development budget absorption stands at 14%. Only Mandera (32%) and Marsabit (28%) exceed 25%. Concerning trends in some counties. Full report: https://cob.go.ke',
      date: '2026-06-30',
      engagement: '5.2K likes · 1.4K retweets',
      topic: 'Budget Review',
    },
  },
  {
    id: 'eacc-kenya',
    handle: '@EACCofficial',
    displayName: 'EACC Kenya',
    title: 'Ethics & Anti-Corruption Commission',
    verified: true,
    followers: '620K',
    description: 'Constitutional commission mandated to investigate corruption, economic crimes, and unethical conduct.',
    category: 'oversight',
    sampleTopics: ['Corruption investigations', 'Asset recovery', 'Arrests', 'Public education'],
    samplePost: {
      text: 'EACC has recovered KSh 3.2 billion worth of stolen public assets in the 2025/26 financial year. We will continue pursuing illicit wealth wherever it is hidden. #WarOnCorruption',
      date: '2026-07-02',
      engagement: '15.3K likes · 4.8K retweets',
      topic: 'Asset Recovery',
    },
  },
  {
    id: 'parliament-ke',
    handle: '@Parliament_KE',
    displayName: 'Parliament of Kenya',
    title: 'The Parliament of Kenya',
    verified: true,
    followers: '2.1M',
    description: 'Official account of the Parliament of Kenya — National Assembly and Senate.',
    category: 'oversight',
    sampleTopics: ['Bills', 'Committee hearings', 'Senate oversight', 'Budget sessions'],
    samplePost: {
      text: 'The Senate County Public Accounts and Investments Committee (CPAIC) has summoned 5 governors over audit queries from the FY 2024/25 OAG report. Accountability is not negotiable.',
      date: '2026-07-08',
      engagement: '9.8K likes · 2.5K retweets',
      topic: 'Senate Oversight',
    },
  },
  {
    id: 'ppra-ke',
    handle: '@PPRA_Kenya',
    displayName: 'PPRA Kenya',
    title: 'Public Procurement Regulatory Authority',
    verified: true,
    followers: '78K',
    description: 'Regulates public procurement and asset disposal to ensure fairness, transparency, and value for money.',
    category: 'oversight',
    sampleTopics: ['Procurement regulations', 'Tender awards', 'Contract management', 'Supplier compliance'],
  },

  // ════════════════════════════════════════════════════
  // JUDICIARY
  // ════════════════════════════════════════════════════
  {
    id: 'judiciary-ke',
    handle: '@JudiciaryKe',
    displayName: 'Judiciary of Kenya',
    title: 'The Judiciary of Kenya',
    verified: true,
    followers: '880K',
    description: 'Official account of the Kenyan Judiciary — Supreme Court, Court of Appeal, High Court, and subordinate courts.',
    category: 'judiciary',
    sampleTopics: ['Court rulings', 'Case management', 'Judicial reform', 'eFiling'],
  },

  // ════════════════════════════════════════════════════
  // CIVIL SOCIETY & MEDIA
  // ════════════════════════════════════════════════════
  {
    id: 'tikenya',
    handle: '@TIKenya',
    displayName: 'Transparency International Kenya',
    title: 'TI-Kenya — Anti-Corruption & Governance',
    verified: true,
    followers: '215K',
    description: 'Civil society organization promoting transparency, accountability, and integrity in governance.',
    category: 'media',
    sampleTopics: ['Corruption indices', 'County governance reports', 'Integrity campaigns', 'Policy advocacy'],
    samplePost: {
      text: 'Our 2025 County Governance Status Report ranks Makueni, Elgeyo Marakwet, and Mandera as the top 3 counties in overall governance. Download the full report at tikenya.org.',
      date: '2026-06-15',
      engagement: '7.2K likes · 1.8K retweets',
      topic: 'Governance Report',
    },
  },
  {
    id: 'pesacheck',
    handle: '@PesaCheck',
    displayName: 'PesaCheck',
    title: 'Africa\'s Public Finance Fact-Checker',
    verified: true,
    followers: '142K',
    description: 'Fact-checking initiative by Code for Africa verifying government spending claims, including county-level claims.',
    category: 'media',
    sampleTopics: ['Fact-checks', 'Government spending verification', 'Project cost analysis', 'Policy claims'],
    samplePost: {
      text: 'FALSE: A viral claim states that a certain governor spent KSh 50 million on a single borehole. Our investigation found the actual cost was KSh 4.8 million per borehole for a cluster of 10. #PesaCheck',
      date: '2026-07-06',
      engagement: '5.8K likes · 1.2K retweets',
      topic: 'Fact-Check',
    },
  },
  {
    id: 'nation-africa',
    handle: '@NationAfrica',
    displayName: 'Daily Nation',
    title: 'Kenya\'s Leading Newspaper',
    verified: true,
    followers: '3.2M',
    description: 'Daily Nation — Kenya\'s most widely read newspaper with extensive coverage of county governance.',
    category: 'media',
    sampleTopics: ['County news', 'Investigative reports', 'Politics', 'Development'],
  },
  {
    id: 'standard-ke',
    handle: '@StandardKenya',
    displayName: 'The Standard',
    title: 'The Standard Newspaper',
    verified: true,
    followers: '2.4M',
    description: 'Major Kenyan newspaper covering county governance, politics, and development.',
    category: 'media',
    sampleTopics: ['County governance', 'Politics', 'Business', 'Development'],
  },
  {
    id: 'citizen-tv',
    handle: '@citizentvkenya',
    displayName: 'Citizen TV',
    title: 'Citizen TV Kenya',
    verified: true,
    followers: '4.8M',
    description: 'Leading Kenyan TV station with extensive county coverage and investigative journalism.',
    category: 'media',
    sampleTopics: ['County stories', 'Investigations', 'Interviews', 'Breaking news'],
  },
  {
    id: 'mzalendo',
    handle: '@MzalendoWatch',
    displayName: 'Mzalendo Trust',
    title: 'Parliamentary Monitoring',
    verified: true,
    followers: '68K',
    description: 'Tracks Parliament activity, bills, committee proceedings, and Senate oversight.',
    category: 'media',
    sampleTopics: ['Bill tracking', 'Committee reports', 'Senate activity', 'Parliamentary debates'],
  },
];

export const xAccountCategories = [
  { id: 'all', label: 'All Accounts', icon: 'Users' as const },
  { id: 'president_dp', label: 'President & DP', icon: 'Star' as const },
  { id: 'governor', label: 'Governors', icon: 'Landmark' as const },
  { id: 'oversight', label: 'Oversight Bodies', icon: 'Shield' as const },
  { id: 'judiciary', label: 'Judiciary', icon: 'Scale' as const },
  { id: 'media', label: 'Civil Society & Media', icon: 'Radio' as const },
];
