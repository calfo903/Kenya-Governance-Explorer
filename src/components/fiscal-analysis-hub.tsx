'use client';

import { useState, lazy, Suspense } from 'react';
import { Zap, PieChart, BarChart3, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AuditTrendsPage = lazy(() => import('@/components/audit-trends-page'));
const BudgetScatterPage = lazy(() => import('@/components/budget-scatter-page'));
const FYComparisonPage = lazy(() => import('@/components/fy-comparison-page'));

interface SubTab {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.LazyExoticComponent<React.ComponentType>;
}

const subTabs: SubTab[] = [
  { id: 'auditTrends', label: 'Audit Trends', icon: Zap, component: AuditTrendsPage },
  { id: 'budgetScatter', label: 'Budget Scatter', icon: PieChart, component: BudgetScatterPage },
  { id: 'fyComparison', label: 'FY Comparison', icon: BarChart3, component: FYComparisonPage },
];

function LoadingSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default function FiscalAnalysisHub() {
  const [activeTab, setActiveTab] = useState<string>('auditTrends');
  const [contentKey, setContentKey] = useState(0);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setContentKey(prev => prev + 1);
  };

  const activeSubTab = subTabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeSubTab?.component;

  return (
    <div className="flex flex-col h-full">
      {/* Hub Header */}
      <header className="shrink-0 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            Fiscal Analysis
          </h1>
        </div>
        <p className="ml-[52px] text-sm text-stone-500 dark:text-stone-400">
          Audit trends, budget analysis &amp; year-over-year comparisons
        </p>
      </header>

      {/* Sub-tab Navigation */}
      <nav
        className="shrink-0 border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-sm"
        aria-label="Fiscal Analysis"
      >
        <div className="overflow-x-auto flex gap-2 px-6 py-3 scrollbar-none">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={
                  'inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ' +
                  (isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700')
                }
                aria-selected={isActive}
                role="tab"
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sub-tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div key={contentKey} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Suspense fallback={<LoadingSkeleton />}>
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
