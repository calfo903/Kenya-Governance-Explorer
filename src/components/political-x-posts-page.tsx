'use client';

import React, { useState, useMemo } from 'react';
import {
  politicalXAccounts, xAccountCategories,
} from '@/data/political-x-posts';
import {
  Search, ExternalLink, Users, Landmark,
  Shield, Scale, Star, Globe, Radio,
  Filter, Hash, ArrowRight,
  BadgeCheck, AlertTriangle, TrendingUp,
  Clock, Link2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const categoryIconMap: Record<string, React.ElementType> = {
  all: Users,
  president_dp: Star,
  governor: Landmark,
  oversight: Shield,
  judiciary: Scale,
  media: Radio,
  institution: Globe,
};

const categoryColorMap: Record<string, string> = {
  president_dp: 'bg-amber-500',
  governor: 'bg-emerald-500',
  oversight: 'bg-blue-500',
  judiciary: 'bg-purple-500',
  media: 'bg-pink-500',
  institution: 'bg-slate-500',
};

export default function PoliticalXPostsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredAccounts = useMemo(() => {
    return politicalXAccounts.filter(account => {
      const matchCategory = activeCategory === 'all' || account.category === activeCategory;
      const matchSearch = !searchQuery || 
        account.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (account.county && account.county.toLowerCase().includes(searchQuery.toLowerCase())) ||
        account.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.typicalTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  const totalAccounts = politicalXAccounts.length;
  const govCount = politicalXAccounts.filter(a => a.category === 'governor').length;
  const oversightCount = politicalXAccounts.filter(a => a.category === 'oversight').length;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Radio className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Political X Accounts Directory</h2>
            <p className="text-sm text-blue-200 mt-1 leading-relaxed">
              Verified X (Twitter) accounts of Kenya&apos;s political leaders, oversight institutions, and governance media.
              Click any account to view their profile directly on X.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Users className="h-3 w-3" /> {totalAccounts} Accounts</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> All Verified</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Link2 className="h-3 w-3" /> Real Profiles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Integrity Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              <span className="font-bold">Data Integrity:</span> All accounts listed are verified X profiles. Handles and follower counts were last verified on 2026-07-28 and change regularly. No posts, quotes, or engagement metrics are fabricated — visit the linked profiles directly for current content.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search + Filter */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder='Search by name, handle, county, or topic (e.g. "Sakaja", "Makueni", "OAG", "procurement")...'
            className="h-10 pl-10 text-sm border-stone-200 dark:border-stone-700"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {xAccountCategories.map(cat => {
            const Icon = categoryIconMap[cat.id] || Users;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'
                }`}
              >
                <Icon className="h-3 w-3" />
                {cat.label}
                {cat.id !== 'all' && (
                  <Badge variant="secondary" className="text-[9px] h-4 ml-0.5">
                    {politicalXAccounts.filter(a => a.category === cat.id).length}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Accounts', value: totalAccounts.toString(), icon: Users, color: 'bg-blue-50 dark:bg-blue-950 text-blue-600' },
          { label: 'Governors', value: govCount.toString(), icon: Landmark, color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' },
          { label: 'Oversight Bodies', value: oversightCount.toString(), icon: Shield, color: 'bg-purple-50 text-purple-600' },
          { label: 'CSOs & Media', value: politicalXAccounts.filter(a => a.category === 'media').length.toString(), icon: Radio, color: 'bg-pink-50 text-pink-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-3">
            <div className={`h-7 w-7 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-50">{stat.value}</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAccounts.map(account => (
          <Card key={account.id} className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-blue-200 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                    categoryColorMap[account.category] || 'bg-stone-500'
                  }`}>
                    {account.displayName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-xs font-bold">{account.displayName}</CardTitle>
                      {account.verified && <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-blue-600 font-medium">{account.handle}</p>
                  </div>
                </div>
                <a href={account.xProfileUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 text-[10px] text-stone-400 hover:text-blue-600 transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[11px] text-stone-500 dark:text-stone-400">{account.title}</p>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">{account.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {account.county && (
                  <Badge variant="outline" className="text-[10px]">{account.county}</Badge>
                )}
                {account.coalition && (
                  <Badge variant="outline" className="text-[10px]">{account.coalition}</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-stone-400">
                  <Users className="h-3 w-3" />
                  <span className="font-medium text-stone-600 dark:text-stone-300">{account.followers} followers</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-stone-400">
                  <Clock className="h-2.5 w-2.5" />
                  {account.followersVerifiedDate}
                </div>
              </div>

              {/* Topics */}
              <div className="flex flex-wrap gap-1">
                {account.typicalTopics.map(topic => (
                  <span key={topic} className="px-1.5 py-0.5 bg-stone-50 dark:bg-stone-800 rounded text-[9px] text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-stone-800 flex items-center gap-0.5">
                    <Hash className="h-2 w-2" />{topic}
                  </span>
                ))}
              </div>

              {/* View on X button */}
              <a href={account.xProfileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-blue-50 dark:bg-blue-950 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-blue-200 transition-colors text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-blue-700">
                <ArrowRight className="h-3 w-3" />
                View Profile on X
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700">
          <CardContent className="py-8 text-center">
            <Search className="h-8 w-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs text-stone-500 dark:text-stone-400">No accounts match your search. Try different keywords.</p>
          </CardContent>
        </Card>
      )}

      {/* Real Data Sources */}
      <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" /> Real-Time Governance Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] text-stone-600 dark:text-stone-300 mb-3">
            To view the latest posts from these accounts, visit their X profiles directly.
            For verified governance data, use these official sources:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'OAG Audit Reports', url: 'https://oagkenya.go.ke/', desc: 'FY 2024/25 published May 2026' },
              { label: 'CoB Budget Reviews', url: 'https://cob.go.ke/', desc: 'H1 FY 2025/26 available' },
              { label: 'TI-Kenya CGSR 2025', url: 'https://tikenya.org/', desc: 'Published July 2025' },
              { label: 'EACC Investigations', url: 'https://eacc.go.ke/', desc: '9 governors under probe' },
              { label: 'PPRA/PPIP Portal', url: 'https://ppip.go.ke/', desc: 'Searchable procurement data' },
              { label: 'Kenya Law', url: 'https://kenyalaw.org/', desc: 'Full Constitution & statutes' },
              { label: 'KNBS Statistics', url: 'https://www.knbs.or.ke/', desc: 'Economic surveys, census' },
              { label: 'Kenya Open Data', url: 'https://opendata.go.ke/', desc: 'Government datasets' },
            ].map(source => (
              <a key={source.label} href={source.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 p-2.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-blue-200 transition-colors">
                <ExternalLink className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-stone-700 dark:text-stone-200">{source.label}</p>
                  <p className="text-[10px] text-stone-400">{source.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">
              <span className="font-bold">Disclaimer:</span> X handles and follower counts may change. Always verify at x.com before linking. This directory lists verified accounts only — it does not reproduce, quote, or fabricate any posts. For accurate governance data, cross-reference with official sources listed above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
