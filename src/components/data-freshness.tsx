'use client';

import React from 'react';
import { nationalSummary } from '@/data/national-summary';
import { Clock, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DataFreshnessProps {
  source?: string;
  compact?: boolean;
}

export function DataFreshnessIndicator({ source, compact }: DataFreshnessProps) {
  const latestAudit = nationalSummary.auditSummaries[0];
  const latestBudget = nationalSummary.budgetSummaries[0];

  const sources = [
    { name: 'OAG Audits', verified: latestAudit?.source.accessedDate || '2026-07-25', url: 'https://oagkenya.go.ke/' },
    { name: 'CoB Budget', verified: latestBudget?.source.accessedDate || '2026-07-25', url: 'https://cob.go.ke/' },
    { name: 'IEBC', verified: '2022-08-22', url: 'https://www.iebc.or.ke/' },
    { name: 'EACC', verified: '2026-07-28', url: 'https://eacc.go.ke/' },
    { name: 'TI-Kenya', verified: '2026-01-15', url: 'https://tikenya.org/' },
  ];

  if (source) {
    const found = sources.find(s => s.name.toLowerCase().includes(source.toLowerCase()));
    if (!found) return null;
    const isStale = new Date(found.verified) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    return (
      <div className={`flex items-center gap-1 text-[10px] ${isStale ? 'text-amber-600' : 'text-stone-400'}`}>
        <Clock className="h-2.5 w-2.5" />
        <span>Verified: {found.verified}</span>
        {isStale && <AlertTriangle className="h-2.5 w-2.5" />}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500">
        <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
        <span>Updated: {latestAudit?.source.accessedDate || '2026-07-25'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {sources.map(s => {
        const isStale = new Date(s.verified) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        return (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border transition-colors ${
              isStale ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30'
              : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
            }`}>
            {isStale ? <AlertTriangle className="h-2.5 w-2.5" /> : <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />}
            <span>{s.name}: {s.verified}</span>
          </a>
        );
      })}
    </div>
  );
}
