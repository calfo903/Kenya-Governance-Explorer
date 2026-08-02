'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, Clock,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, RefreshCw,
  ShieldAlert, Info, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart,
  Bar, Legend,
} from 'recharts';

// --- Mock Data ---

const FINANCIAL_YEARS = ['2023/24', '2024/25', '2025/26'] as const;

type FinancialYear = (typeof FINANCIAL_YEARS)[number];

interface WaterfallEntry {
  county: string;
  allocated: number;
  disbursed: number;
  spent: number;
  unspent: number;
}

const WATERFALL_DATA: Record<FinancialYear, WaterfallEntry[]> = {
  '2023/24': [
    { county: 'Nairobi City', allocated: 42.0, disbursed: 35.2, spent: 28.1, unspent: 7.1 },
    { county: 'Kiambu', allocated: 18.0, disbursed: 15.5, spent: 13.2, unspent: 2.3 },
    { county: 'Nakuru', allocated: 17.0, disbursed: 12.8, spent: 9.4, unspent: 3.4 },
    { county: 'Kakamega', allocated: 14.0, disbursed: 9.1, spent: 6.2, unspent: 2.9 },
    { county: 'Machakos', allocated: 13.0, disbursed: 8.2, spent: 5.6, unspent: 2.6 },
    { county: 'Kilifi', allocated: 12.5, disbursed: 7.5, spent: 4.8, unspent: 2.7 },
    { county: 'Mombasa', allocated: 11.8, disbursed: 8.3, spent: 5.9, unspent: 2.4 },
    { county: 'Uasin Gishu', allocated: 11.5, disbursed: 9.2, spent: 7.8, unspent: 1.4 },
    { county: 'Turkana', allocated: 11.0, disbursed: 9.4, spent: 8.5, unspent: 0.9 },
    { county: 'Mandera', allocated: 9.5, disbursed: 8.1, spent: 7.6, unspent: 0.5 },
  ],
  '2024/25': [
    { county: 'Nairobi City', allocated: 44.5, disbursed: 36.8, spent: 30.2, unspent: 6.6 },
    { county: 'Kiambu', allocated: 19.2, disbursed: 16.8, spent: 14.5, unspent: 2.3 },
    { county: 'Nakuru', allocated: 18.1, disbursed: 14.2, spent: 10.8, unspent: 3.4 },
    { county: 'Kakamega', allocated: 14.8, disbursed: 10.2, spent: 7.1, unspent: 3.1 },
    { county: 'Machakos', allocated: 13.5, disbursed: 9.1, spent: 6.2, unspent: 2.9 },
    { county: 'Kilifi', allocated: 13.0, disbursed: 8.4, spent: 5.5, unspent: 2.9 },
    { county: 'Mombasa', allocated: 12.2, disbursed: 9.0, spent: 6.4, unspent: 2.6 },
    { county: 'Uasin Gishu', allocated: 12.0, disbursed: 10.1, spent: 8.8, unspent: 1.3 },
    { county: 'Turkana', allocated: 11.5, disbursed: 10.0, spent: 9.2, unspent: 0.8 },
    { county: 'Mandera', allocated: 10.0, disbursed: 8.8, spent: 8.3, unspent: 0.5 },
  ],
  '2025/26': [
    { county: 'Nairobi City', allocated: 46.2, disbursed: 22.5, spent: 14.8, unspent: 7.7 },
    { county: 'Kiambu', allocated: 20.0, disbursed: 11.2, spent: 8.4, unspent: 2.8 },
    { county: 'Nakuru', allocated: 19.0, disbursed: 9.8, spent: 6.5, unspent: 3.3 },
    { county: 'Kakamega', allocated: 15.2, disbursed: 6.2, spent: 3.8, unspent: 2.4 },
    { county: 'Machakos', allocated: 14.0, disbursed: 5.8, spent: 3.2, unspent: 2.6 },
    { county: 'Kilifi', allocated: 13.5, disbursed: 5.2, spent: 2.9, unspent: 2.3 },
    { county: 'Mombasa', allocated: 12.8, disbursed: 5.6, spent: 3.4, unspent: 2.2 },
    { county: 'Uasin Gishu', allocated: 12.5, disbursed: 6.5, spent: 4.8, unspent: 1.7 },
    { county: 'Turkana', allocated: 12.0, disbursed: 7.2, spent: 5.6, unspent: 1.6 },
    { county: 'Mandera', allocated: 10.5, disbursed: 5.8, spent: 4.5, unspent: 1.3 },
  ],
};

const MONTHLY_DISBURSEMENT: Record<FinancialYear, { month: string; amount: number }[]> = {
  '2023/24': [
    { month: 'Jul', amount: 12.5 }, { month: 'Aug', amount: 18.2 }, { month: 'Sep', amount: 22.1 },
    { month: 'Oct', amount: 28.4 }, { month: 'Nov', amount: 32.6 }, { month: 'Dec', amount: 15.3 },
    { month: 'Jan', amount: 19.8 }, { month: 'Feb', amount: 24.5 }, { month: 'Mar', amount: 30.2 },
    { month: 'Apr', amount: 35.1 }, { month: 'May', amount: 38.7 }, { month: 'Jun', amount: 42.3 },
  ],
  '2024/25': [
    { month: 'Jul', amount: 14.1 }, { month: 'Aug', amount: 20.5 }, { month: 'Sep', amount: 25.3 },
    { month: 'Oct', amount: 31.2 }, { month: 'Nov', amount: 35.8 }, { month: 'Dec', amount: 18.6 },
    { month: 'Jan', amount: 22.4 }, { month: 'Feb', amount: 27.1 }, { month: 'Mar', amount: 33.5 },
    { month: 'Apr', amount: 38.2 }, { month: 'May', amount: 41.9 }, { month: 'Jun', amount: 45.6 },
  ],
  '2025/26': [
    { month: 'Jul', amount: 16.2 }, { month: 'Aug', amount: 23.1 }, { month: 'Sep', amount: 28.7 },
    { month: 'Oct', amount: 34.5 }, { month: 'Nov', amount: 39.1 }, { month: 'Dec', amount: 20.8 },
    { month: 'Jan', amount: 25.3 }, { month: 'Feb', amount: 30.6 }, { month: 'Mar', amount: 36.8 },
    { month: 'Apr', amount: 0 }, { month: 'May', amount: 0 }, { month: 'Jun', amount: 0 },
  ],
};

const SECTOR_DATA = [
  { name: 'Education', value: 32, color: '#10b981' },
  { name: 'Health', value: 26, color: '#3b82f6' },
  { name: 'Infrastructure', value: 22, color: '#f59e0b' },
  { name: 'Agriculture', value: 12, color: '#8b5cf6' },
  { name: 'Governance', value: 8, color: '#ef4444' },
];

interface AnomalyAlert {
  id: number;
  severity: 'critical' | 'warning' | 'info';
  county: string;
  description: string;
  amount: string;
  timestamp: string;
}

const ANOMALY_ALERTS: AnomalyAlert[] = [
  { id: 1, severity: 'critical', county: 'Nairobi City', description: 'Disbursement rate dropped 40% in Q3 despite high allocation', amount: 'KSh 8.2B at risk', timestamp: '2 hours ago' },
  { id: 2, severity: 'critical', county: 'Kakamega', description: 'Unexplained pending bills surge exceeding FY budget by 12%', amount: 'KSh 1.8B over budget', timestamp: '4 hours ago' },
  { id: 3, severity: 'warning', county: 'Kilifi', description: 'Education sector absorption at 28% -- significantly below national average', amount: 'KSh 2.1B unspent', timestamp: '6 hours ago' },
  { id: 4, severity: 'warning', county: 'Mombasa', description: 'Infrastructure spending spike in final quarter without approved variance', amount: 'KSh 980M irregular', timestamp: '8 hours ago' },
  { id: 5, severity: 'info', county: 'Mandera', description: 'Consistent high absorption rate pattern -- potential model county for best practices', amount: '78% absorption', timestamp: '12 hours ago' },
];

// --- Helpers ---

function fmtB(n: number): string {
  if (n >= 1) return `${n.toFixed(1)}B`;
  return `${(n * 1000).toFixed(0)}M`;
}

function absorptionColor(rate: number): string {
  if (rate >= 60) return 'text-emerald-600 dark:text-emerald-400';
  if (rate >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function severityBadge(severity: string) {
  if (severity === 'critical') return <Badge variant="destructive">Critical</Badge>;
  if (severity === 'warning') return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Warning</Badge>;
  return <Badge variant="secondary">Info</Badge>;
}

const WATERFALL_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// --- Component ---

export default function BudgetTrackingDashboard() {
  const [selectedFY, setSelectedFY] = useState<FinancialYear>('2024/25');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const waterfallData = WATERFALL_DATA[selectedFY];
  const monthlyData = MONTHLY_DISBURSEMENT[selectedFY];

  const sortedByAbsorption = useMemo(() => {
    return [...waterfallData].sort((a, b) => {
      const rateA = (a.spent / a.allocated) * 100;
      const rateB = (b.spent / b.allocated) * 100;
      return rateB - rateA;
    });
  }, [waterfallData]);

  const top5 = sortedByAbsorption.slice(0, 5);
  const bottom5 = sortedByAbsorption.slice(-5).reverse();

  const totalAllocated = waterfallData.reduce((s, d) => s + d.allocated, 0);
  const totalDisbursed = waterfallData.reduce((s, d) => s + d.disbursed, 0);
  const totalSpent = waterfallData.reduce((s, d) => s + d.spent, 0);
  const totalUnspent = waterfallData.reduce((s, d) => s + d.unspent, 0);

  const stackedWaterfall = waterfallData.map((d) => ({
    county: d.county,
    Allocated: d.allocated,
    Disbursed: d.disbursed - d.spent,
    Spent: d.spent,
    Unspent: d.unspent,
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                Live Budget Tracking
              </h1>
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 ml-13">
              Real-time county budget absorption and disbursement monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedFY}
              onValueChange={(v) => setSelectedFY(v as FinancialYear)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FINANCIAL_YEARS.map((fy) => (
                  <SelectItem key={fy} value={fy}>FY {fy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Last updated: {lastUpdated.toLocaleTimeString('en-KE')}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Allocated</p>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-50 mt-1">KSh {fmtB(totalAllocated)}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">FY {selectedFY} across 10 counties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Disbursed</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">KSh {fmtB(totalDisbursed)}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{((totalDisbursed / totalAllocated) * 100).toFixed(1)}% of allocation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">KSh {fmtB(totalSpent)}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{((totalSpent / totalAllocated) * 100).toFixed(1)}% absorption rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Unspent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">KSh {fmtB(totalUnspent)}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{((totalUnspent / totalAllocated) * 100).toFixed(1)}% idle funds</p>
            </CardContent>
          </Card>
        </div>

        {/* Waterfall Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              County Budget Absorption Waterfall
            </CardTitle>
            <CardDescription>Allocated vs Disbursed vs Spent vs Unspent (KSh Billions)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedWaterfall} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="county" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [`KSh ${fmtB(value)}`, undefined]}
                  />
                  <Legend />
                  <Bar dataKey="Spent" stackId="a" fill="#10b981" />
                  <Bar dataKey="Disbursed" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Unspent" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Disbursement Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Monthly Disbursement Trend
              </CardTitle>
              <CardDescription>Cumulative disbursements across tracked counties (KSh Billions)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [`KSh ${value.toFixed(1)}B`, 'Disbursed']}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sector Breakdown Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                Sector Breakdown
              </CardTitle>
              <CardDescription>Budget allocation by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={SECTOR_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {SECTOR_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [`${value}%`, 'Share']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {SECTOR_DATA.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top/Bottom Counties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                Top 5 Counties by Absorption Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {top5.map((c) => {
                const rate = ((c.spent / c.allocated) * 100).toFixed(1);
                return (
                  <div key={c.county} className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{c.county}</span>
                        <span className={`text-sm font-semibold ${absorptionColor(parseFloat(rate))}`}>{rate}%</span>
                      </div>
                      <Progress value={parseFloat(rate)} className="h-2" />
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        KSh {fmtB(c.spent)} of {fmtB(c.allocated)} spent
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <ArrowDownRight className="w-4 h-4" />
                Bottom 5 Counties by Absorption Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bottom5.map((c) => {
                const rate = ((c.spent / c.allocated) * 100).toFixed(1);
                return (
                  <div key={c.county} className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{c.county}</span>
                        <span className={`text-sm font-semibold ${absorptionColor(parseFloat(rate))}`}>{rate}%</span>
                      </div>
                      <Progress value={parseFloat(rate)} className="h-2" />
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        KSh {fmtB(c.spent)} of {fmtB(c.allocated)} spent
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Budget Anomaly Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Budget Anomaly Alerts
            </CardTitle>
            <CardDescription>Automated flags from budget monitoring algorithms</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72">
              <div className="space-y-3">
                {ANOMALY_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50"
                  >
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                      alert.severity === 'critical'
                        ? 'text-red-500'
                        : alert.severity === 'warning'
                        ? 'text-amber-500'
                        : 'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{alert.county}</span>
                        {severityBadge(alert.severity)}
                        <span className="text-xs text-stone-400 dark:text-stone-500">{alert.timestamp}</span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">{alert.description}</p>
                      <p className="text-xs font-medium text-stone-900 dark:text-stone-100 mt-1">{alert.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
