'use client';

import React, { useState, Suspense, lazy } from 'react';
import { Trophy, Flag, GitCompare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CountyRankingsPage = lazy(() => import('@/components/county-rankings-page'));
const DevolutionMilestonesPage = lazy(() => import('@/components/devolution-milestones-page'));
const CoalitionComparisonPage = lazy(() => import('@/components/coalition-comparison-page'));

const SUBTABS = [
  { id: 'rankings', label: 'County Rankings', icon: Trophy },
  { id: 'milestones', label: 'Devolution Milestones', icon: Flag },
  { id: 'coalition', label: 'Coalition Comparison', icon: GitCompare },
] as const;

export default function InsightsHub() {
  const [activeTab, setActiveTab] = useState<string>('rankings');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Insights</h1>
          <p className="mt-1 text-emerald-100 text-sm sm:text-base">
            County rankings, devolution milestones &amp; coalition analysis
          </p>
        </div>
      </header>

      {/* Sub-tabs */}
      <nav className="overflow-x-auto flex gap-2 px-4 py-2 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        {SUBTABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          {activeTab === 'rankings' && <CountyRankingsPage />}
          {activeTab === 'milestones' && <DevolutionMilestonesPage />}
          {activeTab === 'coalition' && <CoalitionComparisonPage />}
        </Suspense>
      </div>
    </div>
  );
}
