'use client';

import React, { useState, useMemo } from 'react';
import {
  all47Governors, getPlaceholderCounties,
} from '@/data/governors';
import {
  nationalSummary, getLatestAuditSummary, getLatestBudgetSummary,
  governorCoalitionDistribution, governorPartyDistribution,
} from '@/data/national-summary';
import { kajiadoCounty } from '@/data/kajiado-county';
import {
  County, Representative, ScorecardMetrics, FilterState, ComparisonItem,
  getScoreColor, getScoreLabel, getAuditColor, AUDIT_OPINIONS, REGIONS,
} from '@/data/types';

// ════════════════════════════════════════════════════════════════
// ICON IMPORTS (Lucide)
// ════════════════════════════════════════════════════════════════
import {
  Shield, ChevronDown, ChevronRight, Search, Filter,
  Users, MapPin, Building2, Scale, FileText,
  BarChart3, GitCompare, TreePine, Database,
  ExternalLink, AlertTriangle, CheckCircle2,
  XCircle, MinusCircle, Globe, Phone, Mail,
  BadgeCheck, ArrowUpDown, Landmark, User,
  GripVertical, Star
} from 'lucide-react';

// shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

// ════════════════════════════════════════════════════════════════
// TAB TYPES
// ════════════════════════════════════════════════════════════════
type TabId = 'summary' | 'tree' | 'county' | 'compare' | 'schema';

// ════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════
export default function KenyaGovernancePage() {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [selectedCounty, setSelectedCounty] = useState<string>('034');
  const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
  const [comparisonList, setComparisonList] = useState<ComparisonItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({});

  // Replace Kajiado placeholder with full data
  const allCounties = useMemo(() => {
    const placeholders = getPlaceholderCounties();
    return placeholders.map((c) => c.code === '034' ? kajiadoCounty : c);
  }, []);

  const toggleCounty = (code: string) => {
    const next = new Set(expandedCounties);
    if (next.has(code)) next.delete(code); else next.add(code);
    setExpandedCounties(next);
  };

  const addToComparison = (rep: Representative, countyName: string) => {
    if (comparisonList.length >= 4) return;
    if (comparisonList.find(c => c.representative.id === rep.id)) return;
    setComparisonList([...comparisonList, { representative: rep, countyName }]);
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter(c => c.representative.id !== id));
  };

  // Filter governors
  const filteredGovernors = useMemo(() => {
    return all47Governors.filter((g) => {
      if (filters.region && g.region !== filters.region) return false;
      if (filters.coalition && g.coalition !== filters.coalition) return false;
      if (filters.party && g.party !== filters.party) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!g.name.toLowerCase().includes(kw) && !g.county.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
        {/* ─── HEADER ─── */}
        <header className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Kenya County Governance Explorer
                </h1>
                <p className="text-green-100 text-sm sm:text-base mt-1">
                  2022–2027 Term · Constitution of Kenya 2010 · Devolved Government · 47 Counties
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs sm:text-sm text-green-200">
              <span className="flex items-center gap-1"><Landmark className="h-3.5 w-3.5" /> Non-Partisan</span>
              <span>·</span>
              <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Evidence-Based</span>
              <span>·</span>
              <span>Sources: OAG · CoB · TI-Kenya · IEBC · EACC</span>
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
            <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1">
              <TabsTrigger value="summary" className="text-xs sm:text-sm gap-1.5 py-2.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">National Summary</span>
                <span className="sm:hidden">Summary</span>
              </TabsTrigger>
              <TabsTrigger value="tree" className="text-xs sm:text-sm gap-1.5 py-2.5">
                <TreePine className="h-4 w-4" />
                <span className="hidden sm:inline">Governors Tree</span>
                <span className="sm:hidden">Tree</span>
              </TabsTrigger>
              <TabsTrigger value="county" className="text-xs sm:text-sm gap-1.5 py-2.5">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">County Explorer</span>
                <span className="sm:hidden">County</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="text-xs sm:text-sm gap-1.5 py-2.5">
                <GitCompare className="h-4 w-4" />
                <span className="hidden sm:inline">Compare</span>
                <span className="sm:hidden">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="schema" className="text-xs sm:text-sm gap-1.5 py-2.5">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">JSON Schema</span>
                <span className="sm:hidden">Schema</span>
              </TabsTrigger>
            </TabsList>

            {/* ════════════════════════════════════════════════════
                TAB 1: NATIONAL SUMMARY
            ════════════════════════════════════════════════════ */}
            <TabsContent value="summary">
              <NationalSummaryDashboard />
            </TabsContent>

            {/* ════════════════════════════════════════════════════
                TAB 2: GOVERNORS TREE
            ════════════════════════════════════════════════════ */}
            <TabsContent value="tree">
              <GovernorsTreeView
                governors={filteredGovernors}
                expandedCounties={expandedCounties}
                toggleCounty={toggleCounty}
                allCounties={allCounties}
                filters={filters}
                setFilters={setFilters}
                addToComparison={addToComparison}
                comparisonList={comparisonList}
              />
            </TabsContent>

            {/* ════════════════════════════════════════════════════
                TAB 3: COUNTY EXPLORER
            ════════════════════════════════════════════════════ */}
            <TabsContent value="county">
              <CountyExplorer
                countyCode={selectedCounty}
                allCounties={allCounties}
                onSelectCounty={setSelectedCounty}
                addToComparison={addToComparison}
                comparisonList={comparisonList}
              />
            </TabsContent>

            {/* ════════════════════════════════════════════════════
                TAB 4: COMPARISON
            ════════════════════════════════════════════════════ */}
            <TabsContent value="compare">
              <ComparisonView
                comparisonList={comparisonList}
                removeFromComparison={removeFromComparison}
                addToComparison={addToComparison}
                allCounties={allCounties}
              />
            </TabsContent>

            {/* ════════════════════════════════════════════════════
                TAB 5: JSON SCHEMA
            ════════════════════════════════════════════════════ */}
            <TabsContent value="schema">
              <JsonSchemaView />
            </TabsContent>
          </Tabs>
        </main>

        {/* ─── FOOTER ─── */}
        <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-2">Data Sources</h3>
                <ul className="space-y-1 text-xs">
                  <li><a href="https://oagkenya.go.ke/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> oagkenya.go.ke</a></li>
                  <li><a href="https://cob.go.ke/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> cob.go.ke</a></li>
                  <li><a href="https://tikenya.org/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> tikenya.org</a></li>
                  <li><a href="https://www.iebc.or.ke/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> iebc.or.ke</a></li>
                  <li><a href="https://eacc.go.ke/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> eacc.go.ke</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Methodology</h3>
                <p className="text-xs leading-relaxed">
                  All scorecard metrics are based exclusively on publicly verifiable primary sources.
                  Data gaps are explicitly marked. This tool is non-partisan, factual, and transparent.
                  No data is invented, estimated, or approximated.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Last Updated</h3>
                <p className="text-xs">2026-07-25</p>
                <p className="text-xs mt-1">
                  Designed to connect to live feeds from OAG, CoB, TI-Kenya, and county portals.
                </p>
              </div>
            </div>
            <Separator className="my-4 bg-gray-700" />
            <p className="text-center text-xs text-gray-500">
              Kenya County Governance Explorer · Strictly Non-Partisan · Evidence-Based · All Rights Reserved
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: NATIONAL SUMMARY DASHBOARD
// ════════════════════════════════════════════════════════════════
function NationalSummaryDashboard() {
  const latestAudit = getLatestAuditSummary();
  const latestBudget = getLatestBudgetSummary();
  const prevAudit = nationalSummary.auditSummaries[1];

  return (
    <div className="space-y-6">
      {/* OAG Audit Summary */}
      <Card className="border-l-4 border-l-green-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5 text-green-600" />
                OAG County Audit Opinions — {latestAudit.financialYear}
              </CardTitle>
              <CardDescription className="mt-1">
                Source: {latestAudit.source.source} — {latestAudit.source.reportTitle}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">Latest Available</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* County Executives */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> County Executives (47 Counties)
              </h4>
              <div className="space-y-3">
                <AuditBar label="Unmodified (Clean)" count={latestAudit.countyExecutive.unmodified} total={47} color="bg-green-500" opinion={AUDIT_OPINIONS.UNMODIFIED} />
                <AuditBar label="Qualified" count={latestAudit.countyExecutive.qualified} total={47} color="bg-yellow-500" opinion={AUDIT_OPINIONS.QUALIFIED} />
                <AuditBar label="Adverse" count={latestAudit.countyExecutive.adverse} total={47} color="bg-orange-500" opinion={AUDIT_OPINIONS.ADVERSE} />
                <AuditBar label="Disclaimer" count={latestAudit.countyExecutive.disclaimer} total={47} color="bg-red-500" opinion={AUDIT_OPINIONS.DISCLAIMER} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only <strong className="text-green-700">{latestAudit.countyExecutive.unmodified} of 47</strong> county executives received a clean audit opinion.
              </p>
            </div>

            {/* County Assemblies */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Landmark className="h-4 w-4" /> County Assemblies (47)
              </h4>
              <div className="space-y-3">
                <AuditBar label="Unmodified (Clean)" count={latestAudit.countyAssembly.unmodified} total={47} color="bg-green-500" opinion={AUDIT_OPINIONS.UNMODIFIED} />
                <AuditBar label="Qualified" count={latestAudit.countyAssembly.qualified} total={47} color="bg-yellow-500" opinion={AUDIT_OPINIONS.QUALIFIED} />
                <AuditBar label="Adverse" count={latestAudit.countyAssembly.adverse} total={47} color="bg-orange-500" opinion={AUDIT_OPINIONS.ADVERSE} />
                <AuditBar label="Disclaimer" count={latestAudit.countyAssembly.disclaimer} total={47} color="bg-red-500" opinion={AUDIT_OPINIONS.DISCLAIMER} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Assemblies perform better: <strong className="text-green-700">{latestAudit.countyAssembly.unmodified} clean</strong> opinions.
              </p>
            </div>
          </div>

          {/* YoY Comparison */}
          {prevAudit && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Year-over-Year Trend</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Executive Clean</p>
                  <p className="text-lg font-bold">{prevAudit.countyExecutive.unmodified} → {latestAudit.countyExecutive.unmodified}</p>
                  <p className="text-xs text-green-600">{latestAudit.countyExecutive.unmodified > prevAudit.countyExecutive.unmodified ? '↑ Improved' : latestAudit.countyExecutive.unmodified === prevAudit.countyExecutive.unmodified ? '→ Unchanged' : '↓ Declined'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Executive Qualified</p>
                  <p className="text-lg font-bold">{prevAudit.countyExecutive.qualified} → {latestAudit.countyExecutive.qualified}</p>
                  <p className="text-xs text-yellow-600">{latestAudit.countyExecutive.qualified > prevAudit.countyExecutive.qualified ? '↑ Increased' : '→'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assembly Clean</p>
                  <p className="text-lg font-bold">{prevAudit.countyAssembly.unmodified} → {latestAudit.countyAssembly.unmodified}</p>
                  <p className="text-xs text-green-600">{latestAudit.countyAssembly.unmodified > prevAudit.countyAssembly.unmodified ? '↑ Improved' : latestAudit.countyAssembly.unmodified === prevAudit.countyAssembly.unmodified ? '→ Unchanged' : '↓ Declined'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Adverse Opinions</p>
                  <p className="text-lg font-bold">{prevAudit.countyExecutive.adverse} → {latestAudit.countyExecutive.adverse}</p>
                  <p className="text-xs text-red-600">{latestAudit.countyExecutive.adverse > prevAudit.countyExecutive.adverse ? '↑ Increased' : latestAudit.countyExecutive.adverse === prevAudit.countyExecutive.adverse ? '→ Unchanged' : '↓ Declined'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CoB Budget Summary */}
      <Card className="border-l-4 border-l-red-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                CoB Budget Absorption — {latestBudget.financialYear} ({latestBudget.period})
              </CardTitle>
              <CardDescription className="mt-1">
                Source: {latestBudget.source.source} — {latestBudget.source.reportTitle}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">{latestBudget.period}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-red-700 font-medium">Avg. Development Budget Absorption</p>
                <p className="text-4xl font-bold text-red-700 mt-1">{latestBudget.avgDevelopmentAbsorption}%</p>
                <p className="text-xs text-red-600 mt-1">Alarmingly low — billions left unspent</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-700 font-medium">Avg. Recurrent Budget Absorption</p>
                <p className="text-4xl font-bold text-green-700 mt-1">{latestBudget.avgRecurrentAbsorption}%</p>
                <p className="text-xs text-green-600 mt-1">Near full absorption (salaries & operations)</p>
              </div>
              {latestBudget.totalUnspentAmount && (
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <p className="text-xs text-orange-700 font-medium">Total Unspent Development Funds</p>
                  <p className="text-3xl font-bold text-orange-700 mt-1">{latestBudget.totalUnspentAmount}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" /> Top Performers
                </h4>
                <div className="space-y-2">
                  {latestBudget.topPerformers.map((c) => (
                    <div key={c.county} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                      <span className="text-sm font-medium">{c.county}</span>
                      <Badge className={`${c.rate >= 70 ? 'bg-green-600' : c.rate >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}>{c.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" /> Bottom Performers
                </h4>
                <div className="space-y-2">
                  {latestBudget.bottomPerformers.map((c) => (
                    <div key={c.county} className="flex items-center justify-between p-2 bg-red-50 rounded border">
                      <span className="text-sm font-medium">{c.county}</span>
                      <Badge className="bg-red-600">{c.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coalition Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Governor Coalition Distribution — 47 Counties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(governorCoalitionDistribution).map(([coalition, count]) => (
              <div key={coalition} className={`p-4 rounded-lg border text-center ${
                coalition === 'Kenya Kwanza Alliance' ? 'bg-yellow-50 border-yellow-200' :
                coalition === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-xs text-muted-foreground">{coalition}</p>
                <p className="text-3xl font-bold mt-1">{count}</p>
                <p className="text-xs text-muted-foreground">{Math.round((count / 47) * 100)}% of 47</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scorecard Color Legend */}
      <Card className="bg-gray-50">
        <CardContent className="py-4">
          <h4 className="font-semibold text-sm mb-3">Scorecard Color Coding</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-500 inline-block" /> Green (80–100): Strong Performance</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-500 inline-block" /> Yellow (50–79): Moderate</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500 inline-block" /> Red (&lt;50): Weak Performance</span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-gray-300 inline-block" /> Gray: Data Not Available</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: AUDIT BAR
// ════════════════════════════════════════════════════════════════
function AuditBar({ label, count, total, color, opinion }: {
  label: string; count: number; total: number; color: string; opinion: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-40 shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }}>
          <span className="text-white text-xs font-bold">{count}</span>
        </div>
      </div>
      <span className="text-xs font-medium w-10 text-right">{pct}%</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: GOVERNORS TREE VIEW
// ════════════════════════════════════════════════════════════════
function GovernorsTreeView({ governors, expandedCounties, toggleCounty, allCounties, filters, setFilters, addToComparison, comparisonList }: {
  governors: typeof all47Governors;
  expandedCounties: Set<string>;
  toggleCounty: (code: string) => void;
  allCounties: County[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  addToComparison: (rep: Representative, countyName: string) => void;
  comparisonList: ComparisonItem[];
}) {
  const grouped = useMemo(() => {
    const map: Record<string, typeof governors> = {};
    for (const g of governors) {
      if (!map[g.region]) map[g.region] = [];
      map[g.region].push(g);
    }
    return map;
  }, [governors]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-sm">Filters</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={filters.region || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, region: v === '_all' ? undefined : v as typeof REGIONS[number] }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Regions</SelectItem>
                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.coalition || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, coalition: v === '_all' ? undefined : v as any }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Coalition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Coalitions</SelectItem>
                <SelectItem value="Kenya Kwanza Alliance">Kenya Kwanza</SelectItem>
                <SelectItem value="Azimio la Umoja One Kenya Coalition">Azimio</SelectItem>
                <SelectItem value="Independent">Independent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.party || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, party: v === '_all' ? undefined : v }))}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Party" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Parties</SelectItem>
                {Object.keys(governorPartyDistribution).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search name or county..."
                className="h-9 text-xs pl-8"
                value={filters.keyword || ''}
                onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value || undefined }))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Showing {governors.length} of 47 governors</p>
        </CardContent>
      </Card>

      {/* Tree by Region */}
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, govs]) => (
        <Accordion key={region} type="multiple" defaultValue={[region]}>
          <AccordionItem value={region} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-semibold">{region}</span>
                <Badge variant="secondary" className="text-xs">{govs.length} counties</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pb-1">
              <div className="space-y-1">
                {govs.sort((a, b) => a.code.localeCompare(b.code)).map((g) => {
                  const county = allCounties.find(c => c.code === g.code);
                  const isExpanded = expandedCounties.has(g.code);
                  const isInComparison = comparisonList.some(c => c.representative.id === `gov-${g.code}`);
                  return (
                    <div key={g.code} className="border rounded-lg overflow-hidden">
                      {/* Governor Row */}
                      <button
                        onClick={() => toggleCounty(g.code)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-green-600 shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{g.name}</span>
                              <Badge className={`text-xs ${g.coalition === 'Kenya Kwanza Alliance' ? 'bg-yellow-100 text-yellow-800' : g.coalition === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {g.party}
                              </Badge>
                              {county?.executiveAuditOpinion && (
                                <Badge className={`text-xs ${getAuditColor(county.executiveAuditOpinion)}`}>
                                  {county.executiveAuditOpinion}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {g.county} County · Pop. {g.population.toLocaleString()} · {g.constituenciesCount} Constituencies · {g.wardsCount} Wards
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {isInComparison && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`text-xs px-2 py-0.5 rounded border ${county?.dataAvailability === 'full' ? 'bg-green-50 border-green-200 text-green-700' : county?.dataAvailability === 'partial' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                                {county?.dataAvailability || 'placeholder'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs">{county?.dataAvailabilityNote || 'Placeholder — expand to load data'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && county && (
                        <div className="border-t bg-gray-50/50 px-4 py-3 space-y-3">
                          <CountyQuickView county={county} onAddComparison={addToComparison} isInComparison={isInComparison} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: COUNTY QUICK VIEW (in tree)
// ════════════════════════════════════════════════════════════════
function CountyQuickView({ county, onAddComparison, isInComparison }: {
  county: County; onAddComparison: (rep: Representative, countyName: string) => void; isInComparison: boolean;
}) {
  const { governor, senator, womanRep, deputyGovernor, countyAssembly, countyExecutive } = county;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Leadership */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">County Leadership</h5>
        {governor && <OfficialMiniCard rep={governor} onCompare={() => onAddComparison(governor, county.name)} isCompared={isInComparison} />}
        {deputyGovernor && <OfficialMiniCard rep={deputyGovernor} onCompare={() => onAddComparison(deputyGovernor, county.name)} />}
        {senator && <OfficialMiniCard rep={senator} onCompare={() => onAddComparison(senator, county.name)} />}
        {womanRep && <OfficialMiniCard rep={womanRep} onCompare={() => onAddComparison(womanRep, county.name)} />}
        {countyAssembly?.speaker && <OfficialMiniCard rep={countyAssembly.speaker} onCompare={() => onAddComparison(countyAssembly.speaker, county.name)} />}
      </div>

      {/* Constituencies & Assemblies */}
      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Structure</h5>
        {county.constituencies.length > 0 ? (
          <div className="space-y-1">
            {county.constituencies.map((con) => (
              <div key={con.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                <div>
                  <span className="font-medium">{con.name}</span>
                  {con.mp && <span className="text-muted-foreground ml-2">MP: {con.mp.fullName} ({con.mp.politicalParty})</span>}
                </div>
                {con.mp && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-1.5" onClick={() => onAddComparison(con.mp, county.name)}>
                    <GitCompare className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground bg-white p-2 rounded border">Constituency and MCA data requires expansion. Pull from IEBC and county assembly records.</p>
        )}

        {countyExecutive && countyExecutive.length > 0 && (
          <>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3">County Executive Committee</h5>
            <div className="space-y-1">
              {countyExecutive.map((cecm) => (
                <div key={cecm.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                  <span className="font-medium">{cecm.portfolio}</span>
                  <span className="text-muted-foreground">{cecm.fullName.includes('not publicly') ? 'Name pending verification' : cecm.fullName}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: OFFICIAL MINI CARD
// ════════════════════════════════════════════════════════════════
function OfficialMiniCard({ rep, onCompare, isCompared }: {
  rep: Representative; onCompare: () => void; isCompared?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-white rounded border text-xs">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-green-600 shrink-0" />
          <span className="font-medium">{rep.fullName}</span>
        </div>
        <div className="flex items-center gap-2 ml-4 mt-0.5 text-muted-foreground">
          <span>{rep.officialTitle}</span>
          {rep.politicalParty && <span>· {rep.politicalParty}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isCompared && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-1.5" onClick={onCompare}>
              <GitCompare className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Add to comparison</p></TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: COUNTY EXPLORER (FULL DETAIL)
// ════════════════════════════════════════════════════════════════
function CountyExplorer({ countyCode, allCounties, onSelectCounty, addToComparison, comparisonList }: {
  countyCode: string; allCounties: County[]; onSelectCounty: (code: string) => void;
  addToComparison: (rep: Representative, countyName: string) => void; comparisonList: ComparisonItem[];
}) {
  const county = allCounties.find(c => c.code === countyCode) || allCounties[0];

  return (
    <div className="space-y-6">
      {/* County Selector */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-green-600" />
            <Select value={county.code} onValueChange={onSelectCounty}>
              <SelectTrigger className="h-9 text-sm flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {allCounties.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.name} ({c.region})
                    {c.dataAvailability === 'full' ? ' ★' : c.dataAvailability === 'partial' ? ' ◐' : ' ○'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* County Header */}
      <Card className="border-l-4 border-l-green-600">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-xl">{county.name} County</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Code: {county.code} · Region: {county.region} · Capital: {county.capital}
              </p>
            </div>
            <div className="flex gap-2">
              {county.executiveAuditOpinion && (
                <Badge className={`border ${getAuditColor(county.executiveAuditOpinion)}`}>
                  Audit: {county.executiveAuditOpinion}
                </Badge>
              )}
              <Badge variant="outline" className={county.dataAvailability === 'full' ? 'text-green-700 border-green-300' : county.dataAvailability === 'partial' ? 'text-yellow-700 border-yellow-300' : 'text-gray-500'}>
                {county.dataAvailability === 'full' ? 'Fully Populated' : county.dataAvailability === 'partial' ? 'Partially Populated' : 'Placeholder'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {[
              { label: 'Population', value: county.population.toLocaleString(), icon: <Users className="h-4 w-4" /> },
              { label: 'Area (km²)', value: county.areaSqKm.toLocaleString(), icon: <MapPin className="h-4 w-4" /> },
              { label: 'Constituencies', value: county.constituenciesCount.toString(), icon: <Building2 className="h-4 w-4" /> },
              { label: 'Wards', value: county.wardsCount.toString(), icon: <Landmark className="h-4 w-4" /> },
              { label: 'Term', value: '2022–2027', icon: <FileText className="h-4 w-4" /> },
            ].map((s) => (
              <div key={s.label} className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">{s.icon}<span className="text-xs">{s.label}</span></div>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Data Availability Notice */}
          {county.dataAvailabilityNote && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${county.dataAvailability === 'full' ? 'bg-green-50 text-green-800' : county.dataAvailability === 'partial' ? 'bg-yellow-50 text-yellow-800' : 'bg-orange-50 text-orange-800'}`}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Data Availability: {county.dataAvailability.toUpperCase()}</strong>
                <p className="mt-1">{county.dataAvailabilityNote}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Details */}
      {county.dataAvailability !== 'placeholder' ? (
        <div className="space-y-6">
          {/* Governor Scorecard */}
          {county.governor && (
            <OfficialFullCard rep={county.governor} countyName={county.name} onCompare={addToComparison} />
          )}

          {/* Deputy Governor */}
          {county.deputyGovernor && (
            <OfficialFullCard rep={county.deputyGovernor} countyName={county.name} onCompare={addToComparison} />
          )}

          {/* Senator */}
          {county.senator && (
            <OfficialFullCard rep={county.senator} countyName={county.name} onCompare={addToComparison} />
          )}

          {/* Woman Rep */}
          {county.womanRep && (
            <OfficialFullCard rep={county.womanRep} countyName={county.name} onCompare={addToComparison} />
          )}

          {/* County Assembly Speaker */}
          {county.countyAssembly?.speaker && (
            <OfficialFullCard rep={county.countyAssembly.speaker} countyName={county.name} onCompare={addToComparison} />
          )}

          {/* Assembly Audit */}
          {county.countyAssembly?.auditOpinion && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  County Assembly Audit Opinion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`border ${getAuditColor(county.countyAssembly.auditOpinion)}`}>
                  {county.countyAssembly.auditOpinion}
                </Badge>
                {county.countyAssembly.auditSource && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Source: {county.countyAssembly.auditSource.source} — {county.countyAssembly.auditSource.reportTitle} ({county.countyAssembly.auditSource.financialYear})
                    {county.countyAssembly.auditSource.url && (
                      <a href={county.countyAssembly.auditSource.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-green-600 hover:underline flex items-center gap-0.5 inline-flex">
                        <ExternalLink className="h-3 w-3" /> View Report
                      </a>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Constituencies & MCAs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-600" />
                Constituencies, MPs & Wards ({county.constituenciesCount} Constituencies · {county.wardsCount} Wards)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {county.constituencies.length > 0 ? (
                <Accordion type="multiple" className="space-y-2">
                  {county.constituencies.map((con) => (
                    <AccordionItem key={con.id} value={con.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex items-center gap-2 text-sm">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{con.name} Constituency</span>
                          {con.mp && <Badge variant="secondary" className="text-xs">{con.mp.fullName} ({con.mp.politicalParty})</Badge>}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        {con.mp && (
                          <div className="mb-3 p-2 bg-green-50 rounded border">
                            <p className="text-xs font-medium text-green-800">MP: {con.mp.fullName}</p>
                            <p className="text-xs text-muted-foreground">Party: {con.mp.politicalParty} {con.mp.coalition ? `(${con.mp.coalition})` : ''} · Term: {con.mp.termStart} to {con.mp.termEnd}</p>
                            <Button variant="ghost" size="sm" className="h-6 text-xs mt-1" onClick={() => addToComparison(con.mp, county.name)}>
                              <GitCompare className="h-3 w-3 mr-1" /> Compare
                            </Button>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {con.wards.map((ward) => (
                            <div key={ward.id} className="p-2 bg-gray-50 rounded border text-xs">
                              <p className="font-medium">{ward.name} Ward</p>
                              {ward.mca ? (
                                <p className="text-muted-foreground mt-0.5">MCA: {ward.mca.fullName} ({ward.mca.politicalParty})</p>
                              ) : (
                                <p className="text-muted-foreground mt-0.5 italic">MCA data not verified — requires IEBC / County Assembly records</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="p-4 bg-orange-50 rounded-lg text-xs">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Constituency and ward-level data has not been loaded for this county.
                  To expand: pull data from <a href="https://www.iebc.or.ke/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">IEBC</a>,
                  the <a href={`https://${county.name.toLowerCase().replace(/\s/g, '')}.go.ke/`} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">county portal</a>,
                  and the <a href={`https://${county.name.toLowerCase().replace(/\s/g, '')}assembly.go.ke/`} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">county assembly</a>.
                </div>
              )}
            </CardContent>
          </Card>

          {/* County Executive Committee */}
          {county.countyExecutive && county.countyExecutive.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  County Executive Committee (CECMs)
                </CardTitle>
                <CardDescription>Appointed by the Governor, per Article 179 of the Constitution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {county.countyExecutive.map((cecm) => (
                    <div key={cecm.id} className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-semibold text-green-800">{cecm.portfolio}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cecm.fullName.includes('not publicly') ? (
                          <span className="italic"><AlertTriangle className="h-3 w-3 inline mr-1" />Name not verified — requires county gazette notice</span>
                        ) : cecm.fullName}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Placeholder State */
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-orange-800">Placeholder Data</h3>
            <p className="text-sm text-orange-700 mt-2 max-w-lg mx-auto">
              This county has not been fully populated yet. To expand this county with complete data, pull the latest information from:
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {[
                { label: 'OAG Audit Reports', url: 'https://oagkenya.go.ke/reports/county-government-audit-reports/' },
                { label: 'CoB Budget Reports', url: 'https://cob.go.ke/county-budget-implementation-review-reports/' },
                { label: 'TI-Kenya Governance', url: 'https://tikenya.org/' },
                { label: 'IEBC Records', url: 'https://www.iebc.or.ke/' },
                { label: 'County Portal', url: `https://${county.name.toLowerCase().replace(/\s/g, '')}.go.ke/` },
              ].map((src) => (
                <a key={src.label} href={src.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-white rounded border border-orange-200 text-orange-800 hover:bg-orange-100 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> {src.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: OFFICIAL FULL CARD WITH SCORECARD
// ════════════════════════════════════════════════════════════════
function OfficialFullCard({ rep, countyName, onCompare }: {
  rep: Representative; countyName: string; onCompare: (rep: Representative, countyName: string) => void;
}) {
  const metricLabels: Record<keyof ScorecardMetrics, string> = {
    overallAccountabilityScore: 'Overall Accountability',
    transparencyAssetDeclaration: 'Transparency & Asset Declaration',
    projectDeliveryAbsorptionRate: 'Project/CIDP Delivery & Absorption',
    manifestoPromiseFulfillment: 'Manifesto Promise Fulfillment',
    legislativeOversightPerformance: 'Legislative/Oversight Performance',
    ethicsIntegrity: 'Ethics & Integrity',
    publicSentimentCitizenAwareness: 'Public Sentiment & Citizen Awareness',
  };

  return (
    <Card className="border-l-4 border-l-green-600">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              {rep.fullName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {rep.officialTitle} · {rep.politicalParty} {rep.coalition ? `(${rep.coalition})` : ''} · {rep.jurisdiction}
            </p>
            <p className="text-xs text-muted-foreground">Term: {rep.termStart} to {rep.termEnd}</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onCompare(rep, countyName)}>
            <GitCompare className="h-3 w-3" /> Compare
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Biography */}
        {rep.biography && <p className="text-sm leading-relaxed">{rep.biography}</p>}

        {/* Contacts */}
        {rep.contacts && Object.values(rep.contacts).some(Boolean) && (
          <div className="flex flex-wrap gap-3 text-xs">
            {rep.contacts.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-green-600" /> {rep.contacts.email}</span>}
            {rep.contacts.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-green-600" /> {rep.contacts.phone}</span>}
            {rep.contacts.xHandle && <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-green-600" /> @{rep.contacts.xHandle}</span>}
            {rep.contacts.website && (
              <a href={rep.contacts.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                <ExternalLink className="h-3 w-3" /> Website
              </a>
            )}
          </div>
        )}

        {/* Scorecard */}
        {rep.scorecard && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-green-600" />
              Comprehensive Scorecard (0–100)
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {(Object.entries(metricLabels) as [keyof ScorecardMetrics, string][]).map(([key, label]) => {
                const value = rep.scorecard!.metrics[key];
                const source = rep.scorecard!.sources[key];
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div className={`p-2.5 rounded-lg border text-center ${getScoreColor(value)}`}>
                        <p className="text-xs opacity-75">{label}</p>
                        <p className="text-xl font-bold mt-0.5">{getScoreLabel(value)}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-xs">{label}: {getScoreLabel(value)}/100</p>
                      {source && (
                        <p className="text-xs mt-1">
                          Source: {source.source} — {source.reportTitle}<br />
                          FY: {source.financialYear} {source.section ? `(${source.section})` : ''}<br />
                          Accessed: {source.accessedDate}
                          {source.url && <><br /><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-green-500 underline">View source</a></>}
                        </p>
                      )}
                      {!source && <p className="text-xs mt-1 text-muted-foreground">No specific source cited for this metric.</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            {rep.scorecard.dataGapsNote && (
              <div className="mt-3 p-2.5 bg-yellow-50 rounded-lg text-xs flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-yellow-600" />
                <p className="text-yellow-800">{rep.scorecard.dataGapsNote}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Scorecard last updated: {rep.scorecard.lastUpdated}
            </p>
          </div>
        )}

        {/* Promise vs Delivery */}
        {rep.promiseVsDelivery && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Promise vs Delivery</h5>
            <p className="text-xs leading-relaxed">{rep.promiseVsDelivery}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: COMPARISON VIEW
// ════════════════════════════════════════════════════════════════
function ComparisonView({ comparisonList, removeFromComparison, addToComparison, allCounties }: {
  comparisonList: ComparisonItem[];
  removeFromComparison: (id: string) => void;
  addToComparison: (rep: Representative, countyName: string) => void;
  allCounties: County[];
}) {
  const metricLabels: Record<keyof ScorecardMetrics, string> = {
    overallAccountabilityScore: 'Overall Accountability',
    transparencyAssetDeclaration: 'Transparency & Asset Declaration',
    projectDeliveryAbsorptionRate: 'Project/CIDP Delivery',
    manifestoPromiseFulfillment: 'Manifesto Fulfillment',
    legislativeOversightPerformance: 'Legislative/Oversight',
    ethicsIntegrity: 'Ethics & Integrity',
    publicSentimentCitizenAwareness: 'Public Sentiment',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-green-600" />
            Side-by-Side Comparison (Max 4 Officials)
          </CardTitle>
          <CardDescription>
            Add officials from the Tree or County Explorer tabs to compare their scorecards side-by-side.
            {comparisonList.length === 0 && ' Select officials from the Governors Tree or County Explorer tabs.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold sticky left-0 bg-white min-w-[180px]">Metric</th>
                    {comparisonList.map((item) => (
                      <th key={item.representative.id} className="text-left py-2 px-3 font-semibold min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">{item.representative.fullName}</p>
                            <p className="text-xs text-muted-foreground font-normal">{item.representative.officialTitle} · {item.countyName}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeFromComparison(item.representative.id)}>
                            <XCircle className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-gray-50">
                    <td className="py-2 px-3 font-medium">Political Party</td>
                    {comparisonList.map((item) => (
                      <td key={item.representative.id} className="py-2 px-3">
                        <Badge variant="secondary">{item.representative.politicalParty}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="py-2 px-3 font-medium">Coalition</td>
                    {comparisonList.map((item) => (
                      <td key={item.representative.id} className="py-2 px-3">{item.representative.coalition || '—'}</td>
                    ))}
                  </tr>
                  {(Object.entries(metricLabels) as [keyof ScorecardMetrics, string][]).map(([key, label]) => (
                    <tr key={key} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{label}</td>
                      {comparisonList.map((item) => {
                        const val = item.representative.scorecard?.metrics[key];
                        return (
                          <td key={item.representative.id} className="py-2 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded border text-xs font-bold ${getScoreColor(val)}`}>
                              {getScoreLabel(val)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="py-2 px-3 font-medium">Data Gaps</td>
                    {comparisonList.map((item) => (
                      <td key={item.representative.id} className="py-2 px-3 text-muted-foreground max-w-[200px] truncate">
                        {item.representative.scorecard?.dataGapsNote ? 'See full card' : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No officials selected for comparison yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Visit the Governors Tree or County Explorer to add officials.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENT: JSON SCHEMA VIEW
// ════════════════════════════════════════════════════════════════
function JsonSchemaView() {
  const jsonSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Kenya County Governance Data Schema",
    "description": "Reusable data schema for the Kenya County Governance Explorer, 2022-2027 term. All scorecard fields map to verifiable public sources.",
    "version": "1.0.0",
    "lastUpdated": "2026-07-25",
    "types": {
      "SourceCitation": {
        "type": "object",
        "properties": {
          "source": { "type": "string", "description": "e.g. Office of the Auditor-General" },
          "reportTitle": { "type": "string" },
          "financialYear": { "type": "string", "pattern": "^FY \\d{4}/\\d{2}$" },
          "url": { "type": "string", "format": "uri" },
          "section": { "type": "string" },
          "accessedDate": { "type": "string", "format": "date" }
        },
        "required": ["source", "reportTitle", "financialYear", "accessedDate"]
      },
      "ScorecardMetrics": {
        "type": "object",
        "properties": {
          "overallAccountabilityScore": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
          "transparencyAssetDeclaration": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
          "projectDeliveryAbsorptionRate": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
          "manifestoPromiseFulfillment": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
          "legislativeOversightPerformance": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
          "ethicsIntegrity": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
          "publicSentimentCitizenAwareness": { "type": ["number", "null"], "minimum": 0, "maximum": 100 }
        }
      },
      "Scorecard": {
        "type": "object",
        "properties": {
          "metrics": { "$ref": "#/types/ScorecardMetrics" },
          "sources": {
            "type": "object",
            "additionalProperties": { "$ref": "#/types/SourceCitation" },
            "description": "Per-metric source citations"
          },
          "lastUpdated": { "type": "string", "format": "date" },
          "dataGapsNote": { "type": "string" }
        }
      },
      "Representative": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "fullName": { "type": "string" },
          "officialTitle": { "type": "string" },
          "politicalParty": { "type": "string" },
          "coalition": { "type": "string", "enum": ["Kenya Kwanza Alliance", "Azimio la Umoja One Kenya Coalition", "Independent"] },
          "termStart": { "type": "string", "format": "date" },
          "termEnd": { "type": "string", "format": "date" },
          "jurisdiction": { "type": "string" },
          "level": { "type": "string", "enum": ["national", "county", "constituency", "ward"] },
          "biography": { "type": "string" },
          "contacts": {
            "type": "object",
            "properties": { "email": { "type": "string" }, "phone": { "type": "string" }, "xHandle": { "type": "string" }, "website": { "type": "string", "format": "uri" } }
          },
          "scorecard": { "$ref": "#/types/Scorecard" },
          "promiseVsDelivery": { "type": "string" }
        },
        "required": ["id", "fullName", "officialTitle", "politicalParty", "termStart", "termEnd", "jurisdiction", "level"]
      },
      "County": {
        "type": "object",
        "properties": {
          "code": { "type": "string", "pattern": "^\\d{3}$" },
          "name": { "type": "string" },
          "region": { "type": "string", "enum": ["Coast", "North Eastern", "Eastern", "Central", "Rift Valley", "Western", "Nyanza", "Nairobi"] },
          "governor": { "$ref": "#/types/Representative" },
          "deputyGovernor": { "$ref": "#/types/Representative" },
          "senator": { "$ref": "#/types/Representative" },
          "womanRep": { "$ref": "#/types/Representative" },
          "constituencies": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" },
                "mp": { "$ref": "#/types/Representative" },
                "wards": {
                  "type": "array",
                  "items": { "$ref": "#/types/Ward" }
                }
              }
            }
          },
          "countyAssembly": {
            "type": "object",
            "properties": {
              "speaker": { "$ref": "#/types/Representative" },
              "auditOpinion": { "type": "string", "enum": ["Unmodified", "Qualified", "Adverse", "Disclaimer"] },
              "auditSource": { "$ref": "#/types/SourceCitation" }
            }
          },
          "countyExecutive": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "fullName": { "type": "string" },
                "portfolio": { "type": "string" },
                "scorecard": { "$ref": "#/types/Scorecard" }
              }
            }
          },
          "executiveAuditOpinion": { "type": "string", "enum": ["Unmodified", "Qualified", "Adverse", "Disclaimer"] },
          "executiveAuditSource": { "$ref": "#/types/SourceCitation" },
          "developmentAbsorptionRate": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
          "dataAvailability": { "type": "string", "enum": ["full", "partial", "placeholder"] },
          "dataAvailabilityNote": { "type": "string" }
        }
      }
    },
    "liveFeedEndpoints": {
      "oagReports": "https://oagkenya.go.ke/reports/county-government-audit-reports/",
      "cobReports": "https://cob.go.ke/county-budget-implementation-review-reports/",
      "tiKenya": "https://tikenya.org/",
      "eaccReports": "https://eacc.go.ke/",
      "iebcRecords": "https://www.iebc.or.ke/"
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Reusable JSON Data Schema
          </CardTitle>
          <CardDescription>
            Clean, reusable schema for the Kenya County Governance Explorer. Includes fields for source citations,
            audit opinions, and live feed integration points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
            <pre className="text-xs text-green-400 leading-relaxed whitespace-pre-wrap break-words">
              {JSON.stringify(jsonSchema, null, 2)}
            </pre>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(jsonSchema, null, 2));
            }}>
              Copy JSON Schema
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="data:application/json;charset=utf-8," download="kenya-governance-schema.json"
                onClick={(e) => { (e.currentTarget as HTMLAnchorElement).href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonSchema, null, 2))}`; }}>
                Download Schema
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions for expanding counties */}
      <Card className="border-l-4 border-l-green-600">
        <CardHeader>
          <CardTitle className="text-base">Instructions for Expanding Any County</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-green-600" /> Step 1: Pull Election Data</h4>
              <p className="text-muted-foreground mt-1">
                Obtain the complete list of elected officials (Governor, Deputy, Senator, Woman Rep, MPs, MCAs) from
                the <a href="https://www.iebc.or.ke/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">Independent Electoral and Boundaries Commission (IEBC)</a> official records.
                Verify names against the official gazette notices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2"><Scale className="h-4 w-4 text-green-600" /> Step 2: Pull Audit Data</h4>
              <p className="text-muted-foreground mt-1">
                Download the county-specific audit reports from the
                <a href="https://oagkenya.go.ke/reports/county-government-audit-reports/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline"> Office of the Auditor-General</a>.
                Extract the audit opinion (Unmodified/Qualified/Adverse/Disclaimer) for both the County Executive and County Assembly.
                Note the specific financial year and page number.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-green-600" /> Step 3: Pull Budget Data</h4>
              <p className="text-muted-foreground mt-1">
                Download the County Budget Implementation Review Reports from the
                <a href="https://cob.go.ke/county-budget-implementation-review-reports/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline"> Controller of Budget</a>.
                Extract the development budget absorption rate, recurrent absorption rate, and any pending bills data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-green-600" /> Step 4: Pull Governance Indices</h4>
              <p className="text-muted-foreground mt-1">
                Check <a href="https://tikenya.org/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">Transparency International Kenya</a> for
                the County Governance Status Report, budget transparency surveys, and county integrity indices.
                Also check <a href="https://eacc.go.ke/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">EACC</a> for any public reports or court records.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2"><Landmark className="h-4 w-4 text-green-600" /> Step 5: Populate Scorecard</h4>
              <p className="text-muted-foreground mt-1">
                For each scorecard metric (0–100), cite the exact source, financial year, and section where the data was found.
                If data is unavailable, set the value to null and include a dataGapsNote explaining the gap.
                Never invent, estimate, or approximate numbers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-green-600" /> Step 6: Verify Contacts</h4>
              <p className="text-muted-foreground mt-1">
                Only include publicly available contact information (email, phone, X handle, website) from official county websites
                or verified public social media accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
