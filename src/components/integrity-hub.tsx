use client;

import React, { useState, Suspense, lazy } from 'react';
import { Eye, ShieldCheck, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const WhistleblowerPage = lazy(() => import('@/components/whistleblower-page'));
const AnonymousTipPage = lazy(() => import('@/components/anonymous-tip-page'));

const SUBTABS = [
  { id: 'whistleblower', label: 'Whistleblower', icon: Eye },
  { id: 'securetip', label: 'Secure Tip', icon: ShieldCheck },
  { id: 'tiptsubmit', label: 'Anonymous Tip', icon: Send },
] as const;

export default function IntegrityHub() {
  const [activeTab, setActiveTab] = useState<string>('whistleblower');
  const [contentKey, setContentKey] = useState(0);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setContentKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <Eye className="w-7 h-7" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Integrity & Whistleblowing
            </h1>
          </div>
          <p className="mt-1 text-red-100 text-sm sm:text-base">
            Report corruption, submit anonymous tips & secure whistleblowing
          </p>
        </div>
      </header>

      <nav className="overflow-x-auto flex gap-2 px-4 py-2 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        {SUBTABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto">
        <div key={contentKey} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            {activeTab === 'whistleblower' && <WhistleblowerPage />}
            {activeTab === 'securetip' && <AnonymousTipPage />}
            {activeTab === 'tiptsubmit' && <AnonymousTipPage />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}