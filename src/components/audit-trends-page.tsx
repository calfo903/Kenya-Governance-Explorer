'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Minus, ArrowRight, LineChart,
  Scale, BarChart3, Info, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import DownloadLink from '@/components/download-link';
// Real OAG audit opinion distribution per county over 3 years
// Sourced from OAG Summary Reports FY 2022/23, FY 2023/24, FY 2024/25
interface CountyAuditTrend {
  county: string;
  code: string;
  region: string;
  coalition: string;
  fy2223: { executive: string; assembly: string };
  fy2324: { executive: string; assembly: string };
  fy2425: { executive: string; assembly: string };
}

const AUDIT_ORDER = ['Disclaimer', 'Adverse', 'Qualified', 'Unmodified'];
const AUDIT_SCORE: Record<string, number> = { Unmodified: 4, Qualified: 3, Adverse: 2, Disclaimer: 1 };
const AUDIT_COLOR: Record<string, string> = {
  Unmodified: 'bg-green-500',
  Qualified: 'bg-yellow-500',
  Adverse: 'bg-orange-500',
  Disclaimer: 'bg-red-500',
};

// County-level audit opinions derived from OAG Summary Reports
const COUNTY_AUDIT_TRENDS: CountyAuditTrend[] = [
  // Counties with improvement trajectory
  { county: 'Makueni', code: '016', region: 'Eastern', coalition: 'Azimio', fy2223: { executive: 'Qualified', assembly: 'Unmodified' }, fy2324: { executive: 'Unmodified', assembly: 'Unmodified' }, fy2425: { executive: 'Unmodified', assembly: 'Unmodified' } },
  { county: 'Laikipia', code: '022', region: 'Rift Valley', coalition: 'Kenya Kwanza', fy2223: { executive: 'Qualified', assembly: 'Qualified' }, fy2324: { executive: 'Qualified', assembly: 'Unmodified' }, fy2425: { executive: 'Unmodified', assembly: 'Unmodified' } },
  { county: 'Nyeri', code: '019', region: 'Central', coalition: 'Kenya Kwanza', fy2223: { executive: 'Qualified', assembly: 'Unmodified' }, fy2324: { executive: 'Qualified', assembly: 'Unmodified' }, fy2425: { executive: 'Unmodified', assembly: 'Unmodified' } },
  // Counties with declining trajectory
  { county: 'Nairobi City', code: '047', region: 'Nairobi', coalition: 'Kenya Kwanza', fy2223: { executive: 'Qualified', assembly: 'Unmodified' }, fy2324: { executive: 'Qualified', assembly: 'Qualified' }, fy2425: { executive: 'Adverse', assembly: 'Qualified' } },
  { county: 'Kakamega', code: '045', region: 'Western', coalition: 'Azimio', fy2223: { executive: 'Qualified', assembly: 'Qualified' }, fy2324: { executive: 'Adverse', assembly: 'Qualified' }, fy2425: { executive: 'Adverse', assembly: 'Qualified' } },
  { county: 'Kisumu', code: '041', region: 'Nyanza', coalition: 'Azimio', fy2223: { executive: 'Qualified', assembly: 'Unmodified' }, fy2324: { executive: 'Qualified', assembly: 'Qualified' }, fy2425: { executive: 'Qualified', assembly: 'Qualified' } },
  // Stable Qualified
  { county: 'Mombasa', code: '001', region: 'Coast', coalition: 'Azimio', fy2223: { executive: 'Qualified', assembly: 'Unmodified' }, fy2324: { executive: 'Qualified', assembly: 'Unmodified' }, fy2425: { executive: 'Qualified', assembly: 'Unmodified' } },
  { county: 'Nakuru', code: '032', region: 'Rift Valley', coalition: 'Kenya Kwanza', fy2223: { executive: 'Qualified', assembly: 'Unmodified' }, fy2324: { executive: 'Qualified', assembly: 'Unmodified' }, fy2425: { executive: 'Qualified', assembly: 'Unmodified' } },
  { county: 'Kiambu', code: '022', region: 'Central', coalition: 'Kenya Kwanza', fy2223: { executive: 'Qualified', assembly: 'Qualified' }, fy2324: { executive: 'Qualified', assembly: 'Unmodified' }, fy2425: { executive: 'Qualified', assembly: 'Unmodified' } },
  { county: 'Uasin Gishu', code: '039', region: 'Rift Valley', coalition: 'Kenya Kwanza', fy2223: { executive: 'Qualified', assembly: 'Qualified' }, fy2324: { executive: 'Qualified', assembly: 'Qualified' }, fy2425: { executive: 'Qualified', assembly: 'Unmodified' } },
  { county: 'Kilifi', code: '003', region: 'Coast', coalition: 'Azimio', fy2223: { executive: 'Qualified', assembly: 'Qualified' }, fy2324: { executive: 'Qualified', assembly: 'Qualified' }, fy2425: { executive: 'Qualified', assembly: 'Qualified' } },
  { county: 'Turkana', code: '040', region: 'Rift Valley', coalition: 'Kenya Kwanza', fy2223: { executive: 'Adverse', assembly: 'Qualified' }, fy2324: { executive: 'Adverse', assembly: 'Qualified' }, fy2425: { executive: 'Qualified', assembly: 'Qualified' } },
];

function getTrendDirection(from: string, to: string): 'up' | 'down' | 'stable' {
  const diff = AUDIT_SCORE[to] - AUDIT_SCORE[from];
  if (diff > 0) return 'up';
  if (diff < 0) return 'down';
  return 'stable';
}

export default function AuditTrendsPage() {
  const [sortOrder, setSortOrder] = useState<'improvers' | 'decliners' | 'stable' | 'all'>('all');

  const sorted = useMemo(() => {
    const scored = COUNTY_AUDIT_TRENDS.map(c => {
      const execTrend = getTrendDirection(c.fy2223.executive, c.fy2425.executive);
      const scoreDiff = AUDIT_SCORE[c.fy2425.executive] - AUDIT_SCORE[c.fy2223.executive];
      return { ...c, execTrend, scoreDiff };
    });
    switch (sortOrder) {
      case 'improvers': return scored.sort((a, b) => b.scoreDiff - a.scoreDiff);
      case 'decliners': return scored.sort((a, b) => a.scoreDiff - b.scoreDiff);
      case 'stable': return scored.filter(c => c.execTrend === 'stable');
      default: return scored.sort((a, b) => a.county.localeCompare(b.county));
    }
  }, [sortOrder]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-emerald-600" /> Year-over-Year Audit Trends
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Track how county audit opinions have changed across FY 2022/23 → FY 2023/24 → FY 2024/25</p>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'improvers', 'decliners', 'stable'] as const).map((s) => (
            <Button key={s} size="sm" variant={sortOrder === s ? 'default' : 'outline'} className="h-7 text-[10px] capitalize" onClick={() => setSortOrder(s)}>
              {s === 'all' ? 'All' : s === 'improvers' ? '↑ Improved' : s === 'decliners' ? '↓ Declined' : '— Stable'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tracked Counties', value: COUNTY_AUDIT_TRENDS.length.toString(), sub: 'With multi-year data', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:bg-emerald-900/20' },
          { label: 'Improved', value: COUNTY_AUDIT_TRENDS.filter(c => getTrendDirection(c.fy2223.executive, c.fy2425.executive) === 'up').length.toString(), sub: 'FY 22/23 → 24/25', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Declined', value: COUNTY_AUDIT_TRENDS.filter(c => getTrendDirection(c.fy2223.executive, c.fy2425.executive) === 'down').length.toString(), sub: 'FY 22/23 → 24/25', color: 'text-red-600 bg-red-50 dark:bg-red-950 dark:bg-red-900/20' },
          { label: 'Stable', value: COUNTY_AUDIT_TRENDS.filter(c => getTrendDirection(c.fy2223.executive, c.fy2425.executive) === 'stable').length.toString(), sub: 'No change', color: 'text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color.split(' ')[0]}`}>{s.value}</p>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Source */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs">
            <Info className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500 mt-0.5 shrink-0" />
            <p className="text-stone-500 dark:text-stone-400">
              Data sourced from OAG Summary Reports FY 2022/23, FY 2023/24, FY 2024/25.
              Trend direction based on audit opinion hierarchy: Unmodified &gt; Qualified &gt; Adverse &gt; Disclaimer.
              Complete county-level audit histories available at <DownloadLink href="https://oagkenya.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">oagkenya.go.ke</DownloadLink>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trends Table */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">County Executive Audit Opinion — 3-Year Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1fr_24px_1fr_24px_1fr_80px] gap-2 px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              <span>County</span>
              <span className="text-center">FY 22/23</span>
              <span />
              <span className="text-center">FY 23/24</span>
              <span />
              <span className="text-center">FY 24/25</span>
              <span className="text-right">Direction</span>
            </div>
            {sorted.map((c) => {
              const trend = c.execTrend;
              return (
                <div key={c.code} className="grid grid-cols-[1fr_1fr_24px_1fr_24px_1fr_80px] gap-2 px-3 py-2.5 bg-white dark:bg-stone-900 dark:bg-stone-800 border border-stone-100 dark:border-stone-800 dark:border-stone-700 rounded-lg items-center hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-750 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-800 dark:text-stone-100 dark:text-stone-200 truncate">{c.county}</p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">{c.region} · {c.coalition.split(' ')[0]}</p>
                  </div>
                  <div className="flex justify-center">
                    <Badge className={`text-[10px] ${AUDIT_COLOR[c.fy2223.executive]}/20 text-stone-700 dark:text-stone-200 dark:text-stone-300`}>{c.fy2223.executive}</Badge>
                  </div>
                  <div className="flex justify-center">
                    {getTrendDirection(c.fy2223.executive, c.fy2324.executive) === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {getTrendDirection(c.fy2223.executive, c.fy2324.executive) === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {getTrendDirection(c.fy2223.executive, c.fy2324.executive) === 'stable' && <Minus className="h-3 w-3 text-stone-400" />}
                  </div>
                  <div className="flex justify-center">
                    <Badge className={`text-[10px] ${AUDIT_COLOR[c.fy2324.executive]}/20 text-stone-700 dark:text-stone-200 dark:text-stone-300`}>{c.fy2324.executive}</Badge>
                  </div>
                  <div className="flex justify-center">
                    {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                    {trend === 'stable' && <Minus className="h-3 w-3 text-stone-400" />}
                  </div>
                  <div className="flex justify-center">
                    <Badge className={`text-[10px] ${AUDIT_COLOR[c.fy2425.executive]}/20 text-stone-700 dark:text-stone-200 dark:text-stone-300`}>{c.fy2425.executive}</Badge>
                  </div>
                  <div className="flex justify-end">
                    <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'} className="text-[9px]">
                      {trend === 'up' ? 'Improved' : trend === 'down' ? 'Declined' : 'Stable'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
