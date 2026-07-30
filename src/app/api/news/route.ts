import { NextResponse } from 'next/server';

export async function GET() {
  const newsItems = [
    {
      id: 'news-1',
      headline: 'OAG Flags KSh 8.2B in Unsupported Expenditures Across 12 Counties',
      source: 'The Standard',
      url: 'https://www.standardmedia.co.ke/',
      publishedAt: '2026-07-27T10:30:00Z',
      summary:
        'The Office of the Auditor-General has flagged KSh 8.2 billion in unsupported expenditures in county governments for the financial year 2024/25, citing inadequate documentation and procurement irregularities.',
      relevanceScore: 95,
    },
    {
      id: 'news-2',
      headline: 'EACC Recovers KSh 340M in Stolen Public Assets in Q2 2026',
      source: 'Nation Africa',
      url: 'https://nation.africa/',
      publishedAt: '2026-07-26T14:15:00Z',
      summary:
        'The Ethics and Anti-Corruption Commission recovered KSh 340 million in stolen public assets during the second quarter of 2026, through asset tracing and recovery operations.',
      relevanceScore: 88,
    },
    {
      id: 'news-3',
      headline: 'Senate Committee Probes Delayed Road Projects in North Eastern Region',
      source: 'Citizen TV',
      url: 'https://citizen.digital/',
      publishedAt: '2026-07-25T08:45:00Z',
      summary:
        'The Senate Roads and Transportation Committee has launched an investigation into delayed road construction projects in Garissa, Wajir, and Mandera counties, with a combined budget of KSh 4.5 billion.',
      relevanceScore: 82,
    },
    {
      id: 'news-4',
      headline: 'PPRA Publishes New Public Procurement Regulations for Counties',
      source: 'Business Daily',
      url: 'https://www.businessdailyafrica.com/',
      publishedAt: '2026-07-24T16:00:00Z',
      summary:
        'The Public Procurement Regulatory Authority has published revised procurement regulations specifically targeting county governments, requiring real-time disclosure of tender awards above KSh 5 million.',
      relevanceScore: 76,
    },
    {
      id: 'news-5',
      headline: 'CoB Report: Average County Budget Absorption at 62% — Below Target',
      source: 'Kenya News Agency',
      url: 'https://www.kenyanewsagency.go.ke/',
      publishedAt: '2026-07-23T11:20:00Z',
      summary:
        'The Controller of Budget quarterly report shows average county budget absorption rate at 62%, below the 80% target, with 9 counties absorbing less than 50% of their development budgets.',
      relevanceScore: 91,
    },
    {
      id: 'news-6',
      headline: 'High Court Orders Mandera County to Account for KSh 120M Health Funds',
      source: 'The Star',
      url: 'https://www.the-star.co.ke/',
      publishedAt: '2026-07-22T09:30:00Z',
      summary:
        'The High Court in Garissa has ordered Mandera County government to account for KSh 120 million allocated to health facilities that remain non-operational.',
      relevanceScore: 72,
    },
  ];

  return NextResponse.json({ articles: newsItems });
}
