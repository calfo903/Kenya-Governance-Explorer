'use client';

import React from 'react';
import {
  nationalSummary, getLatestAuditSummary, getLatestBudgetSummary,
  governorCoalitionDistribution,
} from '@/data/national-summary';
import { allSources } from '@/data/sources';
import { MapPin, CheckCircle2, TrendingDown, AlertTriangle, Scale, BarChart3, ExternalLink, TrendingUp, Minus, GitCompare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ExportButton from '@/components/export-button';
import { exportCountiesToCSV } from '@/lib/data-export';
import type { TabId } from './tab-types';

// ══════════════════════════════════════════════════════════════════
// NATIONAL SUMMARY DASHBOARD
// ══════════════════════════════════════════════════════════════════
export default function NationalSummaryDashboard({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const latestAudit = getLatestAuditSummary();
  const prevAudit = nationalSummary.auditSummaries[1];
  const latestBudget = getLatestBudgetSummary();

  return (
    <div className="space-y-5">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">National Dashboard</h2>
          <p className="text-xs text-stone-500">Evidence-based overview of Kenya's 47 county governments</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            variant="outline"
            size="sm"
            label="Export CSV"
            onClick={() => exportCountiesToCSV()}
          />
          <button
            onClick={() => onNavigate('compareEnhanced')}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Compare Counties
          </button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Counties', value: '47', sub: 'Devolved Units', icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Clean Audits (Exec)', value: latestAudit.countyExecutive.unmodified.toString(), sub: `of 47 (${latestAudit.financialYear})`, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Dev Absorption', value: `${latestBudget.avgDevelopmentAbsorption}%`, sub: latestBudget.period, icon: TrendingDown, color: 'text-red-600 bg-red-50' },
          { label: 'Unspent Funds', value: latestBudget.totalUnspentAmount || '—', sub: 'Development Budget', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-stone-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 leading-tight">{stat.value}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* OAG Audit */}
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-600" /> OAG Audit Opinions — {latestAudit.financialYear}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">Latest</Badge>
            </div>
            <CardDescription className="text-xs">{latestAudit.source.source} — {latestAudit.source.reportTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-2.5">County Executives</p>
              <div className="space-y-2">
                {[
                  { label: 'Unmodified', count: latestAudit.countyExecutive.unmodified, color: 'bg-green-500' },
                  { label: 'Qualified', count: latestAudit.countyExecutive.qualified, color: 'bg-yellow-500' },
                  { label: 'Adverse', count: latestAudit.countyExecutive.adverse, color: 'bg-orange-500' },
                  { label: 'Disclaimer', count: latestAudit.countyExecutive.disclaimer, color: 'bg-red-500' },
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
              <p className="text-xs font-semibold text-stone-600 mb-2.5">County Assemblies</p>
              <div className="space-y-2">
                {[
                  { label: 'Unmodified', count: latestAudit.countyAssembly.unmodified, color: 'bg-green-500' },
                  { label: 'Qualified', count: latestAudit.countyAssembly.qualified, color: 'bg-yellow-500' },
                  { label: 'Adverse', count: latestAudit.countyAssembly.adverse, color: 'bg-orange-500' },
                  { label: 'Disclaimer', count: latestAudit.countyAssembly.disclaimer, color: 'bg-red-500' },
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
            {latestAudit.source.url && (
              <a href={latestAudit.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> View full report
              </a>
            )}
          </CardContent>
        </Card>

        {/* CoB Budget */}
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-600" /> CoB Budget Absorption — {latestBudget.financialYear}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">{latestBudget.period}</Badge>
            </div>
            <CardDescription className="text-xs">{latestBudget.source.source} — {latestBudget.source.reportTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-xl text-center border border-red-100">
                <p className="text-[10px] font-medium text-red-600 uppercase tracking-wider">Development</p>
                <p className="text-3xl font-bold text-red-700 mt-0.5">{latestBudget.avgDevelopmentAbsorption}%</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Recurrent</p>
                <p className="text-3xl font-bold text-emerald-700 mt-0.5">{latestBudget.avgRecurrentAbsorption}%</p>
              </div>
            </div>
            {latestBudget.totalUnspentAmount && (
              <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">Total Unspent</p>
                <p className="text-xl font-bold text-amber-800 mt-0.5">{latestBudget.totalUnspentAmount}</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Top Performers</p>
              {latestBudget.topPerformers.map(c => (
                <div key={c.county} className="flex justify-between items-center px-3 py-1.5 bg-green-50 rounded-lg text-xs">
                  <span className="font-medium">{c.county}</span>
                  <span className="font-bold text-green-700">{c.rate}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Bottom Performers</p>
              {latestBudget.bottomPerformers.map(c => (
                <div key={c.county} className="flex justify-between items-center px-3 py-1.5 bg-red-50 rounded-lg text-xs">
                  <span className="font-medium">{c.county}</span>
                  <span className="font-bold text-red-700">{c.rate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* YoY + Coalition + Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {prevAudit && (
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Year-over-Year Trend</CardTitle>
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
                      <span className="text-stone-400">{item.prev}</span>
                      {item.curr > item.prev ? <TrendingUp className="h-3 w-3 text-green-600" /> : item.curr < item.prev ? <TrendingDown className="h-3 w-3 text-red-600" /> : <Minus className="h-3 w-3 text-stone-400" />}
                      <span className="font-bold">{item.curr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Governor Coalition Split</CardTitle>
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
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Score Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { color: 'bg-green-500', label: '80–100', desc: 'Strong performance', text: 'text-green-700' },
              { color: 'bg-yellow-500', label: '50–79', desc: 'Moderate', text: 'text-yellow-700' },
              { color: 'bg-red-500', label: '< 50', desc: 'Weak performance', text: 'text-red-700' },
              { color: 'bg-stone-300', label: 'N/A', desc: 'Data not available', text: 'text-stone-500' },
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
