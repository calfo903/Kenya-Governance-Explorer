'use client';

import React, { useState, useMemo } from 'react';
import {
  chapters, constitutionalPrinciples, constitutionPreamble,
  devolutionSpecificArticles,
} from '@/data/constitution';
import {
  BookOpen, Scale, ChevronDown, ChevronRight,
  Landmark, FileText, Search, ArrowRight,
  CheckCircle2, AlertTriangle, Building2,
  Users, Globe, Shield, Leaf, BarChart3,
  Layers, MapPin, Star, Gavel,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import DownloadLink from '@/components/download-link';
export default function ConstitutionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('principles');

  const filteredPrinciples = useMemo(() => {
    if (!searchQuery) return constitutionalPrinciples;
    const q = searchQuery.toLowerCase();
    return constitutionalPrinciples.filter(p =>
      p.article.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.relevance.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredChapters = useMemo(() => {
    if (!searchQuery) return chapters;
    const q = searchQuery.toLowerCase();
    return chapters.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.articles.toLowerCase().includes(q) ||
      c.keyProvisions.some(kp => kp.text.toLowerCase().includes(q) || kp.article.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Constitution of Kenya 2010</h2>
            <p className="text-sm text-emerald-200 mt-1 leading-relaxed">
              Promulgated August 27, 2010 — the supreme law of Kenya establishing devolved governance,
              the Bill of Rights, and 47 county governments.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Scale className="h-3 w-3" /> 18 Chapters</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><FileText className="h-3 w-3" /> 255+ Articles</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Landmark className="h-3 w-3" /> 47 Counties</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Users className="h-3 w-3" /> Sovereign People</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
        <Input
          placeholder='Search articles (e.g. "devolution", "Article 35", "county assembly", "land")...'
          className="h-10 pl-10 text-sm border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-1">
        {[
          { id: 'principles', label: 'Key Principles', icon: Scale },
          { id: 'chapters', label: 'All Chapters', icon: BookOpen },
          { id: 'devolution', label: 'Devolution Articles', icon: Landmark },
          { id: 'preamble', label: 'Preamble', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Key Principles */}
      {activeTab === 'principles' && (
        <div className="space-y-3">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-700" />
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-bold">{constitutionalPrinciples.length} key constitutional principles</span> most relevant to county governance, accountability, and citizen rights.
                </p>
              </div>
            </CardContent>
          </Card>

          <Accordion type="multiple" defaultValue={['0', '1']} className="space-y-2">
            {filteredPrinciples.map((principle, i) => (
              <AccordionItem key={i} value={`${i}`} className="border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-900 overflow-hidden px-1">
                <AccordionTrigger className="py-3 px-3 hover:no-underline">
                  <div className="flex items-start gap-3 text-left">
                    <div className="h-7 w-7 rounded-lg bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-emerald-800">{principle.article} — {principle.title}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-3">{principle.description}</p>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Governance Relevance</p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">{principle.relevance}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* All Chapters */}
      {activeTab === 'chapters' && (
        <div className="space-y-3">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-700" />
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-bold">{filteredChapters.length} chapters</span> of the Constitution of Kenya 2010, with summaries and key provisions.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredChapters.map((chapter, i) => (
              <Card key={i} className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-200 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        chapter.number === 'Preamble' ? 'bg-amber-100 text-amber-800' :
                        chapter.number === 11 || chapter.number === 12 ? 'bg-emerald-100 text-emerald-800' :
                        chapter.number === 4 ? 'bg-blue-100 text-blue-800' :
                        chapter.number === 6 ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}>
                        {typeof chapter.number === 'string' && chapter.number.startsWith('S') ? <Layers className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold leading-tight">{chapter.title}</CardTitle>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">{chapter.articles}</p>
                      </div>
                    </div>
                    {chapter.keyProvisions.length > 1 && <Badge variant="secondary" className="text-[10px] h-5">{chapter.keyProvisions.length} provisions</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">{chapter.summary}</p>
                  {chapter.keyProvisions.slice(0, 3).map((kp, j) => (
                    <div key={j} className="flex items-start gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                      <ArrowRight className="h-2.5 w-2.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-emerald-700">{kp.article}:</span> {kp.text}</span>
                    </div>
                  ))}
                  {chapter.keyProvisions.length > 3 && (
                    <p className="text-[10px] text-stone-400">+{chapter.keyProvisions.length - 3} more provisions</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Devolution Articles */}
      {activeTab === 'devolution' && (
        <div className="space-y-3">
          <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
            <CardContent className="py-4 px-4">
              <div className="flex items-start gap-3">
                <Landmark className="h-5 w-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">Chapter 11 — Devolved Government</p>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    {devolutionSpecificArticles.length} articles defining county governments, their structure, powers, and intergovernmental relations. This is the most transformative chapter of the 2010 Constitution.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {devolutionSpecificArticles.map((article, i) => (
              <div key={i} className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-6 w-6 rounded bg-emerald-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <p className="text-xs font-bold text-emerald-800">{article.article}</p>
                </div>
                <p className="text-[11px] font-semibold text-stone-700 dark:text-stone-200 mb-1">{article.title}</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">{article.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preamble */}
      {activeTab === 'preamble' && (
        <div className="space-y-4">
          <Card className="border-emerald-200 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-700" /> The Preamble
              </CardTitle>
              <CardDescription className="text-xs">The philosophical foundation of the Constitution — adopted by the people of Kenya.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl border border-emerald-100">
                <p className="text-sm text-emerald-900 leading-relaxed italic font-serif">&ldquo;{constitutionPreamble}&rdquo;</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Key Principles from the Preamble</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { principle: 'Supremacy of God', desc: 'Acknowledges the Almighty God as the ultimate source of authority.' },
                  { principle: 'Struggle for Freedom', desc: 'Honours those who fought for Kenya\'s independence and democracy.' },
                  { principle: 'Diversity', desc: 'Proud of ethnic, cultural, and religious diversity.' },
                  { principle: 'Individual Well-being', desc: 'Committed to nurturing and protecting the individual, family, and community.' },
                  { principle: 'Human Rights', desc: 'Recognises aspirations for governance based on human rights, equality, and freedom.' },
                  { principle: 'Rule of Law', desc: 'Shared commitment to the rule of law, good governance, integrity, and transparency.' },
                  { principle: 'Gender Equity', desc: 'Promotes gender equity and social justice.' },
                  { principle: 'People\'s Power', desc: 'The people of Kenya adopt this Constitution — authority flows from the people.' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <p className="text-[11px] font-bold text-stone-800 dark:text-stone-100">{item.principle}</p>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed pl-5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                <DownloadLink href="https://kenyalaw.org/klr/" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                  Read the full Constitution at KenyaLaw.org
                </DownloadLink>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
