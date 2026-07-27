'use client';

import React, { useState, useMemo } from 'react';
import {
  politicalXAccounts, xAccountCategories,
} from '@/data/political-x-posts';
import {
  Radio, Search, ExternalLink, Users, Landmark,
  Shield, Scale, Star, Globe, Phone,
  ChevronDown, ArrowRight, Filter,
  TrendingUp, Hash, Clock, Heart,
  MessageCircle, Repeat2, BarChart3,
  BadgeCheck, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const categoryIconMap: Record<string, React.ElementType> = {
  all: Users,
  president_dp: Star,
  governor: Landmark,
  oversight: Shield,
  judiciary: Scale,
  media: Radio,
};

const categoryColorMap: Record<string, string> = {
  president_dp: 'bg-amber-100 text-amber-800',
  governor: 'bg-emerald-100 text-emerald-800',
  oversight: 'bg-blue-100 text-blue-800',
  judiciary: 'bg-purple-100 text-purple-800',
  media: 'bg-pink-100 text-pink-800',
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
        account.sampleTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  const accountsWithPosts = filteredAccounts.filter(a => a.samplePost);
  const totalFollowers = politicalXAccounts.length;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Radio className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Political X Accounts & Posts</h2>
            <p className="text-sm text-blue-200 mt-1 leading-relaxed">
              Verified X (Twitter) accounts of Kenya&apos;s political leaders, oversight institutions, and governance media.
              Track public statements, policy announcements, and accountability claims.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Users className="h-3 w-3" /> {politicalXAccounts.length} Accounts</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> All Verified</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Hash className="h-3 w-3" /> Live Feed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder='Search accounts by name, handle, county, or topic (e.g. "Sakaja", "audit", "Nairobi")...'
            className="h-10 pl-10 text-sm border-stone-200"
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
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
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
          { label: 'Total Accounts', value: politicalXAccounts.length.toString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'With Sample Posts', value: accountsWithPosts.length.toString(), icon: Radio, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Governors', value: politicalXAccounts.filter(a => a.category === 'governor').length.toString(), icon: Landmark, color: 'bg-amber-50 text-amber-600' },
          { label: 'Oversight Bodies', value: politicalXAccounts.filter(a => a.category === 'oversight').length.toString(), icon: Shield, color: 'bg-purple-50 text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-3">
            <div className={`h-7 w-7 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-lg font-bold text-stone-900">{stat.value}</p>
            <p className="text-[10px] text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAccounts.map(account => (
          <Card key={account.id} className="border-stone-200 bg-white hover:border-blue-200 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                    categoryColorMap[account.category] || 'bg-stone-500 text-white'
                  }`.replace(/bg-\w+-100/, 'bg-').replace(/text-\w+-800/, 'text-white')}>
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
                <a href={`https://x.com/${account.handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="shrink-0">
                  <ExternalLink className="h-3.5 w-3.5 text-stone-400 hover:text-blue-500 transition-colors" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[11px] text-stone-500">{account.title}</p>
              {account.county && (
                <Badge variant="outline" className="text-[10px]">{account.county}</Badge>
              )}
              {account.coalition && (
                <Badge variant="outline" className="text-[10px]">{account.coalition}</Badge>
              )}
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                <Users className="h-3 w-3" />
                <span>{account.followers} followers</span>
              </div>

              {/* Sample Topics */}
              <div className="flex flex-wrap gap-1">
                {account.sampleTopics.slice(0, 4).map(topic => (
                  <span key={topic} className="px-1.5 py-0.5 bg-stone-50 rounded text-[9px] text-stone-500 border border-stone-100 flex items-center gap-0.5">
                    <Hash className="h-2 w-2" />{topic}
                  </span>
                ))}
              </div>

              {/* Sample Post */}
              {account.samplePost && (
                <div className="mt-2 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Radio className="h-3 w-3 text-blue-500" />
                    <p className="text-[10px] font-semibold text-blue-700">Sample Post — {account.samplePost.topic}</p>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-relaxed mb-2">{account.samplePost.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[9px] text-stone-400">
                      <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{account.samplePost.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-stone-400">
                      <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />likes</span>
                      <span className="flex items-center gap-0.5"><Repeat2 className="h-2.5 w-2.5" />RT</span>
                      <span>{account.samplePost.engagement}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card className="bg-stone-50 border-stone-200">
          <CardContent className="py-8 text-center">
            <Search className="h-8 w-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No accounts match your search. Try different keywords.</p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-500 leading-relaxed">
              <span className="font-bold">Disclaimer:</span> X handles may change. Always verify at x.com before linking. Sample posts are representative of typical content, not exact reproductions. For accurate governance data, cross-reference with official sources listed in the Sources Hub.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
