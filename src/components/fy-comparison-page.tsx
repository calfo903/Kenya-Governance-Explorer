'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, BarChart, Bar, Legend, Cell, AreaChart, Area,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, BarChart3, ArrowUpRight, ArrowDownRight,
  Calendar, AlertTriangle, CheckCircle2, Target, ArrowRight, XCircle,
  ChevronDown, ChevronUp, BookOpen, Scale, Filter,
} from 'lucide-react';
import { countyAuditData, getCountyAuditRecords } from '@/data/county-audit-data';
import { countyBudgetData, getCountyBudget } from '@/data/county-budget-data';
import { all47Governors } from '@/data/governors';

import DownloadLink from '@/components/download-link';
const FINANCIAL_YEARS = ['FY 2022/23', 'FY 2023/24', 'FY 2024/25'];

const OPINION_COLORS: Record<string, string> = {
  Unmodified: '#059669',
  Qualified: '#d97706',
  Adverse: '#dc2626',
  Disclaimer: '#6b7280',
};

const OPINION_SCORES: Record<string, number> = {
  Unmodified: 100,
  Qualified: 50,
  Adverse: 25,
  Disclaimer: 0,
};

// Pre-computed audit opinion counts per FY (from OAG summary reports)
const AUDIT_TRENDS_EXEC = [
  { name: 'FY 2022/23', unmodified: 3, qualified: 38, adverse: 6, disclaimer: 0 },
  { name: 'FY 2023/24', unmodified: 0, qualified: 44, adverse: 3, disclaimer: 0 },
  { name: 'FY 2024/25', unmodified: 1, qualified: 44, adverse: 2, disclaimer: 0 },
];

const AUDIT_TRENDS_ASM = [
  { name: 'FY 2022/23', unmodified: 7, qualified: 36, adverse: 2, disclaimer: 2 },
  { name: 'FY 2023/24', unmodified: 8, qualified: 39, adverse: 0, disclaimer: 0 },
  { name: 'FY 2024/25', unmodified: 9, qualified: 38, adverse: 0, disclaimer: 0 },
];

// Devolution funding trend (equitable share in KSh Billions)
const FUNDING_TREND = [
  { year: '2013/14', amount: 190 },
  { year: '2014/15', amount: 226 },
  { year: '2015/16', amount: 258 },
  { year: '2016/17', amount: 280 },
  { year: '2017/18', amount: 302 },
  { year: '2018/19', amount: 316 },
  { year: '2019/20', amount: 327 },
  { year: '2020/21', amount: 336 },
  { year: '2021/22', amount: 370 },
  { year: '2022/23', amount: 385 },
  { year: '2023/24', amount: 400 },
  { year: '2024/25', amount: 387 },
];

interface CountyFYRow {
  code: string;
  name: string;
  governor: string;
  party: string;
  coalition: string;
  region: string;
  opinions: Record<string, string | null>;
  scores: Record<string, number>;
  devAbsorption: Record<string, number>;
  trend: 'improved' | 'same' | 'declined' | 'unknown';
}

function getOpinionTrendIcon(trend: string) {
  if (trend === 'improved') return <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />;
  if (trend === 'declined') return <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />;
  if (trend === 'same') return <Minus className="h-3.5 w-3.5 text-amber-600" />;
  return <Minus className="h-3.5 w-3.5 text-stone-400" />;
}

function getOpinionBadgeClass(opinion: string | null) {
  if (!opinion) return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600';
  switch (opinion) {
    case 'Unmodified': return 'bg-green-100 text-green-800 border-green-300';
    case 'Qualified': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Adverse': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Disclaimer': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600';
  }
}

export default function FYComparisonPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);
  const [showAssembly, setShowAssembly] = useState(false);

  // Build county-level FY comparison data
  const countyFYData = useMemo(() => {
    return all47Governors.map(g => {
      const records = FINANCIAL_YEARS.map(fy => {
        const auditRecords = countyAuditData.filter(a => a.countyCode === g.code && a.financialYear === fy);
        const execRecord = auditRecords.find(r => r.executiveOpinion);
        const asmRecord = auditRecords.find(r => r.assemblyOpinion);
        const budget = countyBudgetData.find(b => b.countyCode === g.code && b.financialYear === fy);

        return {
          fy,
          execOpinion: showAssembly ? asmRecord?.assemblyOpinion || null : execRecord?.executiveOpinion || null,
          devAbsorption: budget?.devAbsorptionRate || 0,
          ownSource: budget?.ownSourceRevenue || 0,
          totalBudget: budget?.totalBudget || 0,
          pendingBills: budget?.pendingBills || 0,
        };
      });

      const opinions: Record<string, string | null> = {};
      const scores: Record<string, number> = {};
      const devAbsorption: Record<string, number> = {};

      records.forEach(r => {
        opinions[r.fy] = r.execOpinion;
        scores[r.fy] = r.execOpinion ? OPINION_SCORES[r.execOpinion] || 0 : 0;
        devAbsorption[r.fy] = r.devAbsorption;
      });

      // Determine trend (FY 2022/23 → FY 2024/25)
      const firstScore = scores['FY 2022/23'];
      const lastScore = scores['FY 2024/25'];
      let trend: 'improved' | 'same' | 'declined' | 'unknown' = 'unknown';
      if (firstScore > 0 && lastScore > 0) {
        if (lastScore > firstScore) trend = 'improved';
        else if (lastScore < firstScore) trend = 'declined';
        else trend = 'same';
      }

      return {
        code: g.code,
        name: g.county,
        governor: g.name,
        party: g.party,
        coalition: g.coalition,
        region: g.region,
        opinions,
        scores,
        devAbsorption,
        trend,
      } as CountyFYRow;
    });
  }, [showAssembly]);

  const filteredData = useMemo(() => {
    let data = countyFYData;
    if (selectedRegion !== 'all') {
      data = data.filter(d => d.region === selectedRegion);
    }

    switch (sortBy) {
      case 'name':
        data = [...data].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'score_fy2425':
        data = [...data].sort((a, b) => b.scores['FY 2024/25'] - a.scores['FY 2024/25']);
        break;
      case 'score_fy2223':
        data = [...data].sort((a, b) => b.scores['FY 2022/23'] - a.scores['FY 2022/23']);
        break;
      case 'dev_absorption':
        data = [...data].sort((a, b) => b.devAbsorption['FY 2024/25'] - a.devAbsorption['FY 2024/25']);
        break;
      case 'trend':
        const order = { improved: 0, same: 1, declined: 2, unknown: 3 };
        data = [...data].sort((a, b) => order[a.trend] - order[b.trend]);
        break;
    }

    return data;
  }, [countyFYData, selectedRegion, sortBy]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const improved = filteredData.filter(d => d.trend === 'improved').length;
    const declined = filteredData.filter(d => d.trend === 'declined').length;
    const same = filteredData.filter(d => d.trend === 'same').length;
    const unmodified = filteredData.filter(d => d.opinions['FY 2024/25'] === 'Unmodified').length;
    const adverse = filteredData.filter(d => d.opinions['FY 2024/25'] === 'Adverse').length;
    const avgAbsorption = filteredData.length > 0
      ? Math.round(filteredData.reduce((sum, d) => sum + d.devAbsorption['FY 2024/25'], 0) / filteredData.length)
      : 0;
    return { improved, declined, same, unmodified, adverse, avgAbsorption, total: filteredData.length };
  }, [filteredData]);

  // Movers: biggest improvements and declines
  const movers = useMemo(() => {
    const scored = countyFYData
      .filter(d => d.trend !== 'unknown')
      .map(d => ({ ...d, scoreChange: d.scores['FY 2024/25'] - d.scores['FY 2022/23'] }));
    const topImprovers = [...scored].sort((a, b) => b.scoreChange - a.scoreChange).slice(0, 5);
    const topDecliners = [...scored].sort((a, b) => a.scoreChange - b.scoreChange).slice(0, 5);
    return { topImprovers, topDecliners };
  }, [countyFYData]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-stone-900 dark:text-stone-50">Financial Year Comparison</CardTitle>
                <CardDescription className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Compare county audit opinions and budget absorption across 3 financial years. Sources: OAG & CoB.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showAssembly ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setShowAssembly(!showAssembly)}
              >
                {showAssembly ? 'Assembly' : 'Executive'} Views
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {['Coast', 'North Eastern', 'Eastern', 'Central', 'Rift Valley', 'Western', 'Nyanza', 'Nairobi'].map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">County Name</SelectItem>
                <SelectItem value="score_fy2425">FY 2024/25 Score</SelectItem>
                <SelectItem value="score_fy2223">FY 2022/23 Score</SelectItem>
                <SelectItem value="dev_absorption">Dev Absorption</SelectItem>
                <SelectItem value="trend">Trend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {[
              { label: 'Total Counties', value: summaryStats.total, color: 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100', icon: Target },
              { label: 'Improved', value: summaryStats.improved, color: 'bg-green-100 text-green-800', icon: TrendingUp },
              { label: 'Declined', value: summaryStats.declined, color: 'bg-red-100 text-red-800', icon: TrendingDown },
              { label: 'Same', value: summaryStats.same, color: 'bg-amber-100 text-amber-800', icon: Minus },
              { label: 'Unmodified FY25', value: summaryStats.unmodified, color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
              { label: 'Adverse FY25', value: summaryStats.adverse, color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
              { label: 'Avg Dev Absorption', value: `${summaryStats.avgAbsorption}%`, color: 'bg-blue-100 text-blue-800', icon: BarChart3 },
            ].map(item => (
              <div key={item.label} className={`${item.color} rounded-lg p-2.5 text-center`}>
                <item.icon className="h-3.5 w-3.5 mx-auto mb-1 opacity-70" />
                <p className="text-lg font-bold leading-none">{item.value}</p>
                <p className="text-[9px] font-medium mt-0.5 opacity-75">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Audit Opinion Trend — Executive */}
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-600" />
              {showAssembly ? 'Assembly' : 'Executive'} Audit Opinion Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={showAssembly ? AUDIT_TRENDS_ASM : AUDIT_TRENDS_EXEC} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 50]} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="unmodified" name="Unmodified" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                <Bar dataKey="qualified" name="Qualified" stackId="a" fill="#d97706" radius={[0, 0, 0, 0]} />
                <Bar dataKey="adverse" name="Adverse" stackId="a" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disclaimer" name="Disclaimer" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Devolution Funding Trend */}
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Equitable Share Disbursement Trend (KSh Billions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={FUNDING_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="year" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}B`} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number) => [`KSh ${value}B`, 'Equitable Share']}
                />
                <defs>
                  <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="amount" stroke="#059669" fill="url(#colorFunding)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            Key Insights — 3-Year Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                title: 'Only 1 Unmodified Opinion in FY 2024/25',
                desc: 'Makueni County — the only county to receive a clean audit opinion. Down from 3 counties (Makueni, Baringo, West Pokot) in FY 2022/23.',
                type: 'warning',
              },
              {
                title: 'Assembly Opinions Improving Steadily',
                desc: 'Assembly disclaimer opinions dropped from 2 (FY 2022/23) to 0 (FY 2024/25). Unmodified assembly opinions rose from 7 to 9 over 3 years.',
                type: 'success',
              },
              {
                title: 'Adverse Opinions Declining',
                desc: 'Executive adverse opinions declined from 6 (FY 2022/23) to 2 (FY 2024/25). Meru and Embu received adverse opinions in the latest audit cycle.',
                type: 'success',
              },
              {
                title: 'Zero Disclaimer Opinions at Executive Level',
                desc: 'Across all 3 financial years (2022/23 to 2024/25), no county has received a disclaimer of opinion at the executive level. Assembly had 2 in FY 2022/23.',
                type: 'info',
              },
              {
                title: 'Funding Growth Despite Challenges',
                desc: 'Equitable share grew from KSh 190B (2013/14) to KSh 387B (2024/25), but FY 2024/25 saw a slight decrease from KSh 400B in FY 2023/24.',
                type: 'info',
              },
              {
                title: 'Qualified Remains Dominant',
                desc: '44 out of 47 counties (93.6%) received Qualified audit opinions in FY 2024/25. This proportion has been consistently high across all 3 years.',
                type: 'warning',
              },
            ].map((insight, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                insight.type === 'success' ? 'bg-green-50 border-green-200' :
                insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950 border-amber-200' :
                'bg-blue-50 dark:bg-blue-950 border-blue-200'
              }`}>
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-50 mb-1">{insight.title}</p>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700">
              <ArrowUpRight className="h-4 w-4" />
              Most Improved Counties
            </CardTitle>
            <CardDescription className="text-[11px]">Audit score improvement FY 2022/23 to FY 2024/25</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={movers.topImprovers.map(d => ({
                name: d.name.length > 12 ? d.name.slice(0, 12) + '...' : d.name,
                change: d.scoreChange,
                fullName: d.name,
              }))} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number) => [`+${value} pts`, 'Score Change']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="change" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
              <ArrowDownRight className="h-4 w-4" />
              Most Declined Counties
            </CardTitle>
            <CardDescription className="text-[11px]">Audit score decline FY 2022/23 to FY 2024/25</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={movers.topDecliners.map(d => ({
                name: d.name.length > 12 ? d.name.slice(0, 12) + '...' : d.name,
                change: Math.abs(d.scoreChange),
                fullName: d.name,
              }))} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                <RechartsTooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number) => [`-${value} pts`, 'Score Change']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="change" fill="#dc2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Full County Comparison Table */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            All {summaryStats.total} Counties — {showAssembly ? 'Assembly' : 'Executive'} Audit Comparison
          </CardTitle>
          <CardDescription className="text-[11px]">Click any county row to expand details. Colored badges show audit opinions per financial year.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <table aria-label="County audit opinion comparison across financial years" className="w-full text-xs">
              <thead className="sticky top-0 bg-stone-50 dark:bg-stone-800 z-10">
                <tr className="border-b border-stone-200 dark:border-stone-700">
                  <th scope="col" className="text-left py-2 px-2 font-semibold text-stone-600 dark:text-stone-300 min-w-[140px]">County</th>
                  <th scope="col" className="text-center py-2 px-1 font-semibold text-stone-600 dark:text-stone-300">FY 2022/23</th>
                  <th scope="col" className="text-center py-2 px-1 font-semibold text-stone-600 dark:text-stone-300">FY 2023/24</th>
                  <th scope="col" className="text-center py-2 px-1 font-semibold text-stone-600 dark:text-stone-300">FY 2024/25</th>
                  <th scope="col" className="text-center py-2 px-1 font-semibold text-stone-600 dark:text-stone-300">Trend</th>
                  <th scope="col" className="text-center py-2 px-1 font-semibold text-stone-600 dark:text-stone-300">Dev Abs.</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((county, idx) => (
                  <React.Fragment key={county.code}>
                    <tr
                      className={`border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-800 dark:bg-stone-800 cursor-pointer transition-colors ${
                        expandedCounty === county.code ? 'bg-emerald-50/50' : ''
                      }`}
                      onClick={() => setExpandedCounty(expandedCounty === county.code ? null : county.code)}
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">{county.code}</span>
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-stone-50">{county.name}</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400">{county.governor} · {county.party}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-2 px-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOpinionBadgeClass(county.opinions['FY 2022/23'])}`}>
                          {county.opinions['FY 2022/23'] || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center py-2 px-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOpinionBadgeClass(county.opinions['FY 2023/24'])}`}>
                          {county.opinions['FY 2023/24'] || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center py-2 px-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOpinionBadgeClass(county.opinions['FY 2024/25'])}`}>
                          {county.opinions['FY 2024/25'] || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center py-2 px-1">
                        {getOpinionTrendIcon(county.trend)}
                      </td>
                      <td className="text-center py-2 px-1">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                county.devAbsorption['FY 2024/25'] >= 60 ? 'bg-green-500' :
                                county.devAbsorption['FY 2024/25'] >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, county.devAbsorption['FY 2024/25'])}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300">{county.devAbsorption['FY 2024/25']}%</span>
                        </div>
                      </td>
                    </tr>
                    {expandedCounty === county.code && (
                      <tr className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                        <td colSpan={6} className="py-3 px-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                            <div>
                              <p className="font-semibold text-stone-700 dark:text-stone-200 mb-1">Score Progression</p>
                              {FINANCIAL_YEARS.map(fy => (
                                <div key={fy} className="flex items-center justify-between py-0.5">
                                  <span className="text-stone-500 dark:text-stone-400">{fy}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${county.scores[fy]}%` }} />
                                    </div>
                                    <span className="font-mono font-bold text-stone-700 dark:text-stone-200 w-6 text-right">{county.scores[fy]}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="font-semibold text-stone-700 dark:text-stone-200 mb-1">Budget Absorption</p>
                              {FINANCIAL_YEARS.map(fy => (
                                <div key={fy} className="flex items-center justify-between py-0.5">
                                  <span className="text-stone-500 dark:text-stone-400">{fy}</span>
                                  <span className="font-mono font-bold text-stone-700 dark:text-stone-200">{county.devAbsorption[fy]}%</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p className="font-semibold text-stone-700 dark:text-stone-200 mb-1">Details</p>
                              <p className="text-stone-500 dark:text-stone-400">Governor: {county.governor}</p>
                              <p className="text-stone-500 dark:text-stone-400">Party: {county.party}</p>
                              <p className="text-stone-500 dark:text-stone-400">Region: {county.region}</p>
                              <p className="text-stone-500 dark:text-stone-400">Coalition: {county.coalition}</p>
                              <p className="text-stone-500 dark:text-stone-400">Trend: <Badge variant="outline" className={`text-[9px] h-4 px-1 ${
                                county.trend === 'improved' ? 'text-green-700 border-green-300' :
                                county.trend === 'declined' ? 'text-red-700 border-red-300' : 'text-amber-700 border-amber-300'
                              }`}>{county.trend}</Badge></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-stone-500 dark:text-stone-400">Data Sources</CardTitle>
        </CardHeader>
        <CardContent className="text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
          <p>Audit opinions: Office of the Auditor-General (OAG) of Kenya — <DownloadLink href="https://www.oagkenya.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">oagkenya.go.ke</DownloadLink></p>
          <p>Budget absorption: Controller of Budget (CoB) CBIRR Reports — <DownloadLink href="https://cob.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">cob.go.ke</DownloadLink></p>
          <p>Equitable share: Commission on Revenue Allocation (CRA) — <DownloadLink href="https://www.cra.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">cra.go.ke</DownloadLink></p>
        </CardContent>
      </Card>
    </div>
  );
}
