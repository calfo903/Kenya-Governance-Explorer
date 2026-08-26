'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, RotateCcw, AlertCircle, MapPin, Tag, UserCircle, FilePlus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// ─── Types ─────────────────────────────────────────────────────────
interface RTILetterResponse {
  success: boolean;
  letter?: string;
  error?: string;
}

// ─── Loading Skeleton ─────────────────────────────────────────────
function LetterSkeleton() {
  return (
    <div className="space-y-3 p-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="h-4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="h-4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function AIRTILetterPage() {
  const [countyName, setCountyName] = useState('');
  const [topic, setTopic] = useState('');
  const [recipient, setRecipient] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canGenerate = countyName.trim().length > 0 && topic.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setLetter(null);

    try {
      const body: Record<string, string> = {
        countyName: countyName.trim(),
        topic: topic.trim(),
      };
      if (recipient.trim()) body.recipient = recipient.trim();
      if (additionalDetails.trim()) body.additionalDetails = additionalDetails.trim();

      const res = await fetch('/api/ai/rti-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: RTILetterResponse = await res.json();

      if (data.success && data.letter) {
        setLetter(data.letter);
      } else {
        setError(data.error || 'Failed to generate RTI letter.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement('textarea');
      textarea.value = letter;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">RTI Letter Generator</h1>
            <p className="text-sm text-stone-500">Generate formal Right to Information request letters for Kenyan counties</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Letter Details</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> County Name <Badge variant="destructive" className="text-[9px] px-1 py-0">Required</Badge>
                </label>
                <Input
                  value={countyName}
                  onChange={(e) => setCountyName(e.target.value)}
                  placeholder="e.g., Nairobi"
                  className="bg-stone-50 dark:bg-stone-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Information Topic <Badge variant="destructive" className="text-[9px] px-1 py-0">Required</Badge>
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., County budget allocation for 2024"
                  className="bg-stone-50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <UserCircle className="w-3.5 h-3.5" /> Recipient (optional)
              </label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g., County Secretary or Commission on Administrative Justice"
                className="bg-stone-50 dark:bg-stone-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Additional Details (optional)</label>
              <Textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Any specific context, dates, or references to include in the letter..."
                rows={3}
                className="bg-stone-50 dark:bg-stone-800 resize-none"
              />
            </div>

            <Button onClick={handleGenerate} disabled={!canGenerate || loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Generating...</>
              ) : (
                <><FileText className="w-4 h-4 mr-2" /> Generate Letter</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <CardContent className="p-5 flex flex-col items-center gap-3">
              <Badge variant="destructive">{error}</Badge>
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                <RotateCcw className="w-3 h-3 mr-1" /> Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Generated Letter */}
        {loading && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent><LetterSkeleton /></CardContent>
          </Card>
        )}

        {letter && !loading && (
          <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Generated Letter</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={copied ? 'border-emerald-300 text-emerald-700' : ''}
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-5">
                <pre className="whitespace-pre-wrap text-sm text-stone-800 dark:text-stone-200 font-mono leading-relaxed">
                  {letter}
                </pre>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>Disclaimer:</strong> Review before sending. AI-generated drafts should be verified for accuracy and completeness. Ensure all personal details and specific references are correct before submitting.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
