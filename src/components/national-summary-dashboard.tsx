'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  nationalSummary, getLatestAuditSummary, getLatestBudgetSummary,
  governorCoalitionDistribution,
} from '@/data/national-summary';
import { allSources } from '@/data/sources';
import { MapPin, CheckCircle2, TrendingDown, AlertTriangle, Scale, BarChart3, ExternalLink, TrendingUp, Minus, GitCompare, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ExportButton from '@/components/export-button';
import { exportCountiesToCSV } from '@/lib/data-export';
import type { TabId } from './tab-types';
import KenyanFlagLogo from '@/components/kenyan-flag-logo';

// ══════════════════════════════════════════════════════════════════
// ANIMATED COUNTER HOOK
// ══════════════════════════════════════════════════════════════════
function useAnimatedCounter(target: number, duration: number = 1500): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    startRef.current = performance.now();
    const animate = (now: number) => {
      if (!startRef.current) return;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target * 10) / 10);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

// ══════════════════════════════════════════════════════════════════
// NATIONAL SUMMARY DASHBOARD
// ══════════════════════════════════════════════════════════════════
export default function NationalSummaryDashboard({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const t = useTranslations();
  const latestAudit = getLatestAuditSummary();
  const prevAudit = nationalSummary.auditSummaries[1];
  const latestBudget = getLatestBudgetSummary();

  // Animated counter values
  const animatedCounties = useAnimatedCounter(47);
  const animatedCleanAudit = useAnimatedCounter(1);
  const animatedAbsorption = useAnimatedCounter(58.3);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5">
      {/* ══════════ HERO BANNER ══════════ */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-emerald-700 to-emerald-500 dark:from-emerald-900 dark:to-emerald-700">
        {/* Kenya-themed pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />

        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          {/* Hero title */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <KenyanFlagLogo size={44} className="drop-shadow-lg" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Kenya Devolution at a Glance</h2>
            <p className="text-xs text-emerald-100">Real-time national summary of county governance performance</p>
          </div>

          {/* Animated counters row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {/* Counties */}
            <div className="text-center">
              <MapPin className="h-5 w-5 text-emerald-200 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white tabular-nums">{animatedCounties}</p>
              <p className="text-xs text-emerald-100 mt-0.5">Counties</p>
            </div>
            {/* Equitable Share */}
            <div className="text-center">
              <Scale className="h-5 w-5 text-emerald-200 mx-auto mb-2" />
              <p className={`text-3xl font-bold text-white transition-opacity duration-1000 tabular-nums ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>KSh 387.4B</p>
              <p className="text-xs text-emerald-100 mt-0.5">Equitable Share</p>
            </div>
            {/* Clean Audit */}
            <div className="text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-200 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white tabular-nums">{animatedCleanAudit}</p>
              <p className="text-xs text-emerald-100 mt-0.5">Clean Audit</p>
            </div>
            {/* Avg Dev Absorption */}
            <div className="text-center">
              <TrendingDown className="h-5 w-5 text-emerald-200 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white tabular-nums">{Math.round(animatedAbsorption * 10) / 10}%</p>
              <p className="text-xs text-emerald-100 mt-0.5">Avg Dev Absorption</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto">
            <button
              onClick={() => onNavigate('summary')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-emerald-200 hover:bg-white/25 transition-colors cursor-text"
            >
              <Search className="h-4 w-4 text-emerald-200" />
              <span className="text-sm text-emerald-200">Search counties, tools, data...</span>
              <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] text-emerald-200">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Top Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{t('dashboard.nationalDashboard')}</h2>
          <p className="text-sm text-stone-500">{t('dashboard.dashboardSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            variant="outline"
            size="sm"
            label={t('common.exportCsv')}
            onClick={() => exportCountiesToCSV()}
          />
          <button
            onClick={() => onNavigate('compareEnhanced')}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <GitCompare className="h-3.5 w-3.5" />
            {t('common.compareCounties')}
          </button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('sidebar.counties'), value: '47', sub: t('budget.devolvedUnits'), icon: MapPin, color: 'text-emerald-600 bg-emerald-50', cardClass: 'stat-card card-lift stat-gradient-emerald' },
          { label: t('budget.cleanAuditsExec'), value: latestAudit.countyExecutive.unmodified.toString(), sub: `of 47 (${latestAudit.financialYear})`, icon: CheckCircle2, color: 'text-green-600 bg-green-50', cardClass: 'stat-card card-lift stat-gradient-blue accent-blue' },
          { label: t('budget.avgDevAbsorption'), value: `${latestBudget.avgDevelopmentAbsorption}%`, sub: latestBudget.period, icon: TrendingDown, color: 'text-red-600 bg-red-50', cardClass: 'stat-card card-lift stat-gradient-red accent-red' },
          { label: t('budget.unspentFunds'), value: latestBudget.totalUnspentAmount || '—', sub: t('budget.developmentBudget'), icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', cardClass: 'stat-card card-lift stat-gradient-amber accent-amber' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-xl border border-stone-200 p-4 ${'cardClass' in stat ? stat.cardClass : ''}`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-stone-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 leading-tight"><span className="tabular-nums">{stat.value}</span></p>
            <p className="text-[11px] text-stone-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* OAG Audit */}
        <Card className="border-stone-200 bg-white card-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-600" /> {t('audit.oagAuditOpinions')} — {latestAudit.financialYear}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">{t('common.latest')}</Badge>
            </div>
            <CardDescription className="text-xs">{latestAudit.source.source} — {latestAudit.source.reportTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-2.5">{t('audit.countyExecutives')}</p>
              <div className="space-y-2">
                {[
                  { label: t('audit.unmodified'), count: latestAudit.countyExecutive.unmodified, color: 'bg-green-500' },
                  { label: t('audit.qualified'), count: latestAudit.countyExecutive.qualified, color: 'bg-yellow-500' },
                  { label: t('audit.adverse'), count: latestAudit.countyExecutive.adverse, color: 'bg-orange-500' },
                  { label: t('audit.disclaimer'), count: latestAudit.countyExecutive.disclaimer, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-xs w-24 text-stone-600">{item.label}</span>
                    <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full flex items-center justify-end pr-1.5 transition-all`}
                        style={{ width: `${Math.max((item.count / 47) * 100, item.count > 0 ? 6 : 0)}%` }}>
                        <span className="text-[10px] font-bold text-white">{item.count}</span>
                      </div>
                    </div>
                    <span className="text-xs w-9 text-right text-stone-500">{Math.round((item.count / 47) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-2.5">{t('audit.countyAssemblies')}</p>
              <div className="space-y-2">
                {[
                  { label: t('audit.unmodified'), count: latestAudit.countyAssembly.unmodified, color: 'bg-green-500' },
                  { label: t('audit.qualified'), count: latestAudit.countyAssembly.qualified, color: 'bg-yellow-500' },
                  { label: t('audit.adverse'), count: latestAudit.countyAssembly.adverse, color: 'bg-orange-500' },
                  { label: t('audit.disclaimer'), count: latestAudit.countyAssembly.disclaimer, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-xs w-24 text-stone-600">{item.label}</span>
                    <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full flex items-center justify-end pr-1.5 transition-all`}
                        style={{ width: `${Math.max((item.count / 47) * 100, item.count > 0 ? 6 : 0)}%` }}>
                        <span className="text-[10px] font-bold text-white">{item.count}</span>
                      </div>
                    </div>
                    <span className="text-xs w-9 text-right text-stone-500 tabular-nums">{Math.round((item.count / 47) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            {latestAudit.source.url && (
              <a href={latestAudit.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> {t('common.viewFullReport')}
              </a>
            )}
          </CardContent>
        </Card>

        {/* CoB Budget */}
        <Card className="border-stone-200 bg-white card-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-600" /> {t('budget.cobBudgetAbsorption')} — {latestBudget.financialYear}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">{latestBudget.period}</Badge>
            </div>
            <CardDescription className="text-xs">{latestBudget.source.source} — {latestBudget.source.reportTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-xl text-center border border-red-100">
                <p className="text-[10px] font-medium text-red-600 uppercase tracking-wider">{t('budget.development')}</p>
                <p className="text-3xl font-bold text-red-700 mt-0.5 tabular-nums">{latestBudget.avgDevelopmentAbsorption}%</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">{t('budget.recurrent')}</p>
                <p className="text-3xl font-bold text-emerald-700 mt-0.5 tabular-nums">{latestBudget.avgRecurrentAbsorption}%</p>
              </div>
            </div>
            {latestBudget.totalUnspentAmount && (
              <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">{t('budget.totalUnspent')}</p>
                <p className="text-xl font-bold text-amber-800 mt-0.5 tabular-nums">{latestBudget.totalUnspentAmount}</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {t('budget.topPerformers')}</p>
              {latestBudget.topPerformers.map(c => (
                <div key={c.county} className="flex justify-between items-center px-3 py-1.5 bg-green-50 rounded-lg text-xs">
                  <span className="font-medium">{c.county}</span>
                  <span className="font-bold text-green-700 tabular-nums">{c.rate}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {t('budget.bottomPerformers')}</p>
              {latestBudget.bottomPerformers.map(c => (
                <div key={c.county} className="flex justify-between items-center px-3 py-1.5 bg-red-50 rounded-lg text-xs">
                  <span className="font-medium">{c.county}</span>
                  <span className="font-bold text-red-700 tabular-nums">{c.rate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* YoY + Coalition + Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {prevAudit && (
          <Card className="border-stone-200 bg-white card-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t('dashboard.yearOverYearTrend')}</CardTitle>
              <CardDescription className="text-xs">FY {prevAudit.financialYear} → {latestAudit.financialYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Exec Clean', prev: prevAudit.countyExecutive.unmodified, curr: latestAudit.countyExecutive.unmodified },
                  { label: 'Exec Qualified', prev: prevAudit.countyExecutive.qualified, curr: latestAudit.countyExecutive.qualified },
                  { label: 'Assembly Clean', prev: prevAudit.countyAssembly.unmodified, curr: latestAudit.countyAssembly.unmodified },
                  { label: 'Adverse', prev: prevAudit.countyExecutive.adverse, curr: latestAudit.countyExecutive.adverse },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-stone-600 w-28">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 tabular-nums">{item.prev}</span>
                      {item.curr > item.prev ? <TrendingUp className="h-3 w-3 text-green-600" /> : item.curr < item.prev ? <TrendingDown className="h-3 w-3 text-red-600" /> : <Minus className="h-3 w-3 text-stone-400" />}
                      <span className="font-bold tabular-nums">{item.curr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-stone-200 bg-white card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t('dashboard.governorCoalitionSplit')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(governorCoalitionDistribution).map(([coal, count]) => (
              <div key={coal} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  coal === 'Kenya Kwanza Alliance' ? 'bg-yellow-100 text-yellow-800' :
                  coal === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-100 text-blue-800' :
                  'bg-stone-100 text-stone-700'
                }`}>{count}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{coal}</p>
                  <div className="h-1.5 bg-stone-100 rounded-full mt-1">
                    <div className={`h-full rounded-full ${coal === 'Kenya Kwanza Alliance' ? 'bg-yellow-400' : coal === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-400' : 'bg-stone-400'}`}
                      style={{ width: `${(count / 47) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs text-stone-400">{Math.round((count / 47) * 100)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white card-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t('dashboard.scoreLegend')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { color: 'bg-green-500', label: '80–100', desc: t('dashboard.strongPerformance'), text: 'text-green-700' },
              { color: 'bg-yellow-500', label: '50–79', desc: t('dashboard.moderate'), text: 'text-yellow-700' },
              { color: 'bg-red-500', label: '< 50', desc: t('dashboard.weakPerformance'), text: 'text-red-700' },
              { color: 'bg-stone-300', label: 'N/A', desc: t('dashboard.dataNotAvailable'), text: 'text-stone-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-xs">
                <span className={`w-6 h-6 rounded ${item.color}`} />
                <div>
                  <span className={`font-semibold ${item.text}`}>{item.label}</span>
                  <span className="text-stone-500 ml-1.5">{item.desc}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
