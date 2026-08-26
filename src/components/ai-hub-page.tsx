'use client';

import { useState } from 'react';
import { lazy, Suspense } from 'react';
import { Bot, TrendingDown, Newspaper, FileText, Brain, Sparkles, BookOpen, GraduationCap, Search, TrendingUp, MapPin, AlertTriangle, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AIChatPage = lazy(() => import('@/components/ai-chat-page'));
const AIBudgetAnomalyPage = lazy(() => import('@/components/ai-budget-anomaly-page'));
const AINewsPage = lazy(() => import('@/components/ai-news-page'));
const AIRTILetterPage = lazy(() => import('@/components/ai-rti-letter-page'));
const AIReportIntelPage = lazy(() => import('@/components/ai-report-intel-page'));
const AICompareInsightsPage = lazy(() => import('@/components/ai-compare-insights-page'));
const AIHansardPage = lazy(() => import('@/components/ai-hansard-page'));
const AIQuizPage = lazy(() => import('@/components/ai-quiz-page'));
const AISearchPage = lazy(() => import('@/components/ai-search-page'));
const AISentimentPage = lazy(() => import('@/components/ai-sentiment-page'));
const AIProfilePage = lazy(() => import('@/components/ai-profile-page'));
const AIProcurementRiskPage = lazy(() => import('@/components/ai-procurement-risk-page'));

interface SubTab {
  id: string;
  label: string;
  icon: LucideIcon;
  component: React.LazyExoticComponent<React.ComponentType>;
}

const subTabs: SubTab[] = [
  { id: 'chat', label: 'AI Chat', icon: Bot, component: AIChatPage },
  { id: 'budgetAnomaly', label: 'Budget Anomaly', icon: TrendingDown, component: AIBudgetAnomalyPage },
  { id: 'news', label: 'AI News', icon: Newspaper, component: AINewsPage },
  { id: 'rtiLetter', label: 'RTI Letter', icon: FileText, component: AIRTILetterPage },
  { id: 'reportIntel', label: 'Report Intel', icon: Brain, component: AIReportIntelPage },
  { id: 'compareInsights', label: 'Compare Insights', icon: Sparkles, component: AICompareInsightsPage },
  { id: 'hansard', label: 'Hansard Summary', icon: BookOpen, component: AIHansardPage },
  { id: 'quiz', label: 'AI Quiz', icon: GraduationCap, component: AIQuizPage },
  { id: 'search', label: 'AI Search', icon: Search, component: AISearchPage },
  { id: 'sentiment', label: 'Sentiment', icon: TrendingUp, component: AISentimentPage },
  { id: 'profile', label: 'County Profile', icon: MapPin, component: AIProfilePage },
  { id: 'procurementRisk', label: 'Procurement Risk', icon: AlertTriangle, component: AIProcurementRiskPage },
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

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState<string>('chat');
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
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
            AI Governance Tools
          </h1>
        </div>
        <p className="ml-[52px] text-sm text-stone-500 dark:text-stone-400">
          12 AI-powered tools for county governance analysis
        </p>
      </header>

      {/* Sub-tab Navigation */}
      <nav
        className="shrink-0 border-b border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-sm"
        aria-label="AI Tools"
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
                    ? 'bg-emerald-600 text-white shadow-sm'
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
