'use client';

import React, { useState, useMemo } from 'react';
import { assemblyHansardData, getHansardStats, AssemblyHansardEntry } from '@/data/assembly-hansard';
import { REGIONS } from '@/data/types';
import {
  BookOpen, ExternalLink, Globe, Search, Filter,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  ArrowUpDown, MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortField = 'countyName' | 'region' | 'hasHansard' | 'hasWebsite';

export default function AssemblyHansardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('countyName');
  const [sortAsc, setSortAsc] = useState(true);

  const stats = useMemo(() => getHansardStats(), []);

  const filtered = useMemo(() => {
    let items = [...assemblyHansardData];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(e =>
        e.countyName.toLowerCase().includes(q) ||
        e.countyCode.includes(q) ||
        e.assemblyName.toLowerCase().includes(q)
      );
    }
    if (regionFilter !== 'all') {
      items = items.filter(e => e.region === regionFilter);
    }
    if (statusFilter === 'hansard') {
      items = items.filter(e => e.hasHansard);
    } else if (statusFilter === 'no-hansard') {
      items = items.filter(e => !e.hasHansard);
    }

    items.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'countyName') cmp = a.countyName.localeCompare(b.countyName);
      else if (sortField === 'region') cmp = a.region.localeCompare(b.region);
      else if (sortField === 'hasHansard') cmp = Number(b.hasHansard) - Number(a.hasHansard);
      else if (sortField === 'hasWebsite') cmp = Number(b.hasWebsite) - Number(a.hasWebsite);
      return sortAsc ? cmp : -cmp;
    });

    return items;
  }, [searchQuery, regionFilter, statusFilter, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-stone-200 bg-white dark:bg-stone-900">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Assembly Hansard Records</CardTitle>
              <CardDescription className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Hansard records are the official proceedings of county assembly sessions. They document debates, motions, votes, and questions — essential for oversight accountability under Article 185 of the Constitution of Kenya 2010.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Total Counties', value: stats.total, icon: MapPin, color: 'text-emerald-600' },
          { label: 'Hansard Available', value: stats.withHansard, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'No Hansard', value: stats.withoutHansard, icon: XCircle, color: 'text-stone-400' },
          { label: 'Coverage', value: `${Math.round((stats.withHansard / stats.total) * 100)}%`, icon: Globe, color: 'text-blue-600' },
        ].map(s => (
          <Card key={s.label} className="border-stone-200 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-bold text-stone-800 dark:text-stone-100">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-stone-200 bg-white dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by county name, code, or assembly..."
                className="h-9 pl-10 text-sm border-stone-200 dark:border-stone-700"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-9 w-[160px] text-sm border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[160px] text-sm border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Hansard Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="hansard">Hansard Available</SelectItem>
                <SelectItem value="no-hansard">No Hansard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-stone-200 bg-white dark:bg-stone-900">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="County Assembly Hansard records">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                  <th className="text-left py-2.5 px-4 font-semibold text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none" scope="col" onClick={() => toggleSort('countyName')}>
                    <span className="flex items-center gap-1">County <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-left py-2.5 px-4 font-semibold text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none" scope="col" onClick={() => toggleSort('region')}>
                    <span className="flex items-center gap-1">Region <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-center py-2.5 px-4 font-semibold text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none" scope="col" onClick={() => toggleSort('hasHansard')}>
                    <span className="flex items-center justify-center gap-1">Hansard <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-center py-2.5 px-4 font-semibold text-xs text-stone-600 dark:text-stone-300 cursor-pointer select-none" scope="col" onClick={() => toggleSort('hasWebsite')}>
                    <span className="flex items-center justify-center gap-1">Website <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="text-center py-2.5 px-4 font-semibold text-xs text-stone-600 dark:text-stone-300" scope="col">Links</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400 dark:text-stone-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No counties match your filters.</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => { setSearchQuery(''); setRegionFilter('all'); setStatusFilter('all'); }}>
                        Clear Filters
                      </Button>
                    </td>
                  </tr>
                ) : filtered.map(entry => (
                  <HansardRow key={entry.countyCode} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="py-3 px-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Note:</strong> Hansard availability varies by county. Not all county assemblies publish their proceedings online. Contact your county assembly clerk to request Hansard records for counties marked as unavailable. The links above point to official county assembly websites where available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function HansardRow({ entry }: { entry: AssemblyHansardEntry }) {
  return (
    <tr className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded">{entry.countyCode}</span>
          <div>
            <p className="font-medium text-stone-800 dark:text-stone-100 text-xs">{entry.countyName}</p>
            <p className="text-[10px] text-stone-400 dark:text-stone-500">{entry.assemblyName}</p>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-4 text-xs text-stone-600 dark:text-stone-300">{entry.region}</td>
      <td className="py-2.5 px-4 text-center">
        {entry.hasHansard ? (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700 text-[10px]">Available</Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] text-stone-400">Not Available</Badge>
        )}
      </td>
      <td className="py-2.5 px-4 text-center">
        {entry.hasWebsite ? (
          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-[10px]">Online</Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] text-stone-400">No Site</Badge>
        )}
      </td>
      <td className="py-2.5 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {entry.hasWebsite && (
            <a href={entry.website} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {entry.hasHansard && entry.hansardUrl && (
            <a href={entry.hansardUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5">
              <BookOpen className="h-3 w-3" /> Hansard
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}
