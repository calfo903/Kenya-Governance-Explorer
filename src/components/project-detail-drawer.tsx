'use client';
import React, { useState, useMemo } from 'react';
import { ProjectRecord, AuditTimelineEvent, RiskForecast, CitizenAuditorStats, WeatherData } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield, Clock, AlertTriangle, CheckCircle2, XCircle, FileText,
  ExternalLink, Eye, Share2, Bell, Flag, MapPin, Thermometer,
  TrendingUp, TrendingDown, Users, Cloud, Gauge, Send, Copy,
  ChevronRight, GitCompare, Target, Zap, FileCheck, Megaphone,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from 'sonner';

// ─── Helper Types ────────────────────────────────────────────────

type EventSeverity = 'info' | 'warning' | 'critical' | 'success';
type EventType = AuditTimelineEvent['type'];

interface TimelineEventProps {
  event: AuditTimelineEvent;
  isFirstLifecycleStart: boolean;
  isLastLifecycleEnd: boolean;
}

// ─── Utility Functions ──────────────────────────────────────────

function getSeverityColor(severity: EventSeverity | undefined): { bg: string; border: string; text: string; dot: string } {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', dot: 'bg-red-500' };
    case 'warning':
      return { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', dot: 'bg-amber-500' };
    case 'success':
      return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', dot: 'bg-emerald-500' };
    case 'info':
    default:
      return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', dot: 'bg-blue-500' };
  }
}

function getEventIcon(type: EventType) {
  switch (type) {
    case 'milestone': return <Target className="h-3.5 w-3.5" />;
    case 'audit': return <FileCheck className="h-3.5 w-3.5" />;
    case 'budget': return <GitCompare className="h-3.5 w-3.5" />;
    case 'finding': return <AlertTriangle className="h-3.5 w-3.5" />;
    case 'action': return <Zap className="h-3.5 w-3.5" />;
    case 'lifecycle_start': return <Flag className="h-3.5 w-3.5" />;
    case 'lifecycle_end': return <CheckCircle2 className="h-3.5 w-3.5" />;
    default: return <Clock className="h-3.5 w-3.5" />;
  }
}

function getEventLabel(type: EventType): string {
  switch (type) {
    case 'milestone': return 'Milestone';
    case 'audit': return 'Audit';
    case 'budget': return 'Budget';
    case 'finding': return 'Finding';
    case 'action': return 'Action';
    case 'lifecycle_start': return 'Lifecycle Start';
    case 'lifecycle_end': return 'Lifecycle End';
    default: return 'Event';
  }
}

function getStatusBadgeStyle(status: ProjectRecord['status']): string {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
    case 'active': return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
    case 'planning': return 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200';
    case 'stalled': return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
    case 'suspended': return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
    default: return 'bg-stone-100 text-stone-700 border-stone-300';
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `KES ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(1)}K`;
  return `KES ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getRiskLevel(score: number | undefined): { label: string; color: string; textColor: string } {
  if (score === undefined) return { label: 'N/A', color: 'bg-stone-200', textColor: 'text-stone-600' };
  if (score >= 75) return { label: 'High', color: 'bg-red-500', textColor: 'text-red-600' };
  if (score >= 50) return { label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-600' };
  return { label: 'Low', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
}

// ─── Sub-Components ──────────────────────────────────────────────

function RiskScoreGauge({ score }: { score: number | undefined }) {
  const risk = getRiskLevel(score);
  const displayScore = score !== undefined ? score : 0;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-stone-200"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={risk.color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${risk.textColor}`}>
            {score !== undefined ? score : '—'}
          </span>
          <span className="text-[10px] text-stone-500">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-semibold ${risk.textColor}`}>{risk.label} Risk</span>
    </div>
  );
}

function TimelineEventItem({ event, isFirstLifecycleStart, isLastLifecycleEnd }: TimelineEventProps) {
  const colors = getSeverityColor(event.severity);
  const icon = getEventIcon(event.type);
  const label = getEventLabel(event.type);
  const isSpecial = isFirstLifecycleStart || isLastLifecycleEnd;

  return (
    <div className={`relative flex gap-4 ${isSpecial ? 'py-1' : ''}`}>
      {/* Vertical connector line */}
      <div className="flex flex-col items-center">
        <div
          className={`shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
            isSpecial
              ? `w-10 h-10 ${colors.bg} ${colors.border}`
              : `w-8 h-8 ${colors.bg} ${colors.border}`
          }`}
        >
          <span className={colors.text}>{icon}</span>
        </div>
        <div className="w-0.5 flex-1 bg-emerald-200 min-h-4" />
      </div>

      {/* Event content */}
      <div className={`flex-1 pb-6 ${isSpecial ? '-mt-0.5' : '-mt-0.5'}`}>
        {/* Date & verification row */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium ${isSpecial ? 'text-stone-800 text-sm' : 'text-stone-500'}`}>
            {formatDate(event.date)}
          </span>

          {/* Verification status badge */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5">
                  {event.verificationStatus === 'verified' ? (
                    <span className="h-4 w-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                    </span>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {event.verificationStatus === 'verified' ? 'Verified by auditor' : 'Pending verification'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Event type badge */}
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-5 ${colors.bg} ${colors.text} ${colors.border} border`}
          >
            {label}
          </Badge>
        </div>

        {/* Title */}
        <h4 className={`font-semibold leading-tight ${isSpecial ? 'text-base' : 'text-sm'} text-stone-900`}>
          {event.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-stone-600 mt-1 leading-relaxed max-w-lg">
          {event.description}
        </p>

        {/* Source citation */}
        {event.source && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-stone-400">
            <FileText className="h-3 w-3 mt-0.5 shrink-0" />
            <span>
              Source: {event.source.reportTitle} ({event.source.financialYear})
              {event.source.url && (
                <a
                  href={event.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-0.5 text-stone-500 hover:text-stone-700 transition-colors"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetProgressBar({ allocated, spent }: { allocated: number; spent: number }) {
  const percentage = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
  const isOverBudget = spent > allocated;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-500">Budget Utilization</span>
        <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-stone-700'}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2.5 ${isOverBudget ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'}`}
      />
      <div className="flex items-center justify-between text-[11px] text-stone-500">
        <span>Spent: {formatCurrency(spent)}</span>
        <span>Allocated: {formatCurrency(allocated)}</span>
      </div>
    </div>
  );
}

function ProjectVelocityChart({ timeline }: { timeline: AuditTimelineEvent[] }) {
  const chartData = useMemo(() => {
    const monthMap = new Map<string, number>();
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthMap.set(key, 0);
    }

    timeline.forEach((event) => {
      const eventDate = new Date(event.date);
      const key = eventDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      }
    });

    return Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      events: count,
    }));
  }, [timeline]);

  const maxEvents = Math.max(...chartData.map((d) => d.events), 1);

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          Audit Velocity
        </CardTitle>
        <CardDescription className="text-[10px]">Events per month (last 6 months)</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#78716c' }}
                axisLine={{ stroke: '#d6d3d1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, Math.max(maxEvents + 1, 4)]}
                tick={{ fontSize: 10, fill: '#78716c' }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #d6d3d1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  padding: '4px 8px',
                }}
                formatter={(value: number) => [`${value} event${value !== 1 ? 's' : ''}`, 'Count']}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function WeatherWidgetPlaceholder({ locationName }: { locationName: string }) {
  return (
    <Card className="border-stone-200 bg-gradient-to-br from-stone-50 to-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-stone-500" />
          {locationName}
        </CardTitle>
        <CardDescription className="text-[10px]">Weather at project site</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
              <Cloud className="h-5 w-5 text-stone-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-stone-800">—°C</div>
              <div className="text-[10px] text-stone-500">Conditions unavailable</div>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] text-stone-400">
              <Thermometer className="h-2.5 w-2.5" />
              <span>Humidity: —%</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-stone-400">
              <span className="inline-block h-2 w-2 rounded-full bg-stone-300" />
              <span>Wind: — km/h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskForecastPanel({ project }: { project: ProjectRecord }) {
  const forecast = useMemo((): RiskForecast => {
    const riskScore = project.riskScore ?? 30;
    const riskFactorCount = project.riskFactors?.length ?? 0;
    const stallingProbability = Math.min(
      95,
      Math.max(5, Math.round((riskScore * 0.6) + (riskFactorCount * 8)))
    );
    const budgetVelocity = project.budgetAllocated > 0
      ? Math.round((project.budgetSpent / project.budgetAllocated) * 100)
      : 0;

    return {
      projectId: project.id,
      stallingProbability,
      factors: [
        {
          name: 'Budget Absorption',
          weight: budgetVelocity > 80 ? 0.3 : budgetVelocity > 50 ? 0.15 : 0.35,
          status: budgetVelocity > 80 ? 'normal' : budgetVelocity > 50 ? 'concerning' : 'critical',
        },
        {
          name: 'Risk Score',
          weight: riskScore > 60 ? 0.35 : riskScore > 30 ? 0.2 : 0.1,
          status: riskScore > 60 ? 'critical' : riskScore > 30 ? 'concerning' : 'normal',
        },
        {
          name: 'Risk Factor Count',
          weight: Math.min(riskFactorCount * 0.1, 0.3),
          status: riskFactorCount > 3 ? 'critical' : riskFactorCount > 1 ? 'concerning' : 'normal',
        },
      ],
      predictedCompletionDate: project.endDate,
      budgetVelocity,
      milestoneCompletionRate: project.status === 'completed' ? 100 : project.status === 'active' ? 65 : 30,
      recommendation:
        stallingProbability > 70
          ? 'Immediate intervention recommended. Escalate to OAG for priority review.'
          : stallingProbability > 40
          ? 'Monitor closely. Budget absorption below target — engage county assembly oversight.'
          : 'Project on track. Continue routine monitoring and citizen auditing.',
    };
  }, [project]);

  const stallingColor =
    forecast.stallingProbability > 70
      ? 'text-red-600'
      : forecast.stallingProbability > 40
      ? 'text-amber-600'
      : 'text-emerald-600';

  const stallingBarColor =
    forecast.stallingProbability > 70
      ? 'bg-red-500'
      : forecast.stallingProbability > 40
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-amber-600" />
          Risk Forecast
        </CardTitle>
        <CardDescription className="text-[10px]">Stalling probability analysis</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Stalling probability */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-stone-600">Stalling Probability</span>
              <span className={`font-bold ${stallingColor}`}>
                {forecast.stallingProbability}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${stallingBarColor}`}
                style={{ width: `${forecast.stallingProbability}%` }}
              />
            </div>
          </div>
        </div>

        {/* Factors */}
        <div className="space-y-1.5">
          {forecast.factors.map((factor) => (
            <div key={factor.name} className="flex items-center justify-between text-[11px]">
              <span className="text-stone-500">{factor.name}</span>
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 h-4 border ${
                  factor.status === 'critical'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : factor.status === 'concerning'
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}
              >
                {(factor.weight * 100).toFixed(0)}% weight
              </Badge>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="mt-2 p-2 rounded-md bg-stone-50 border border-stone-200">
          <p className="text-[10px] text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-700">AI Recommendation: </span>
            {forecast.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CitizenAuditorWidget({ project }: { project: ProjectRecord }) {
  // Simulated stats derived from project data
  const stats: CitizenAuditorStats = useMemo(() => ({
    userId: 'simulated',
    photosVerified: project.citizenPhotos ?? Math.floor(Math.random() * 20),
    rank: Math.floor(Math.random() * 50) + 1,
    totalParticipants: 234,
    badges: project.status === 'completed' ? ['Auditor', 'Verified', 'Watcher'] : ['Auditor', 'Watcher'],
    recentActivity: [
      {
        date: new Date().toISOString().split('T')[0],
        action: 'Submitted photo evidence',
        county: project.countyCode,
      },
    ],
  }), [project]);

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-blue-600" />
          Citizen Auditor Stats
        </CardTitle>
        <CardDescription className="text-[10px]">Community monitoring activity</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-md bg-stone-50 border border-stone-100 text-center">
            <div className="text-lg font-bold text-stone-800">{stats.photosVerified}</div>
            <div className="text-[10px] text-stone-500">Photos Verified</div>
          </div>
          <div className="p-2 rounded-md bg-stone-50 border border-stone-100 text-center">
            <div className="text-lg font-bold text-stone-800">
              #{stats.rank}
            </div>
            <div className="text-[10px] text-stone-500">
              of {stats.totalParticipants}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {stats.badges.map((badge) => (
            <Badge
              key={badge}
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 border-blue-200 bg-blue-50 text-blue-700"
            >
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              {badge}
            </Badge>
          ))}
        </div>

        {/* Recent activity */}
        <div className="text-[10px] text-stone-500 flex items-start gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
          <span>
            <span className="text-stone-700">{stats.recentActivity[0]?.action ?? 'No recent activity'}</span>
            {' — '}
            {formatDate(stats.recentActivity[0]?.date ?? '')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function OversightActionHub({ project }: { project: ProjectRecord }) {
  const [copied, setCopied] = useState(false);
  const [tracked, setTracked] = useState(false);

  const handleShareReport = async () => {
    const summary = [
      `📋 ${project.name}`,
      `Status: ${project.status.toUpperCase()}`,
      `County: ${project.countyCode}`,
      `Budget: ${formatCurrency(project.budgetAllocated)} allocated, ${formatCurrency(project.budgetSpent)} spent`,
      `Risk Score: ${project.riskScore ?? 'N/A'}/100`,
      `Agency: ${project.implementingAgency}`,
      project.riskFactors?.length
        ? `Risk Factors: ${project.riskFactors.join(', ')}`
        : '',
      `Source: Kenya Governance Explorer`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Report summary copied to clipboard!', {
        description: 'Share it on social media or with your community.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleTrackProject = () => {
    setTracked(true);
    toast.success(`Now tracking "${project.name}"`, {
      description: 'You will receive alerts for major updates on this project.',
    });
  };

  const actionItems = [
    {
      label: 'File Anonymous Whistleblower Report',
      icon: Megaphone,
      variant: 'default' as const,
      className: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
      onClick: () => {
        toast.info('Redirecting to Whistleblower Report tab...');
      },
      tooltip: 'Submit an anonymous report about irregularities in this project',
    },
    {
      label: 'Flag for OAG Priority Review',
      icon: Flag,
      variant: 'outline' as const,
      className: 'border-amber-300 text-amber-700 hover:bg-amber-50',
      onClick: () => {
        window.open('https://oagkenya.go.ke', '_blank', 'noopener,noreferrer');
      },
      tooltip: 'Flag this project for the Office of the Auditor General',
    },
    {
      label: 'Request RTI Information',
      icon: Eye,
      variant: 'outline' as const,
      className: 'border-blue-300 text-blue-700 hover:bg-blue-50',
      onClick: () => {
        toast.info('Redirecting to RTI Request tab...');
      },
      tooltip: 'Request information under the Access to Information Act',
    },
    {
      label: tracked ? 'Tracking Project ✓' : 'Track This Project',
      icon: Bell,
      variant: tracked ? ('secondary' as const) : ('outline' as const),
      className: tracked
        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
        : 'border-stone-300 text-stone-700 hover:bg-stone-50',
      onClick: handleTrackProject,
      disabled: tracked,
      tooltip: 'Subscribe to notifications for this project',
    },
    {
      label: copied ? 'Copied ✓' : 'Share Report',
      icon: copied ? CheckCircle2 : Share2,
      variant: copied ? ('secondary' as const) : ('outline' as const),
      className: copied
        ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
        : 'border-stone-300 text-stone-700 hover:bg-stone-50',
      onClick: handleShareReport,
      tooltip: 'Copy a summary report to clipboard',
    },
  ];

  return (
    <Card className="border-stone-200 bg-gradient-to-r from-stone-50 to-white">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-stone-800 flex items-center gap-2">
          <Shield className="h-4 w-4 text-stone-600" />
          Oversight Action Hub
        </CardTitle>
        <CardDescription className="text-xs text-stone-500">
          Civic oversight tools for community accountability
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {actionItems.map((item) => (
            <TooltipProvider key={item.label} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={item.variant}
                    size="sm"
                    className={`text-xs gap-1.5 transition-all duration-200 ${item.className}`}
                    onClick={item.onClick}
                    disabled={item.disabled}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">
                      {item.label.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-xs">
                  {item.tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function ProjectDetailDrawer({
  project,
  onClose,
}: {
  project: ProjectRecord;
  onClose?: () => void;
}) {
  const timeline = project.timeline ?? [];

  // Identify special lifecycle events
  const firstLifecycleStart = useMemo(
    () => timeline.find((e) => e.type === 'lifecycle_start'),
    [timeline]
  );
  const lastLifecycleEnd = useMemo(
    () => [...timeline].reverse().find((e) => e.type === 'lifecycle_end'),
    [timeline]
  );

  // Sort timeline chronologically (newest first)
  const sortedTimeline = useMemo(
    () =>
      [...timeline].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [timeline]
  );

  const budgetPercentage =
    project.budgetAllocated > 0
      ? Math.min((project.budgetSpent / project.budgetAllocated) * 100, 100)
      : 0;

  return (
    <TooltipProvider>
      <ScrollArea className="h-full">
        <div className="min-h-full bg-stone-50/50">
          {/* Close button */}
          {onClose && (
            <div className="sticky top-0 z-10 flex justify-end p-2 bg-stone-50/80 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-full h-8 w-8 p-0"
                aria-label="Close project detail"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 pb-8 space-y-6">
            {/* ─── Project Header ─────────────────────────────────── */}
            <Card className="border-stone-200 bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Title, status, agency */}
                  <div className="flex-1 space-y-3">
                    {/* Name & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                        {project.name}
                      </h2>
                      <Badge
                        variant="outline"
                        className={`text-xs w-fit ${getStatusBadgeStyle(project.status)}`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>

                    {/* County & Agency */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        {project.countyCode}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="inline-flex items-center gap-1">
                        <Send className="h-3.5 w-3.5 text-stone-400" />
                        {project.implementingAgency}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-stone-400" />
                        {project.category}
                      </span>
                    </div>

                    {/* Date range */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDate(project.startDate)}
                        {project.endDate ? ` — ${formatDate(project.endDate)}` : ' — Present'}
                      </span>
                    </div>

                    {/* Budget Progress */}
                    <BudgetProgressBar
                      allocated={project.budgetAllocated}
                      spent={project.budgetSpent}
                    />
                  </div>

                  {/* Right: Risk Score Gauge */}
                  <div className="flex flex-col items-center gap-1 lg:border-l lg:border-stone-200 lg:pl-6">
                    <RiskScoreGauge score={project.riskScore} />
                    {project.riskFactors && project.riskFactors.length > 0 && (
                      <div className="mt-2 max-w-48">
                        <p className="text-[10px] font-medium text-stone-500 mb-1">Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.riskFactors.map((factor) => (
                            <Badge
                              key={factor}
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 border-stone-200 text-stone-600"
                            >
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Main Content: Timeline + Sidebar ─────────────── */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Audit Timeline (70%) */}
              <div className="w-full lg:w-[70%] space-y-4">
                <Card className="border-stone-200 bg-white shadow-sm">
                  <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
                    <CardTitle className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Audit Timeline
                    </CardTitle>
                    <CardDescription className="text-xs text-stone-500">
                      Chronological record of audits, milestones, and findings
                      {timeline.length > 0 && (
                        <span className="ml-2 text-stone-400">
                          ({timeline.length} event{timeline.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-6">
                    {sortedTimeline.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                        <Clock className="h-10 w-10 mb-3 text-stone-300" />
                        <p className="text-sm font-medium">No timeline events recorded</p>
                        <p className="text-xs mt-1">Audit events will appear here as they become available.</p>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[15px] sm:left-[19px] top-0 bottom-0 w-0.5 bg-emerald-200" />

                        <div className="space-y-0">
                          {sortedTimeline.map((event) => (
                            <TimelineEventItem
                              key={event.id}
                              event={event}
                              isFirstLifecycleStart={event.id === firstLifecycleStart?.id}
                              isLastLifecycleEnd={event.id === lastLifecycleEnd?.id}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Sidebar Widgets (30%) */}
              <div className="w-full lg:w-[30%] space-y-4">
                {/* Weather Widget */}
                <WeatherWidgetPlaceholder locationName={project.location.name} />

                {/* Project Velocity Chart */}
                <ProjectVelocityChart timeline={timeline} />

                {/* Risk Forecast Panel */}
                <RiskForecastPanel project={project} />

                {/* Citizen Auditor Stats */}
                <CitizenAuditorWidget project={project} />
              </div>
            </div>

            {/* ─── Oversight Action Hub ──────────────────────────── */}
            <OversightActionHub project={project} />
          </div>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
