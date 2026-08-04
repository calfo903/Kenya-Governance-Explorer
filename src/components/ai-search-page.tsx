'use client';

import React, { useState } from 'react';
import {
  Search, Loader2, AlertCircle, RotateCcw, Globe, Database,
  ExternalLink, Sparkles, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface SearchResult {
  answer: string;
  sources: { title: string; url: string; snippet?: string }[];
  webResultsCount: number;
  dbResultsCount: number;
}

const SUGGESTED_SEARCHES = [
  'Which county has the largest budget?',
  'Who is the governor of Mombasa?',
  'Compare Nairobi and Kiambu budgets',
  'What are the main audit findings for 2023?',
  'Which counties have the highest absorption rates?',
];

export default function AISearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setQuery(q);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-8 md:pt-16">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Ask About Kenya Governance
          </h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Search across county budgets, audits, leadership, and more using natural language
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask anything about Kenya's county governance..."
              className="pl-12 pr-28 h-14 text-base rounded-xl border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-sm"
              disabled={loading}
            />
            <Button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-11"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Suggested searches */}
        {!result && !loading && !error && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide px-1">
              Suggested searches
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <Search className="h-3 w-3" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-3 flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">Search failed</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => handleSearch()} className="border-red-300 text-red-600">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="border-stone-200 dark:border-stone-800">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Separator className="my-2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4">
            {/* Source counts */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Globe className="h-3 w-3" />
                {result.webResultsCount} web results
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Database className="h-3 w-3" />
                {result.dbResultsCount} database results
              </Badge>
            </div>

            {/* Answer */}
            <Card className="border-stone-200 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="text-lg">Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-stone dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {result.answer}
                </div>
              </CardContent>
            </Card>

            {/* Sources */}
            {result.sources.length > 0 && (
              <Card className="border-stone-200 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="text-base">Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <ExternalLink className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-stone-800 dark:text-stone-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                              {src.title}
                            </p>
                            {src.snippet && (
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                                {src.snippet}
                              </p>
                            )}
                            <p className="text-xs text-stone-400 mt-1 truncate">{src.url}</p>
                          </div>
                        </div>
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
