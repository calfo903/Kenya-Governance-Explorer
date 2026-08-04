'use client';

import React, { useRef, useCallback } from 'react';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import {
  Camera, Download, Share2, Shield, Star,
  MapPin, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, BarChart3, Eye, XCircle, Scale,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import RepChatWidget from '@/components/rep-chat-widget';
import RepAvatar from '@/components/rep-avatar';

export default function GovernorReportCardPage() {
  const [selectedCounty, setSelectedCounty] = React.useState<string>('034');
  const cardRef = useRef<HTMLDivElement>(null);

  const governor = all47Governors.find(g => g.code === selectedCounty);
  const latestAudit = nationalSummary.auditSummaries[0];
  const latestBudget = nationalSummary.budgetSummaries[0];

  const handleSharePNG = useCallback(async () => {
    if (!governor) return;
    // Try native share first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${governor.name} — Performance Report Card`,
          text: `${governor.name} — ${governor.county} County Governor Report Card\nKenya Governance Explorer · 2022–2027`,
          url: window.location.href,
        });
        return;
      } catch { /* User cancelled, fall through */ }
    }
    // Fallback: copy summary text to clipboard
    const summary = `${governor.name} — ${governor.county} County Governor\nParty: ${governor.party} · Coalition: ${governor.coalition}\nPopulation: ${governor.population.toLocaleString()} · Area: ${governor.areaSqKm.toLocaleString()} km²\nConstituencies: ${governor.constituenciesCount} · Wards: ${governor.wardsCount}\n\nKenya Governance Explorer · 2022–2027\nData: OAG · CoB · IEBC · TI-Kenya`;
    try {
      await navigator.clipboard.writeText(summary);
      // toast.success('Report summary copied to clipboard!');
    } catch {
      // Final fallback: open mailto with the summary
      window.open(`mailto:?subject=${encodeURIComponent(`${governor.name} Report Card`)}&body=${encodeURIComponent(summary)}`);
    }
  }, [governor]);

  if (!governor) return null;

  const auditColors: Record<string, string> = {
    unmodified: 'text-green-600',
    qualified: 'text-yellow-600',
    adverse: 'text-red-600',
    disclaimer: 'text-red-800',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-600" /> Governor Report Card
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Shareable performance snapshot — export as PNG or share on WhatsApp/X</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger className="h-8 text-xs w-44 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {all47Governors.map(g => (
                <SelectItem key={g.code} value={g.code}>{g.county}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleSharePNG} className="h-8 text-xs gap-1.5">
            <Share2 className="h-3 w-3" /> Share
          </Button>
        </div>
      </div>

      {/* Report Card */}
      <div ref={cardRef} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-6 max-w-lg mx-auto shadow-lg">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="mb-3">
            <RepAvatar name={governor.name} county={governor.county} size="h-16 w-16" className="mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{governor.name}</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">{governor.county} County Governor</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className={`text-[10px] ${governor.coalition === 'Kenya Kwanza Alliance' ? 'bg-yellow-100 text-yellow-800' : governor.coalition === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
              {governor.party} · {governor.region}
            </Badge>
          </div>
        </div>

        <Separator className="bg-stone-200 dark:bg-stone-700" />

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{governor.population.toLocaleString()}</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Population</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{governor.areaSqKm.toLocaleString()}</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Area (km²)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{governor.constituenciesCount}</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Constituencies</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{governor.wardsCount}</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Wards</p>
          </div>
        </div>

        <Separator className="bg-stone-200 dark:bg-stone-700 my-5" />

        {/* Audit Opinion */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">Latest Audit Opinion</p>
            <Badge variant="outline" className="text-[9px] ml-auto">{latestAudit.financialYear}</Badge>
          </div>
          <div className="space-y-2">
            {['unmodified', 'qualified', 'adverse', 'disclaimer'].map((op) => (
              <div key={op} className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-300 dark:text-stone-400 capitalize">{op}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    op === 'unmodified' ? 'bg-green-500' :
                    op === 'qualified' ? 'bg-yellow-500' :
                    op === 'adverse' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <span className="text-stone-400 dark:text-stone-500">See county report</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-stone-200 dark:bg-stone-700 my-5" />

        {/* Budget */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">Budget Absorption (Dev)</p>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={latestBudget.avgDevelopmentAbsorption} className="h-3 flex-1" />
            <span className="text-sm font-bold text-stone-700 dark:text-stone-200">{latestBudget.avgDevelopmentAbsorption}%</span>
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">National average — {latestBudget.period}</p>
        </div>

        <Separator className="bg-stone-200 dark:bg-stone-700 my-5" />

        {/* Footer */}
        <div className="text-center">
          <p className="text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">Kenya Governance Explorer · 2022–2027</p>
          <p className="text-[9px] text-stone-400 dark:text-stone-500 mt-1">Data: OAG · CoB · IEBC · TI-Kenya</p>
          <p className="text-[9px] text-stone-300 dark:text-stone-600 mt-1">Verified: 2026-07-28</p>
        </div>
        {/* AI Chat Widget */}
        <div className="flex justify-end mt-3">
          <RepChatWidget rep={{ name: governor.name, title: 'Governor', county: governor.county, party: governor.party, coalition: governor.coalition }} />
        </div>
      </div>

      {/* Share options */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">Share this report card</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => {
              const text = `${governor.name} — ${governor.county} County Governor Report Card\nKenya Governance Explorer`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}>
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={() => {
              const text = `${governor.name} — ${governor.county} County Governor Report Card #KenyaGovernance #CountyScorecard`;
              window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}>
              X (Twitter)
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={handleSharePNG}>
              <Download className="h-3 w-3" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
