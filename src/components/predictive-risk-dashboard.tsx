'use client';

import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown,
  Minus, ChevronRight, ChevronDown, Brain, Target, Zap, Eye,
  BarChart3, ArrowUpRight, ArrowDownRight, FileWarning, Lightbulb,
  Activity, Gauge, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ─────────────────────────────────────────────────────────
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type Trend = 'up' | 'down' | 'stable';

interface ProjectRisk {
  id: number;
  name: string;
  county: string;
  riskScore: number;
  riskLevel: RiskLevel;
  stallingProbability: number;
  keyRiskFactor: string;
  trend: Trend;
  budgetAllocated: number;
  budgetSpent: number;
  completionPct: number;
}

interface RiskForecastPoint {
  month: string;
  riskScore: number;
  stallingProb: number;
}

interface RiskFactorWeight {
  factor: string;
  weight: number;
  color: string;
  description: string;
}

interface CountyRiskRow {
  county: string;
  budgetRisk: number;
  politicalRisk: number;
  contractorRisk: number;
  environmentalRisk: number;
  corruptionRisk: number;
  overallRisk: number;
}

// ─── Constants ─────────────────────────────────────────────────────
const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#059669',
  Medium: '#ca8a04',
  High: '#ea580c',
  Critical: '#dc2626',
};

const RISK_LABELS: Record<RiskLevel, { bg: string; color: string; border: string }> = {
  Low: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700' },
  Medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', color: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700' },
  High: { bg: 'bg-orange-100 dark:bg-orange-900/40', color: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
  Critical: { bg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
};

const PIE_COLORS = ['#059669', '#ca8a04', '#ea580c', '#dc2626'];

const RISK_FACTORS: RiskFactorWeight[] = [
  { factor: 'Budget Velocity', weight: 28, color: '#059669', description: 'Rate of budget utilization and absorption patterns' },
  { factor: 'Political Interference', weight: 22, color: '#ea580c', description: 'Political disruptions affecting project continuity' },
  { factor: 'Contractor Capacity', weight: 20, color: '#2563eb', description: 'Contractor track record and technical capability' },
  { factor: 'Weather Disruptions', weight: 12, color: '#7c3aed', description: 'Seasonal weather patterns and climate risks' },
  { factor: 'Land Disputes', weight: 10, color: '#ca8a04', description: 'Land acquisition challenges and community disputes' },
  { factor: 'Corruption Indicators', weight: 8, color: '#dc2626', description: 'Procurement irregularities and audit findings' },
];

// ─── Mock Data ─────────────────────────────────────────────────────
const PROJECTS: ProjectRisk[] = [
  { id: 1, name: 'Nakuru-Nyahururu Road Dualing', county: 'Nakuru', riskScore: 78, riskLevel: 'High', stallingProbability: 72, keyRiskFactor: 'Budget Velocity', trend: 'up', budgetAllocated: 4200, budgetSpent: 1680, completionPct: 40 },
  { id: 2, name: 'Mombasa Dongo Kundu Bypass Phase II', county: 'Mombasa', riskScore: 85, riskLevel: 'Critical', stallingProbability: 88, keyRiskFactor: 'Land Disputes', trend: 'up', budgetAllocated: 8700, budgetSpent: 3480, completionPct: 40 },
  { id: 3, name: 'Kisumu Waste Management Plant', county: 'Kisumu', riskScore: 45, riskLevel: 'Medium', stallingProbability: 35, keyRiskFactor: 'Contractor Capacity', trend: 'stable', budgetAllocated: 1800, budgetSpent: 810, completionPct: 45 },
  { id: 4, name: 'Garissa Solar Power Station', county: 'Garissa', riskScore: 32, riskLevel: 'Low', stallingProbability: 18, keyRiskFactor: 'Weather Disruptions', trend: 'down', budgetAllocated: 3200, budgetSpent: 2400, completionPct: 75 },
  { id: 5, name: 'Machakos Level 4 Hospital Upgrade', county: 'Machakos', riskScore: 67, riskLevel: 'High', stallingProbability: 58, keyRiskFactor: 'Political Interference', trend: 'up', budgetAllocated: 950, budgetSpent: 285, completionPct: 30 },
  { id: 6, name: 'Turkana Irrigation Scheme Phase III', county: 'Turkana', riskScore: 91, riskLevel: 'Critical', stallingProbability: 92, keyRiskFactor: 'Corruption Indicators', trend: 'up', budgetAllocated: 5600, budgetSpent: 1120, completionPct: 20 },
  { id: 7, name: 'Uasin Gishu Modern Abattoir', county: 'Uasin Gishu', riskScore: 25, riskLevel: 'Low', stallingProbability: 12, keyRiskFactor: 'Budget Velocity', trend: 'down', budgetAllocated: 650, budgetSpent: 552, completionPct: 85 },
  { id: 8, name: 'Kakamega Water Tower Extension', county: 'Kakamega', riskScore: 58, riskLevel: 'Medium', stallingProbability: 45, keyRiskFactor: 'Land Disputes', trend: 'stable', budgetAllocated: 2100, budgetSpent: 1050, completionPct: 50 },
  { id: 9, name: 'Nairobi Governor Office Complex', county: 'Nairobi', riskScore: 72, riskLevel: 'High', stallingProbability: 65, keyRiskFactor: 'Corruption Indicators', trend: 'up', budgetAllocated: 15000, budgetSpent: 6000, completionPct: 40 },
  { id: 10, name: 'Mandera Border Market Construction', county: 'Mandera', riskScore: 83, riskLevel: 'Critical', stallingProbability: 80, keyRiskFactor: 'Political Interference', trend: 'up', budgetAllocated: 420, budgetSpent: 84, completionPct: 20 },
  { id: 11, name: 'Kiambu Smart Market Complex', county: 'Kiambu', riskScore: 38, riskLevel: 'Low', stallingProbability: 22, keyRiskFactor: 'Contractor Capacity', trend: 'down', budgetAllocated: 1200, budgetSpent: 960, completionPct: 80 },
  { id: 12, name: 'Narok Water Treatment Plant', county: 'Narok', riskScore: 55, riskLevel: 'Medium', stallingProbability: 42, keyRiskFactor: 'Weather Disruptions', trend: 'stable', budgetAllocated: 780, budgetSpent: 351, completionPct: 45 },
  { id: 13, name: 'Kajiado Technical Institute', county: 'Kajiado', riskScore: 29, riskLevel: 'Low', stallingProbability: 15, keyRiskFactor: 'Budget Velocity', trend: 'down', budgetAllocated: 560, budgetSpent: 504, completionPct: 90 },
  { id: 14, name: 'Marsabit Wind Power Feasibility', county: 'Marsabit', riskScore: 70, riskLevel: 'High', stallingProbability: 60, keyRiskFactor: 'Land Disputes', trend: 'up', budgetAllocated: 2800, budgetSpent: 560, completionPct: 20 },
  { id: 15, name: 'Bungoma Tea Processing Factory', county: 'Bungoma', riskScore: 48, riskLevel: 'Medium', stallingProbability: 38, keyRiskFactor: 'Contractor Capacity', trend: 'stable', budgetAllocated: 1800, budgetSpent: 720, completionPct: 40 },
  { id: 16, name: 'Isiolo Resort City Phase II', county: 'Isiolo', riskScore: 87, riskLevel: 'Critical', stallingProbability: 85, keyRiskFactor: 'Political Interference', trend: 'up', budgetAllocated: 12000, budgetSpent: 2400, completionPct: 20 },
  { id: 17, name: 'Lamu Port Access Road', county: 'Lamu', riskScore: 62, riskLevel: 'High', stallingProbability: 52, keyRiskFactor: 'Weather Disruptions', trend: 'stable', budgetAllocated: 3500, budgetSpent: 1400, completionPct: 40 },
  { id: 18, name: 'Meru Milk Processing Plant', county: 'Meru', riskScore: 35, riskLevel: 'Low', stallingProbability: 20, keyRiskFactor: 'Budget Velocity', trend: 'down', budgetAllocated: 900, budgetSpent: 765, completionPct: 85 },
  { id: 19, name: 'Kitui Cotton Ginnery Revival', county: 'Kitui', riskScore: 76, riskLevel: 'High', stallingProbability: 68, keyRiskFactor: 'Corruption Indicators', trend: 'up', budgetAllocated: 1100, budgetSpent: 275, completionPct: 25 },
  { id: 20, name: 'Siaya Fish Processing Hub', county: 'Siaya', riskScore: 52, riskLevel: 'Medium', stallingProbability: 40, keyRiskFactor: 'Budget Velocity', trend: 'stable', budgetAllocated: 750, budgetSpent: 337, completionPct: 45 },
];

const generateForecast = (project: ProjectRisk): RiskForecastPoint[] => {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const base = project.riskScore;
  const trend = project.trend;
  return months.map((month, i) => {
    const delta = trend === 'up' ? (i + 1) * (2 + Math.random() * 4) : trend === 'down' ? -(i + 1) * (1.5 + Math.random() * 3) : (Math.random() - 0.5) * 4;
    const score = Math.min(100, Math.max(5, Math.round(base + delta)));
    const stall = Math.min(99, Math.max(5, Math.round(project.stallingProbability + delta * 0.9)));
    return { month, riskScore: score, stallingProb: stall };
  });
};

const COUNTY_RISK_DATA: CountyRiskRow[] = [
  { county: 'Nakuru', budgetRisk: 72, politicalRisk: 45, contractorRisk: 38, environmentalRisk: 25, corruptionRisk: 55, overallRisk: 52 },
  { county: 'Mombasa', budgetRisk: 80, politicalRisk: 60, contractorRisk: 52, environmentalRisk: 70, corruptionRisk: 65, overallRisk: 66 },
  { county: 'Kisumu', budgetRisk: 45, politicalRisk: 35, contractorRisk: 40, environmentalRisk: 30, corruptionRisk: 38, overallRisk: 38 },
  { county: 'Garissa', budgetRisk: 55, politicalRisk: 50, contractorRisk: 45, environmentalRisk: 60, corruptionRisk: 42, overallRisk: 50 },
  { county: 'Machakos', budgetRisk: 65, politicalRisk: 72, contractorRisk: 48, environmentalRisk: 35, corruptionRisk: 58, overallRisk: 58 },
  { county: 'Turkana', budgetRisk: 88, politicalRisk: 55, contractorRisk: 70, environmentalRisk: 65, corruptionRisk: 82, overallRisk: 74 },
  { county: 'Uasin Gishu', budgetRisk: 30, politicalRisk: 25, contractorRisk: 20, environmentalRisk: 28, corruptionRisk: 22, overallRisk: 25 },
  { county: 'Kakamega', budgetRisk: 58, politicalRisk: 42, contractorRisk: 55, environmentalRisk: 30, corruptionRisk: 48, overallRisk: 47 },
  { county: 'Nairobi', budgetRisk: 70, politicalRisk: 68, contractorRisk: 35, environmentalRisk: 22, corruptionRisk: 75, overallRisk: 55 },
  { county: 'Mandera', budgetRisk: 82, politicalRisk: 78, contractorRisk: 65, environmentalRisk: 55, corruptionRisk: 60, overallRisk: 68 },
  { county: 'Kiambu', budgetRisk: 28, politicalRisk: 22, contractorRisk: 30, environmentalRisk: 20, corruptionRisk: 25, overallRisk: 25 },
  { county: 'Narok', budgetRisk: 50, politicalRisk: 48, contractorRisk: 42, environmentalRisk: 55, corruptionRisk: 40, overallRisk: 47 },
  { county: 'Kajiado', budgetRisk: 25, politicalRisk: 20, contractorRisk: 18, environmentalRisk: 30, corruptionRisk: 20, overallRisk: 22 },
  { county: 'Isiolo', budgetRisk: 85, politicalRisk: 75, contractorRisk: 68, environmentalRisk: 60, corruptionRisk: 70, overallRisk: 72 },
  { county: 'Marsabit', budgetRisk: 75, politicalRisk: 58, contractorRisk: 62, environmentalRisk: 72, corruptionRisk: 55, overallRisk: 64 },
];

const AI_RECOMMENDATIONS = [
  {
    id: 1,
    priority: 'Critical' as const,
    title: 'Immediately intervene in Turkana Irrigation Scheme Phase III',
    description: 'Project shows 92% stalling probability with 20% completion and severe corruption indicators. Recommend CoB audit intervention and EACC referral.',
    county: 'Turkana',
  },
  {
    id: 2,
    priority: 'High' as const,
    title: 'Review Mombasa Dongo Kundu Bypass land acquisition process',
    description: 'Land disputes are the primary risk factor. Recommend fast-tracking title verification and community engagement to prevent further delays.',
    county: 'Mombasa',
  },
  {
    id: 3,
    priority: 'High' as const,
    title: 'Escrow funding mechanism for Isiolo Resort City Phase II',
    description: 'Political interference risk is extremely high (75/100). Recommend milestone-based disbursement to ensure continuity regardless of political changes.',
    county: 'Isiolo',
  },
  {
    id: 4,
    priority: 'Medium' as const,
    title: 'Strengthen contractor vetting for Marsabit Wind Power project',
    description: 'Contractor capacity scored 62/100. Recommend requiring additional technical documentation and performance bonds before proceeding.',
    county: 'Marsabit',
  },
  {
    id: 5,
    priority: 'Low' as const,
    title: 'Replicate Uasin Gishu abattoir project management model',
    description: 'This project demonstrates best practices with 85% completion and low risk scores. Recommend using its governance model as a template for other county projects.',
    county: 'Uasin Gishu',
  },
];

const MITIGATION_STRATEGIES: Record<string, string[]> = {
  'Budget Velocity': [
    'Implement quarterly budget absorption targets with CoB oversight',
    'Establish automated budget tracking dashboards per project',
    'Introduce penalty clauses for contractors with slow utilization rates',
    'Require monthly financial progress reports from project managers',
  ],
  'Political Interference': [
    'Establish independent project oversight committees with CSO representation',
    'Implement milestone-based funding that transcends political cycles',
    'Create legally binding project continuity agreements',
    'Regular public accountability forums on project status',
  ],
  'Contractor Capacity': [
    'Strengthen pre-qualification criteria for major tenders',
    'Require verified track record of similar-scale projects',
    'Mandate performance bonds of at least 15% of contract value',
    'Implement joint venture requirements for contracts above KES 500M',
  ],
  'Weather Disruptions': [
    'Incorporate climate risk assessments in project design phase',
    'Build weather contingency allowances (10-15%) into project budgets',
    'Schedule critical works during favorable weather windows',
    'Develop emergency response plans for extreme weather events',
  ],
  'Land Disputes': [
    'Conduct thorough due diligence before project commencement',
    'Engage community leaders and affected residents early in process',
    'Allocate budget for compensation and resettlement where needed',
    'Partner with National Land Commission for title verification',
  ],
  'Corruption Indicators': [
    'Strengthen procurement transparency through public e-procurement',
    'Implement whistleblower protection for project staff',
    'Request proactive EACC involvement for high-value projects',
    'Mandate independent audit at each project milestone',
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────
function getTrendIcon(trend: Trend) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-emerald-500" />;
  return <Minus className="h-4 w-4 text-stone-400" />;
}

function getRiskCellColor(value: number): string {
  if (value >= 75) return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300';
  if (value >= 50) return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300';
  if (value >= 25) return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300';
  return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case 'Critical': return { bg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700', icon: <AlertCircle className="h-3.5 w-3.5" /> };
    case 'High': return { bg: 'bg-orange-100 dark:bg-orange-900/40', color: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
    case 'Medium': return { bg: 'bg-yellow-100 dark:bg-yellow-900/40', color: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
    default: return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700', icon: <ShieldCheck className="h-3.5 w-3.5" /> };
  }
}

// ─── Component ────────────────────────────────────────────────────
export default function PredictiveRiskDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1);
  const [sortField, setSortField] = useState<'riskScore' | 'stallingProbability' | 'name'>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => PROJECTS.find(p => p.id === selectedProjectId) || null,
    [selectedProjectId],
  );

  const forecastData = useMemo(
    () => selectedProject ? generateForecast(selectedProject) : [],
    [selectedProject],
  );

  const pieData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    PROJECTS.forEach(p => counts[p.riskLevel]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const topProjects = useMemo(() => {
    const filtered = riskLevelFilter === 'all' ? [...PROJECTS] : PROJECTS.filter(p => p.riskLevel === riskLevelFilter);
    return filtered.sort((a, b) => {
      const aVal = sortField === 'riskScore' ? a.riskScore : sortField === 'stallingProbability' ? a.stallingProbability : a.name;
      const bVal = sortField === 'riskScore' ? b.riskScore : sortField === 'stallingProbability' ? b.stallingProbability : b.name;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }).slice(0, 10);
  }, [sortField, sortDir, riskLevelFilter]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIndicator = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3 ml-0.5" /> : <ArrowDownRight className="h-3 w-3 ml-0.5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Activity className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Predictive Risk Dashboard</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">AI-powered project risk assessment across {PROJECTS.length} projects in {new Set(PROJECTS.map(p => p.county)).size} counties</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Brain className="h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>
      </div>

      {/* Overview Stats + Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
              <BarChart3 className="h-4 w-4 text-stone-600 dark:text-stone-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{PROJECTS.length}</p>
              <p className="text-xs text-stone-500">Total Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <FileWarning className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{PROJECTS.filter(p => p.riskLevel === 'Critical').length}</p>
              <p className="text-xs text-stone-500">Critical Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{PROJECTS.filter(p => p.riskLevel === 'Low').length}</p>
              <p className="text-xs text-stone-500">Low Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Gauge className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{Math.round(PROJECTS.reduce((s, p) => s + p.stallingProbability, 0) / PROJECTS.length)}%</p>
              <p className="text-xs text-stone-500">Avg Stall Prob</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie */}
        <Card className="border-stone-200 dark:border-stone-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-stone-800 dark:text-stone-200">Risk Distribution</CardTitle>
            <CardDescription>Project risk level breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs text-stone-600 dark:text-stone-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Forecast Area Chart */}
        <Card className="lg:col-span-2 border-stone-200 dark:border-stone-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-stone-800 dark:text-stone-200">Risk Forecast</CardTitle>
                <CardDescription>6-month prediction for {selectedProject?.name || 'select a project'}</CardDescription>
              </div>
              <Select value={String(selectedProjectId || '')} onValueChange={v => setSelectedProjectId(Number(v))}>
                <SelectTrigger className="h-8 w-[220px] text-xs border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECTS.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="stallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" className="dark:stroke-stone-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#78716c" className="dark:stroke-stone-500" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#78716c" className="dark:stroke-stone-500" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    iconType="line"
                    iconSize={12}
                    formatter={(value: string) => <span className="text-xs text-stone-600 dark:text-stone-400">{value}</span>}
                  />
                  <Area type="monotone" dataKey="riskScore" stroke="#dc2626" fill="url(#riskGradient)" strokeWidth={2} name="Risk Score" />
                  <Area type="monotone" dataKey="stallingProb" stroke="#ea580c" fill="url(#stallGradient)" strokeWidth={2} name="Stalling %" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center">
                <p className="text-sm text-stone-400">Select a project to view risk forecast</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 10 At-Risk Projects Table */}
      <Card className="border-stone-200 dark:border-stone-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-stone-800 dark:text-stone-200">Top 10 At-Risk Projects</CardTitle>
              <CardDescription>Projects ranked by risk assessment</CardDescription>
            </div>
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-stone-500">#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-stone-500">
                    <button onClick={() => handleSort('name')} className="flex items-center hover:text-stone-800">
                      Project <SortIndicator field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-stone-500">County</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-stone-500">
                    <button onClick={() => handleSort('riskScore')} className="flex items-center hover:text-stone-800">
                      Risk Score <SortIndicator field="riskScore" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-stone-500">
                    <button onClick={() => handleSort('stallingProbability')} className="flex items-center hover:text-stone-800">
                      Stall % <SortIndicator field="stallingProbability" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-stone-500">Key Factor</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-stone-500">Trend</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-stone-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {topProjects.map((project, i) => (
                  <tr
                    key={project.id}
                    className={`hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition-colors ${selectedProjectId === project.id ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : ''}`}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <td className="px-4 py-2.5 text-xs text-stone-400">{i + 1}</td>
                    <td className="px-4 py-2.5">
                      <p className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate max-w-[200px]">{project.name}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{project.county}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Progress value={project.riskScore} className="h-1.5 w-16" />
                        <span className={`text-xs font-bold ${project.riskScore >= 75 ? 'text-red-600' : project.riskScore >= 50 ? 'text-orange-600' : project.riskScore >= 25 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                          {project.riskScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-semibold ${project.stallingProbability >= 70 ? 'text-red-600' : project.stallingProbability >= 40 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {project.stallingProbability}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-stone-600 dark:text-stone-400">{project.keyRiskFactor}</td>
                    <td className="px-4 py-2.5 text-center">{getTrendIcon(project.trend)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400">
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factor Analysis */}
        <Card className="border-stone-200 dark:border-stone-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-stone-800 dark:text-stone-200">Risk Factor Analysis</CardTitle>
            <CardDescription>Relative weight of each risk factor in the AI model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {RISK_FACTORS.map(factor => (
              <div key={factor.factor}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: factor.color }} />
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200">{factor.factor}</span>
                  </div>
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{factor.weight}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${factor.weight}%`, backgroundColor: factor.color }}
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">{factor.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-stone-200 dark:border-stone-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-stone-800 dark:text-stone-200">
              <Brain className="h-4 w-4 text-emerald-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Actionable recommendations based on risk analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI_RECOMMENDATIONS.map(rec => {
              const pConfig = getPriorityConfig(rec.priority);
              return (
                <div key={rec.id} className="p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg shrink-0 ${pConfig.bg}`}>
                      {pConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] px-1.5 py-0 ${pConfig.bg} ${pConfig.color} border ${pConfig.border}`}>
                          {rec.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {rec.county}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 mb-0.5">{rec.title}</p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* County Risk Heatmap */}
      <Card className="border-stone-200 dark:border-stone-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-stone-800 dark:text-stone-200">County Risk Heatmap</CardTitle>
          <CardDescription>Risk dimensions by county (color-coded severity)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-stone-500">County</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-stone-500">Budget</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-stone-500">Political</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-stone-500">Contractor</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-stone-500">Environment</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-stone-500">Corruption</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-stone-500">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {COUNTY_RISK_DATA.sort((a, b) => b.overallRisk - a.overallRisk).map(row => (
                  <tr key={row.county} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium text-stone-800 dark:text-stone-200">{row.county}</td>
                    {[
                      { val: row.budgetRisk, key: 'budgetRisk' },
                      { val: row.politicalRisk, key: 'politicalRisk' },
                      { val: row.contractorRisk, key: 'contractorRisk' },
                      { val: row.environmentalRisk, key: 'environmentalRisk' },
                      { val: row.corruptionRisk, key: 'corruptionRisk' },
                    ].map(({ val, key }) => (
                      <td key={key} className="text-center px-4 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getRiskCellColor(val)}`}>
                          {val}
                        </span>
                      </td>
                    ))}
                    <td className="text-center px-4 py-2.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${getRiskCellColor(row.overallRisk)}`}>
                        {row.overallRisk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-4 justify-center">
              <span className="text-[10px] text-stone-400">Risk Scale:</span>
              {[
                { label: 'Low (0-24)', cls: 'bg-emerald-100 dark:bg-emerald-900/40' },
                { label: 'Medium (25-49)', cls: 'bg-yellow-100 dark:bg-yellow-900/40' },
                { label: 'High (50-74)', cls: 'bg-orange-100 dark:bg-orange-900/40' },
                { label: 'Critical (75-100)', cls: 'bg-red-100 dark:bg-red-900/40' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${item.cls}`} />
                  <span className="text-[10px] text-stone-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mitigation Strategies */}
      <Card className="border-stone-200 dark:border-stone-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-stone-800 dark:text-stone-200">
            <Target className="h-4 w-4 text-emerald-600" />
            Risk Mitigation Strategies
          </CardTitle>
          <CardDescription>Recommended strategies for selected project&apos;s key risk factor</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedProject ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">{selectedProject.name}</span>
                  <Badge className={`text-[10px] px-1.5 py-0 ${RISK_LABELS[selectedProject.riskLevel].bg} ${RISK_LABELS[selectedProject.riskLevel].color} border ${RISK_LABELS[selectedProject.riskLevel].border}`}>
                    {selectedProject.riskLevel} Risk
                  </Badge>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Primary risk factor: <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedProject.keyRiskFactor}</span> | Risk Score: {selectedProject.riskScore}/100 | Stalling: {selectedProject.stallingProbability}%
                </p>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Mitigation for: {selectedProject.keyRiskFactor}
                  </h4>
                </div>
                <div className="space-y-2">
                  {(MITIGATION_STRATEGIES[selectedProject.keyRiskFactor] || []).map((strategy, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-600">{i + 1}</span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{strategy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <button
                  onClick={() => setExpandedStrategy(expandedStrategy === selectedProject.keyRiskFactor ? null : selectedProject.keyRiskFactor)}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 mb-2"
                >
                  {expandedStrategy === selectedProject.keyRiskFactor ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  View all risk factor strategies
                </button>
                {expandedStrategy === selectedProject.keyRiskFactor && (
                  <div className="space-y-4 mt-2">
                    {Object.entries(MITIGATION_STRATEGIES).map(([factor, strategies]) => (
                      <div key={factor} className="p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_FACTORS.find(f => f.factor === factor)?.color || '#78716c' }} />
                          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">{factor}</span>
                          <span className="text-[10px] text-stone-400">({RISK_FACTORS.find(f => f.factor === factor)?.weight || 0}% weight)</span>
                        </div>
                        <ul className="space-y-1">
                          {strategies.map((s, j) => (
                            <li key={j} className="text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">--</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-stone-400">Select a project from the table above to view mitigation strategies</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
