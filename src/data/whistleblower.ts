/**
 * Whistleblower Protection & Reporting Channels
 * Kenya Legal Framework for Reporting Corruption & Maladministration
 *
 * Sources: Constitution of Kenya 2010, EACC Act 2011, Public Service Act,
 * CAJ (Ombudsman) Act, Protection Against Harassment, PICA 2016
 */

export interface ReportingChannel {
  id: string;
  name: string;
  agency: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  onlineForm?: string;
  type: 'hotline' | 'online' | 'in_person' | 'letter' | 'email';
  jurisdiction: 'national' | 'county' | 'both';
  anonymous?: boolean;
  protected?: boolean;
}

export interface LegalProtection {
  article: string;
  title: string;
  description: string;
  keyProvisions: string[];
}

export interface WhistleblowerFAQ {
  question: string;
  answer: string;
}

export const reportingChannels: ReportingChannel[] = [
  {
    id: 'eacc-hotline',
    name: 'EACC Corruption Hotline',
    agency: 'Ethics & Anti-Corruption Commission',
    description: 'Primary national hotline for reporting corruption, bribery, and unethical conduct involving public officers. Available 24/7. Reports can be anonymous.',
    phone: '1512 (toll-free)',
    email: 'complaints@eacc.go.ke',
    website: 'https://eacc.go.ke/',
    onlineForm: 'https://eacc.go.ke/report-corruption/',
    type: 'hotline',
    jurisdiction: 'both',
    anonymous: true,
    protected: true,
  },
  {
    id: 'eacc-online',
    name: 'EACC Online Portal',
    agency: 'Ethics & Anti-Corruption Commission',
    description: 'Submit corruption reports online through the EACC secure reporting portal. Supports document attachments and follow-up tracking.',
    website: 'https://eacc.go.ke/report-corruption/',
    type: 'online',
    jurisdiction: 'both',
    anonymous: true,
    protected: true,
  },
  {
    id: 'eacc-regional',
    name: 'EACC Regional Offices',
    agency: 'Ethics & Anti-Corruption Commission',
    description: 'Walk-in reporting at any EACC regional office across all 47 counties. Offices in Nairobi, Mombasa, Kisumu, Nakuru, Nyeri, Eldoret, Garissa, and Kakamega.',
    website: 'https://eacc.go.ke/regional-offices/',
    type: 'in_person',
    jurisdiction: 'both',
    protected: true,
  },
  {
    id: 'dci-hq',
    name: 'DCI Headquarters',
    agency: 'Directorate of Criminal Investigations',
    description: 'Report criminal conduct including fraud, embezzlement, and economic crimes. DCI works closely with EACC on corruption cases.',
    phone: '+254 020 2540930 / 254 020 2221371',
    email: 'info@dci.go.ke',
    website: 'https://dci.go.ke/',
    address: 'Mazingira Complex, Kiambu Road, Nairobi',
    type: 'in_person',
    jurisdiction: 'national',
  },
  {
    id: 'caj-ombudsman',
    name: 'CAJ / Commission on Administrative Justice',
    agency: 'Commission on Administrative Justice (Ombudsman)',
    description: 'Reports maladministration, injustice, and abuse of power by public officers at both national and county level. Handles delayed services, discrimination, and unfair treatment.',
    phone: '+254 020 2727444 / 0800 221 0225 (toll-free)',
    email: 'info@caj.go.ke',
    website: 'https://caj.go.ke/',
    address: 'Reinsurance Plaza, 6th Floor, Taifa Road, Nairobi',
    type: 'in_person',
    jurisdiction: 'both',
    protected: true,
  },
  {
    id: 'oag-fraud',
    name: 'OAG — Report Audit Irregularities',
    agency: 'Office of the Auditor-General',
    description: 'Report suspected financial irregularities, misappropriation, and audit anomalies in county or national government entities. Tips inform audit priorities.',
    email: 'audit@oagkenya.go.ke',
    website: 'https://oagkenya.go.ke/',
    type: 'email',
    jurisdiction: 'both',
  },
  {
    id: 'ppra-fraud',
    name: 'PPRA — Report Procurement Irregularities',
    agency: 'Public Procurement Regulatory Authority',
    description: 'Report procurement fraud, bid rigging, conflict of interest in tenders, or non-compliance with procurement law.',
    phone: '+254 020 2251669 / 2242402',
    email: 'info@ppra.go.ke',
    website: 'https://ppra.go.ke/',
    address: 'PPRA Tower, Maruarui, Along Thika Road',
    type: 'in_person',
    jurisdiction: 'both',
  },
  {
    id: 'psck-complaints',
    name: 'Public Service Commission',
    agency: 'Public Service Commission (PSC)',
    description: 'Report misconduct, nepotism, and irregular appointments in county and national public service. Handles staff integrity complaints.',
    phone: '+254 020 2221509',
    email: 'complaints@psc.go.ke',
    website: 'https://psc.go.ke/',
    address: 'Commission House, Harambee Avenue, Nairobi',
    type: 'in_person',
    jurisdiction: 'both',
  },
  {
    id: 'parliament-petition',
    name: 'Parliamentary Petitions',
    agency: 'Parliament of Kenya',
    description: 'Submit a petition to the Senate or National Assembly on any matter of county governance under Article 119 of the Constitution.',
    website: 'https://parliament.go.ke/petitions',
    type: 'online',
    jurisdiction: 'both',
    protected: true,
  },
  {
    id: 'county-assembly',
    name: 'County Assembly Petitions',
    agency: 'County Assembly',
    description: 'Every county assembly has a petition process. Submit concerns about county executive conduct, service delivery failures, or resource misuse.',
    type: 'in_person',
    jurisdiction: 'county',
    protected: true,
  },
  {
    id: 'tikenya-report',
    name: 'TI-Kenya Advocacy & Legal Advice Centre',
    agency: 'Transparency International Kenya',
    description: 'Free legal advice and support for corruption whistleblowers. Helps navigate reporting channels and provides witness protection referrals.',
    phone: '+254 020 2325696',
    email: 'info@tikenya.org',
    website: 'https://tikenya.org/advocacy/legal-advice-centre/',
    type: 'hotline',
    jurisdiction: 'both',
    anonymous: true,
  },
  {
    id: 'kituo-legal',
    name: 'Kituo Cha Sheria',
    agency: 'Kituo Cha Sheria (Legal Advice Centre)',
    description: 'Free legal aid for whistleblowers and citizens reporting corruption. Specializes in public interest litigation and rights awareness.',
    phone: '+254 020 2243815',
    email: 'info@kituo.org',
    website: 'https://kituo.org/',
    type: 'hotline',
    jurisdiction: 'both',
  },
];

export const legalProtections: LegalProtection[] = [
  {
    article: 'Article 33(1)(d)',
    title: 'Freedom of Expression — Information',
    description: 'Every person has the right to freedom of expression, including the freedom to seek, receive, or impart information or ideas. Whistleblowing is a protected exercise of this right.',
    keyProvisions: [
      'Right to seek, receive, and impart information',
      'Applies to all persons, including public servants',
      'Does not extend to propaganda for war, incitement to violence, or hate speech',
    ],
  },
  {
    article: 'Article 35',
    title: 'Right to Information',
    description: 'Citizens have the right to information held by the state, and the state has a duty to publish and publicize important information affecting the nation. Public officers must be compelled to disclose information.',
    keyProvisions: [
      'Right to information held by the state (Art. 35(1))',
      'Right to information held by another person that is required for exercise of a right (Art. 35(2))',
      'State must publish and publicize important information (Art. 35(3))',
      'Legislation to be enacted for enforcement within 3 years',
    ],
  },
  {
    article: 'Article 73',
    title: 'Leadership & Integrity — Code of Conduct',
    description: 'Authority assigned to a state officer is a public trust. Officers must be honest, declare their income and assets, and not place themselves in conflicts of interest.',
    keyProvisions: [
      'Authority is a public trust — must be exercised in a manner consistent with the Constitution',
      'Personal financial interests must not conflict with public duties',
      'Honesty, declaration of income/assets, and avoidance of conflict of interest are mandatory',
      'The Leadership and Integrity Act (LIA) provides enforcement mechanisms',
    ],
  },
  {
    article: 'Article 74',
    title: 'Oath of Office',
    description: 'Before assuming office, every state officer must swear or affirm to uphold and defend the Constitution, and to faithfully discharge their duties. Violation can result in removal.',
    keyProvisions: [
      'Oath to uphold and defend the Constitution',
      'Promise to faithfully discharge duties',
      'Sworn before a designated authority',
      'Violation may lead to removal from office',
    ],
  },
  {
    article: 'Article 79 & Chapter 13',
    title: 'Ethics & Anti-Corruption Commission (EACC)',
    description: 'EACC is established to investigate corruption, coordinate anti-corruption efforts, and educate the public. It has the power to investigate and recommend prosecution.',
    keyProvisions: [
      'EACC investigates corruption and economic crimes (Art. 79 & 252)',
      'Power to arrest, search, and seize evidence (EACC Act, Sec. 26)',
      'Receives and processes complaints from the public',
      'Can recommend prosecution to the DPP',
      'Asset recovery powers under the EACC Act',
    ],
  },
  {
    article: 'Article 174(c) & Schedule 4',
    title: 'County Assembly Oversight',
    description: 'County assemblies have the power to vet and approve appointments, oversight the county executive, and summon officials to answer questions about governance.',
    keyProvisions: [
      'Vetting and approval of county executive appointees (Art. 179(2))',
      'Oversight over county executive committees',
      'Power to summon any county official (Standing Orders)',
      'Power to approve budgets and development plans',
    ],
  },
  {
    article: 'EACC Act, Sec. 20-24',
    title: 'Protection of Witnesses & Whistleblowers',
    description: 'The EACC Act provides explicit protections for witnesses and persons who report corruption. This includes protection of identity and protection from victimization.',
    keyProvisions: [
      'EACC may protect the identity of any person who provides information (Sec. 21)',
      'Protection from intimidation, harassment, or retaliation',
      'Witnesses may give evidence in camera or through intermediaries',
      'Violating witness protection is a criminal offense',
    ],
  },
  {
    article: 'Public Procurement & Asset Disposal Act, Sec. 172',
    title: 'Procurement Whistleblower Protection',
    description: 'Any person who reports procurement fraud or irregularity is protected from retaliation. The PPAD Act explicitly shields whistleblowers in procurement processes.',
    keyProvisions: [
      'Protection from disciplinary action for reporting procurement irregularities',
      'Anonymous reporting accepted',
      'Institutional whistleblower hotlines mandated for procuring entities',
      'False reporting penalties to prevent abuse',
    ],
  },
  {
    article: 'Section 6A — PICA 2016',
    title: 'Protection of Witnesses in Criminal Cases',
    description: 'The Protection of Witnesses Act provides formal witness protection programs for persons who testify or provide evidence in criminal proceedings, including corruption cases.',
    keyProvisions: [
      'Formal protection program managed by the Attorney General',
      'Identity protection, relocation, and security support',
      'Available to any person who faces threat due to testimony',
    ],
  },
];

export const faqItems: WhistleblowerFAQ[] = [
  {
    question: 'Can I report corruption anonymously?',
    answer: 'Yes. EACC, TI-Kenya, and most reporting channels accept anonymous reports. The EACC toll-free hotline (1512) and online portal both allow anonymous submission. However, providing contact details helps investigators follow up for additional evidence.',
  },
  {
    question: 'Will I be protected if I blow the whistle?',
    answer: 'Kenya has legal protections under the EACC Act (Sections 20-24), the PPAD Act (Section 172), and the Constitution (Articles 33, 35, 73). These protect you from victimization, harassment, or retaliation. The EACC can also protect your identity and arrange witness protection in serious cases.',
  },
  {
    question: 'What evidence do I need to report corruption?',
    answer: 'You do not need formal evidence to make a report. You need reasonable grounds for suspicion — even an observation or document is enough to trigger an investigation. EACC and DCI will conduct their own investigations. However, providing specific details (names, dates, amounts, documents) strengthens the case.',
  },
  {
    question: 'How do I report corruption at the county level?',
    answer: 'There are multiple channels: (1) Call EACC at 1512 or visit a regional office, (2) File a petition at your County Assembly, (3) Contact the County Assembly Clerk, (4) Submit a report to the CAJ/Ombudsman (toll-free 0800 221 0225), (5) Report to the local DCI office. All county-level reports are treated with the same legal protections.',
  },
  {
    question: 'What happens after I file a report?',
    answer: 'The receiving agency registers your complaint, assigns it to an investigator, and begins preliminary inquiry. If the inquiry finds merit, a formal investigation is launched. EACC can recommend prosecution to the Director of Public Prosecutions (DPP). You may be contacted for additional information, but your identity is protected.',
  },
  {
    question: 'Can a public officer be fired for reporting corruption?',
    answer: 'No. Under Article 73 of the Constitution and the EACC Act, victimizing a whistleblower is itself a criminal offense. If a public officer faces retaliation for reporting corruption, they can file a counter-complaint with EACC, PSC, or the courts. The Employment Act (2007) also protects employees from unfair dismissal.',
  },
  {
    question: 'Is there a time limit for reporting corruption?',
    answer: 'There is no strict time limit for reporting corruption under Kenyan law. However, the sooner a report is made, the easier it is to gather evidence. For financial crimes, the limitation period may apply depending on the specific offense under the Anti-Corruption and Economic Crimes Act (ACECA).',
  },
  {
    question: 'What is the difference between EACC and DCI?',
    answer: 'EACC focuses specifically on corruption, ethics violations, and economic crimes. DCI handles all criminal investigations including fraud, theft, and organized crime. They often collaborate — EACC investigates the corruption angle while DCI handles the criminal aspects. Both can receive reports from the public.',
  },
  {
    question: 'Can I report corruption involving the Governor?',
    answer: 'Yes. Governors are state officers and are subject to all anti-corruption laws. Reports against governors go through EACC, which can investigate and recommend prosecution. The Senate also has oversight power and can form a special committee to investigate allegations. The county assembly can also petition the Senate to investigate.',
  },
  {
    question: 'What is a County Budget & Economic Forum (CBEF)?',
    answer: 'CBEFs are public participation forums mandated by the Public Finance Management Act (Section 137). Every county must establish CBEFs to allow citizens to input on budgets and priorities. Attending CBEF meetings is one way to raise concerns about county resource allocation and demand accountability.',
  },
];
