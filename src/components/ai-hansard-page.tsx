'use client';

import React, { useState } from 'react';
import {
  BookOpen, Search, Loader2, AlertCircle, ExternalLink,
  FileText, Mic, RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface HansardSource {
  title: string;
  url: string;
  date?: string;
}

interface HansardSummaryResult {
  summary: string;
  keyDebates: string[];
  keyMotions: string[];
  sources: HansardSource[];
}

export default function AIHansardPage() {
  const [county, setCounty] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HansardSummaryResult | null>(null);

  const handleSummarize = async () => {
    if (!county) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/ai/hansard-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ county, topic: topic || undefined }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Hansard AI Summarizer
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              AI-powered summaries of county assembly debates and motions
            </p>
          </div>
        </div>

        <Card className="border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-lg">Configure Search</CardTitle>
            <CardDescription>
              Select a county and optionally narrow by topic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                County Assembly
              </label>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Topic <span className="text-stone-400">(optional)</span>
              </label>
              <Input
                placeholder="e.g., health budget, education policy, land rates..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSummarize()}
              />
            </div>

            <Button
              onClick={handleSummarize}
              disabled={loading || !county}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Summarizing Debates...' : 'Summarize Debates'}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-3 flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    Failed to generate summary
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    className="border-red-300 text-red-600 hover:bg-red-100 dark:border-red-700 dark:text-red-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="border-stone-200 dark:border-stone-800">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Separator className="my-4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Separator className="my-4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/5" />
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <Card className="border-stone-200 dark:border-stone-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-lg">AI Summary</CardTitle>
                </div>
                <CardDescription>{county} County Assembly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {result.summary}
                </p>
              </CardContent>
            </Card>

            {result.keyDebates.length > 0 && (
              <Card className="border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    Key Debates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.keyDebates.map((debate, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                        <Badge variant="secondary" className="shrink-0 mt-0.5 text-xs">
                          {i + 1}
                        </Badge>
                        {debate}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.keyMotions.length > 0 && (
              <Card className="border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Key Motions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.keyMotions.map((motion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                        <Badge variant="outline" className="shrink-0 mt-0.5 text-xs">
                          M{i + 1}
                        </Badge>
                        {motion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.sources.length > 0 && (
              <Card className="border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="text-base">Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline group"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 truncate">{src.title}</span>
                        {src.date && (
                          <span className="text-xs text-stone-400 shrink-0">{src.date}</span>
                        )}
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
