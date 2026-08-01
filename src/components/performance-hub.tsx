'use client';

import React, { useState, Suspense, lazy } from 'react';
import { Building2, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ServiceDeliveryPage = lazy(() => import('@/components/service-delivery-page'));
const CECMPerformancePage = lazy(() => import('@/components/cecm-performance-page'));

const SUBTABS = [
  { id: 'serviceDelivery', label: 'Service Delivery', icon: Building2 },
  { id: 'cecm', label: 'CECM Performance', icon: Award },
] as const;

export default function PerformanceHub() {
  const [activeTab, setActiveTab] = useState<string>('serviceDelivery');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <header className="bg-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Performance</h1>
          <p className="mt-1 text-purple-100 text-sm sm:text-base">
            Service delivery metrics &amp; CECM performance scores
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
                ? 'bg-purple-600 text-white shadow-sm'
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
          {activeTab === 'serviceDelivery' && <ServiceDeliveryPage />}
          {activeTab === 'cecm' && <CECMPerformancePage />}
        </Suspense>
      </div>
    </div>
  );
}
