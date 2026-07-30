'use client';

import React, { useState } from 'react';
import { Brain, Search, RotateCcw, AlertTriangle, Tag, Phone, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// ─── Types ─────────────────────────────────────────────────────────
interface ReportIntelResponse {
  success: boolean;
  category?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions?: string[];
  countyContacts?: string[];
  error?: string;
}

// ─── Severity Config ───────────────────────────────────────────────
const SEVERITY_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  low: { label: 'Low', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800', dot: 'bg-red-500' },
};

// ─── Loading Skeleton ─────────────────────────────────────────────
function IntelSkeleton() {
  return (
    <div className="space-y-4 p-2">
      <div className="flex gap-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-40" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-2">
          <Skeleton className="w-4 h-4 rounded mt-0.5" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
      <Skeleton className="h-5 w-36" />
      {[1, 2, 3].map((i) => (
        <div key={`c-${i}`} className="flex items-start gap-2">
          <Skeleton className="w-4 h-4 rounded mt-0.5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function AIReportIntelPage() {
  const [reportText, setReportText] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [countyContacts, setCountyContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!reportText.trim()) return;
    setLoading(true);
    setError(null);
    setCategory(null);
    setSeverity(null);
    setSuggestedActions([]);
    setCountyContacts([]);

    try {
      const res = await fetch('/api/ai/report-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText: reportText.trim() }),
      });
      const data: ReportIntelResponse = await res.json();

      if (data.success) {
        setCategory(data.category ?? 'general');
        setSeverity(data.severity ?? 'medium');
        setSuggestedActions(data.suggestedActions ?? []);
        setCountyContacts(data.countyContacts ?? []);
      } else {
        setError(data.error || 'Failed to analyze report.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sevConfig = severity ? SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.medium : null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Citizen Report Intelligence</h1>
            <p className="text-sm text-stone-500">AI-powered classification and action recommendations for citizen reports</p>
          </div>
        </div>

        {/* Input */}
        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Report Text</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Paste or type the citizen report text here. The AI will classify it by governance theme, assess severity, and suggest follow-up actions..."
              rows={6}
              className="bg-stone-50 dark:bg-stone-800 resize-none text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">{reportText.length} characters</span>
              <Button
                onClick={handleAnalyze}
                disabled={!reportText.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Analyzing...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Analyze Report</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
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

        {/* Results */}
        {loading && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent><IntelSkeleton /></CardContent>
          </Card>
        )}

        {!loading && category && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Analysis Results</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Badges Row */}
              <div className="flex flex-wrap gap-3">
                <Badge className="border text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  <Tag className="w-3 h-3 mr-1" /> {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
                {sevConfig && (
                  <Badge className={`border text-xs ${sevConfig.className} flex items-center gap-1.5`}>
                    <div className={`w-2 h-2 rounded-full ${sevConfig.dot}`} />
                    <AlertTriangle className="w-3 h-3" />
                    {sevConfig.label} Severity
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Suggested Actions */}
              {suggestedActions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                    Suggested Actions
                  </h4>
                  <div className="space-y-2">
                    {suggestedActions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-white">{i + 1}</span>
                        </div>
                        <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* County Contacts */}
              {countyContacts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    Relevant County Contacts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {countyContacts.map((contact, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                        <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                          <Phone className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-stone-700 dark:text-stone-300">{contact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
