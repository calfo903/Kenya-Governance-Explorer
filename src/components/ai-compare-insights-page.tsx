'use client';

import React, { useState } from 'react';
import { GitCompare, Search, RotateCcw, MapPin, BarChart3, Shield, Users, FolderOpen } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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

const METRICS_OPTIONS = [
  { id: 'budget', label: 'Budget', icon: BarChart3 },
  { id: 'audit', label: 'Audit', icon: Shield },
  { id: 'leadership', label: 'Leadership', icon: Users },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
];

// ─── Types ─────────────────────────────────────────────────────────
interface CompareResponse {
  success: boolean;
  analysis?: string;
  error?: string;
}

// ─── Markdown Renderer ──────────────────────────────────────────────
function renderComparison(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  lines.forEach((line, i) => {
    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) inTable = true;
      const isSeparator = /^\|[\s\-:|]+\|$/.test(line.trim());
      if (!isSeparator) {
        const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
        tableRows.push(cells);
      }
      return;
    }

    // Flush table if we were in one
    if (inTable) {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800">
                  {tableRows[0].map((cell, ci) => (
                    <th key={ci} className="text-left px-3 py-2 border border-stone-200 dark:border-stone-700 font-semibold text-stone-800 dark:text-stone-200 text-xs">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-stone-900' : 'bg-stone-50 dark:bg-stone-850'}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableRows = [];
    }

    // Headers
    if (/^### (.+)/.test(line)) {
      elements.push(<h3 key={`h3-${i}`} className="text-base font-semibold text-stone-800 dark:text-stone-200 mt-4 mb-1">{line.replace('### ', '')}</h3>);
      return;
    }
    if (/^## (.+)/.test(line)) {
      elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-4 mb-1">{line.replace('## ', '')}</h2>);
      return;
    }

    // Bullet points
    if (/^\s*[-*]\s(.+)/.test(line)) {
      elements.push(<div key={`li-${i}`} className="flex gap-2 ml-2 mb-1"><span className="text-emerald-600">•</span><span className="text-stone-700 dark:text-stone-300">{line.replace(/^\s*[-*]\s/, '')}</span></div>);
      return;
    }

    // Numbered items
    if (/^\d+\.\s(.+)/.test(line)) {
      const num = line.match(/^\d+/)?.[0];
      elements.push(<div key={`ol-${i}`} className="flex gap-2 ml-2 mb-1"><span className="font-medium text-emerald-600">{num}.</span><span className="text-stone-700 dark:text-stone-300">{line.replace(/^\d+\.\s/, '')}</span></div>);
      return;
    }

    // Bold-only lines
    if (/^\*\*(.+)\*\*$/.test(line)) {
      elements.push(<p key={`bold-${i}`} className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{line.replace(/\*\*/g, '')}</p>);
      return;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      return;
    }

    // Regular paragraph with inline bold
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let last = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(<span key={`t-${key++}`}>{line.slice(last, match.index)}</span>);
      parts.push(<strong key={`b-${key++}`} className="font-semibold text-stone-900 dark:text-stone-100">{match[1]}</strong>);
      last = match.index + match[0].length;
    }
    if (last < line.length) parts.push(<span key={`t-${key++}`}>{line.slice(last)}</span>);
    elements.push(<p key={`p-${i}`} className="text-stone-700 dark:text-stone-300 leading-relaxed mb-1">{parts}</p>);
  });

  return elements;
}

// ─── Loading Skeleton ─────────────────────────────────────────────
function ComparisonSkeleton() {
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
export default function AICompareInsightsPage() {
  const [county1, setCounty1] = useState<string>('');
  const [county2, setCounty2] = useState<string>('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['budget', 'audit', 'leadership', 'projects']);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const canCompare = county1 && county2 && county1 !== county2;

  const handleCompare = async () => {
    if (!canCompare) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch('/api/ai/compare-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          county1,
          county2,
          metrics: selectedMetrics.length > 0 ? selectedMetrics : undefined,
        }),
      });
      const data: CompareResponse = await res.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to generate comparison.');
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
            <GitCompare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Comparative Insights</h1>
            <p className="text-sm text-stone-500">AI-powered county comparison across budget, audit, leadership, and projects</p>
          </div>
        </div>

        {/* Controls */}
        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardContent className="p-5 space-y-4">
            {/* County Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> First County
                </label>
                <Select value={county1} onValueChange={setCounty1}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select first county" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Second County
                </label>
                <Select value={county2} onValueChange={setCounty2}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select second county" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Metrics Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Compare Metrics (optional)</label>
              <div className="flex flex-wrap gap-3">
                {METRICS_OPTIONS.map((metric) => {
                  const checked = selectedMetrics.includes(metric.id);
                  return (
                    <label
                      key={metric.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleMetric(metric.id)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <metric.icon className={`w-3.5 h-3.5 ${checked ? 'text-emerald-600' : 'text-stone-500'}`} />
                      <span className={`text-xs font-medium ${checked ? 'text-emerald-700 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-400'}`}>
                        {metric.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button onClick={handleCompare} disabled={!canCompare || loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Generating...</>
              ) : (
                <><GitCompare className="w-4 h-4 mr-2" /> Generate Comparison</>
              )}
            </Button>

            {county1 && county2 && county1 === county2 && (
              <p className="text-xs text-red-500">Please select two different counties to compare.</p>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <CardContent className="p-5 flex flex-col items-center gap-3">
              <Badge variant="destructive">{error}</Badge>
              <Button variant="outline" size="sm" onClick={handleCompare}>
                <RotateCcw className="w-3 h-3 mr-1" /> Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent><ComparisonSkeleton /></CardContent>
          </Card>
        )}

        {/* Results */}
        {analysis && !loading && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {county1} vs {county2}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">{county1}</Badge>
                  <span className="text-xs text-stone-400 self-center">vs</span>
                  <Badge variant="outline" className="text-xs">{county2}</Badge>
                </div>
              </div>
              {selectedMetrics.length > 0 && selectedMetrics.length < 4 && (
                <div className="flex gap-1 mt-2">
                  {selectedMetrics.map((m) => (
                    <Badge key={m} className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0">
                      {m}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="text-sm">{renderComparison(analysis)}</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
