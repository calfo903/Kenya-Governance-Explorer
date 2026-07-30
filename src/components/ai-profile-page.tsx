'use client';

import React, { useState } from 'react';
import {
  Users, Wallet, ShieldCheck, FolderKanban, AlertTriangle,
  Loader2, AlertCircle, RotateCcw, Copy, Check, Building2, Sparkles,
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

interface ProfileSection {
  leadership: string;
  budgetHealth: string;
  auditStatus: string;
  projectPipeline: string;
  keyChallenges: string;
}

interface ProfileResult {
  county: string;
  sections: ProfileSection;
}

const SECTION_META = [
  { key: 'leadership' as const, label: 'Leadership', icon: Users, color: 'text-blue-600' },
  { key: 'budgetHealth' as const, label: 'Budget Health', icon: Wallet, color: 'text-emerald-600' },
  { key: 'auditStatus' as const, label: 'Audit Status', icon: ShieldCheck, color: 'text-amber-600' },
  { key: 'projectPipeline' as const, label: 'Project Pipeline', icon: FolderKanban, color: 'text-purple-600' },
  { key: 'keyChallenges' as const, label: 'Key Challenges', icon: AlertTriangle, color: 'text-red-600' },
];

export default function AIProfilePage() {
  const [county, setCounty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!county) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch('/api/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ county }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = SECTION_META.map(
      (s) => `## ${s.label}\n\n${result.sections[s.key]}`
    ).join('\n\n');
    const full = `# ${result.county} County Governance Profile\n\n${text}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              County Governance Profile
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              AI-generated comprehensive governance profiles for Kenyan counties
            </p>
          </div>
        </div>

        <Card className="border-stone-200 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="text-lg">Select County</CardTitle>
            <CardDescription>
              Generate a detailed governance profile for any of the 47 counties
            </CardDescription>
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
              onClick={handleGenerate}
              disabled={loading || !county}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {loading ? 'Generating Profile...' : 'Generate Profile'}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-3 flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">Generation failed</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button variant="outline" size="sm" onClick={handleGenerate} className="border-red-300 text-red-600">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-4">
            {SECTION_META.map((s) => (
              <Card key={s.key} className="border-stone-200 dark:border-stone-800">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {result.county} County
              </h2>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-1 text-emerald-600" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy Profile'}
              </Button>
            </div>

            <Separator />

            {SECTION_META.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.key} className="border-stone-200 dark:border-stone-800">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${s.color}`} />
                      {s.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                      {result.sections[s.key]}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
