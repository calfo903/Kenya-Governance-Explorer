'use client';

import React, { useState } from 'react';
import { Newspaper, Search, RotateCcw, ExternalLink, MapPin, Clock, Globe } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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

// ─── Types ─────────────────────────────────────────────────────────
interface Source {
  title: string;
  url: string;
  snippet?: string;
}

interface NewsResponse {
  success: boolean;
  briefing?: string;
  sources?: Source[];
  topic?: string;
  error?: string;
}

// ─── Markdown Helper ──────────────────────────────────────────────
function renderBriefing(text: string) {
  return text.split('\n').map((line, i) => {
    if (/^### (.+)/.test(line)) return <h3 key={i} className="text-base font-semibold text-stone-800 dark:text-stone-200 mt-4 mb-1">{line.replace('### ', '')}</h3>;
    if (/^## (.+)/.test(line)) return <h2 key={i} className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-4 mb-1">{line.replace('## ', '')}</h2>;
    if (/^\s*[-*]\s(.+)/.test(line)) return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-emerald-600">•</span><span className="text-stone-700 dark:text-stone-300">{line.replace(/^\s*[-*]\s/, '')}</span></div>;
    if (/^\d+\.\s(.+)/.test(line)) { const num = line.match(/^\d+/)?.[0]; return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="font-medium text-emerald-600">{num}.</span><span className="text-stone-700 dark:text-stone-300">{line.replace(/^\d+\.\s/, '')}</span></div>; }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-stone-700 dark:text-stone-300 leading-relaxed mb-1">{line}</p>;
  });
}

// ─── Loading Skeleton ─────────────────────────────────────────────
function BriefingSkeleton() {
  return (
    <div className="space-y-4 p-2">
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="h-3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function AINewsPage() {
  const [topic, setTopic] = useState('Kenya county governance');
  const [countyName, setCountyName] = useState<string>('');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [searchTopic, setSearchTopic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetBriefing = async () => {
    setLoading(true);
    setError(null);
    setBriefing(null);
    setSources([]);

    try {
      const body: Record<string, string> = { topic: topic.trim() || 'Kenya county governance' };
      if (countyName && countyName !== 'none') body.countyName = countyName;

      const res = await fetch('/api/ai/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: NewsResponse = await res.json();

      if (data.success && data.briefing) {
        setBriefing(data.briefing);
        setSources(data.sources ?? []);
        setSearchTopic(data.topic ?? topic);
      } else {
        setError(data.error || 'Failed to generate briefing.');
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
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">AI Governance News</h1>
            <p className="text-sm text-stone-500">Get AI-curated briefings on Kenya&apos;s county governance</p>
          </div>
        </div>

        {/* Controls */}
        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> News Topic
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Kenya county governance"
                className="bg-stone-50 dark:bg-stone-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Filter by County (optional)
              </label>
              <Select value={countyName} onValueChange={setCountyName}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All counties" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">All Counties</SelectItem>
                  <Separator className="my-1" />
                  {COUNTIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGetBriefing} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Fetching briefing...</>
              ) : (
                <><Search className="w-4 h-4 mr-2" /> Get AI Briefing</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <BriefingSkeleton />
              <Separator className="my-4" />
              <Skeleton className="h-4 w-32 mb-3" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <CardContent className="p-5 flex flex-col items-center gap-3">
              <Badge variant="destructive">{error}</Badge>
              <Button variant="outline" size="sm" onClick={handleGetBriefing}>
                <RotateCcw className="w-3 h-3 mr-1" /> Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {briefing && !loading && (
          <>
            {/* Briefing Card */}
            <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">AI News Briefing</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock className="w-3 h-3" />
                    {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                {searchTopic && (
                  <Badge variant="outline" className="mt-2 text-xs border-stone-300 text-stone-600">
                    Topic: {searchTopic}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="text-sm">{renderBriefing(briefing)}</CardContent>
            </Card>

            {/* Sources */}
            {sources.length > 0 && (
              <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Sources ({sources.length})</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 group p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                      >
                        <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 group-hover:underline truncate">{src.title}</p>
                          {src.snippet && <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{src.snippet}</p>}
                          <p className="text-xs text-stone-400 mt-0.5 truncate">{src.url}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
