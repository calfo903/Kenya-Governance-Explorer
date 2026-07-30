'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { KenyaMiniMap } from '@/components/kenya-county-map';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  RefreshCw,
  ExternalLink,
  Award,
  Trophy,
  Camera,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Newspaper,
  Clock,
  ChevronRight,
  Zap,
  Target,
  Shield,
} from 'lucide-react';

// ─── 1. WeatherWidget ────────────────────────────────────────────────

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  location: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function WeatherWidget({ lat, lng, location }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/weather?lat=${lat}&lng=${lng}&location=${encodeURIComponent(location)}`,
      );
      if (!res.ok) throw new Error('Weather fetch failed');
      const data: WeatherData = await res.json();
      setWeather(data);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError('Unable to load weather');
    } finally {
      setLoading(false);
    }
  }, [lat, lng, location]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (loading) {
    return (
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
            <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            {location}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
            <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            {location}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">{error ?? 'No data'}</p>
          <button
            onClick={fetchWeather}
            className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 transition-shadow hover:shadow-md">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
            <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            {location}
          </CardTitle>
          <button
            onClick={fetchWeather}
            className="text-stone-400 hover:text-emerald-600 transition-colors"
            aria-label="Refresh weather"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {Math.round(weather.temperature)}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">°C</span>
            </div>
            <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
              {weather.condition}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-blue-400" />
            {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="h-3 w-3 text-stone-400" />
            {weather.windSpeed} km/h
          </span>
        </div>
        {lastUpdated && (
          <p className="mt-1.5 text-[9px] text-stone-400">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── 2. CitizenAuditorDashboard ──────────────────────────────────────

const SAMPLE_BADGES = [
  { icon: Camera, label: 'Photo Verifier', color: 'text-amber-500' },
  { icon: Shield, label: 'Integrity Guard', color: 'text-emerald-500' },
  { icon: Zap, label: 'Quick Reporter', color: 'text-violet-500' },
];

const SAMPLE_ACTIVITIES = [
  { date: '12 Jan', action: 'Verified 3 project photos', county: 'Nairobi' },
  { date: '10 Jan', action: 'Submitted audit report', county: 'Mombasa' },
  { date: '8 Jan', action: 'Flagged procurement issue', county: 'Kisumu' },
];

export function CitizenAuditorDashboard() {
  const verifiedPhotos = 47;
  const rank = 12;
  const totalParticipants = 234;
  const nextRankThreshold = 60;
  const progressPercent = Math.min(
    Math.round((verifiedPhotos / nextRankThreshold) * 100),
    100,
  );

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 transition-shadow hover:shadow-md">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
          <Trophy className="h-3.5 w-3.5 text-emerald-600" />
          Citizen Auditor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 p-2 text-center">
            <p className="text-sm font-bold text-emerald-700">{verifiedPhotos}</p>
            <p className="text-[9px] text-stone-500 dark:text-stone-400">Photos Verified</p>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 p-2 text-center">
            <p className="text-sm font-bold text-emerald-700">#{rank}</p>
            <p className="text-[9px] text-stone-500 dark:text-stone-400">Rank</p>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-950 p-2 text-center">
            <p className="text-sm font-bold text-emerald-700">{totalParticipants}</p>
            <p className="text-[9px] text-stone-500 dark:text-stone-400">Participants</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="mb-1.5 text-[10px] font-medium text-stone-600 dark:text-stone-300">Badges Earned</p>
          <div className="flex gap-2">
            {SAMPLE_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="group relative flex flex-col items-center gap-0.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 transition-colors group-hover:bg-emerald-100">
                  <badge.icon className={`h-4 w-4 ${badge.color}`} />
                </div>
                <span className="text-[8px] leading-tight text-stone-500 dark:text-stone-400 text-center w-14">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress to next rank */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-medium text-stone-600 dark:text-stone-300">
              Progress to Rank #{rank - 1}
            </p>
            <p className="text-[10px] font-semibold text-emerald-600">
              {progressPercent}%
            </p>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          <p className="mt-1 text-[9px] text-stone-400">
            {verifiedPhotos} / {nextRankThreshold} photos to next rank
          </p>
        </div>

        {/* Recent activity */}
        <div>
          <p className="mb-1.5 text-[10px] font-medium text-stone-600 dark:text-stone-300">
            Recent Activity
          </p>
          <div className="space-y-1.5">
            {SAMPLE_ACTIVITIES.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md p-1.5 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800"
              >
                <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-stone-700 dark:text-stone-200 leading-tight">
                    {item.action}
                  </p>
                  <p className="text-[9px] text-stone-400">
                    {item.date} · {item.county}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 3. AIInsightsWidget ─────────────────────────────────────────────

interface NewsItem {
  headline: string;
  url: string;
  source: string;
  timeAgo: string;
  relevanceScore: number;
}

export function AIInsightsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        setNews(Array.isArray(data) ? data.slice(0, 3) : []);
        setError(null);
      } catch {
        setError('Unable to load insights');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-100 text-emerald-700';
    if (score >= 0.6) return 'bg-amber-100 text-amber-700';
    return 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300';
  };

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 transition-shadow hover:shadow-md">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
          <Newspaper className="h-3.5 w-3.5 text-emerald-600" />
          AI Governance Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-20" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-[10px] text-stone-500 dark:text-stone-400">{error}</p>
        )}

        {!loading && !error && news.length === 0 && (
          <p className="text-[10px] text-stone-400">No insights available</p>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="space-y-2.5">
            {news.map((item, i) => (
              <div
                key={i}
                className="group rounded-md p-1.5 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-[11px] font-medium leading-tight text-stone-700 dark:text-stone-200 hover:text-emerald-700 transition-colors line-clamp-2"
                  >
                    {item.headline}
                    <ExternalLink className="ml-0.5 inline h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                  <Badge
                    variant="secondary"
                    className={`flex-shrink-0 text-[8px] px-1.5 py-0 h-4 font-medium ${getRelevanceColor(item.relevanceScore)}`}
                  >
                    {Math.round(item.relevanceScore * 100)}%
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[9px] text-stone-400">
                  <span className="font-medium text-stone-500 dark:text-stone-400">
                    {item.source}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {item.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── 4. ProjectVelocityChart ─────────────────────────────────────────

interface ProjectVelocityChartProps {
  projectRef?: string;
}

function generateVelocityData() {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.toLocaleString('en', { month: 'short' }),
      events: Math.floor(Math.random() * 40) + 15,
    });
  }
  return months;
}

export function ProjectVelocityChart({ projectRef }: ProjectVelocityChartProps) {
  const data = generateVelocityData();
  const first = data[0].events;
  const last = data[data.length - 1].events;
  const isIncreasing = last >= first;
  const changePercent = Math.round(((last - first) / first) * 100);

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 transition-shadow hover:shadow-md">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            Audit Velocity
          </CardTitle>
          <div
            className={`flex items-center gap-0.5 text-[10px] font-medium ${
              isIncreasing ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {isIncreasing ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isIncreasing ? '+' : ''}
            {changePercent}%
          </div>
        </div>
        {projectRef && (
          <p className="text-[9px] text-stone-400 mt-0.5">{projectRef}</p>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9, fill: '#a8a29e' }}
              axisLine={{ stroke: '#d6d3d1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#a8a29e' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <RechartsTooltip
              contentStyle={{
                fontSize: 10,
                borderRadius: 6,
                border: '1px solid #e7e5e4',
                padding: '4px 8px',
              }}
              labelStyle={{ fontSize: 9, color: '#78716c' }}
              itemStyle={{ fontSize: 10, color: '#059669' }}
            />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-1 text-[9px] text-stone-400 text-center">
          Audit events per month (last 6 months)
        </p>
      </CardContent>
    </Card>
  );
}

// ─── 5. RiskForecastWidget ───────────────────────────────────────────

interface RiskForecastWidgetProps {
  projectId?: string;
}

interface RiskFactor {
  label: string;
  weight: number;
}

const SAMPLE_RISK_FACTORS: RiskFactor[] = [
  { label: 'Budget variance', weight: 35 },
  { label: 'Delayed milestones', weight: 28 },
  { label: 'Procurement irregularities', weight: 22 },
];

function getRiskLevel(probability: number) {
  if (probability < 30) return { level: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  if (probability <= 60) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100' };
  return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
}

function getRecommendation(probability: number): string {
  if (probability < 30)
    return 'Project is on track. Continue current monitoring cadence.';
  if (probability <= 60)
    return 'Elevated risk detected. Increase audit frequency and review milestones.';
  return 'Critical risk of stalling. Immediate intervention recommended.';
}

export function RiskForecastWidget({ projectId }: RiskForecastWidgetProps) {
  // Stalling probability derived from sample risk factor weights
  const stallingProbability = 42; // sample calculated value
  const risk = getRiskLevel(stallingProbability);
  const recommendation = getRecommendation(stallingProbability);

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 transition-shadow hover:shadow-md">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
            <AlertTriangle className="h-3.5 w-3.5 text-emerald-600" />
            Risk Forecast
          </CardTitle>
          <Badge
            variant="secondary"
            className={`text-[9px] px-1.5 py-0 h-4 font-medium ${risk.bg} ${risk.color}`}
          >
            {risk.level}
          </Badge>
        </div>
        {projectId && (
          <p className="text-[9px] text-stone-400 mt-0.5">{projectId}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        {/* Probability display */}
        <div className="text-center">
          <span
            className={`text-3xl font-bold ${risk.color}`}
          >
            {stallingProbability}%
          </span>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
            stalling probability
          </p>
        </div>

        {/* Risk factors */}
        <div>
          <p className="mb-1.5 text-[10px] font-medium text-stone-600 dark:text-stone-300">
            Top Risk Factors
          </p>
          <div className="space-y-2">
            {SAMPLE_RISK_FACTORS.map((factor) => (
              <div key={factor.label}>
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-[10px] text-stone-600 dark:text-stone-300">
                    {factor.label}
                  </span>
                  <span className="text-[10px] font-medium text-stone-700 dark:text-stone-200">
                    {factor.weight}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${factor.weight}%`,
                      backgroundColor:
                        factor.weight > 30
                          ? '#dc2626'
                          : factor.weight > 20
                            ? '#d97706'
                            : '#059669',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-md bg-stone-50 dark:bg-stone-800 p-2">
          <p className="flex items-start gap-1.5 text-[10px] leading-tight text-stone-600 dark:text-stone-300">
            <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-600" />
            {recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 7. SidebarMiniMap ──────────────────────────────────────────────

export function SidebarMiniMap({ onCountyClick }: { onCountyClick?: (countyCode: string) => void }) {
  const [colorMode, setColorMode] = useState<'coalition' | 'region' | 'audit'>('region');

  return (
    <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
      <CardContent className="p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Kenya Map</p>
          <div className="flex items-center gap-1">
            {(['region', 'coalition', 'audit'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                  colorMode === mode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {mode === 'region' ? 'Region' : mode === 'coalition' ? 'Party' : 'Audit'}
              </button>
            ))}
          </div>
        </div>
        <KenyaMiniMap
          colorMode={colorMode}
          onCountyClick={onCountyClick}
          className="w-full rounded-md cursor-pointer"
        />
      </CardContent>
    </Card>
  );
}
