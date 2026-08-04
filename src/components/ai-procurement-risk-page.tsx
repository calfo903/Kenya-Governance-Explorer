'use client';

import React, { useState } from 'react';
import {
  ShieldAlert, Loader2, AlertCircle, RotateCcw, AlertTriangle,
  CheckCircle, Search, FileWarning, ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const COUNTIES = [
  'Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita-Taveta','Garissa',
  'Wajir','Mandera','Marsabit','Isiolo','Meru','Tharaka-Nithi','Embu',
  'Kitui','Machakos','Makueni','Nyandarua','Nyeri','Kirinyaga',"Murang'a",
  'Kiambu','Turkana','West Pokot','Samburu','Trans Nzoia','Uasin Gishu',
  'Elgeyo-Marakwet','Nandi','Baringo','Laikipia','Nakuru','Narok',
  'Kajiado','Kericho','Bomet','Kakamega','Vihiga','Bungoma','Busia',
  'Siaya','Kisumu','Homa Bay','Migori','Kisii','Nyamira','Nairobi',
];

type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

interface RiskResult {
  riskLevel: RiskLevel;
  analysis: string;
  redFlags: string[];
  recommendations: string[];
}

const RISK_CONFIG: Record<RiskLevel, { bg: string; text: string; border: string; icon: React.ReactNode; badge: string }> = {
  Low: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    icon: <ShieldCheck className="h-8 w-8 text-emerald-600" />,
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  },
  Medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    icon: <ShieldAlert className="h-8 w-8 text-yellow-600" />,
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  High: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    icon: <AlertTriangle className="h-8 w-8 text-orange-600" />,
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  Critical: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    icon: <FileWarning className="h-8 w-8 text-red-600" />,
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

export default function AIProcurementRiskPage() {
  const [county, setCounty] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ai/procurement-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          county: county || undefined,
          category: category || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze risks');
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? RISK_CONFIG[result.riskLevel] : null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Procurement Risk Analysis
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              AI-powered detection of procurement risks and red flags
            </p>
          </div>
        </div>

        <Card className="border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Parameters</CardTitle>
            <CardDescription>
              Narrow the analysis by county and/or procurement category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                County <span className="text-stone-400">(optional)</span>
              </label>
              <Select value={county} onValueChange={setCounty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All counties" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="__all">All Counties</SelectItem>
                  {COUNTIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Category <span className="text-stone-400">(optional)</span>
              </label>
              <Input
                placeholder="e.g., medical supplies, road construction, ICT..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Analyzing Risks...' : 'Analyze Risks'}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-3 flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">Analysis failed</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleAnalyze} className="border-red-300 text-red-600">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-4">
            <Card className="border-stone-200 dark:border-stone-800">
              <CardContent className="pt-8 pb-8 flex flex-col items-center space-y-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
            <Card className="border-stone-200 dark:border-stone-800">
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card className="border-stone-200 dark:border-stone-800">
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {result && cfg && !loading && (
          <div className="space-y-4">
            {/* Risk level badge */}
            <Card className={`border ${cfg.border} ${cfg.bg}`}>
              <CardContent className="pt-8 pb-8 text-center space-y-3">
                <div className="flex justify-center">{cfg.icon}</div>
                <Badge className={`text-lg px-4 py-1 ${cfg.badge}`}>
                  {result.riskLevel} Risk
                </Badge>
                {county && (
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {county === '__all' ? 'All Counties' : county}
                    {category ? ` · ${category}` : ''}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card className="border-stone-200 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="text-base">Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {result.analysis}
                </p>
              </CardContent>
            </Card>

            {/* Red flags */}
            {result.redFlags.length > 0 && (
              <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Red Flags ({result.redFlags.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-stone-700 dark:text-stone-300">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="h-5 w-5" />
                    Recommendations ({result.recommendations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-stone-700 dark:text-stone-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
