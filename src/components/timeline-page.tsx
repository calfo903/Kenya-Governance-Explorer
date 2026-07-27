'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock, Calendar, Landmark, BookOpen, Scale, TrendingUp,
  AlertTriangle, Filter, Search, ExternalLink, ChevronRight,
  Vote, FileText, Gavel, Shield, Users, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

type EventCategory = 'election' | 'audit' | 'budget' | 'legislation' | 'anticorruption' | 'devolution';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  category: EventCategory;
  source?: string;
  sourceUrl?: string;
  icon?: string;
}

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  election: { label: 'Elections', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', icon: <Vote className="h-3.5 w-3.5 text-blue-600" /> },
  audit: { label: 'Audit', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: <FileText className="h-3.5 w-3.5 text-emerald-600" /> },
  budget: { label: 'Budget', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', icon: <BarChart3 className="h-3.5 w-3.5 text-amber-600" /> },
  legislation: { label: 'Legislation', color: 'text-purple-700', bg: 'bg-purple-100 border-purple-200', icon: <Scale className="h-3.5 w-3.5 text-purple-600" /> },
  anticorruption: { label: 'Anti-Corruption', color: 'text-red-700', bg: 'bg-red-100 border-red-200', icon: <Shield className="h-3.5 w-3.5 text-red-600" /> },
  devolution: { label: 'Devolution', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200', icon: <Landmark className="h-3.5 w-3.5 text-slate-600" /> },
};

const TIMELINE_EVENTS: TimelineEvent[] = [
  // 2010
  { date: '2010-08-27', title: 'Constitution of Kenya Promulgated', description: 'The new Constitution of Kenya 2010 was promulgated at Uhuru Park, Nairobi, establishing devolved governance, a Bill of Rights, and 47 county governments under Chapter 11.', category: 'legislation', source: 'Kenya Gazette Supplement No. 135', sourceUrl: 'https://kenyalaw.org/klr/' },
  { date: '2010-08-27', title: 'Chapter 11: Devolved Government Established', description: 'The Constitution created 47 county governments with executive and legislative authority, establishing the framework for devolution that would transform Kenyan governance.', category: 'devolution', source: 'Constitution of Kenya, Art. 174-200' },
  // 2012
  { date: '2012-05-22', title: 'Commission on Revenue Allocation Established', description: 'CRA established under Article 215 to recommend the equitable sharing of revenue raised nationally between national and county governments.', category: 'legislation', source: 'Commission on Revenue Allocation Act, 2012' },
  // 2013
  { date: '2013-03-04', title: 'First Devolved County Elections', description: 'Kenya held its first devolved elections under the 2010 Constitution. 47 governors, senators, women representatives, MCAs, and county assembly speakers elected. Marked the birth of devolution.', category: 'election', source: 'IEBC Official Results', sourceUrl: 'https://www.iebc.or.ke' },
  { date: '2013-03-27', title: 'Transition to Devolved County Governments', description: 'First 47 county governments were inaugurated. County assemblies held first sittings. County executive committees appointed. Kenya officially became a devolved state.', category: 'devolution', source: 'Transition Authority, Government of Kenya' },
  { date: '2013-07-01', title: 'First County Budgets Take Effect', description: 'County budgets for FY 2013/14 took effect. Revenue sharing formula allocated KSh 210 billion to county governments — 28% of nationally-collected revenue.', category: 'budget', source: 'Commission on Revenue Allocation' },
  // 2014
  { date: '2014-06-20', title: 'First OAG Audit Reports on County Governments', description: 'The Office of the Auditor-General published the first audit reports on county governments (FY 2013/14), revealing significant accountability gaps across nearly all counties.', category: 'audit', source: 'OAG Kenya', sourceUrl: 'https://www.oagkenya.go.ke' },
  { date: '2014-10-16', title: 'EACC Charges Against Governors Begin', description: 'EACC began charging sitting and former governors with corruption-related offenses, marking a new era of accountability for county leadership.', category: 'anticorruption', source: 'EACC', sourceUrl: 'https://www.eacc.go.ke' },
  // 2015
  { date: '2015-01-14', title: 'Public Procurement & Asset Disposal Act (PPAD Act)', description: 'The PPAD Act 2015 enacted, establishing uniform procurement procedures for all public entities including county governments. Set thresholds and oversight mechanisms.', category: 'legislation', source: 'Kenya Gazette Supplement No. 15' },
  { date: '2015-07-01', title: 'County Integrated Development Plans (CIDPs) Published', description: 'All 47 counties published their first 5-year CIDPs (2013-2017), setting strategic development priorities and budgets aligned with the devolution framework.', category: 'devolution', source: 'Various County Governments' },
  // 2016
  { date: '2016-04-21', title: 'Punguza Mizigo Initiative Discussed', description: 'Public discourse on reducing the number of counties from 47 gained momentum, though ultimately the Constitutional Bench rejected the proposal to alter county boundaries.', category: 'legislation', source: 'Parliamentary Debates' },
  { date: '2016-09-06', title: 'Second OAG County Audit Summary: Deteriorating Opinions', description: 'OAG FY 2015/16 audit summary showed worsening county audit opinions — only 2 counties received unmodified opinions, reflecting persistent accountability challenges.', category: 'audit', source: 'OAG Kenya', sourceUrl: 'https://www.oagkenya.go.ke' },
  // 2017
  { date: '2017-08-08', title: 'Second General Election', description: 'Presidential, parliamentary, and county elections held. President Kenyatta declared winner by IEBC. Opposition challenged results, leading to Supreme Court annulment.', category: 'election', source: 'IEBC, Supreme Court of Kenya', sourceUrl: 'https://www.iebc.or.ke' },
  { date: '2017-09-01', title: 'Supreme Court Annuls Presidential Election', description: 'In a historic ruling, the Supreme Court annulled the August 8 presidential election and ordered a fresh election within 60 days — the first in Africa.', category: 'election', source: 'Supreme Court of Kenya, Petition No. 1 of 2017' },
  { date: '2017-10-26', title: 'Fresh Presidential Election', description: 'Fresh presidential election held after Supreme Court annulment. Raila Odinga withdrew. Turnout was significantly lower than the August election.', category: 'election', source: 'IEBC' },
  { date: '2017-10-26', title: 'Second Term County Governments Elected', description: 'Second generation of county governors, senators, and MCAs elected alongside the fresh presidential election. 23 governors re-elected, 24 new governors took office.', category: 'election', source: 'IEBC Official Results' },
  // 2018
  { date: '2018-03-09', title: 'Building Bridges Initiative (BBI) Launched', description: 'President Kenyatta and Raila Odinga launched the "Building Bridges Initiative" to address national divisions. Would later propose constitutional amendments affecting county governance.', category: 'legislation', source: 'Presidential Press Service' },
  { date: '2018-05-31', title: 'CoB First County Budget Implementation Report', description: 'Controller of Budget published first comprehensive county budget implementation review, revealing low development budget absorption rates across many counties.', category: 'budget', source: 'CoB', sourceUrl: 'https://cob.go.ke' },
  // 2019
  { date: '2019-02-01', title: 'CoB Reports KSh 100B Unspent County Funds', description: 'Controller of Budget reported cumulative unspent development funds approaching KSh 100 billion across counties, raising serious concerns about project delivery capacity.', category: 'budget', source: 'CoB FY 2017/18 Review', sourceUrl: 'https://cob.go.ke' },
  { date: '2019-11-07', title: 'First Governors Forum (CoG) Accountability Report', description: 'The Council of Governors published its first self-assessment report on county governance performance, covering all 47 counties.', category: 'anticorruption', source: 'Council of Governors' },
  // 2020
  { date: '2020-07-01', title: 'FY 2020/21 Budget: COVID-19 Impact on Counties', description: 'County budgets adjusted to account for COVID-19 pandemic. Revenue sharing disputes between national and county governments intensified. Counties reported revenue shortfalls.', category: 'budget', source: 'CoB, CRA' },
  // 2021
  { date: '2021-06-01', title: 'OAG: Majority of Counties Get Qualified Opinions (FY 2020/21)', description: 'OAG audit summary for FY 2020/21 showed continued poor financial management — 44 of 47 counties received qualified opinions or worse.', category: 'audit', source: 'OAG Kenya', sourceUrl: 'https://www.oagkenya.go.ke' },
  // 2022
  { date: '2022-08-09', title: 'Third General Election — Current Term', description: 'Kenya held its third general election under the 2010 Constitution. William Ruto elected President. New generation of county governors, senators, and MCAs elected for the 2022-2027 term.', category: 'election', source: 'IEBC Official Results', sourceUrl: 'https://www.iebc.or.ke' },
  { date: '2022-08-25', title: 'Third Generation County Governments Inaugurated', description: '47 county governments for the 2022-2027 term inaugurated. Coalition distribution: 26 Kenya Kwanza, 18 Azimio, 3 Independent governors.', category: 'devolution', source: 'IEBC, Transition Authority' },
  { date: '2022-11-01', title: 'Third Generation CIDPs Published (2023-2027)', description: 'All 47 counties published new 5-year CIDPs aligned with the new political dispensation and Vision 2030 Medium Term Plan III.', category: 'devolution', source: 'Various County Governments' },
  // 2023
  { date: '2023-05-01', title: 'CoB Reports Rising County Revenue Shortfalls', description: 'Controller of Budget flagged growing gaps between county budget allocations and own-source revenue collection, limiting service delivery capacity.', category: 'budget', source: 'CoB Report', sourceUrl: 'https://cob.go.ke' },
  { date: '2023-09-15', title: 'OAG FY 2022/23: 6 Counties Receive Adverse Opinions', description: 'OAG audit summary for FY 2022/23 showed 6 counties received adverse opinions, 38 qualified, 3 unmodified — the worst adverse opinion count in a single year.', category: 'audit', source: 'OAG Kenya', sourceUrl: 'https://www.oagkenya.go.ke' },
  // 2024
  { date: '2024-07-01', title: 'CoB Reports 12 Counties Exceed 70% Dev Absorption (FY 2024/25)', description: 'Controller of Budget reported 12 counties spent over 70% of their development budget in FY 2024/25, while 20 counties spent zero on development in Q1 FY 2025/26.', category: 'budget', source: 'CoB', sourceUrl: 'https://cob.go.ke' },
  // 2025
  { date: '2025-01-01', title: 'TI-Kenya CPI 2025: Kenya Scores 30/100', description: 'Transparency International released its 2025 Corruption Perception Index. Kenya scored 30/100, ranking 130 out of 182 countries — below the sub-Saharan Africa average.', category: 'anticorruption', source: 'TI-Kenya', sourceUrl: 'https://www.tikenya.org' },
  { date: '2025-07-01', title: 'TI-Kenya CGSR 2025 Published', description: 'Transparency International Kenya published its County Governance, Security, and Reconciliation (CGSR) report, assessing governance across all 47 counties.', category: 'anticorruption', source: 'TI-Kenya', sourceUrl: 'https://www.tikenya.org' },
  // 2026
  { date: '2026-05-01', title: 'OAG Summary Report FY 2024/25 Published', description: 'OAG published the latest summary report on county governments for FY 2024/25: 1 unmodified, 44 qualified, 2 adverse, 0 disclaimer for county executives.', category: 'audit', source: 'OAG Kenya', sourceUrl: 'https://www.oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf' },
  { date: '2026-07-01', title: 'CoB Budget Implementation Review FY 2025/26 Half-Year', description: 'Controller of Budget published the half-year budget implementation review for FY 2025/26. Average development absorption at 14% for the half-year period.', category: 'budget', source: 'CoB', sourceUrl: 'https://cob.go.ke/county-budget-implementation-review-reports/' },
];

export default function TimelinePage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const years = useMemo(() => {
    const set = new Set(TIMELINE_EVENTS.map(e => e.date.substring(0, 4)));
    return ['all', ...Array.from(set).sort().reverse()];
  }, []);

  const filteredEvents = useMemo(() => {
    return TIMELINE_EVENTS.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (yearFilter !== 'all' && e.date.substring(0, 4) !== yearFilter) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [categoryFilter, yearFilter]);

  // Group by year
  const grouped = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {};
    filteredEvents.forEach(e => {
      const year = e.date.substring(0, 4);
      if (!groups[year]) groups[year] = [];
      groups[year].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEvents]);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Governance Events Timeline</h2>
            <p className="text-sm text-emerald-200 mt-1 leading-relaxed">
              Key milestones in Kenya&apos;s devolution journey from 2010 to 2026. Track elections, audit releases, budget milestones,
              legislative changes, and anti-corruption developments.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Clock className="h-3 w-3" /> 2010–2026</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Calendar className="h-3 w-3" /> {TIMELINE_EVENTS.length} Events</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Landmark className="h-3 w-3" /> 6 Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-stone-200 bg-white">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-44 text-xs border-stone-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-9 w-32 text-xs border-stone-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y === 'all' ? 'All Years' : y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1.5 ml-auto">
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                <Badge key={key} variant="outline" className="text-[9px] gap-1 h-5 cursor-pointer hover:bg-stone-50" onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}>
                  {cfg.icon} {cfg.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {grouped.map(([year, events]) => (
          <div key={year}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{year}</div>
              <div className="flex-1 h-px bg-stone-200" />
              <Badge variant="secondary" className="text-[10px] h-5">{events.length} events</Badge>
            </div>
            <div className="ml-4 border-l-2 border-stone-200 pl-4 space-y-3">
              {events.map((event, i) => {
                const cfg = CATEGORY_CONFIG[event.category];
                const dateStr = new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <Card key={`${event.date}-${i}`} className="border-stone-200 bg-white hover:border-slate-300 transition-colors">
                    <CardContent className="py-3 px-4">
                      <div className="flex flex-col md:flex-row md:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[9px] h-5 ${cfg.bg}`}>{cfg.icon} {cfg.label}</Badge>
                            <span className="text-[10px] text-stone-400">{dateStr}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">{event.title}</p>
                          <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">{event.description}</p>
                          {event.source && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {event.sourceUrl ? (
                                <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" /> {event.source}
                                </a>
                              ) : (
                                <span className="text-[10px] text-stone-500 flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" /> Source: {event.source}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
