'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown, Download, GitCompare, TrendingUp, Trophy,
  ChevronRight, X, BarChart3, Radar as RadarIcon, Star,
  MapPin, Users, DollarSign, Percent, FileCheck, Building2,
  AlertTriangle, Heart, BookOpen, Smile, Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface CountyMetric {
  population: number;
  area: number;
  budget: number;
  absorptionRate: number;
  auditOpinion: number;
  activeProjects: number;
  riskScore: number;
  healthScore: number;
  educationScore: number;
  citizenSatisfaction: number;
}

interface CountyData {
  name: string;
  code: string;
  metrics: CountyMetric;
  budgetFormatted: string;
  populationFormatted: string;
  areaFormatted: string;
}

const COUNTIES: CountyData[] = [
  { name: 'Nairobi', code: 'nrb', metrics: { population: 4397073, area: 696, budget: 43500, absorptionRate: 78, auditOpinion: 65, activeProjects: 342, riskScore: 35, healthScore: 72, educationScore: 78, citizenSatisfaction: 61 }, budgetFormatted: 'KES 43.5B', populationFormatted: '4.40M', areaFormatted: '696 km2' },
  { name: 'Mombasa', code: 'msa', metrics: { population: 1208333, area: 229, budget: 18700, absorptionRate: 68, auditOpinion: 52, activeProjects: 187, riskScore: 42, healthScore: 65, educationScore: 62, citizenSatisfaction: 55 }, budgetFormatted: 'KES 18.7B', populationFormatted: '1.21M', areaFormatted: '229 km2' },
  { name: 'Kisumu', code: 'ksm', metrics: { population: 1168908, area: 2086, budget: 14200, absorptionRate: 71, auditOpinion: 58, activeProjects: 156, riskScore: 38, healthScore: 68, educationScore: 65, citizenSatisfaction: 58 }, budgetFormatted: 'KES 14.2B', populationFormatted: '1.17M', areaFormatted: '2,086 km2' },
  { name: 'Nakuru', code: 'nkr', metrics: { population: 2160889, area: 7496, budget: 15800, absorptionRate: 67, auditOpinion: 55, activeProjects: 198, riskScore: 44, healthScore: 62, educationScore: 60, citizenSatisfaction: 52 }, budgetFormatted: 'KES 15.8B', populationFormatted: '2.16M', areaFormatted: '7,496 km2' },
  { name: 'Uasin Gishu', code: 'ug', metrics: { population: 894179, area: 3345, budget: 11800, absorptionRate: 82, auditOpinion: 72, activeProjects: 134, riskScore: 25, healthScore: 75, educationScore: 72, citizenSatisfaction: 68 }, budgetFormatted: 'KES 11.8B', populationFormatted: '894K', areaFormatted: '3,345 km2' },
  { name: 'Kiambu', code: 'kmb', metrics: { population: 2417753, area: 2544, budget: 16200, absorptionRate: 76, auditOpinion: 68, activeProjects: 210, riskScore: 32, healthScore: 74, educationScore: 76, citizenSatisfaction: 64 }, budgetFormatted: 'KES 16.2B', populationFormatted: '2.42M', areaFormatted: '2,544 km2' },
  { name: 'Machakos', code: 'mks', metrics: { population: 1427841, area: 5953, budget: 12400, absorptionRate: 63, auditOpinion: 48, activeProjects: 145, riskScore: 48, healthScore: 58, educationScore: 56, citizenSatisfaction: 48 }, budgetFormatted: 'KES 12.4B', populationFormatted: '1.43M', areaFormatted: '5,953 km2' },
  { name: 'Kajiado', code: 'kjd', metrics: { population: 1157373, area: 21307, budget: 11200, absorptionRate: 65, auditOpinion: 52, activeProjects: 128, riskScore: 40, healthScore: 55, educationScore: 52, citizenSatisfaction: 50 }, budgetFormatted: 'KES 11.2B', populationFormatted: '1.16M', areaFormatted: '21,307 km2' },
  { name: 'Kakamega', code: 'kkg', metrics: { population: 1866610, area: 3052, budget: 10500, absorptionRate: 61, auditOpinion: 45, activeProjects: 112, riskScore: 50, healthScore: 52, educationScore: 55, citizenSatisfaction: 45 }, budgetFormatted: 'KES 10.5B', populationFormatted: '1.87M', areaFormatted: '3,052 km2' },
  { name: 'Turkana', code: 'trk', metrics: { population: 926976, area: 77908, budget: 9800, absorptionRate: 54, auditOpinion: 38, activeProjects: 78, riskScore: 62, healthScore: 35, educationScore: 32, citizenSatisfaction: 38 }, budgetFormatted: 'KES 9.8B', populationFormatted: '927K', areaFormatted: '77,908 km2' },
];

const DIMENSION_CONFIG = [
  { key: 'population', label: 'Population', unit: '', format: (v: number) => v.toLocaleString(), icon: <Users className="h-3.5 w-3.5" />, higherBetter: true },
  { key: 'area', label: 'Area', unit: ' km2', format: (v: number) => v.toLocaleString(), icon: <MapPin className="h-3.5 w-3.5" />, higherBetter: false },
  { key: 'budget', label: 'Budget', unit: 'M KES', format: (v: number) => `${v.toLocaleString()}M`, icon: <DollarSign className="h-3.5 w-3.5" />, higherBetter: true },
  { key: 'absorptionRate', label: 'Absorption Rate', unit: '%', format: (v: number) => `${v}%`, icon: <Percent className="h-3.5 w-3.5" />, higherBetter: true },
  { key: 'auditOpinion', label: 'Audit Score', unit: '/100', format: (v: number) => `${v}/100`, icon: <FileCheck className="h-3.5 w-3.5" />, higherBetter: true },
  { key: 'activeProjects', label: 'Active Projects', unit: '', format: (v: number) => v.toString(), icon: <Building2 className="h-3.5 w-3.5" />, higherBetter: true },
  { key: 'riskScore', label: 'Risk Score', unit: '/100', format: (v: number) => `${v}/100`, icon: <AlertTriangle className="h-3.5 w-3.5" />, higherBetter: false },
  { key: 'healthScore', label: 'Health Score', unit: '/100', format: (v: number) => `${v}/100`, icon: <Heart className="h-3.5 w-3.5" />, higherBetter: true },
  { key: 'educationScore', label: 'Education Score', unit: '/100', format: (v: number) => `${v}/100`, icon: <BookOpen className="h-3.5 w-3.5" />, higherBetter: true },
  { key: 'citizenSatisfaction', label: 'Citizen Satisfaction', unit: '%', format: (v: number) => `${v}%`, icon: <Smile className="h-3.5 w-3.5" />, higherBetter: true },
];

const COMPARISON_COLORS = [
  { name: 'emerald', fill: 'rgba(16, 185, 129, 0.3)', stroke: '#10b981' },
  { name: 'blue', fill: 'rgba(59, 130, 246, 0.3)', stroke: '#3b82f6' },
  { name: 'amber', fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b' },
  { name: 'purple', fill: 'rgba(168, 85, 247, 0.3)', stroke: '#a855f7' },
];

export default function EnhancedCountyComparison() {
  const [selectedCounties, setSelectedCounties] = useState<string[]>(['nrb', 'msa', 'ksm']);
  const [drillDown, setDrillDown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sideBySide');

  const selectedData = useMemo(() =>
    selectedCounties.map(code => COUNTIES.find(c => c.code === code)).filter(Boolean) as CountyData[],
    [selectedCounties]
  );

  const addCounty = (code: string) => {
    if (selectedCounties.length >= 4 || selectedCounties.includes(code)) return;
    setSelectedCounties(prev => [...prev, code]);
  };

  const removeCounty = (code: string) => {
    setSelectedCounties(prev => prev.filter(c => c !== code));
  };

  const getLeader = (dimensionKey: keyof CountyMetric) => {
    const config = DIMENSION_CONFIG.find(d => d.key === dimensionKey);
    if (!config || selectedData.length < 2) return null;
    let leader = selectedData[0];
    for (let i = 1; i < selectedData.length; i++) {
      const curr = selectedData[i].metrics[dimensionKey];
      const best = leader.metrics[dimensionKey];
      if (config.higherBetter ? curr > best : curr < best) leader = selectedData[i];
    }
    return leader.code;
  };

  const radarData = useMemo(() => {
    return ['absorptionRate', 'auditOpinion', 'riskScore', 'healthScore', 'educationScore', 'citizenSatisfaction'].map(dim => {
      const config = DIMENSION_CONFIG.find(d => d.key === dim)!;
      const entry: Record<string, any> = { metric: config.label };
      selectedData.forEach(c => { entry[c.name] = c.metrics[dim as keyof CountyMetric]; });
      return entry;
    });
  }, [selectedData]);

  const barData = useMemo(() => {
    return ['budget', 'absorptionRate', 'auditOpinion', 'activeProjects', 'healthScore', 'educationScore', 'citizenSatisfaction'].map(dim => {
      const config = DIMENSION_CONFIG.find(d => d.key === dim)!;
      const entry: Record<string, any> = { metric: config.label };
      selectedData.forEach(c => { entry[c.name] = c.metrics[dim as keyof CountyMetric]; });
      return entry;
    });
  }, [selectedData]);

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'topBudget': setSelectedCounties(['nrb', 'msa', 'nkr', 'kmb']); break;
      case 'improved': setSelectedCounties(['ug', 'ksm', 'nrb']); break;
      case 'highestRisk': setSelectedCounties(['trk', 'kkg', 'mks']); break;
    }
  };

  const exportCSV = () => {
    const headers = ['Metric', ...selectedData.map(c => c.name)];
    const rows = DIMENSION_CONFIG.map(d => [d.label, ...selectedData.map(c => c.metrics[d.key as keyof CountyMetric])]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'county-comparison.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <GitCompare className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Comparing:</p>
              {selectedData.map((c, i) => (
                <Badge key={c.code} variant="outline" className={`gap-1.5 text-sm py-1 px-2.5 border-${COMPARISON_COLORS[i].name}-300 dark:border-${COMPARISON_COLORS[i].name}-800`}>
                  <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: COMPARISON_COLORS[i].stroke }} />
                  {c.name}
                  <button onClick={() => removeCounty(c.code)} className="ml-0.5 hover:text-red-500"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
              {selectedCounties.length < 4 && (
                <Select onValueChange={addCounty}>
                  <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="+ Add county" /></SelectTrigger>
                  <SelectContent>
                    {COUNTIES.filter(c => !selectedCounties.includes(c.code)).map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset('topBudget')}>
                <DollarSign className="h-3.5 w-3.5 mr-1" /> Top 4 Budget
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('improved')}>
                <TrendingUp className="h-3.5 w-3.5 mr-1" /> Most Improved
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('highestRisk')}>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Highest Risk
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-3.5 w-3.5 mr-1" /> CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="sideBySide">Side-by-Side</TabsTrigger>
          <TabsTrigger value="radar">Radar Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Comparison</TabsTrigger>
        </TabsList>

        {/* Side-by-Side */}
        <TabsContent value="sideBySide" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedData.map((county, idx) => {
              const color = COMPARISON_COLORS[idx];
              const leaderCount = DIMENSION_CONFIG.filter(d => getLeader(d.key as keyof CountyMetric) === county.code).length;
              return (
                <Card key={county.code} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color.stroke }} />
                  <CardHeader className="pb-2 pt-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{county.name}</CardTitle>
                      {leaderCount > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                          <Trophy className="h-3 w-3 mr-1" /> Leads {leaderCount}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Pop: {county.populationFormatted} | Area: {county.areaFormatted} | Budget: {county.budgetFormatted}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {DIMENSION_CONFIG.map(dim => {
                      const val = county.metrics[dim.key as keyof CountyMetric];
                      const isLeader = getLeader(dim.key as keyof CountyMetric) === county.code;
                      return (
                        <button
                          key={dim.key}
                          onClick={() => setDrillDown(drillDown === dim.key ? null : dim.key as string)}
                          className={`w-full text-left flex items-center justify-between p-2 rounded-md transition-colors ${
                            isLeader ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900' : 'hover:bg-stone-50 dark:hover:bg-stone-900'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-400">{dim.icon}</span>
                            <span className="text-xs text-stone-600 dark:text-stone-400">{dim.label}</span>
                            {isLeader && <Crown className="h-3 w-3 text-emerald-600" />}
                          </div>
                          <span className={`text-xs font-medium ${isLeader ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'}`}>
                            {dim.format(val)}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Drill Down Modal */}
          {drillDown && (
            <Card className="mt-4 border-emerald-200 dark:border-emerald-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {DIMENSION_CONFIG.find(d => d.key === drillDown)?.label} - Historical Trend
                    </CardTitle>
                    <CardDescription>Mock historical data for {DIMENSION_CONFIG.find(d => d.key === drillDown)?.label}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setDrillDown(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={
                      ['FY 2019/20', 'FY 2020/21', 'FY 2021/22', 'FY 2022/23', 'FY 2023/24', 'FY 2024/25'].map((fy, i) => {
                        const entry: Record<string, any> = { year: fy };
                        selectedData.forEach(c => {
                          const base = c.metrics[drillDown as keyof CountyMetric];
                          entry[c.name] = Math.max(0, Math.round(base * (0.7 + Math.random() * 0.3) - i * 0.5));
                        });
                        return entry;
                      })
                    }>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      {selectedData.map((c, i) => (
                        <Bar key={c.code} dataKey={c.name} fill={COMPARISON_COLORS[i].stroke} radius={[2, 2, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Radar Chart */}
        <TabsContent value="radar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RadarIcon className="h-5 w-5 text-emerald-600" />
                Multi-Dimensional Comparison
              </CardTitle>
              <CardDescription>Overlapping radar view of selected counties (higher is better except Risk Score)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-stone-200 dark:stroke-stone-700" />
                    <PolarAngleAxis dataKey="metric" className="text-xs" tick={{ fill: 'var(--color-stone-500)', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                    {selectedData.map((c, i) => (
                      <Radar
                        key={c.code}
                        name={c.name}
                        dataKey={c.name}
                        stroke={COMPARISON_COLORS[i].stroke}
                        fill={COMPARISON_COLORS[i].fill}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bar Chart */}
        <TabsContent value="bar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Key Metrics Comparison
              </CardTitle>
              <CardDescription>Grouped bar chart for key governance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-8 pb-4">
                  {barData.map((entry, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">{entry.metric}</p>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[entry]}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200 dark:stroke-stone-700" />
                            <XAxis dataKey="metric" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            {selectedData.map((c, i) => (
                              <Bar key={c.code} dataKey={c.name} fill={COMPARISON_COLORS[i].stroke} radius={[4, 4, 0, 0]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}