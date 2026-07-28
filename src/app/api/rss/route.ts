import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preview-chatglm.space-z.ai';

  const feedItems = [
    {
      title: "Auditor-General's Summary Report on County Governments FY 2024/25",
      link: 'https://www.oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
      description: 'Comprehensive audit opinions for all 47 county executives and county assemblies for the financial year 2024/25. Includes special reports on pending bills and conditional grants.',
      pubDate: '2026-05-15T09:00:00Z',
      category: 'Audit Report',
    },
    {
      title: "Controller of Budget: County Budget Implementation Review Report FY 2024/25",
      link: 'https://cob.go.ke/county-budget-implementation-review-reports/',
      description: 'Quarterly review of county budget absorption rates, own-source revenue collection, and development spending performance across all 47 counties.',
      pubDate: '2026-04-20T09:00:00Z',
      category: 'Budget Report',
    },
    {
      title: "EACC Annual Report 2025/2026 — County Governance",
      link: 'https://eacc.go.ke/reports/',
      description: 'Ethics and Anti-Corruption Commission annual report covering county-level investigations, asset recovery cases, and prevention measures.',
      pubDate: '2026-03-10T09:00:00Z',
      category: 'Anti-Corruption',
    },
    {
      title: "Commission on Revenue Allocation: County Revenue Sharing Formula Review",
      link: 'https://cra.go.ke/',
      description: 'Updated revenue sharing recommendations and equitable distribution analysis for the 2026/27 financial year.',
      pubDate: '2026-02-28T09:00:00Z',
      category: 'Revenue',
    },
    {
      title: "TI-Kenya County Governance Status Report 2025",
      link: 'https://tikenya.org/',
      description: 'Transparency International Kenya annual county governance scores measuring transparency, accountability, and citizen participation.',
      pubDate: '2026-01-15T09:00:00Z',
      category: 'Governance Index',
    },
    {
      title: "PPRA Annual Procurement Audit Report FY 2024/25",
      link: 'https://ppra.go.ke/',
      description: 'Public Procurement Regulatory Authority report on county procurement compliance, including flagged tender awards and recommended suspensions.',
      pubDate: '2025-12-20T09:00:00Z',
      category: 'Procurement',
    },
    {
      title: "KNBS Economic Survey 2026 — County Statistics",
      link: 'https://www.knbs.or.ke/',
      description: 'Kenya National Bureau of Statistics annual survey including county-level economic indicators, poverty indices, and demographic updates.',
      pubDate: '2025-11-05T09:00:00Z',
      category: 'Statistics',
    },
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kenya Governance Explorer — Report Releases</title>
    <link>${siteUrl}</link>
    <description>RSS feed of new audit, budget, and governance reports from OAG, CoB, EACC, TI-Kenya, and other oversight institutions covering Kenya's 47 county governments.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
    <generator>Kenya Governance Explorer RSS</generator>
    ${feedItems.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <category>${item.category}</category>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.link}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
