'use client';

import React, { useState } from 'react';
import {
  Heart, Loader2, AlertCircle, RotateCcw, ExternalLink,
  TrendingUp, TrendingDown, Minus, BarChart3, Tag, Link2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

type Sentiment = 'Positive' | 'Negative' | 'Mixed' | 'Neutral';

interface SentimentResult {
  sentiment: Sentiment;
  summary: string;
  themes: string[];
  sources: { title: string; url: string }[];
}

const SENTIMENT_CONFIG: Record<Sentiment, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  Positive: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
  },
  Negative: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    icon: <TrendingDown className="h-6 w-6 text-red-600" />,
  },
  Mixed: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    icon: <Minus className="h-6 w-6 text-yellow-600" />,
  },
  Neutral: {
    bg: 'bg-stone-100 dark:bg-stone-800',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-300 dark:border-stone-600',
    icon: <BarChart3 className="h-6 w-6 text-stone-500" />,
  },
};

export default function AISentimentPage() {
  const [county, setCounty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SentimentResult | null>(null);

  const handleAnalyze = async () => {
    if (!county) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ county }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze sentiment');
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? SENTIMENT_CONFIG[result.sentiment] : null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Governor Sentiment Analysis
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              AI-powered analysis of public sentiment toward county governors
            </p>
          </div>
        </div>

        <Card className="border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-lg">Select Governor</CardTitle>
            <CardDescription>Choose a county to analyze its governor's public sentiment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a county..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !county}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              {loading ? 'Analyzing Sentiment...' : 'Analyze Sentiment'}
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
              <CardContent className="pt-6 flex flex-col items-center space-y-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
            <Card className="border-stone-200 dark:border-stone-800">
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {result && cfg && !loading && (
          <div className="space-y-4">
            {/* Sentiment badge */}
            <Card className={`border ${cfg.border} ${cfg.bg}`}>
              <CardContent className="pt-8 pb-8 text-center space-y-3">
                <div className="flex justify-center">{cfg.icon}</div>
                <div className={`text-3xl font-bold ${cfg.text}`}>{result.sentiment}</div>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Public sentiment for {county} Governor
                </p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-stone-200 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {result.summary}
                </p>
              </CardContent>
            </Card>

            {/* Key themes */}
            {result.themes.length > 0 && (
              <Card className="border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    Key Themes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.themes.map((theme, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sources */}
            {result.sources.length > 0 && (
              <Card className="border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-emerald-600" />
                    Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
