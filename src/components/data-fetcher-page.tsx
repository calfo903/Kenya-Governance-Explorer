'use client';

import React, { useState } from 'react';
import {
  Database, ExternalLink, Search, Globe, FileText,
  BookOpen, Shield, BarChart3, Info, AlertCircle,
  ChevronRight, ArrowUpRight, Building2, Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface DataSource {
  name: string;
  url: string;
  description: string;
  reports: ReportEntry[];
  icon: React.ReactNode;
  color: string;
}

interface ReportEntry {
  title: string;
  date: string;
  url?: string;
  status: 'published' | 'expected' | 'periodic';
}

const DATA_SOURCES: DataSource[] = [
  {
    name: 'Office of the Auditor-General (OAG)',
    url: 'https://www.oagkenya.go.ke',
    description: 'Audits all 47 county governments annually. Publishes individual county reports and summary reports on audit opinions.',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-emerald-600',
    reports: [
      { title: "OAG Summary Report on County Governments FY 2024/25", date: 'Published May 2026', url: 'https://www.oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf', status: 'published' },
      { title: "OAG Summary Report on County Governments FY 2023/24", date: 'Published April 2025', url: 'https://www.oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf', status: 'published' },
      { title: 'Individual County Audit Reports FY 2024/25', date: 'Published ongoing', status: 'published' },
      { title: 'Special Audits on Specific Counties', date: 'Published as needed', status: 'periodic' },
    ],
  },
  {
    name: 'Controller of Budget (CoB)',
    url: 'https://cob.go.ke',
    description: 'Oversees county budget implementation. Publishes quarterly and annual budget implementation review reports.',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'text-blue-600',
    reports: [
      { title: 'County Budget Implementation Review — Half Year FY 2025/26', date: 'Published July 2026', url: 'https://cob.go.ke/county-budget-implementation-review-reports/', status: 'published' },
      { title: 'County Budget Implementation Review — FY 2024/25 (Full Year)', date: 'Published October 2025', status: 'published' },
      { title: 'Quarterly Budget Reviews (Q3 FY 2025/26)', date: 'Expected October 2026', status: 'expected' },
      { title: 'County Revenue Collection Reports', date: 'Annual', status: 'periodic' },
    ],
  },
  {
    name: 'Transparency International Kenya (TI-Kenya)',
    url: 'https://www.tikenya.org',
    description: 'Publishes the Corruption Perception Index (CPI), County Governance, Security and Reconciliation (CGSR) reports, and Bribery Index.',
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'text-red-600',
    reports: [
      { title: 'Kenya CPI 2025: Score 30/100, Rank 130/182', date: 'Published January 2025', url: 'https://www.transparency.org/en/cpi/2025/country/kenya', status: 'published' },
      { title: 'TI-Kenya CGSR 2025 (County Governance Report)', date: 'Published July 2025', status: 'published' },
      { title: 'Kenya Bribery Index 2024', date: 'Published 2024', status: 'published' },
      { title: 'County Governance Scorecards', date: 'Periodic', status: 'periodic' },
    ],
  },
  {
    name: 'Ethics and Anti-Corruption Commission (EACC)',
    url: 'https://www.eacc.go.ke',
    description: 'Investigates corruption in county and national government. Publishes annual reports and investigation status updates.',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-amber-600',
    reports: [
      { title: 'EACC Annual Report 2024/25', date: 'Published June 2026', status: 'published' },
      { title: 'Status of County Corruption Investigations', date: 'Ongoing updates', url: 'https://www.eacc.go.ke/report-corruption', status: 'periodic' },
      { title: 'County Asset Recovery Reports', date: 'Published as cases conclude', status: 'periodic' },
      { title: 'National Ethics and Anti-Corruption Policy', date: 'Published 2021', status: 'published' },
    ],
  },
  {
    name: 'Kenya National Bureau of Statistics (KNBS)',
    url: 'https://www.knbs.or.ke',
    description: 'Official source for demographic, economic, and social statistics. Publishes the Kenya Population and Housing Census and Economic Surveys.',
    icon: <Database className="h-5 w-5" />,
    color: 'text-purple-600',
    reports: [
      { title: 'Kenya Economic Survey 2025', date: 'Published April 2025', status: 'published' },
      { title: 'Kenya Demographic and Health Survey (KDHS)', date: 'Published 2023', status: 'published' },
      { title: 'County Statistical Profiles', date: 'Ongoing', status: 'periodic' },
      { title: 'GDP and County Economic Contribution', date: 'Annual', status: 'periodic' },
    ],
  },
  {
    name: 'Kenya Open Data Portal',
    url: 'https://opendata.go.ke',
    description: 'National open data portal with datasets from multiple government agencies, including county-level data.',
    icon: <Globe className="h-5 w-5" />,
    color: 'text-cyan-600',
    reports: [
      { title: 'County Budget Datasets', date: 'Ongoing', status: 'periodic' },
      { title: 'Population Census Data by County', date: '2019 Census', status: 'published' },
      { title: 'Health Facility Census Data', date: 'Periodic updates', status: 'periodic' },
      { title: 'Education Statistics by County', date: 'Annual', status: 'periodic' },
    ],
  },
];

export default function DataFetcherPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countySearch, setCountySearch] = useState('');

  const handleGoogleSearch = (query: string) => {
    const encoded = encodeURIComponent(query);
    window.open(`https://www.google.com/search?q=${encoded}`, '_blank');
  };

  const handleCountySearch = () => {
    if (!countySearch.trim()) return;
    handleGoogleSearch(`Kenya ${countySearch.trim()} county budget audit report 2025 site:gov.ke OR site:oagkenya.go.ke OR site:cob.go.ke`);
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Database className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Live Data Fetcher & API Explorer</h2>
            <p className="text-sm text-blue-200 mt-1 leading-relaxed">
              Access real governance data from Kenya&apos;s official sources. Each link opens the actual government website
              in a new tab. Search for county-specific data across multiple sources.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Globe className="h-3 w-3" /> 6 Data Sources</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><FileText className="h-3 w-3" /> Real Report Links</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Search className="h-3 w-3" /> County Search</span>
            </div>
          </div>
        </div>
      </div>

      {/* County Search */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="py-4 px-4">
          <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-blue-600" />
            County-Specific Data Search
          </p>
          <p className="text-[10px] text-stone-500 mb-3">Search for county budget, audit, and governance data across government sources</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Enter county name (e.g. Nakuru, Makueni, Nairobi)..."
                className="h-10 pl-10 text-sm border-stone-200"
                value={countySearch}
                onChange={e => setCountySearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCountySearch()}
              />
            </div>
            <Button onClick={handleCountySearch} disabled={!countySearch.trim()} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DATA_SOURCES.map((source) => (
          <Card key={source.name} className="border-stone-200 bg-white hover:border-slate-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`shrink-0 ${source.color}`}>{source.icon}</div>
                  <div className="min-w-0">
                    <CardTitle className="text-xs font-semibold leading-tight truncate">{source.name}</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">{source.description}</CardDescription>
                  </div>
                </div>
                <a href={source.url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 h-7 w-7 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
                  <ArrowUpRight className="h-3.5 w-3.5 text-stone-600" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {source.reports.map((report, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-stone-600">
                  <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    {report.url ? (
                      <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline leading-relaxed">
                        {report.title}
                      </a>
                    ) : (
                      <span className="leading-relaxed">{report.title}</span>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-stone-400">{report.date}</span>
                      <Badge variant="outline" className={`text-[8px] h-4 ${report.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : report.status === 'expected' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                        {report.status === 'published' ? 'Published' : report.status === 'expected' ? 'Expected' : 'Periodic'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Documentation */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-slate-700" />
            API & Open Data Endpoints
          </CardTitle>
          <CardDescription className="text-[10px] text-stone-500">Links to developer documentation and data access points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { name: 'Kenya Open Data API', url: 'https://opendata.go.ke/api', desc: 'Socrata Open Data API for government datasets' },
              { name: 'CoB Budget Reports', url: 'https://cob.go.ke/county-budget-implementation-review-reports/', desc: 'County budget implementation review reports' },
              { name: 'OAG Reports Portal', url: 'https://www.oagkenya.go.ke/reports/', desc: 'All OAG audit reports (national & county)' },
              { name: 'EACC Investigation Portal', url: 'https://www.eacc.go.ke/investigations', desc: 'Status of active investigations' },
              { name: 'KNBS Data Portal', url: 'https://www.knbs.or.ke/data-downloads/', desc: 'Statistical data downloads' },
              { name: 'IEBC Results Portal', url: 'https://www.iebc.or.ke/results', desc: 'Election results and voter registration data' },
              { name: 'PPIP Procurement Portal', url: 'https://www.ppip.go.ke', desc: 'Public Procurement Information Portal — searchable county procurement data' },
              { name: 'KenyaLaw.org', url: 'https://kenyalaw.org/klr/', desc: 'Laws, Constitution, and legal documents' },
            ].map(endpoint => (
              <a key={endpoint.name} href={endpoint.url} target="_blank" rel="noopener noreferrer"
                className="p-2.5 bg-stone-50 rounded-lg border border-stone-100 hover:bg-stone-100 transition-colors flex items-start gap-2 group">
                <ExternalLink className="h-3.5 w-3.5 text-stone-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-emerald-700 group-hover:underline truncate">{endpoint.name}</p>
                  <p className="text-[9px] text-stone-500 truncate">{endpoint.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-stone-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-600 leading-relaxed">
              <span className="font-bold">Note:</span> All links point to official Kenyan government and international organization websites.
              Kenya&apos;s government data is primarily published in PDF format. For machine-readable datasets, use the Kenya Open Data Portal (Socrata API).
              Some government websites may have intermittent availability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
