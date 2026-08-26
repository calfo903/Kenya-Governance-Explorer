'use client';

import React, { useState } from 'react';
import { Search, AlertTriangle, RotateCcw, MapPin, Calendar, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// ─── Constants ──────────────────────────────────────────────────────
const COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa',
  'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu',
  'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', "Murang'a",
  'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu',
  'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok',
  'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia',
  'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi',
];

const FINANCIAL_YEARS = [
  'FY 2024/25', 'FY 2023/24', 'FY 2022/23', 'FY 2021/22', 'FY 2020/21',
];

// ─── Types ─────────────────────────────────────────────────────────
interface AnomalyResponse {
  success: boolean;
  analysis?: string;
  anomalies?: string[];
  error?: string;
}

// ─── Markdown Helper ──────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={`t-${key++}`}>{text.slice(last, match.index)}</span>);
    parts.push(<strong key={`b-${key++}`} className="font-semibold text-stone-900 dark:text-stone-100">{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={`t-${key++}`}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

function renderAnalysis(text: string) {
  return text.split('\n').map((line, i) => {
    if (/^### (.+)/.test(line)) return <h3 key={i} className="text-base font-semibold text-stone-800 dark:text-stone-200 mt-4 mb-1">{line.replace('### ', '')}</h3>;
    if (/^## (.+)/.test(line)) return <h2 key={i} className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-4 mb-1">{line.replace('## ', '')}</h2>;
    if (/^\s*[-*]\s(.+)/.test(line)) return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-emerald-600">•</span><span className="text-stone-700 dark:text-stone-300">{renderInline(line.replace(/^\s*[-*]\s/, ''))}</span></div>;
    if (/^\d+\.\s(.+)/.test(line)) { const num = line.match(/^\d+/)?.[0]; return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="font-medium text-emerald-600">{num}.</span><span className="text-stone-700 dark:text-stone-300">{renderInline(line.replace(/^\d+\.\s/, ''))}</span></div>; }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-stone-700 dark:text-stone-300 leading-relaxed mb-1">{renderInline(line)}</p>;
  });
}

// ─── Loading Skeleton ─────────────────────────────────────────────
function AnalysisSkeleton() {
  return (
    <div className="space-y-4 p-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <div className="h-3" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function AIBudgetAnomalyPage() {
  const [county, setCounty] = useState<string>('');
  const [financialYear, setFinancialYear] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setAnomalies([]);

    try {
      const body: Record<string, string> = {};
      if (county && county !== 'all') body.countyCode = county;
      if (financialYear) body.financialYear = financialYear;

      const res = await fetch('/api/ai/budget-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: AnomalyResponse = await res.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setAnomalies(data.anomalies ?? []);
      } else {
        setError(data.error || 'Failed to analyze budget data.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Budget Anomaly Detection</h1>
            <p className="text-sm text-stone-500">AI-powered analysis of county budget irregularities</p>
          </div>
        </div>

        {/* Controls */}
        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> County
                </label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select county (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">Analyze All 47 Counties</SelectItem>
                    <Separator className="my-1" />
                    {COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Financial Year
                </label>
                <Select value={financialYear} onValueChange={setFinancialYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCIAL_YEARS.map((fy) => (
                      <SelectItem key={fy} value={fy}>{fy}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={handleAnalyze} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Analyzing...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Analyze Budget</>
                )}
              </Button>
              {!county && (
                <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
                  <BarChart3 className="w-3 h-3 mr-1" /> Will analyze all counties
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent><AnalysisSkeleton /></CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <CardContent className="p-5 flex flex-col items-center gap-3">
              <Badge variant="destructive">{error}</Badge>
              <Button variant="outline" size="sm" onClick={handleAnalyze}>
                <RotateCcw className="w-3 h-3 mr-1" /> Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {analysis && !loading && (
          <>
            {/* Anomaly Highlights */}
            {anomalies.length > 0 && (
              <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Anomalies Detected ({anomalies.length})</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {anomalies.map((a, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs hover:bg-amber-100 border-0 shrink-0">{i + 1}</Badge>
                        <span className="text-amber-900 dark:text-amber-100">{a}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Analysis */}
            <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">AI Analysis Report</h3>
                </div>
              </CardHeader>
              <CardContent className="text-sm">{renderAnalysis(analysis)}</CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
