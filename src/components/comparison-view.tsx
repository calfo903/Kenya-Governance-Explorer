'use client';

import React from 'react';
import {
  ComparisonItem, Representative, County,
  getScoreColor, getScoreLabel, ScorecardMetrics,
} from '@/data/types';
import { XCircle, GitCompare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ══════════════════════════════════════════════════════════════════
// COMPARISON VIEW
// ══════════════════════════════════════════════════════════════════
export default function ComparisonView({ comparisonList, removeFromComparison, addToComparison, allCounties }: {
  comparisonList: ComparisonItem[]; removeFromComparison: (id: string) => void;
  addToComparison: (rep: Representative, countyName: string) => void; allCounties: County[];
}) {
  const metricLabels: Record<keyof ScorecardMetrics, string> = {
    overallAccountabilityScore: 'Accountability', transparencyAssetDeclaration: 'Transparency', projectDeliveryAbsorptionRate: 'Delivery',
    manifestoPromiseFulfillment: 'Manifesto', legislativeOversightPerformance: 'Oversight', ethicsIntegrity: 'Ethics', publicSentimentCitizenAwareness: 'Sentiment',
  };
  return (
    <div className="space-y-5">
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><GitCompare className="h-4 w-4 text-emerald-600" /> Side-by-Side Comparison (max 4)</CardTitle><CardDescription className="text-xs">Add officials from the Tree or County Explorer tabs.</CardDescription></CardHeader>
        <CardContent>
          {comparisonList.length > 0 ? (
            <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-stone-200"><th className="text-left py-2 px-2 font-semibold sticky left-0 bg-white min-w-[150px]">Metric</th>{comparisonList.map(item => <th key={item.representative.id} className="text-left py-2 px-2 min-w-[180px]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold">{item.representative.fullName}</p><p className="text-[10px] text-stone-400 font-normal">{item.representative.officialTitle} · {item.countyName}</p></div><Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeFromComparison(item.representative.id)}><XCircle className="h-3.5 w-3.5 text-red-400" /></Button></div></th>)}</tr></thead>
            <tbody>
              <tr className="border-b border-stone-100 bg-stone-50"><td className="py-1.5 px-2 font-medium">Party</td>{comparisonList.map(item => <td key={item.representative.id} className="py-1.5 px-2"><Badge variant="secondary" className="text-[10px]">{item.representative.politicalParty}</Badge></td>)}</tr>
              {(Object.entries(metricLabels) as [keyof ScorecardMetrics, string][]).map(([key, label]) => (
                <tr key={key} className="border-b border-stone-100 hover:bg-stone-50"><td className="py-1.5 px-2">{label}</td>{comparisonList.map(item => { const val = item.representative.scorecard?.metrics[key]; return <td key={item.representative.id} className="py-1.5 px-2"><span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-bold ${getScoreColor(val)}`}>{getScoreLabel(val)}</span></td>; })}</tr>
              ))}
            </tbody></table></div>
          ) : (
            <div className="text-center py-12"><GitCompare className="h-10 w-10 text-stone-300 mx-auto mb-2" /><p className="text-xs text-stone-400">Select officials from the Tree or County Explorer to compare.</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
