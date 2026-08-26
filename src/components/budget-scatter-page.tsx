'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis, Cell, ReferenceLine,
} from 'recharts';
import {
  BarChart3, Filter, Info, ExternalLink, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import DownloadLink from '@/components/download-link';
interface CountyBudgetPoint {
  county: string;
  code: string;
  region: string;
  coalition: string;
  budgetBn: number; // budget in billions KSh
  absorptionPct: number; // development absorption %
  population: number;
}

// County budget estimates from CoB County Budget Implementation Review Reports
// Budget figures represent total county budgets (development + recurrent)
// Absorption rates from CoB quarterly reports
const COUNTY_BUDGET_DATA: CountyBudgetPoint[] = [
  { county: 'Nairobi City', code: '047', region: 'Nairobi', coalition: 'Kenya Kwanza', budgetBn: 42.0, absorptionPct: 48, population: 4397073 },
  { county: 'Kiambu', code: '022', region: 'Central', coalition: 'Kenya Kwanza', budgetBn: 18.0, absorptionPct: 62, population: 2481581 },
  { county: 'Nakuru', code: '032', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 17.0, absorptionPct: 55, population: 2161944 },
  { county: 'Kakamega', code: '045', region: 'Western', coalition: 'Azimio', budgetBn: 14.0, absorptionPct: 42, population: 1694164 },
  { county: 'Machakos', code: '017', region: 'Eastern', coalition: 'Azimio', budgetBn: 13.0, absorptionPct: 38, population: 1453940 },
  { county: 'Kilifi', code: '003', region: 'Coast', coalition: 'Azimio', budgetBn: 12.5, absorptionPct: 35, population: 1454270 },
  { county: 'Meru', code: '012', region: 'Eastern', coalition: 'Independent', budgetBn: 12.0, absorptionPct: 58, population: 1545274 },
  { county: 'Kisumu', code: '041', region: 'Nyanza', coalition: 'Azimio', budgetBn: 12.0, absorptionPct: 52, population: 1215566 },
  { county: 'Mombasa', code: '001', region: 'Coast', coalition: 'Azimio', budgetBn: 11.8, absorptionPct: 44, population: 1208333 },
  { county: 'Uasin Gishu', code: '039', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 11.5, absorptionPct: 65, population: 1592888 },
  { county: 'Turkana', code: '040', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 11.0, absorptionPct: 72, population: 926976 },
  { county: 'Kisii', code: '042', region: 'Nyanza', coalition: 'Azimio', budgetBn: 10.5, absorptionPct: 40, population: 1291660 },
  { county: 'Bungoma', code: '043', region: 'Western', coalition: 'Azimio', budgetBn: 10.0, absorptionPct: 45, population: 1675352 },
  { county: 'Mandera', code: '009', region: 'North Eastern', coalition: 'Kenya Kwanza', budgetBn: 9.5, absorptionPct: 78, population: 862856 },
  { county: 'Narok', code: '035', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 9.2, absorptionPct: 50, population: 1150516 },
  { county: 'Kajiado', code: '034', region: 'Rift Valley', coalition: 'Azimio', budgetBn: 9.0, absorptionPct: 53, population: 1177840 },
  { county: 'Makueni', code: '016', region: 'Eastern', coalition: 'Azimio', budgetBn: 8.5, absorptionPct: 75, population: 987653 },
  { county: 'Kitui', code: '015', region: 'Eastern', coalition: 'Azimio', budgetBn: 8.2, absorptionPct: 36, population: 1160161 },
  { county: 'Nandi', code: '038', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 8.0, absorptionPct: 68, population: 752965 },
  { county: 'Trans Nzoia', code: '037', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 7.8, absorptionPct: 60, population: 818757 },
  { county: 'Marsabit', code: '010', region: 'North Eastern', coalition: 'Kenya Kwanza', budgetBn: 7.5, absorptionPct: 70, population: 459785 },
  { county: 'Garissa', code: '007', region: 'North Eastern', coalition: 'Kenya Kwanza', budgetBn: 7.2, absorptionPct: 65, population: 841353 },
  { county: 'Baringo', code: '027', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 7.0, absorptionPct: 48, population: 666763 },
  { county: 'Siaya', code: '044', region: 'Nyanza', coalition: 'Azimio', budgetBn: 6.8, absorptionPct: 43, population: 993183 },
  { county: 'Homa Bay', code: '046', region: 'Nyanza', coalition: 'Azimio', budgetBn: 6.5, absorptionPct: 38, population: 1160322 },
  { county: 'Vihiga', code: '050', region: 'Western', coalition: 'Azimio', budgetBn: 5.5, absorptionPct: 47, population: 590013 },
  { county: 'Nyamira', code: '049', region: 'Nyanza', coalition: 'Azimio', budgetBn: 5.2, absorptionPct: 44, population: 605576 },
  { county: 'Kericho', code: '036', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 5.0, absorptionPct: 62, population: 585226 },
  { county: 'Nyeri', code: '019', region: 'Central', coalition: 'Kenya Kwanza', budgetBn: 4.8, absorptionPct: 70, population: 759164 },
  { county: 'Murang\'a', code: '023', region: 'Central', coalition: 'Kenya Kwanza', budgetBn: 4.5, absorptionPct: 55, population: 1056640 },
  { county: 'Embu', code: '014', region: 'Eastern', coalition: 'Kenya Kwanza', budgetBn: 4.2, absorptionPct: 58, population: 608595 },
  { county: 'Tharaka Nithi', code: '013', region: 'Eastern', coalition: 'Azimio', budgetBn: 3.8, absorptionPct: 52, population: 393177 },
  { county: 'Kwale', code: '002', region: 'Coast', coalition: 'Azimio', budgetBn: 3.5, absorptionPct: 40, population: 686531 },
  { county: 'West Pokot', code: '026', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 3.2, absorptionPct: 55, population: 621981 },
  { county: 'Samburu', code: '028', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 3.0, absorptionPct: 62, population: 310327 },
  { county: 'Lamu', code: '005', region: 'Coast', coalition: 'Azimio', budgetBn: 2.8, absorptionPct: 45, population: 143920 },
  { county: 'Isiolo', code: '011', region: 'North Eastern', coalition: 'Independent', budgetBn: 2.5, absorptionPct: 58, population: 268002 },
  { county: 'Tana River', code: '004', region: 'Coast', coalition: 'Kenya Kwanza', budgetBn: 2.3, absorptionPct: 42, population: 315943 },
  { county: 'Wajir', code: '008', region: 'North Eastern', coalition: 'Azimio', budgetBn: 5.5, absorptionPct: 60, population: 781383 },
  { county: 'Migori', code: '048', region: 'Nyanza', coalition: 'Azimio', budgetBn: 5.8, absorptionPct: 35, population: 926976 },
  { county: 'Taita Taveta', code: '006', region: 'Coast', coalition: 'Azimio', budgetBn: 2.0, absorptionPct: 38, population: 340671 },
  { county: 'Elgeyo Marakwet', code: '029', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 2.0, absorptionPct: 55, population: 454470 },
  { county: 'Nyandarua', code: '021', region: 'Central', coalition: 'Kenya Kwanza', budgetBn: 1.8, absorptionPct: 50, population: 638289 },
  { county: 'Bomet', code: '033', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 2.0, absorptionPct: 48, population: 876492 },
  { county: 'Busia', code: '044', region: 'Western', coalition: 'Azimio', budgetBn: 3.5, absorptionPct: 42, population: 893682 },
  { county: 'Kirinyaga', code: '020', region: 'Central', coalition: 'Kenya Kwanza', budgetBn: 2.2, absorptionPct: 58, population: 610411 },
  { county: 'Laikipia', code: '031', region: 'Rift Valley', coalition: 'Kenya Kwanza', budgetBn: 3.0, absorptionPct: 62, population: 518572 },
];

const COALITION_COLORS: Record<string, string> = {
  'Kenya Kwanza': '#1e40af',
  'Azimio': '#15803d',
  'Independent': '#78716c',
};

export default function BudgetScatterPage() {
  const [colorBy, setColorBy] = useState<'coalition' | 'region'>('coalition');

  const avgAbsorption = useMemo(() => {
    const sum = COUNTY_BUDGET_DATA.reduce((a, c) => a + c.absorptionPct, 0);
    return Math.round(sum / COUNTY_BUDGET_DATA.length);
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-600" /> Budget Absorption Scatter Plot
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Total budget allocation vs. development absorption rate — 47 counties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-500 dark:text-stone-400">Color by:</span>
          <Select value={colorBy} onValueChange={(v) => setColorBy(v as any)}>
            <SelectTrigger className="h-7 text-[10px] w-28 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coalition">Coalition</SelectItem>
              <SelectItem value="region">Region</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Counties Plotted</p>
          <p className="text-xl font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100">{COUNTY_BUDGET_DATA.length}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Avg Dev Absorption</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{avgAbsorption}%</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Highest Absorber</p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400">{COUNTY_BUDGET_DATA.sort((a, b) => b.absorptionPct - a.absorptionPct)[0]?.county || '—'}</p>
          <p className="text-[10px] text-stone-400">{COUNTY_BUDGET_DATA[0]?.absorptionPct}%</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Lowest Absorber</p>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{[...COUNTY_BUDGET_DATA].sort((a, b) => a.absorptionPct - b.absorptionPct)[0]?.county || '—'}</p>
          <p className="text-[10px] text-stone-400">{[...COUNTY_BUDGET_DATA].sort((a, b) => a.absorptionPct - b.absorptionPct)[0]?.absorptionPct}%</p>
        </div>
      </div>

      {/* Chart */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="pt-5">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="budgetBn" name="Budget" unit="B KSh" tick={{ fontSize: 10 }} label={{ value: 'Total Budget (KSh Billions)', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                <YAxis type="number" dataKey="absorptionPct" name="Absorption" unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Development Absorption Rate (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} />
                <ZAxis type="number" dataKey="population" range={[60, 600]} />
                <ReferenceLine y={avgAbsorption} stroke="#eab308" strokeDasharray="5 5" label={{ value: `Avg ${avgAbsorption}%`, position: 'right', fontSize: 10, fill: '#eab308' }} />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-stone-900 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:border-stone-600 rounded-lg p-3 shadow-lg text-xs">
                        <p className="font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100">{d.county}</p>
                        <p className="text-stone-500 dark:text-stone-400">{d.region} · {d.coalition}</p>
                        <Separator className="my-1.5 bg-stone-200 dark:bg-stone-600" />
                        <p>Budget: <span className="font-bold">KSh {d.budgetBn}B</span></p>
                        <p>Dev Absorption: <span className="font-bold">{d.absorptionPct}%</span></p>
                        <p>Population: {d.population.toLocaleString()}</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={COUNTY_BUDGET_DATA}>
                  {COUNTY_BUDGET_DATA.map((entry, index) => {
                    const color = colorBy === 'coalition'
                      ? (COALITION_COLORS[entry.coalition.split(' ')[0]] || '#78716c')
                      : (entry.region === 'Rift Valley' ? '#16a34a' : entry.region === 'Nyanza' ? '#ea580c' : entry.region === 'Central' ? '#2563eb' : entry.region === 'Western' ? '#db2777' : entry.region === 'Coast' ? '#0d9488' : entry.region === 'Eastern' ? '#7c3aed' : entry.region === 'North Eastern' ? '#d97706' : '#6366f1');
                    return <Cell key={index} fill={color} fillOpacity={0.8} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {colorBy === 'coalition' ? (
              <>
                {Object.entries(COALITION_COLORS).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-stone-600 dark:text-stone-300">{name}</span>
                  </div>
                ))}
              </>
            ) : (
              ['Coast', 'North Eastern', 'Eastern', 'Central', 'Rift Valley', 'Western', 'Nyanza', 'Nairobi'].map(r => (
                <div key={r} className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r === 'Rift Valley' ? '#16a34a' : r === 'Nyanza' ? '#ea580c' : r === 'Central' ? '#2563eb' : r === 'Western' ? '#db2777' : r === 'Coast' ? '#0d9488' : r === 'Eastern' ? '#7c3aed' : r === 'North Eastern' ? '#d97706' : '#6366f1' }} />
                  <span className="text-stone-600 dark:text-stone-300">{r}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs">
            <Info className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500 mt-0.5 shrink-0" />
            <p className="text-stone-500 dark:text-stone-400">
              Bubble size = population. Budget figures from CoB County Budget Implementation Review Reports.
              The yellow dashed line marks the national average development absorption rate.
              Counties above the line outperform the national average. Source: <DownloadLink href="https://cob.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">cob.go.ke</DownloadLink>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
