'use client';

import React, { useState, useMemo } from 'react';
import { getCECMPerformanceScores, getCECMScoreColor, getCECMScoreBadgeClass, getCECMScoreLabel, getCECMBarColor, CECMScore } from '@/data/cecm-performance';
import { REGIONS } from '@/data/types';
import { useTranslations } from 'next-intl';
import {
  Award, TrendingUp, TrendingDown, Search,
  BarChart3, ArrowUpDown, Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

type SortField = 'countyName' | 'overallScore' | 'budgetAbsorptionScore' | 'staffingScore' | 'auditScore' | 'region';

export default function CECMPerformancePage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('overallScore');
  const [sortAsc, setSortAsc] = useState(false); // default: highest first

  const scores = useMemo(() => {
    const map = getCECMPerformanceScores('FY 2024/25');
    return Array.from(map.values());
  }, []);

  const avgScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length);
  }, [scores]);

  const best = useMemo(() => scores.reduce((a, b) => a.overallScore > b.overallScore ? a : b, scores[0]), [scores]);
  const worst = useMemo(() => scores.reduce((a, b) => a.overallScore < b.overallScore ? a : b, scores[0]), [scores]);

  const aboveThreshold = useMemo(() => scores.filter(s => s.overallScore >= 60).length, [scores]);

  const filtered = useMemo(() => {
    let items = [...scores];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(s =>
        s.countyName.toLowerCase().includes(q) ||
        s.countyCode.includes(q) ||
        s.region.toLowerCase().includes(q)
      );
    }
    if (regionFilter !== 'all') {
      items = items.filter(s => s.region === regionFilter);
    }

    items.sort((a, b) => {
      let cmp = 0;
      const aVal = a[sortField] as string | number;
      const bVal = b[sortField] as string | number;
      if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
      else cmp = (aVal as number) - (bVal as number);
      return sortAsc ? cmp : -cmp;
    });

    return items;
  }, [scores, searchQuery, regionFilter, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(field === 'countyName' || field === 'region'); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-stone-200 bg-white dark:bg-stone-900">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">CECM Performance Dashboard</CardTitle>
              <CardDescription className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Composite score (0–100) for County Executive Committee performance across all 47 counties. Weighted: Budget Absorption (50%), Audit Quality (30%), CECM Staffing (20%). Source: CoB, OAG, county assembly records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Average Score', value: `${avgScore}/100`, icon: BarChart3, color: getCECMScoreColor(avgScore) },
          { label: 'Top Performer', value: best?.countyName ?? '—', icon: TrendingUp, sub: `${best?.overallScore ?? 0}/100`, color: '#047857' },
          { label: 'Needs Improvement', value: worst?.countyName ?? '—', icon: TrendingDown, sub: `${worst?.overallScore ?? 0}/100`, color: '#dc2626' },
          { label: 'Above 60 Score', value: `${aboveThreshold}/47`, icon: Star, sub: `${Math.round((aboveThreshold / 47) * 100)}%`, color: '#059669' },
        ].map(s => (
          <Card key={s.label} className="border-stone-200 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 shrink-0" style={{ color: s.color }} />
              <div className="min-w-0">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{s.value}</p>
                {s.sub && <p className="text-[10px] text-stone-400">{s.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card className="border-stone-200 bg-white dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <span className="font-semibold text-stone-600 dark:text-stone-300">Score Legend:</span>
            {[
              { range: '80–100', label: 'High Performing', color: '#047857' },
              { range: '60–79', label: 'Good', color: '#059669' },
              { range: '40–59', label: 'Average', color: '#d97706' },
              { range: '20–39', label: 'Below Average', color: '#ea580c' },
              { range: '0–19', label: 'Poor', color: '#dc2626' },
            ].map(l => (
              <span key={l.range} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                <span className="text-stone-600 dark:text-stone-400">{l.range}:</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">{l.label}</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-stone-200 bg-white dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by county name or code..."
                className="h-9 pl-10 text-sm border-stone-200 dark:border-stone-700"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-9 w-[160px] text-sm border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-stone-200 bg-white dark:bg-stone-900">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="CECM Performance scores for all 47 counties">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                  {[
                    { field: 'countyName' as SortField, label: 'County' },
                    { field: 'region' as SortField, label: 'Region' },
                    { field: 'overallScore' as SortField, label: 'Overall' },
                    { field: 'budgetAbsorptionScore' as SortField, label: 'Budget (50%)' },
                    { field: 'auditScore' as SortField, label: 'Audit (30%)' },
                    { field: 'staffingScore' as SortField, label: 'Staffing (20%)' },
                  ].map(col => (
                    <th
                      key={col.field}
                      className={`py-2.5 px-3 font-semibold text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none whitespace-nowrap ${col.field === 'countyName' ? 'text-left' : 'text-center'}`}
                      scope="col"
                      onClick={() => toggleSort(col.field)}
                    >
                      <span className="flex items-center gap-1">
                        {col.field === 'countyName' ? null : <ArrowUpDown className="h-3 w-3" />}
                        {col.label}
                      </span>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 font-semibold text-xs text-stone-600 dark:text-stone-300 text-center" scope="col">CECMs</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400 dark:text-stone-500">
                      <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No counties match your filters.</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => { setSearchQuery(''); setRegionFilter('all'); }}>
                        Clear Filters
                      </Button>
                    </td>
                  </tr>
                ) : filtered.map(score => (
                  <CECMRow key={score.countyCode} score={score} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CECMRow({ score }: { score: CECMScore }) {
  return (
    <tr className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded">{score.countyCode}</span>
          <span className="font-medium text-stone-800 dark:text-stone-100 text-xs">{score.countyName}</span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-xs text-stone-500 dark:text-stone-400 text-center">{score.region}</td>
      <td className="py-2.5 px-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <Badge className={`text-[10px] border ${getCECMScoreBadgeClass(score.overallScore)}`}>
            {score.overallScore}
          </Badge>
          <span className="text-[9px] text-stone-400">{getCECMScoreLabel(score.overallScore)}</span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-center">
        <ScoreBar value={score.budgetAbsorptionScore} color={getCECMBarColor(score.budgetAbsorptionScore)} />
      </td>
      <td className="py-2.5 px-3 text-center">
        <ScoreBar value={score.auditScore} color={getCECMBarColor(score.auditScore)} />
      </td>
      <td className="py-2.5 px-3 text-center">
        <ScoreBar value={score.staffingScore} color={getCECMBarColor(score.staffingScore)} />
      </td>
      <td className="py-2.5 px-3 text-center text-xs">
        <span className="font-medium text-stone-700 dark:text-stone-300">{score.cecmsFilled}</span>
        <span className="text-stone-400">/{score.cecmsExpected}</span>
      </td>
    </tr>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 w-6 text-right">{value}</span>
    </div>
  );
}
