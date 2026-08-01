'use client';

import React, { useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import { governorPartyDistribution } from '@/data/national-summary';
import {
  County, Representative, FilterState, ComparisonItem, REGIONS,
  getAuditColor,
} from '@/data/types';
import {
  Search, MapPin, Star, ChevronDown, ChevronRight, GitCompare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import RepChatWidget from '@/components/rep-chat-widget';

// ══════════════════════════════════════════════════════════════════
// GOVERNORS TREE VIEW
// ══════════════════════════════════════════════════════════════════
export default function GovernorsTreeView({ governors, expandedCounties, toggleCounty, allCounties, filters, setFilters, addToComparison, comparisonList }: {
  governors: typeof all47Governors; expandedCounties: Set<string>; toggleCounty: (code: string) => void;
  allCounties: County[]; filters: FilterState; setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  addToComparison: (rep: Representative, countyName: string) => void; comparisonList: ComparisonItem[];
}) {
  const grouped = useMemo(() => {
    const map: Record<string, typeof governors> = {};
    for (const g of governors) { if (!map[g.region]) map[g.region] = []; map[g.region].push(g); }
    return map;
  }, [governors]);

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-stone-400" />
          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">Find a Governor</h3>
          <span className="ml-auto text-xs text-stone-400">{governors.length} of 47</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative col-span-2 md:col-span-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <Input placeholder="Name or county..." className="h-9 text-xs pl-8 border-stone-200 dark:border-stone-700" value={filters.keyword || ''} onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value || undefined }))} />
          </div>
          <Select value={filters.region || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, region: v === '_all' ? undefined : v as typeof REGIONS[number] }))}>
            <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent><SelectItem value="_all">All Regions</SelectItem>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.coalition || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, coalition: v === '_all' ? undefined : v as any }))}>
            <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Coalition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Coalitions</SelectItem>
              <SelectItem value="Kenya Kwanza Alliance">Kenya Kwanza</SelectItem>
              <SelectItem value="Azimio la Umoja One Kenya Coalition">Azimio</SelectItem>
              <SelectItem value="Independent">Independent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.party || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, party: v === '_all' ? undefined : v }))}>
            <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Party" /></SelectTrigger>
            <SelectContent><SelectItem value="_all">All Parties</SelectItem>{Object.keys(governorPartyDistribution).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Regions */}
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, govs]) => (
        <Accordion key={region} type="multiple" defaultValue={[region]}>
          <AccordionItem value={region} className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold">{region}</span>
                <Badge variant="secondary" className="text-[10px]">{govs.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2">
              <div className="space-y-1">
                {govs.sort((a, b) => a.code.localeCompare(b.code)).map((g) => {
                  const county = allCounties.find(c => c.code === g.code);
                  const isExpanded = expandedCounties.has(g.code);
                  const isCompared = comparisonList.some(c => c.representative.id === `gov-${g.code}`);
                  return (
                    <div key={g.code} className="border border-stone-100 dark:border-stone-800 rounded-lg overflow-hidden">
                      <button onClick={() => toggleCounty(g.code)} className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-800 dark:bg-stone-800 transition-colors text-left">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium">{g.name}</span>
                              <Badge className={`text-[10px] px-1.5 py-0 ${g.coalition === 'Kenya Kwanza Alliance' ? 'bg-yellow-100 text-yellow-800' : g.coalition === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>{g.party}</Badge>
                              {county?.executiveAuditOpinion && <Badge className={`text-[10px] px-1.5 py-0 border ${getAuditColor(county.executiveAuditOpinion)}`}>{county.executiveAuditOpinion}</Badge>}
                              {county?.developmentAbsorptionRate != null && (
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${county.developmentAbsorptionRate >= 50 ? 'text-green-700 border-green-200' : county.developmentAbsorptionRate >= 30 ? 'text-yellow-700 border-yellow-200' : 'text-red-700 border-red-200'}`}>
                                  Dev: {county.developmentAbsorptionRate}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">{g.county} · Pop. {g.population.toLocaleString()} · {g.constituenciesCount} const. · {g.wardsCount} wards</p>
                          </div>
                        </div>
                        {isCompared && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                      </button>
                      {isExpanded && county && (
                        <div className="border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 px-3.5 py-3">
                          <CountyQuickView county={county} onAddComparison={addToComparison} isInComparison={isCompared} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COUNTY QUICK VIEW
// ══════════════════════════════════════════════════════════════════
function CountyQuickView({ county, onAddComparison, isInComparison }: {
  county: County; onAddComparison: (rep: Representative, countyName: string) => void; isInComparison: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        {county.governor && <MiniRow rep={county.governor} onCompare={() => onAddComparison(county.governor!, county.name)} />}
        {county.deputyGovernor && <MiniRow rep={county.deputyGovernor} onCompare={() => onAddComparison(county.deputyGovernor!, county.name)} />}
        {county.senator && <MiniRow rep={county.senator} onCompare={() => onAddComparison(county.senator!, county.name)} />}
        {county.womanRep && <MiniRow rep={county.womanRep} onCompare={() => onAddComparison(county.womanRep!, county.name)} />}
        {county.countyAssembly?.speaker && <MiniRow rep={county.countyAssembly!.speaker!} onCompare={() => onAddComparison(county.countyAssembly!.speaker!, county.name)} />}
      </div>
      <div className="space-y-1.5">
        {county.constituencies.length > 0 ? county.constituencies.map(con => (
          <div key={con.id} className="flex items-center justify-between px-2.5 py-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 text-xs">
            <div><span className="font-medium">{con.name}</span>{con.mp && <span className="text-stone-400 ml-1.5">{con.mp.fullName} ({con.mp.politicalParty})</span>}</div>
            {con.mp && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onAddComparison(con.mp!, county.name)}><GitCompare className="h-3 w-3" /></Button>}
          </div>
        )) : <p className="text-xs text-stone-400 px-2.5 py-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 italic">Constituency data requires expansion from IEBC records.</p>}
      </div>
    </div>
  );
}

function MiniRow({ rep, onCompare }: { rep: Representative; onCompare: () => void }) {
  return (
    <div className="relative flex items-center justify-between px-2.5 py-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800 text-xs">
      <div className="min-w-0">
        <span className="font-medium">{rep.fullName}</span>
        <span className="text-stone-400 ml-1.5">{rep.officialTitle}{rep.politicalParty ? ` · ${rep.politicalParty}` : ''}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <RepChatWidget rep={{ name: rep.fullName, title: rep.officialTitle, county: rep.jurisdiction, party: rep.politicalParty, coalition: rep.coalition, bio: rep.biography }} />
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onCompare}><GitCompare className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}