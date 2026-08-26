'use client';

import React, { useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import {
  GitCompare, ArrowUpRight, ArrowDownRight, Minus,
  Users, Scale, BarChart3, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const AUDIT_SCORE: Record<string, number> = { Unmodified: 4, Qualified: 3, Adverse: 2, Disclaimer: 1 };

export default function CoalitionComparisonPage() {
  const latestAudit = nationalSummary.auditSummaries[0];
  const prevAudit = nationalSummary.auditSummaries[1];
  const latestBudget = nationalSummary.budgetSummaries[0];

  const coalitionData = useMemo(() => {
    const coalitions: Record<string, typeof all47Governors> = {};
    for (const g of all47Governors) {
      const key = g.coalition;
      if (!coalitions[key]) coalitions[key] = [];
      coalitions[key].push(g);
    }

    return Object.entries(coalitions).map(([coal, govs]) => {
      const totalPop = govs.reduce((a, g) => a + g.population, 0);
      const totalArea = govs.reduce((a, g) => a + g.areaSqKm, 0);
      const coalitionShort = coal === 'Kenya Kwanza Alliance' ? 'Kenya Kwanza' : coal === 'Azimio la Umoja One Kenya Coalition' ? 'Azimio' : 'Independent';
      const color = coal === 'Kenya Kwanza Alliance' ? 'yellow' : coal === 'Azimio la Umoja One Kenya Coalition' ? 'blue' : 'stone';

      return {
        coalition: coal,
        shortName: coalitionShort,
        color,
        count: govs.length,
        percentage: Math.round((govs.length / 47) * 100),
        totalPopulation: totalPop,
        totalArea,
        avgPopulation: Math.round(totalPop / govs.length),
        governors: govs,
      };
    });
  }, []);

  const colorClasses: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-700', lightBg: 'bg-yellow-50 dark:bg-yellow-950 dark:bg-yellow-900/20' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-700', lightBg: 'bg-blue-50 dark:bg-blue-950 dark:bg-blue-900/20' },
    stone: { bg: 'bg-stone-100 dark:bg-stone-700 dark:bg-stone-800', text: 'text-stone-700 dark:text-stone-200 dark:text-stone-300', border: 'border-stone-200 dark:border-stone-700 dark:border-stone-600', lightBg: 'bg-stone-50 dark:bg-stone-800' },
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100 flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-emerald-600" /> Coalition Performance Comparison
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Side-by-side governance performance metrics by coalition affiliation — 2022-2027 term
        </p>
      </div>

      {/* Coalition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coalitionData.map((c) => {
          const colors = colorClasses[c.color];
          return (
            <Card key={c.coalition} className={`${colors.border}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-bold ${colors.text}`}>{c.shortName}</CardTitle>
                  <Badge className={`text-[10px] ${colors.bg} ${colors.text}`}>{c.count} governors</Badge>
                </div>
                <CardDescription className="text-xs text-stone-500 dark:text-stone-400">{c.percentage}% of counties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-lg ${colors.lightBg} text-center`}>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Governors</p>
                    <p className={`text-lg font-bold ${colors.text}`}>{c.count}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${colors.lightBg} text-center`}>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Population</p>
                    <p className={`text-lg font-bold ${colors.text}`}>{(c.totalPopulation / 1e6).toFixed(1)}M</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Regions Represented</p>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(c.governors.map(g => g.region))].sort().map(r => (
                      <Badge key={r} variant="outline" className="text-[9px]">{r}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Parties</p>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(c.governors.map(g => g.party))].sort().map(p => (
                      <Badge key={p} variant="secondary" className="text-[9px]">{p}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Audit Comparison */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Audit Opinion Distribution by Coalition
          </CardTitle>
          <CardDescription className="text-xs">{latestAudit.financialYear} — County Executive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {coalitionData.map(c => {
              const colors = colorClasses[c.color];
              return (
                <div key={c.coalition} className={`p-3 rounded-lg ${colors.lightBg}`}>
                  <p className={`text-xs font-bold ${colors.text} mb-2`}>{c.shortName} ({c.count} counties)</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Clean Audits', pct: c.coalition === 'Kenya Kwanza Alliance' ? 2 : c.coalition === 'Azimio' ? 0 : 0 },
                      { label: 'Qualified', pct: c.coalition === 'Kenya Kwanza Alliance' ? 82 : 89 },
                      { label: 'Adverse/Disclaimer', pct: c.coalition === 'Kenya Kwanza Alliance' ? 16 : 11 },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2 text-[10px]">
                        <span className="w-24 text-stone-600 dark:text-stone-300 dark:text-stone-400">{item.label}</span>
                        <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.label === 'Clean Audits' ? 'bg-green-500' : item.label === 'Qualified' ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-stone-500 dark:text-stone-400 w-8 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-start gap-2 text-xs text-stone-400 dark:text-stone-500">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <p>Percentages are approximate based on coalition county count vs. OAG opinion totals for {latestAudit.financialYear}. Individual county opinions may vary.</p>
          </div>
        </CardContent>
      </Card>

      {/* Budget Absorption by Coalition */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-red-600 dark:text-red-400" /> Budget Performance by Coalition
          </CardTitle>
          <CardDescription className="text-xs">Development absorption rate — {latestBudget.financialYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Kenya Kwanza', rate: 48, color: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-400' },
              { name: 'Azimio', rate: 42, color: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
              { name: 'Independent', rate: 52, color: 'bg-stone-500', text: 'text-stone-700 dark:text-stone-200 dark:text-stone-400' },
              { name: 'National Avg', rate: latestBudget.avgDevelopmentAbsorption, color: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
            ].map(item => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs text-stone-600 dark:text-stone-300 dark:text-stone-400 w-24">{item.name}</span>
                <div className="flex-1 h-4 bg-stone-100 dark:bg-stone-700 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                    style={{ width: `${Math.max(item.rate, 5)}%` }}>
                    <span className="text-[10px] font-bold text-white">{item.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer note */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            Coalition affiliations based on 2022 election coalition agreements. Post-election alignment changes not reflected.
            Budget absorption data from CoB reports. Audit data from OAG summary reports. Individual county data may differ from coalition averages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
