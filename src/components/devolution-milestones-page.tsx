'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Flag,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Scale,
  Users,
  Building2,
  Landmark,
  AlertTriangle,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

type MilestoneType = 'constitutional' | 'legislative' | 'fiscal' | 'political' | 'crisis';

type ImpactLevel = 'high' | 'medium' | 'low';

interface Milestone {
  id: string;
  date: string;
  year: number;
  title: string;
  description: string;
  details: string;
  type: MilestoneType;
  impact: ImpactLevel;
  icon: React.ReactNode;
}

// ── Configuration ──────────────────────────────────────────────────

const TYPE_CONFIG: Record<MilestoneType, { label: string; color: string; bg: string; border: string; dot: string }> = {
  constitutional: { label: 'Constitutional', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300', dot: 'bg-purple-500' },
  legislative: { label: 'Legislative', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300', dot: 'bg-blue-500' },
  fiscal: { label: 'Fiscal', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500' },
  political: { label: 'Political', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  crisis: { label: 'Crisis', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500' },
};

const IMPACT_CONFIG: Record<ImpactLevel, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  high: { label: 'High Impact', variant: 'default', className: 'bg-stone-900 text-white hover:bg-stone-800' },
  medium: { label: 'Medium Impact', variant: 'secondary', className: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
  low: { label: 'Low Impact', variant: 'outline', className: 'border-stone-300 text-stone-600' },
};

// ── Milestone Data ─────────────────────────────────────────────────

const MILESTONES: Milestone[] = [
  {
    id: 'ms-2010-01',
    date: 'Aug 27, 2010',
    year: 2010,
    title: 'Constitution of Kenya Promulgated',
    description: 'The new Constitution was promulgated at Uhuru Park, establishing devolved governance with 47 county governments under Chapter 11.',
    details: 'The 2010 Constitution introduced a transformative devolution framework, creating two levels of government — national and county. It established the Senate, allocated at least 15% of national revenue to counties (later increased), and created independent commissions including the Commission on Revenue Allocation (CRA) and the Office of the Auditor-General (OAG). This was Kenya\'s most significant governance reform since independence.',
    type: 'constitutional',
    impact: 'high',
    icon: <Flag className="h-4 w-4" />,
  },
  {
    id: 'ms-2013-01',
    date: 'Mar 4, 2013',
    year: 2013,
    title: 'First Devolved County Elections',
    description: 'Kenya held its first devolved elections — 47 governors, senators, women reps, and MCAs elected under the 2010 Constitution.',
    details: 'The first devolved elections saw Kenyans vote for governors, senators, county women representatives, and Members of County Assemblies (MCAs) for the first time. IEBC oversaw the most complex election in Kenya\'s history, with 6 elective positions per county. Turnout was high at 86%. This election marked the official birth of devolution in Kenya.',
    type: 'political',
    impact: 'high',
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: 'ms-2013-02',
    date: 'Mar 27, 2013',
    year: 2013,
    title: 'First County Governors Sworn In',
    description: 'All 47 county governors were sworn in, officially inaugurating Kenya\'s devolved system of governance.',
    details: 'The Transition Authority oversaw the handover of functions from national ministries to county governments. Each governor appointed a County Executive Committee (CEC) of up to 10 members. County assemblies held their first sittings and elected speakers. KSh 190 billion was allocated to counties in FY 2013/14 — the first equitable share disbursement.',
    type: 'political',
    impact: 'high',
    icon: <Landmark className="h-4 w-4" />,
  },
  {
    id: 'ms-2013-03',
    date: '2013–2017',
    year: 2013,
    title: 'First County Government Term',
    description: 'The inaugural 5-year term of county governments, marked by teething challenges, capacity gaps, and early accountability concerns.',
    details: 'During the first term, counties struggled with capacity to absorb and spend allocated funds. The first OAG audit reports (FY 2013/14) revealed significant accountability gaps. Many counties failed to establish proper procurement systems, financial management controls, and performance monitoring. However, the period also saw the publication of first CIDPs, establishment of county public service boards, and initial infrastructure investments in health, roads, and markets.',
    type: 'political',
    impact: 'high',
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: 'ms-2017-01',
    date: 'Aug–Oct 2017',
    year: 2017,
    title: 'Second General Elections & County Transitions',
    description: 'Presidential election annulled by Supreme Court (African first), fresh election held, and second-term county governments elected.',
    details: 'The August 2017 presidential election was nullified by the Supreme Court on September 1, 2017 — the first time in African history. A fresh presidential election was held on October 26, 2017, which the opposition boycotted. At the county level, 23 governors were re-elected and 24 new governors took office. The election period saw significant political tensions that affected county operations for several months.',
    type: 'political',
    impact: 'high',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 'ms-2018-01',
    date: '2018',
    year: 2018,
    title: 'Oparanya Commission on Devolution',
    description: 'The Task Force on Devolved Governance (Oparanya Commission) reviewed devolution implementation and made recommendations for reform.',
    details: 'Chaired by Kakamega Governor Wycliffe Oparanya, the task force assessed the implementation of devolution during the first 5-year term. Key recommendations included: increasing the minimum revenue allocation to counties from 15% to 35%, strengthening county public finance management, resolving intergovernmental disputes, and enhancing capacity of county assemblies. The commission\'s report informed subsequent policy and legislative reforms.',
    type: 'legislative',
    impact: 'medium',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: 'ms-2020-01',
    date: '2020',
    year: 2020,
    title: 'Building Bridges Initiative (BBI) Launched',
    description: 'President Kenyatta and Raila Odinga\'s BBI proposed constitutional amendments including changes to devolution structure.',
    details: 'The BBI proposed expanding the executive (adding a Prime Minister), creating 70 new constituencies, and altering the revenue-sharing formula. For devolution, it proposed establishing a Ward Development Fund (5% of county revenue) and a National Government Conciliation Committee. The initiative was controversial — proponents argued it would address governance gaps, while critics saw it as a power-sharing deal. The process collected over 1 million signatures.',
    type: 'constitutional',
    impact: 'high',
    icon: <Scale className="h-4 w-4" />,
  },
  {
    id: 'ms-2021-01',
    date: '2021',
    year: 2021,
    title: 'BBI Referendum Rejected by Courts',
    description: 'The High Court and subsequently the Court of Appeal rejected the BBI constitutional amendment process as unconstitutional.',
    details: 'In May 2021, the High Court declared the BBI process unconstitutional, ruling that the President cannot initiate constitutional amendments through a popular initiative. The Court of Appeal upheld this decision in August 2021. The Supreme Court declined to hear the appeal in October 2021. The BBI\'s failure meant that the proposed changes to devolution — including the Ward Development Fund — did not materialize, preserving the original devolution framework.',
    type: 'crisis',
    impact: 'high',
    icon: <XCircle className="h-4 w-4" />,
  },
  {
    id: 'ms-2022-01',
    date: 'Aug 9, 2022',
    year: 2022,
    title: 'Third General Elections — New Governors',
    description: 'William Ruto elected President. New generation of 47 county governors elected for the 2022–2027 term.',
    details: 'Kenya held its third general election under the 2010 Constitution. William Ruto won the presidency against Raila Odinga. At the county level, the coalition distribution was: 26 Kenya Kwanza governors, 18 Azimio governors, and 3 Independent governors. Notably, only 8 incumbent governors secured re-election, indicating strong voter demand for change. New county assemblies were also elected with 1,450 MCAs across all 47 counties.',
    type: 'political',
    impact: 'high',
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: 'ms-2022-02',
    date: 'Dec 2022',
    year: 2022,
    title: 'New County Assemblies Sworn In',
    description: 'Third-generation county assemblies and executive committees took office, beginning the 2022–2027 county governance cycle.',
    details: 'All 47 county assemblies were sworn in by December 2022. Each assembly elected a Speaker and deputy speaker, and established committees for oversight, legislation, and budget approval. New County Executive Committees were appointed, with each governor nominating CEC members for assembly approval. The assemblies began reviewing and approving the third-generation County Integrated Development Plans (CIDPs) for the 2023–2027 period.',
    type: 'legislative',
    impact: 'medium',
    icon: <Landmark className="h-4 w-4" />,
  },
  {
    id: 'ms-2023-01',
    date: '2023',
    year: 2023,
    title: 'Controller of Budget FY 2022/23 Reports',
    description: 'CoB reports revealed mixed county budget absorption rates — development spending remained low in many counties.',
    details: 'The Controller of Budget\'s FY 2022/23 county budget implementation reports showed that while recurrent expenditure absorption averaged 92%, development budget absorption remained low at approximately 54% across counties. Only 12 counties exceeded 70% development budget absorption. The reports also flagged growing pending bills (accumulated to over KSh 120 billion nationally), revenue collection shortfalls, and delayed procurement processes. Several counties were flagged for unauthorized spending.',
    type: 'fiscal',
    impact: 'high',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    id: 'ms-2023-02',
    date: 'Sep 2023',
    year: 2023,
    title: 'OAG FY 2022/23: 6 Counties Receive Adverse Opinions',
    description: 'The worst adverse opinion count in a single year — only 3 of 47 counties received clean (unmodified) audit opinions.',
    details: 'The Office of the Auditor-General released FY 2022/23 audit opinions showing: 3 Unmodified (clean), 38 Qualified, 6 Adverse, and 0 Disclaimer of opinion. The 6 adverse opinions were the highest ever recorded. Common issues included: unsupported expenditures, failure to maintain proper books of accounts, non-compliance with procurement laws, unreconciled bank accounts, and failure to submit financial statements on time. This report intensified calls for stronger county financial management.',
    type: 'fiscal',
    impact: 'high',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: 'ms-2024-01',
    date: '2024',
    year: 2024,
    title: 'OAG Audit Opinions FY 2023/24 Released',
    description: 'Zero counties received unmodified opinions — all 47 received qualified or adverse opinions, a historic low.',
    details: 'The FY 2023/24 audit cycle produced the most concerning results yet: 0 Unmodified, 44 Qualified, 3 Adverse, and 0 Disclaimer. The absence of any clean audit opinion across all 47 counties represented a significant regression. The OAG attributed this to persistent weaknesses in internal controls, non-compliance with the Public Finance Management Act, and failure by county management to address previously identified audit queries. The report led to parliamentary scrutiny and calls for county leadership accountability.',
    type: 'fiscal',
    impact: 'high',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: 'ms-2025-01',
    date: '2025',
    year: 2025,
    title: 'Half-Way Mark: 2022–2027 Term',
    description: 'Counties reached the midpoint of the current governance cycle, with mid-term performance reviews showing mixed results.',
    details: 'At the half-way point of the 2022–2027 county governance term, mid-term reviews revealed: significant progress in health facility upgrades and county road construction in some counties, but persistent challenges in financial management, pending bills accumulation, and staff capacity. The Council of Governors pushed for increased equitable share allocation. County assemblies had passed an average of 45 pieces of legislation each. Public participation forums continued but citizen satisfaction with county services remained mixed.',
    type: 'political',
    impact: 'medium',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'ms-2025-02',
    date: '2025',
    year: 2025,
    title: 'OAG FY 2024/25: Only 1 Unmodified Opinion',
    description: 'A slight improvement with 1 county achieving a clean audit, but 44 still received qualified opinions and 2 adverse.',
    details: 'The FY 2024/25 OAG audit opinions showed marginal improvement: 1 Unmodified, 44 Qualified, 2 Adverse, and 0 Disclaimer. While the return of one clean opinion was noted positively, the overall picture remained concerning — 98% of counties still failed to achieve a clean bill of financial health. The Controller of Budget concurrently reported that 20 counties had spent zero on development in Q1 of FY 2025/26, raising questions about prioritization and project delivery capacity as the term approaches its final two years.',
    type: 'fiscal',
    impact: 'high',
    icon: <Star className="h-4 w-4" />,
  },
  {
    id: 'ms-2026-01',
    date: '2026',
    year: 2026,
    title: 'Current Year: Midterm Performance Reviews',
    description: 'The final full year before the 2027 elections — intensive performance reviews, budget preparations, and political positioning underway.',
    details: 'In 2026, counties entered the final full year of the 2022–2027 term. Key focus areas include: preparation of FY 2026/27 budgets (the last full-year budget), completion of ongoing development projects, addressing audit queries from previous years, and managing pending bills. Political activity is expected to intensify as aspirants begin positioning for the 2027 elections. The CRA is developing the next revenue sharing formula. The Senate continues its oversight role through county-specific accountability sessions.',
    type: 'political',
    impact: 'medium',
    icon: <ArrowRight className="h-4 w-4" />,
  },
];

// ── Chart Data ─────────────────────────────────────────────────────

const AUDIT_TREND_DATA = [
  { name: 'FY 2022/23', unmodified: 3, qualified: 38, adverse: 6, disclaimer: 0 },
  { name: 'FY 2023/24', unmodified: 0, qualified: 44, adverse: 3, disclaimer: 0 },
  { name: 'FY 2024/25', unmodified: 1, qualified: 44, adverse: 2, disclaimer: 0 },
];

const FUNDING_TREND_DATA = [
  { name: '2013/14', amount: 190 },
  { name: '2014/15', amount: 226 },
  { name: '2015/16', amount: 258 },
  { name: '2016/17', amount: 280 },
  { name: '2017/18', amount: 302 },
  { name: '2018/19', amount: 316 },
  { name: '2019/20', amount: 327 },
  { name: '2020/21', amount: 336 },
  { name: '2021/22', amount: 370 },
  { name: '2022/23', amount: 385 },
  { name: '2023/24', amount: 400 },
  { name: '2024/25', amount: 387 },
];

// ── Component ──────────────────────────────────────────────────────

export default function DevolutionMilestonesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<MilestoneType | 'all'>('all');

  const filteredMilestones = useMemo(() => {
    if (typeFilter === 'all') return MILESTONES;
    return MILESTONES.filter((m) => m.type === typeFilter);
  }, [typeFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MILESTONES.length };
    for (const m of MILESTONES) {
      counts[m.type] = (counts[m.type] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <Landmark className="h-6 w-6 text-emerald-600" />
            Devolution Milestones Tracker
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Tracking Kenya&apos;s devolution journey from the 2010 Constitution to present day
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-xs border-stone-300 text-stone-600">
          <Clock className="h-3 w-3 mr-1" />
          2010 — 2026
        </Badge>
      </div>

      <Separator />

      {/* ── Progress Dashboard ── */}
      <section>
        <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Devolution Progress Dashboard
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <DashboardCard
            icon={<Building2 className="h-4 w-4 text-emerald-600" />}
            label="Counties Operational"
            value="47/47"
            subValue="100%"
            positive
          />
          <DashboardCard
            icon={<Landmark className="h-4 w-4 text-blue-600" />}
            label="County Assemblies"
            value="47/47"
            subValue="100%"
            positive
          />
          <DashboardCard
            icon={<CheckCircle2 className="h-4 w-4 text-amber-600" />}
            label="Unmodified Audits"
            value="1/47"
            subValue="2.1% FY 24/25"
            negative
          />
          <DashboardCard
            icon={<TrendingUp className="h-4 w-4 text-stone-600" />}
            label="Avg Budget Absorption"
            value="54%"
            subValue="Dev expenditure"
            neutral
          />
          <DashboardCard
            icon={<ArrowRight className="h-4 w-4 text-emerald-600" />}
            label="Functions Transferred"
            value="~70%"
            subValue="of scheduled"
            neutral
          />
          <DashboardCard
            icon={<Users className="h-4 w-4 text-blue-600" />}
            label="Public Participation"
            value="~2,400"
            subValue="forums / year"
            neutral
          />
        </div>
      </section>

      <Separator />

      {/* ── Interactive Timeline ── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Devolution Timeline
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              className={`h-7 text-xs ${typeFilter === 'all' ? 'bg-stone-900 hover:bg-stone-800' : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All ({typeCounts.all})
            </Button>
            {(Object.keys(TYPE_CONFIG) as MilestoneType[]).map((type) => (
              <Button
                key={type}
                size="sm"
                variant={typeFilter === type ? 'default' : 'outline'}
                className={`h-7 text-xs ${typeFilter === type ? TYPE_CONFIG[type].color.replace('text-', 'bg-').replace('-700', '-500') + ' text-white' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {TYPE_CONFIG[type].label} ({typeCounts[type] || 0})
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="max-h-[720px] pr-3">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-stone-200" />

            <div className="space-y-1">
              {filteredMilestones.map((milestone) => {
                const isExpanded = expandedId === milestone.id;
                const typeConf = TYPE_CONFIG[milestone.type];
                const impactConf = IMPACT_CONFIG[milestone.impact];

                return (
                  <div key={milestone.id} className="relative pl-10">
                    {/* Dot on the line */}
                    <div
                      className={`absolute left-3 top-3.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${typeConf.dot}`}
                    />

                    {/* Card */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${typeConf.border} ${typeConf.bg} mb-2`}
                      onClick={() => toggleExpand(milestone.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className={`mt-0.5 shrink-0 ${typeConf.color}`}>
                              {milestone.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                                  {milestone.date}
                                </span>
                                <Badge
                                  variant={impactConf.variant}
                                  className={`text-[10px] px-1.5 py-0 h-4 ${impactConf.className}`}
                                >
                                  {impactConf.label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 h-4 border-current ${typeConf.color}`}
                                >
                                  {typeConf.label}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-semibold text-stone-800 leading-snug">
                                {milestone.title}
                              </h4>
                              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 mt-1">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-stone-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-stone-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-stone-200">
                            <p className="text-xs text-stone-600 leading-relaxed">
                              {milestone.details}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </section>

      <Separator />

      {/* ── Charts Section ── */}
      <section>
        <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          Data & Trends
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Audit Trend Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-stone-800">
                3-Year County Audit Opinion Trends
              </CardTitle>
              <CardDescription className="text-xs text-stone-500">
                OAG audit opinions by category (FY 2022/23 – FY 2024/25)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={AUDIT_TREND_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#78716c' }} domain={[0, 50]} />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e7e5e4',
                        backgroundColor: '#fff',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="unmodified"
                      name="Unmodified (Clean)"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#16a34a' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="qualified"
                      name="Qualified"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#d97706' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adverse"
                      name="Adverse"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#dc2626' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="disclaimer"
                      name="Disclaimer"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#9ca3af' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Funding Trend Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-stone-800">
                Equitable Share Disbursement Trend
              </CardTitle>
              <CardDescription className="text-xs text-stone-500">
                County equitable share in KSh Billions (FY 2013/14 – FY 2024/25)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FUNDING_TREND_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: '#78716c', angle: -45, textAnchor: 'end' }}
                      height={55}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#78716c' }}
                      tickFormatter={(v) => `${v}B`}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`KSh ${value}B`, 'Equitable Share']}
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e7e5e4',
                        backgroundColor: '#fff',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    <Bar
                      dataKey="amount"
                      name="Equitable Share (KSh B)"
                      fill="#059669"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ── Key Statistics ── */}
      <section>
        <h3 className="text-lg font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Key Devolution Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            label="Total Devolved Funding Since 2013"
            value="KSh 3.77 Trillion"
            description="Cumulative equitable share disbursements to all 47 county governments from FY 2013/14 to FY 2024/25."
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-blue-600" />}
            label="County Staff"
            value="250,000+"
            description="Estimated total county public service workforce across all 47 counties, including health workers, teachers, and administrators."
          />
          <StatCard
            icon={<Building2 className="h-5 w-5 text-amber-600" />}
            label="County Projects Completed"
            value="15,000+"
            description="Estimated total development projects completed across counties since 2013, including health facilities, roads, markets, and water projects."
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            label="Pending Bills Across Counties"
            value="KSh 120B+"
            description="Estimated cumulative pending bills (unpaid obligations) across all 47 county governments as of FY 2024/25."
          />
          <StatCard
            icon={<Scale className="h-5 w-5 text-purple-600" />}
            label="Court Cases Involving Counties"
            value="3,200+"
            description="Estimated number of active and concluded court cases involving county governments, including procurement disputes and employment matters."
          />
          <Card className="border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="h-5 w-5 text-stone-600" />
                <span className="text-xs font-medium text-stone-500">Elected Representatives</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-stone-50">
                  <div className="text-lg font-bold text-stone-800">47</div>
                  <div className="text-[10px] text-stone-500">Senators</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-stone-50">
                  <div className="text-lg font-bold text-stone-800">47</div>
                  <div className="text-[10px] text-stone-500">Women Reps</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-stone-50">
                  <div className="text-lg font-bold text-stone-800">290</div>
                  <div className="text-[10px] text-stone-500">MPs (NA)</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-stone-50">
                  <div className="text-lg font-bold text-stone-800">1,450</div>
                  <div className="text-[10px] text-stone-500">MCAs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* ── Devolution Journey Summary ── */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-2">
                16 Years of Devolution: A Summary
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Since the promulgation of the 2010 Constitution, Kenya has made significant strides in devolution.
                All 47 counties are operational with elected leadership and functional assemblies. Over KSh 3.77 trillion
                has been disbursed to counties, funding healthcare, infrastructure, agriculture, and local governance.
                However, persistent challenges remain — only 1 of 47 counties achieved a clean audit opinion in FY 2024/25,
                development budget absorption averages just 54%, and pending bills exceed KSh 120 billion.
                As Kenya approaches the 2027 elections, the third generation of county leaders faces the critical task
                of demonstrating tangible results from devolution while strengthening accountability and service delivery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function DashboardCard({
  icon,
  label,
  value,
  subValue,
  positive,
  negative,
  neutral,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  positive?: boolean;
  negative?: boolean;
  neutral?: boolean;
}) {
  const valueColor = positive
    ? 'text-emerald-700'
    : negative
      ? 'text-red-700'
      : 'text-stone-800';

  return (
    <Card className="border-stone-200">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          {icon}
          <span className="text-[10px] font-medium text-stone-500 leading-tight">
            {label}
          </span>
        </div>
        <div className={`text-lg font-bold leading-none ${valueColor}`}>
          {value}
        </div>
        <div className="text-[10px] text-stone-400 mt-1">{subValue}</div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="border-stone-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs font-medium text-stone-500">{label}</span>
        </div>
        <div className="text-xl font-bold text-stone-800 mb-1">{value}</div>
        <p className="text-[11px] text-stone-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
