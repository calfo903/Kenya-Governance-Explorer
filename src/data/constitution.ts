/**
 * Kenya Constitution 2010 — Summary & Key Chapters
 *
 * Promulgated August 27, 2010
 * Source: Attorney General of Kenya, Kenya Law Reform Commission
 * Official text: https://kenyalaw.org/
 */

export interface Chapter {
  number: number | string;
  title: string;
  articles: string;
  summary: string;
  keyProvisions: { article: string; text: string }[];
}

export interface ConstitutionalPrinciple {
  article: string;
  title: string;
  description: string;
  relevance: string;
}

export const constitutionPreamble = `We, the people of Kenya — acknowledging the supremacy of the Almighty God of all creation, honouring those who heroically struggled to bring freedom and justice to our land, proud of our ethnic, cultural and religious diversity, and determined to live in peace and unity as one indivisible sovereign nation, committed to nurturing and protecting the well-being of the individual, the family and the community, recognising the aspirations of all Kenyans for a government based on the essential values of human rights, equality, freedom, democracy, social justice and the rule of law, respecting the dignity, rights and freedoms of the individual, and promoting gender equity and social justice, and our shared commitment to the rule of law, good governance, integrity and transparency in public affairs — adopt this Constitution.`;

export const constitutionalPrinciples: ConstitutionalPrinciple[] = [
  {
    article: 'Article 1',
    title: 'Sovereignty of the People',
    description: 'All sovereign power belongs to the people of Kenya and is exercised directly or through democratically elected representatives. This power can be delegated only to the Constitution itself, Parliament, and the independent judicial and legislative bodies.',
    relevance: 'This is the foundational article — all government authority derives from the people. County governments exist because the people willed it through this Constitution.',
  },
  {
    article: 'Article 2',
    title: 'Supremacy of the Constitution',
    description: 'This Constitution is the supreme law of Kenya. If any other law is inconsistent with the Constitution, the Constitution prevails, and the other law shall, to the extent of the inconsistency, be void.',
    relevance: 'Any county law, policy, or action that contradicts the Constitution is void. Citizens can challenge unconstitutional actions in court.',
  },
  {
    article: 'Article 3',
    title: 'Defence of the Constitution',
    description: 'Every person has an obligation to respect, uphold and defend the Constitution. Any attempt to establish a government other than in compliance with the Constitution is unlawful.',
    relevance: 'Citizens have a duty not only to obey the Constitution but to actively defend it against subversion.',
  },
  {
    article: 'Article 4',
    title: 'Declaration of the Republic',
    description: 'Kenya is a sovereign republic consisting of the 47 counties established under this Constitution. The Republic is founded on national values and principles of governance.',
    relevance: 'Establishes the 47-county structure and the national values (patriotism, human dignity, equity, good governance, etc.) that bind all governance.',
  },
  {
    article: 'Article 10',
    title: 'National Values & Principles',
    description: 'The national values and principles of governance bind all state organs, state officers, public officers, and all persons when applying or interpreting the Constitution, enacting or interpreting law, or making public policy.',
    relevance: 'These values are the benchmark against which all county governance can be measured: patriotism, human dignity, equity, social justice, equality, good governance, integrity, transparency, accountability, and sustainable development.',
  },
  {
    article: 'Article 19-57',
    title: 'Bill of Rights',
    description: 'The Bill of Rights is the cornerstone of democracy, outlining fundamental rights and freedoms. It applies to all law and binds all state organs and persons. It is enforceable by courts and cannot be limited except by law that is reasonable and justifiable in an open and democratic society.',
    relevance: 'County governments must respect all rights in the Bill of Rights, including economic and social rights (health, housing, water, education) under Article 43, and the right to information under Article 35.',
  },
  {
    article: 'Article 174-176',
    title: 'Objectives & Principles of Devolution',
    description: 'Devolution is designed to promote democratic and accountable exercise of power, foster national unity, recognise the right of communities to manage their own affairs, and protect and promote the interests and rights of minorities and marginalised communities.',
    relevance: 'The very purpose of county governments — democratic accountability, self-governance, equitable resource sharing, and protection of minorities.',
  },
  {
    article: 'Article 177 & 193',
    title: 'County Governments — Leadership',
    description: 'Each county has a governor elected directly by the registered voters of the county, and a deputy governor elected with the governor as a running mate. The county assembly consists of elected ward representatives (MCAs) and nominated members.',
    relevance: 'Defines the county leadership structure: Governor + Deputy Governor (executive) and County Assembly (legislature), all elected by the people.',
  },
  {
    article: 'Article 179',
    title: 'County Executive Committee',
    description: 'The governor appoints the county executive committee, with the approval of the county assembly. The committee consists of the county secretary and not more than ten other members.',
    relevance: 'The Governor cannot unilaterally appoint the executive — the assembly must vet and approve. This provides legislative oversight over the executive.',
  },
  {
    article: 'Article 185 & 196',
    title: 'County Assembly Powers',
    description: 'County assemblies have legislative power over county matters, oversight over county executive organs, and the power to approve budgets and development plans. They must conduct public participation.',
    relevance: 'MCAs are not just rubber-stamps — they have real legislative and oversight power. Citizens should demand their assembly exercise this mandate.',
  },
  {
    article: 'Article 186-187 & Schedule 4',
    title: 'Distribution of Functions',
    description: 'Functions are divided between national and county governments. Schedule 4 Part 1 lists national functions (defence, foreign policy, immigration, etc.) and Part 2 lists county functions (agriculture, health, county roads, etc.).',
    relevance: 'Knowing what your county government is responsible for is essential for accountability. If a county is failing in its assigned functions, the assembly and citizens must act.',
  },
  {
    article: 'Article 201-203 & 212',
    title: 'Public Finance — Devolved Funds',
    description: 'County governments receive an equitable share of nationally raised revenue (minimum 15% of the most recent audited accounts), plus conditional grants and own-source revenue. County budgets must be published and subject to public participation.',
    relevance: 'The 15% minimum is constitutionally guaranteed. Counties must publish budgets and allow citizen participation in the budget process.',
  },
  {
    article: 'Article 226',
    title: 'Accounts & Audit of Public Entities',
    description: 'An audit of all public entities must be conducted at least once a year by the Auditor-General. The audit report must be submitted to Parliament or the relevant county assembly.',
    relevance: 'Every county must be audited annually by the OAG. The audit report goes to the county assembly and the Senate for oversight. Citizens should read these reports.',
  },
  {
    article: 'Article 229',
    title: 'Office of the Auditor-General',
    description: 'The Auditor-General is independent and audits all public entities, including county governments. The OAG reports directly to Parliament and county assemblies, not to the executive.',
    relevance: 'The OAG is the primary audit watchdog for county governments. Its independence from the executive is constitutionally protected.',
  },
  {
    article: 'Article 230',
    title: 'Controller of Budget',
    description: 'The Controller of Budget oversees the implementation of budgets of national and county governments by authorizing withdrawals from public funds. The CoB ensures money is spent as approved by Parliament or county assemblies.',
    relevance: 'The CoB monitors how counties spend their allocations. Its quarterly Budget Implementation Review Reports are essential for tracking county performance.',
  },
  {
    article: 'Article 228',
    title: 'Commission on Revenue Allocation',
    description: 'The CRA recommends the basis for equitable sharing of revenue raised nationally between national and county governments, and among the 47 counties.',
    relevance: 'CRA determines how the national cake is divided. Its recommendations for county allocations are based on a formula considering population, poverty levels, and other factors.',
  },
  {
    article: 'Article 249-252',
    title: 'Independent Commissions',
    description: 'Constitutional commissions (EACC, OAG, CoB, CRA, PSC, CAJ, KNHRC, NLC, IEBC, etc.) are independent and not subject to direction or control by any person or authority.',
    relevance: 'These commissions are the checks and balances in Kenya\'s governance system. They must be protected from political interference.',
  },
];

export const chapters: Chapter[] = [
  {
    number: 'Preamble',
    title: 'The Preamble',
    articles: 'N/A',
    summary: 'Declares the sovereignty of the people, acknowledges the struggle for freedom, commits to human rights, equality, democracy, social justice, the rule of law, good governance, integrity, and transparency. Serves as the philosophical foundation for the entire Constitution.',
    keyProvisions: [
      { article: 'Preamble', text: 'We, the people of Kenya... adopt this Constitution.' },
    ],
  },
  {
    number: 1,
    title: 'Sovereignty of the People & Supremacy of the Constitution',
    articles: 'Articles 1-3',
    summary: 'Establishes that all sovereign power belongs to the people of Kenya, exercised directly or through elected representatives. The Constitution is the supreme law, and any inconsistent law is void. Every person has an obligation to defend the Constitution.',
    keyProvisions: [
      { article: 'Art. 1', text: 'All sovereign power belongs to the people of Kenya.' },
      { article: 'Art. 2', text: 'This Constitution is the supreme law of Kenya.' },
      { article: 'Art. 3', text: 'Every person has an obligation to respect, uphold and defend the Constitution.' },
    ],
  },
  {
    number: 2,
    title: 'The Republic',
    articles: 'Articles 4-11',
    summary: 'Declares Kenya a sovereign republic with 47 counties. Establishes the national values and principles of governance (patriotism, human dignity, equity, social justice, equality, good governance, integrity, transparency, accountability, sustainable development) and the national languages (Kiswahili and English).',
    keyProvisions: [
      { article: 'Art. 4', text: 'Kenya is a sovereign republic consisting of the 47 counties.' },
      { article: 'Art. 10', text: 'National values bind all state organs, state officers, and public officers.' },
    ],
  },
  {
    number: 3,
    title: 'Citizenship',
    articles: 'Articles 12-18',
    summary: 'Defines who is a Kenyan citizen, including citizenship by birth and by registration. Prohibits dual citizenship except in specific circumstances. Establishes that citizens are entitled to a Kenyan passport and may not be deprived of citizenship.',
    keyProvisions: [
      { article: 'Art. 14', text: 'A person is a citizen by birth if on the day of birth, either parent is a citizen.' },
      { article: 'Art. 16', text: 'A citizen by birth does not lose citizenship by acquiring another.' },
    ],
  },
  {
    number: 4,
    title: 'The Bill of Rights',
    articles: 'Articles 19-57',
    summary: 'The cornerstone of the Constitution. Establishes fundamental rights and freedoms including: right to life, equality, human dignity, freedom from slavery, privacy, conscience, expression, media, association, assembly, movement, residence, political rights, and economic/social rights (health, education, housing, water, food, social security). Also includes rights of persons detained, held in custody, or accused. Children, persons with disabilities, youth, minorities, and older members of society have special protections.',
    keyProvisions: [
      { article: 'Art. 19', text: 'The Bill of Rights is an integral part of Kenya\'s democratic state and is the framework for social, economic and cultural policies.' },
      { article: 'Art. 27', text: 'Equality includes full and equal enjoyment of all rights and fundamental freedoms.' },
      { article: 'Art. 33', text: 'Every person has the right to freedom of expression.' },
      { article: 'Art. 35', text: 'Every citizen has the right of access to information held by the State.' },
      { article: 'Art. 43', text: 'Every person has the right to the highest attainable standard of health, education, housing, food, water, and social security.' },
    ],
  },
  {
    number: 5,
    title: 'Land & Environment',
    articles: 'Articles 60-70',
    summary: 'Defines land classification (public, private, community) and establishes principles for land management. Provides for the National Land Commission (NLC) and county land management boards. Protects the environment including water, wildlife, and biodiversity.',
    keyProvisions: [
      { article: 'Art. 60', text: 'Land in Kenya shall be held, used and managed in a manner that is equitable, efficient, productive and sustainable.' },
      { article: 'Art. 62', text: 'Public land is vested in and held by the county government in trust for the people.' },
      { article: 'Art. 67', text: 'The National Land Commission shall manage public land on behalf of national and county governments.' },
      { article: 'Art. 69', text: 'The State shall maintain the environment for present and future generations.' },
    ],
  },
  {
    number: 6,
    title: 'Leadership & Integrity',
    articles: 'Articles 73-80',
    summary: 'Establishes the leadership code of conduct requiring state officers to be honest, declare income and assets, avoid conflicts of interest, and not abuse their office. Creates the Ethics and Anti-Corruption Commission (EACC). Violation of the leadership code can result in removal from office.',
    keyProvisions: [
      { article: 'Art. 73', text: 'Authority assigned to a state officer is a public trust.' },
      { article: 'Art. 75', text: 'A state officer shall not maintain a bank account outside Kenya except as permitted.' },
      { article: 'Art. 79', text: 'Parliament shall enact legislation to establish the Ethics and Anti-Corruption Commission.' },
    ],
  },
  {
    number: 8,
    title: 'The Legislature',
    articles: 'Articles 93-116',
    summary: 'Establishes Parliament consisting of the National Assembly and the Senate. The National Assembly has 349 members (290 elected, 47 women reps, 12 nominated). The Senate has 68 members (47 elected, 16 women, 2 youth, 2 persons with disabilities, 1 Speaker). Defines legislative process, oversight powers, and public participation requirements.',
    keyProvisions: [
      { article: 'Art. 93', text: 'Parliament consists of the National Assembly and the Senate.' },
      { article: 'Art. 94', text: 'Parliament protects the Constitution and promotes democratic governance.' },
      { article: 'Art. 105', text: 'A member of Parliament may be recalled by registered voters.' },
    ],
  },
  {
    number: 9,
    title: 'The Executive',
    articles: 'Articles 129-155',
    summary: 'Establishes the national executive: President (elected directly), Deputy President, Cabinet Secretaries, and the Attorney General. Defines presidential powers and limitations, election process, and removal of the President through impeachment.',
    keyProvisions: [
      { article: 'Art. 129', text: 'The executive power of the State is vested in the President.' },
      { article: 'Art. 130', text: 'The President is the Head of State and Government.' },
      { article: 'Art. 132', text: 'The President shall address Parliament once a year.' },
    ],
  },
  {
    number: 10,
    title: 'Judiciary',
    articles: 'Articles 159-163',
    summary: 'Establishes an independent judiciary consisting of the Supreme Court, Court of Appeal, High Court, and subordinate courts (including Kadhi\'s courts). Judiciary independence is constitutionally protected — courts cannot be directed or controlled by any person or authority.',
    keyProvisions: [
      { article: 'Art. 159', text: 'Judicial authority is derived from the people and vested in the courts.' },
      { article: 'Art. 160', text: 'In the exercise of judicial authority, the Judiciary shall not be subject to direction or control by any person or authority.' },
    ],
  },
  {
    number: 11,
    title: 'Devolved Government',
    articles: 'Articles 174-201',
    summary: 'The heart of Kenya\'s 2010 Constitution. Establishes 47 county governments, each with an executive (Governor + Deputy Governor + County Executive Committee) and a legislature (County Assembly with elected MCAs). Defines county functions (agriculture, health, county roads, trade, etc.), revenue sharing, intergovernmental relations, and public participation requirements.',
    keyProvisions: [
      { article: 'Art. 174', text: 'Objectives of devolution: democratic accountability, national unity, self-governance, equitable development.' },
      { article: 'Art. 177', text: 'The governor is directly elected by the registered voters of the county.' },
      { article: 'Art. 179', text: 'The county executive committee is appointed by the governor with assembly approval.' },
      { article: 'Art. 185', text: 'A county assembly has power to make laws, oversight, and approve budgets.' },
      { article: 'Art. 196', text: 'A county assembly shall conduct its business in public and promote public participation.' },
      { article: 'Art. 201', text: 'Public finance principles include openness, accountability, and public participation.' },
    ],
  },
  {
    number: 12,
    title: 'Public Finance',
    articles: 'Articles 201-232',
    summary: 'Establishes the framework for public finance including: equitable revenue sharing (minimum 15% to counties), the Consolidated Fund, the Equalisation Fund, county revenue funds, budget process, auditor-general, and controller of budget. Requires public participation in budget processes.',
    keyProvisions: [
      { article: 'Art. 201', text: 'Public money shall be used in a transparent and accountable manner.' },
      { article: 'Art. 203', text: 'Revenue raised nationally shall be shared equitably among national and county governments.' },
      { article: 'Art. 209', text: 'A county may impose property rates, entertainment taxes, and charges for services.' },
      { article: 'Art. 219', text: 'The Commission on Revenue Allocation makes recommendations on revenue sharing.' },
      { article: 'Art. 226', text: 'An audit of all public entities must be conducted at least once a year.' },
      { article: 'Art. 229', text: 'The Auditor-General shall audit and report on the accounts of all public entities.' },
    ],
  },
  {
    number: 13,
    title: 'The Public Service',
    articles: 'Articles 232-236',
    summary: 'Establishes the values and principles of public service including: high standards of professional ethics, efficient and effective use of resources, responsiveness, impartiality, representation of Kenya\'s diversity, and fair competition. Creates the Public Service Commission.',
    keyProvisions: [
      { article: 'Art. 232', text: 'The values and principles of public service apply to all state organs and officers.' },
      { article: 'Art. 233', text: 'The Public Service Commission is established as an independent commission.' },
    ],
  },
  {
    number: 14,
    title: 'National Security',
    articles: 'Articles 238-243',
    summary: 'Establishes national security organs (Kenya Defence Forces, National Police Service, National Intelligence Service). Defines the principles of national security including protection of the people, rule of law, democracy, and human rights.',
    keyProvisions: [
      { article: 'Art. 238', text: 'National security shall be pursued in compliance with the rule of law, democracy, and human rights.' },
    ],
  },
  {
    number: 15,
    title: 'Commissions & Independent Offices',
    articles: 'Articles 248-255',
    summary: 'Establishes independent commissions and offices including: EACC, OAG, CoB, CRA, PSC, CAJ (Ombudsman), KNHRC, NLC, IEBC, Gender & Equality Commission, and Commission on Administrative Justice. These commissions are independent and not subject to direction by any authority.',
    keyProvisions: [
      { article: 'Art. 249', text: 'The commissions and independent offices are independent and not subject to direction or control by any person or authority.' },
      { article: 'Art. 250', text: 'Members of commissions are appointed through a public and competitive process.' },
      { article: 'Art. 252', text: 'Each commission has the power to conduct investigations and recommend actions.' },
    ],
  },
  {
    number: 18,
    title: 'Transitional Provisions',
    articles: 'Articles 260-267',
    summary: 'Provides for the transition from the former Constitution to the 2010 Constitution. Defines how existing laws, institutions, and offices are carried over or reorganized under the new constitutional framework.',
    keyProvisions: [
      { article: 'Art. 260', text: 'Interpretation clause defining terms used throughout the Constitution.' },
    ],
  },
  {
    number: 'Schedule 4',
    title: 'Distribution of Functions Between National & County',
    articles: 'Schedule 4',
    summary: 'Part 1 lists national government functions (foreign affairs, defence, police, judiciary, immigration, etc.). Part 2 lists county government functions (agriculture, county health services, county planning, county public works, trade, etc.).',
    keyProvisions: [
      { article: 'Part 2', text: 'County functions: agriculture, county health, county roads, trade, planning, devolved housing, etc.' },
    ],
  },
];

export const devolutionSpecificArticles = [
  { article: 'Art. 174', title: 'Objects of Devolution', desc: 'Democratic governance, national unity, self-governance, equitable development, and protection of minorities.' },
  { article: 'Art. 175', title: 'Principles of Devolution', desc: 'Distinct spheres of independence, cooperation, consultative and transparent government, and reliable sources of revenue.' },
  { article: 'Art. 176', title: 'County Governments', desc: 'Each of the 47 counties is a distinct entity with its own executive and legislature.' },
  { article: 'Art. 177', title: 'Governor', desc: 'Directly elected by registered voters of the county, serves a maximum of two terms.' },
  { article: 'Art. 178', title: 'Deputy Governor', desc: 'Elected as running mate of the governor, assumes office if the governor is unable to act.' },
  { article: 'Art. 179', title: 'County Executive Committee', desc: 'Appointed by the governor, confirmed by the county assembly. Maximum 10 members plus county secretary.' },
  { article: 'Art. 180', title: 'Removal of Governor', desc: 'Process for impeachment of the governor by the county assembly, tried by the Senate.' },
  { article: 'Art. 181', title: 'Vacancy in Office of Governor', desc: 'Deputy Governor acts if Governor is impeached, dies, or is incapacitated.' },
  { article: 'Art. 182', title: 'Election of Governor', desc: 'Governor elections during general elections, with rules for by-elections.' },
  { article: 'Art. 183', title: 'County Secretary', desc: 'Appointed by the governor from persons competitively sourced, as head of county public service.' },
  { article: 'Art. 184', title: 'Urban Areas & Cities', desc: 'Cities and urban areas may have their own governance structures within counties.' },
  { article: 'Art. 185', title: 'Legislative Authority of County', desc: 'Power to make laws on county matters, oversight of executive, approval of budgets.' },
  { article: 'Art. 186', title: 'Transfer of Functions', desc: 'Parliament may transfer functions between levels of government by law.' },
  { article: 'Art. 187', title: 'Transfer of Functions by Agreement', desc: 'Functions may be transferred by agreement between national and county governments.' },
  { article: 'Art. 189', title: 'Support by National Government', desc: 'National government must support county governments in building capacity.' },
  { article: 'Art. 190', title: 'Intergovernmental Relations', desc: 'Intergovernmental structures for cooperation, consultation, and dispute resolution.' },
  { article: 'Art. 191', title: 'Intergovernmental Forum', desc: 'The Intergovernmental Relations Technical Committee (IRTC) manages intergovernmental matters.' },
  { article: 'Art. 192', title: 'Resolution of Intergovernmental Disputes', desc: 'Disputes resolved through negotiation, mediation, and ultimately the Supreme Court.' },
  { article: 'Art. 193', title: 'Qualifications of MCA', desc: 'Registered voter, meets ethical requirements under Chapter 6.' },
  { article: 'Art. 194', title: 'Vacancy in Office of MCA', desc: 'Procedures for filling vacancies through by-elections.' },
  { article: 'Art. 195', title: 'County Assembly Service', desc: 'County assemblies have their own service commission and clerks.' },
  { article: 'Art. 196', title: 'Public Participation', desc: 'County assemblies must conduct business in public and allow citizen participation.' },
  { article: 'Art. 197', title: 'Speaker of County Assembly', desc: 'Elected by the assembly from among persons who are not members.' },
  { article: 'Art. 200', title: 'County Assembly Powers', desc: 'Power to summon any person, receive evidence, and make resolutions.' },
  { article: 'Art. 201', title: 'Public Finance Principles', desc: 'Openness, accountability, public participation, and equitable sharing of revenue.' },
];
