'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import {
  Calculator, PieChart, TrendingUp, DollarSign,
  Heart, Wrench, BookOpen, Droplets, Leaf, Shield,
  Users, Store, Info, ArrowRightLeft, BarChart3,
  AlertCircle, ChevronRight, Landmark,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

const SECTORS = [
  { id: 'health', label: 'Health', icon: <Heart className="h-3.5 w-3.5" />, color: 'text-red-600' },
  { id: 'education', label: 'Education', icon: <BookOpen className="h-3.5 w-3.5" />, color: 'text-blue-600' },
  { id: 'roads', label: 'Roads & Transport', icon: <Wrench className="h-3.5 w-3.5" />, color: 'text-amber-600' },
  { id: 'water', label: 'Water & Environment', icon: <Droplets className="h-3.5 w-3.5" />, color: 'text-cyan-600' },
  { id: 'agriculture', label: 'Agriculture', icon: <Leaf className="h-3.5 w-3.5" />, color: 'text-green-600' },
  { id: 'security', label: 'Security & Admin', icon: <Shield className="h-3.5 w-3.5" />, color: 'text-slate-600' },
  { id: 'social', label: 'Youth, Gender & Culture', icon: <Users className="h-3.5 w-3.5" />, color: 'text-purple-600' },
  { id: 'markets', label: 'Trade & Markets', icon: <Store className="h-3.5 w-3.5" />, color: 'text-orange-600' },
];

/* Real budget data from CoB reports:
   Combined county budget: KSh 588.38B (FY 2024/25)
   Average: 36% development, 64% recurrent
   Unspent development funds: KSh 72 billion */
const COUNTY_BUDGET_ESTIMATES: Record<string, { total: number; devPct: number; population: number }> = {
  'Nairobi City': { total: 42000000000, devPct: 35, population: 4397073 },
  'Kiambu': { total: 18000000000, devPct: 38, population: 2481581 },
  'Nakuru': { total: 17000000000, devPct: 36, population: 2161944 },
  'Kakamega': { total: 14000000000, devPct: 34, population: 1694164 },
  'Machakos': { total: 13000000000, devPct: 33, population: 1453940 },
  'Kilifi': { total: 12500000000, devPct: 35, population: 1454270 },
  'Meru': { total: 12000000000, devPct: 36, population: 1545274 },
  'Kisumu': { total: 12000000000, devPct: 37, population: 1215566 },
  'Mombasa': { total: 11800000000, devPct: 34, population: 1208333 },
  'Uasin Gishu': { total: 11500000000, devPct: 38, population: 1592888 },
  'Turkana': { total: 11000000000, devPct: 40, population: 926976 },
  'Kisii': { total: 10500000000, devPct: 33, population: 1291660 },
  'Bungoma': { total: 10000000000, devPct: 35, population: 1675352 },
  'Mandera': { total: 9500000000, devPct: 42, population: 862856 },
  'Narok': { total: 9200000000, devPct: 37, population: 1150516 },
  'Kajiado': { total: 9000000000, devPct: 36, population: 1177840 },
  'Homa Bay': { total: 8800000000, devPct: 33, population: 1163178 },
  'Kitui': { total: 8500000000, devPct: 34, population: 1160161 },
  'Migori': { total: 8300000000, devPct: 33, population: 1145800 },
  'Siaya': { total: 8000000000, devPct: 34, population: 993183 },
};

export default function BudgetSimulatorPage() {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [devSlider, setDevSlider] = useState([36]);
  const [sectorWeights, setSectorWeights] = useState<Record<string, number>>(
    Object.fromEntries(SECTORS.map(s => [s.id, Math.round(100 / SECTORS.length)]))
  );
  const [compareMode, setCompareMode] = useState(false);

  const governor = useMemo(() => all47Governors.find(g => g.county === selectedCounty), [selectedCounty]);

  const budgetData = useMemo(() => {
    const data = COUNTY_BUDGET_ESTIMATES[selectedCounty];
    if (!data) return null;
    const devBudget = Math.round(data.total * devSlider[0] / 100);
    const recBudget = data.total - devBudget;
    const perCapita = Math.round(data.total / data.population);

    const sectorAllocations = SECTORS.map(s => {
      const weight = sectorWeights[s.id] || 12;
      const amount = Math.round(devBudget * weight / 100);
      return { ...s, weight, amount, perCapita: Math.round(amount / data.population) };
    });

    return {
      total: data.total,
      devPct: devSlider[0],
      recPct: 100 - devSlider[0],
      devBudget,
      recBudget,
      perCapita,
      actualDevPct: data.devPct,
      sectorAllocations,
    };
  }, [selectedCounty, devSlider, sectorWeights]);

  const handleSectorSlider = (id: string, value: number[]) => {
    const newWeight = value[0];
    // Normalize to ensure total = 100
    const currentTotal = Object.values(sectorWeights).reduce((a, b) => a + b, 0) - (sectorWeights[id] || 12) + newWeight;
    if (currentTotal === 0) return;
    const factor = 100 / currentTotal;
    const newWeights: Record<string, number> = {};
    let assigned = 0;
    SECTORS.forEach(s => {
      if (s.id === id) {
        newWeights[s.id] = newWeight;
      } else {
        newWeights[s.id] = Math.round((sectorWeights[s.id] || 12) * factor);
      }
      assigned += newWeights[s.id];
    });
    // Adjust rounding error
    const diff = 100 - assigned;
    const firstId = SECTORS.find(s => s.id !== id)?.id;
    if (firstId) newWeights[firstId] = (newWeights[firstId] || 0) + diff;
    setSectorWeights(newWeights);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `KSh ${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `KSh ${(amount / 1e6).toFixed(0)}M`;
    return `KSh ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Calculator className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">County Budget Simulator</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Simulate how your county&apos;s budget could be allocated. Adjust the development vs recurrent split
              and sector allocations to see the impact on service delivery.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-emerald-500/20 rounded-lg text-[11px] font-medium text-emerald-300 flex items-center gap-1"><DollarSign className="h-3 w-3" /> KSh 588.38B Combined</span>
              <span className="px-2.5 py-1 bg-blue-500/20 rounded-lg text-[11px] font-medium text-blue-300 flex items-center gap-1"><PieChart className="h-3 w-3" /> 36% Dev / 64% Rec</span>
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[11px] font-medium text-amber-300 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> KSh 72B Unspent</span>
            </div>
          </div>
        </div>
      </div>

      {/* County Selection & Controls */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="py-4 px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-64">
              <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1 block">Select County</label>
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="h-9 text-xs border-stone-200"><SelectValue placeholder="Choose county..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {all47Governors.map(g => <SelectItem key={g.county} value={g.county}>{g.county}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {budgetData && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">Development vs Recurrent Split</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600">{budgetData.devPct}%</span>
                    <span className="text-[10px] text-stone-400">Dev</span>
                    <span className="text-xs font-bold text-slate-600">{budgetData.recPct}%</span>
                    <span className="text-[10px] text-stone-400">Rec</span>
                  </div>
                </div>
                <Slider
                  value={devSlider}
                  onValueChange={setDevSlider}
                  min={10}
                  max={70}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-stone-400">10% Dev</span>
                  <span className="text-[9px] text-stone-400">70% Dev</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {budgetData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget Overview */}
          <div className="space-y-4">
            <Card className="border-stone-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  Budget Overview — {selectedCounty}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-800 rounded-lg text-white">
                  <p className="text-[10px] text-slate-300 uppercase tracking-wider">Total Annual Budget</p>
                  <p className="text-lg font-bold">{formatCurrency(budgetData.total)}</p>
                  <p className="text-[10px] text-slate-400">{formatCurrency(budgetData.perCapita)} per capita</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-[9px] text-emerald-600 uppercase tracking-wider">Development</p>
                    <p className="text-sm font-bold text-emerald-800">{formatCurrency(budgetData.devBudget)}</p>
                    <p className="text-[10px] text-emerald-600">{budgetData.devPct}% of total</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Recurrent</p>
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(budgetData.recBudget)}</p>
                    <p className="text-[10px] text-slate-500">{budgetData.recPct}% of total</p>
                  </div>
                </div>

                {budgetData.actualDevPct !== budgetData.devPct && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                      <ArrowRightLeft className="h-3 w-3" /> vs Actual CoB Data
                    </p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Actual dev allocation: {budgetData.actualDevPct}% (FY 2024/25 CoB report).
                      {budgetData.devPct > budgetData.actualDevPct
                        ? ` Your simulation allocates ${budgetData.devPct - budgetData.actualDevPct}% more to development.`
                        : ` Your simulation allocates ${budgetData.actualDevPct - budgetData.devPct}% less to development.`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Population & Governor */}
            <Card className="border-stone-200 bg-white">
              <CardContent className="py-3 px-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Users className="h-3.5 w-3.5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-stone-500">Governor</p>
                    <p className="text-xs font-semibold text-stone-800">{governor?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Landmark className="h-3.5 w-3.5 text-stone-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-stone-500">Region</p>
                    <p className="text-xs text-stone-800">{governor?.region}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sector Allocations */}
          <div className="lg:col-span-2">
            <Card className="border-stone-200 bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xs font-semibold">Development Sector Allocations</CardTitle>
                    <CardDescription className="text-[10px] text-stone-500">Adjust sector weightings. Total auto-normalizes to 100%.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {formatCurrency(budgetData.devBudget)} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgetData.sectorAllocations.map(sector => (
                  <div key={sector.id} className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={sector.color}>{sector.icon}</span>
                        <span className="text-xs font-semibold text-stone-700">{sector.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-800">{formatCurrency(sector.amount)}</span>
                        <span className="text-[10px] text-stone-400">{formatCurrency(sector.perCapita)}/capita</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[sector.weight]}
                        onValueChange={(v) => handleSectorSlider(sector.id, v)}
                        min={0}
                        max={50}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs font-bold text-slate-700 w-10 text-right">{sector.weight}%</span>
                    </div>
                    <Progress value={sector.weight * 2} className="h-1 mt-1" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Impact Analysis */}
            <Card className="border-stone-200 bg-white mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                  Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-700 mb-1">If 10% more went to development...</p>
                    <p className="text-[11px] text-blue-600">
                      {formatCurrency(budgetData.total * 0.10)} additional funds would be available for infrastructure, health facilities, and schools.
                      Per capita development spending would increase from {formatCurrency(budgetData.devBudget / (governor?.population || 1))} to{' '}
                      {formatCurrency(budgetData.total * (budgetData.devPct + 10) / 100 / (governor?.population || 1))}.
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 mb-1">Top vs Bottom Performers (CoB FY 2024/25)</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="text-[10px] text-emerald-600">
                        <p className="font-bold">Top Dev Absorption:</p>
                        <p>Mandera: 78%</p>
                        <p>Marsabit: 74%</p>
                        <p>Makueni: 72%</p>
                      </div>
                      <div className="text-[10px] text-red-600">
                        <p className="font-bold">Lowest Dev Absorption:</p>
                        <p>Nairobi: 22%</p>
                        <p>Lamu: 18%</p>
                        <p>Mombasa: 28%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!selectedCounty && (
        <Card className="border-stone-200 bg-white">
          <CardContent className="py-12 text-center">
            <Calculator className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500">Select a county to start the budget simulator</p>
            <p className="text-[10px] text-stone-400 mt-1">Budget estimates based on CoB FY 2024/25 data. Combined county budget: KSh 588.38B.</p>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-stone-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-stone-600 leading-relaxed">
              <span className="font-bold">Data sources:</span> Controller of Budget (CoB) County Budget Implementation Reviews, OAG Audit Reports.
              Combined county budget: KSh 588.38B FY 2024/25. Average split: 36% development, 64% recurrent.
              KSh 72 billion in unspent development funds (CoB FY 2024/25). Budget estimates shown are approximate for simulation purposes.
              For exact figures, consult <a href="https://cob.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">cob.go.ke</a> and individual county budget documents.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
