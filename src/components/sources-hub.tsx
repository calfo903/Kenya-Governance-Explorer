'use client';

import React, { useState, useMemo } from 'react';
import { sourceCategories, allSources } from '@/data/sources';
import { Search, Library, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SourceIcon } from '@/components/source-icon';

// ══════════════════════════════════════════════════════════════════
// SOURCES HUB — NEW TAB
// ══════════════════════════════════════════════════════════════════
export default function SourcesHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return sourceCategories.map(cat => ({
      ...cat,
      sources: cat.sources.filter(s => {
        const matchQuery = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()) || s.dataTypes.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchCat = activeCategory === 'all' || cat.id === activeCategory;
        return matchQuery && matchCat;
      }),
    })).filter(cat => cat.sources.length > 0);
  }, [searchQuery, activeCategory]);

  const totalSources = allSources.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Library className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Integrity & Public Resources Sources</h2>
            <p className="text-xs text-stone-500 mt-0.5">{totalSources} verified sources across {sourceCategories.length} categories — for researching government accountability and public resource management.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <Input placeholder="Search sources by name, type, or topic (e.g. &quot;procurement&quot;, &quot;water&quot;, &quot;land&quot;)..." className="h-10 pl-10 text-sm border-stone-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setActiveCategory('all')} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${activeCategory === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>All ({totalSources})</button>
          {sourceCategories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors flex items-center gap-1 ${activeCategory === cat.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              <SourceIcon name={cat.icon} className="h-3 w-3" /> {cat.label} ({cat.sources.length})
            </button>
          ))}
        </div>
      </div>

      {/* Source Cards */}
      <div className="space-y-5">
        {filtered.map(cat => (
          <div key={cat.id}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <SourceIcon name={cat.icon} className={`h-4 w-4 ${cat.color}`} />
              <h3 className="text-sm font-semibold text-stone-800">{cat.label}</h3>
              <Badge variant="secondary" className="text-[10px]">{cat.sources.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.sources.map(src => (
                <a key={src.id} href={src.url} target="_blank" rel="noopener noreferrer"
                  className="group bg-white rounded-xl border border-stone-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all block">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors leading-tight">{src.name}</h4>
                    <ExternalLink className="h-3.5 w-3.5 text-stone-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed mb-3">{src.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {src.dataTypes.map(dt => (
                      <span key={dt} className="px-1.5 py-0.5 bg-stone-50 rounded text-[10px] text-stone-500 border border-stone-100">{dt}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2 truncate">{src.url}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Research Workflow */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2"><ArrowRight className="h-4 w-4 text-emerald-600" /> Research Workflow — Expanding a County</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { step: '1', label: 'Election Data', src: 'IEBC + County Portal', color: 'bg-emerald-100 text-emerald-800' },
              { step: '2', label: 'Audit Opinion', src: 'OAG County Reports', color: 'bg-blue-100 text-blue-800' },
              { step: '3', label: 'Budget Absorption', src: 'CoB CBIRR Reports', color: 'bg-amber-100 text-amber-800' },
              { step: '4', label: 'Procurement', src: 'PPRA / PPIP Portal', color: 'bg-purple-100 text-purple-800' },
              { step: '5', label: 'Integrity Scores', src: 'TI-Kenya / PesaCheck', color: 'bg-rose-100 text-rose-800' },
              { step: '6', label: 'Assembly Oversight', src: 'County Hansard', color: 'bg-teal-100 text-teal-800' },
              { step: '7', label: 'Senate Interrogation', src: 'CPAIC Committee', color: 'bg-indigo-100 text-indigo-800' },
              { step: '8', label: 'Court Cases', src: 'efile.judiciary.go.ke', color: 'bg-red-100 text-red-800' },
              { step: '9', label: 'Natural Resources', src: 'NLC + WASREB + KFS', color: 'bg-green-100 text-green-800' },
              { step: '10', label: 'Ongoing Monitoring', src: 'Google Alerts', color: 'bg-stone-100 text-stone-800' },
            ].map(item => (
              <div key={item.step} className={`${item.color} rounded-lg p-2.5 text-center`}>
                <span className="text-xs font-bold">Step {item.step}</span>
                <p className="text-[10px] font-medium mt-0.5">{item.label}</p>
                <p className="text-[9px] opacity-75 mt-0.5">{item.src}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
