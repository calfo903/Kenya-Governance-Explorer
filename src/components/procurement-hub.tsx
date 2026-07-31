'use client';

import { useState, lazy, Suspense } from 'react';
import { AlertTriangle, ShoppingCart, AlertOctagon, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ProcurementMonitorPage = lazy(() => import('@/components/procurement-monitor-page'));
const ProcurementRedFlagsPage = lazy(() => import('@/components/procurement-redflags-page'));

interface SubTab {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.LazyExoticComponent<React.ComponentType>;
}

const subTabs: SubTab[] = [
  { id: 'monitor', label: 'Procurement Monitor', icon: ShoppingCart, component: ProcurementMonitorPage },
  { id: 'redflags', label: 'Red Flags', icon: AlertOctagon, component: ProcurementRedFlagsPage },
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

export default function ProcurementHub() {
  const [activeTab, setActiveTab] = useState<string>('monitor');

  const activeSubTab = subTabs.find((tab) => tab.id === activeTab);
  const ActiveComponent = activeSubTab?.component;

  return (
    <div className="flex flex-col h-full">
      {/* Hub Header */}
      <header className="shrink-0 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            Procurement Hub
          </h1>
        </div>
        <p className="ml-[52px] text-sm text-stone-500 dark:text-stone-400">
          Monitor county procurement &amp; identify red flags
        </p>
      </header>

      {/* Sub-tab Navigation */}
      <nav
        className="shrink-0 border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-sm"
        aria-label="Procurement Hub"
      >
        <div className="overflow-x-auto flex gap-2 px-6 py-3 scrollbar-none">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  'inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ' +
                  (isActive
                    ? 'bg-amber-600 text-white shadow-sm'
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
        <Suspense fallback={<LoadingSkeleton />}>
          {ActiveComponent && <ActiveComponent />}
        </Suspense>
      </div>
    </div>
  );
}
