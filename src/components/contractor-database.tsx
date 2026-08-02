'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Building2, Star, AlertTriangle, Trophy, TrendingUp,
  Clock, ShieldAlert, Filter, Users, Briefcase, Banknote,
  CheckCircle2, CircleDot, Ban, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// --- Types ---

interface Contractor {
  id: number;
  name: string;
  regNumber: string;
  county: string;
  sector: string;
  totalValue: number; // KSh millions
  completionRate: number; // 0-100
  avgDelayDays: number;
  rating: number; // 1-5
  activeContracts: number;
  pendingContracts: number;
  completedContracts: number;
  onWatchlist: boolean;
}

// --- Mock Data ---

const CONTRACTORS: Contractor[] = [
  { id: 1, name: 'Safaricom Infrastructure Ltd', regNumber: 'CR/2018/004521', county: 'Nairobi City', sector: 'ICT', totalValue: 2450, completionRate: 94, avgDelayDays: 5, rating: 5, activeContracts: 3, pendingContracts: 1, completedContracts: 28, onWatchlist: false },
  { id: 2, name: 'China Road and Bridge Corporation', regNumber: 'CR/2015/001203', county: 'Mombasa', sector: 'Infrastructure', totalValue: 8900, completionRate: 88, avgDelayDays: 12, rating: 4, activeContracts: 2, pendingContracts: 0, completedContracts: 15, onWatchlist: false },
  { id: 3, name: 'Kengen Solutions EA', regNumber: 'CR/2019/007842', county: 'Nakuru', sector: 'Energy', totalValue: 1200, completionRate: 91, avgDelayDays: 8, rating: 5, activeContracts: 4, pendingContracts: 2, completedContracts: 19, onWatchlist: false },
  { id: 4, name: 'Mombasa Cement Works', regNumber: 'CR/2010/000891', county: 'Kilifi', sector: 'Infrastructure', totalValue: 3200, completionRate: 72, avgDelayDays: 34, rating: 3, activeContracts: 2, pendingContracts: 1, completedContracts: 11, onWatchlist: false },
  { id: 5, name: 'Kenya Medical Supplies Agency', regNumber: 'CR/2017/005632', county: 'Kisumu', sector: 'Health', totalValue: 890, completionRate: 96, avgDelayDays: 3, rating: 5, activeContracts: 6, pendingContracts: 3, completedContracts: 42, onWatchlist: false },
  { id: 6, name: 'Transmara Trading Co.', regNumber: 'CR/2016/003418', county: 'Narok', sector: 'Agriculture', totalValue: 340, completionRate: 65, avgDelayDays: 45, rating: 2, activeContracts: 1, pendingContracts: 0, completedContracts: 6, onWatchlist: true },
  { id: 7, name: 'Lake Victoria Builders', regNumber: 'CR/2018/006129', county: 'Homa Bay', sector: 'Infrastructure', totalValue: 560, completionRate: 58, avgDelayDays: 52, rating: 2, activeContracts: 1, pendingContracts: 1, completedContracts: 4, onWatchlist: true },
  { id: 8, name: 'Machakos Engineering Works', regNumber: 'CR/2019/008234', county: 'Machakos', sector: 'Infrastructure', totalValue: 780, completionRate: 85, avgDelayDays: 15, rating: 4, activeContracts: 3, pendingContracts: 0, completedContracts: 14, onWatchlist: false },
  { id: 9, name: 'North Eastern Water Services', regNumber: 'CR/2020/009451', county: 'Garissa', sector: 'Water', totalValue: 450, completionRate: 78, avgDelayDays: 22, rating: 3, activeContracts: 2, pendingContracts: 1, completedContracts: 9, onWatchlist: false },
  { id: 10, name: 'Rift Valley Agro-Industries', regNumber: 'CR/2014/002178', county: 'Uasin Gishu', sector: 'Agriculture', totalValue: 1100, completionRate: 89, avgDelayDays: 10, rating: 4, activeContracts: 2, pendingContracts: 2, completedContracts: 22, onWatchlist: false },
  { id: 11, name: 'Coast General Supplies', regNumber: 'CR/2017/005893', county: 'Kwale', sector: 'Governance', totalValue: 210, completionRate: 42, avgDelayDays: 68, rating: 1, activeContracts: 1, pendingContracts: 0, completedContracts: 3, onWatchlist: true },
  { id: 12, name: 'Central Highlands Developers', regNumber: 'CR/2021/010562', county: 'Nyeri', sector: 'Education', totalValue: 670, completionRate: 87, avgDelayDays: 11, rating: 4, activeContracts: 3, pendingContracts: 1, completedContracts: 16, onWatchlist: false },
];

const COUNTIES = ['All Counties', 'Nairobi City', 'Mombasa', 'Nakuru', 'Kisumu', 'Kilifi', 'Narok', 'Homa Bay', 'Machakos', 'Garissa', 'Uasin Gishu', 'Kwale', 'Nyeri'];
const SECTORS = ['All Sectors', 'ICT', 'Infrastructure', 'Energy', 'Health', 'Agriculture', 'Water', 'Governance', 'Education'];

type SortField = 'completionRate' | 'totalValue' | 'rating' | 'avgDelayDays';
type SortDir = 'asc' | 'desc';

// --- Helpers ---

function fmtM(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}B`;
  return `${n.toFixed(0)}M`;
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? 'text-amber-400 fill-amber-400' : 'text-stone-300 dark:text-stone-600'}`}
        />
      ))}
    </div>
  );
}

function completionColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (rate >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function progressColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-500';
  if (rate >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}
// --- Component ---

export default function ContractorDatabase() {
  const [search, setSearch] = useState('');
  const [countyFilter, setCountyFilter] = useState('All Counties');
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [sortField, setSortField] = useState<SortField>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [tab, setTab] = useState<'all' | 'leaderboard' | 'watchlist'>('all');

  const filtered = useMemo(() => {
    let result = [...CONTRACTORS];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.county.toLowerCase().includes(q) ||
          c.regNumber.toLowerCase().includes(q)
      );
    }
    if (countyFilter !== 'All Counties') {
      result = result.filter((c) => c.county === countyFilter);
    }
    if (sectorFilter !== 'All Sectors') {
      result = result.filter((c) => c.sector === sectorFilter);
    }

    if (tab === 'leaderboard') {
      result = result.filter((c) => c.rating >= 4 && !c.onWatchlist);
    } else if (tab === 'watchlist') {
      result = result.filter((c) => c.onWatchlist || c.rating <= 2);
    }

    result.sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      return (a[sortField] - b[sortField]) * mult;
    });

    return result;
  }, [search, countyFilter, sectorFilter, sortField, sortDir, tab]);

  const totalContractors = CONTRACTORS.length;
  const activeContracts = CONTRACTORS.reduce((s, c) => s + c.activeContracts, 0);
  const totalValue = CONTRACTORS.reduce((s, c) => s + c.totalValue, 0);
  const avgCompletion = (CONTRACTORS.reduce((s, c) => s + c.completionRate, 0) / totalContractors).toFixed(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 text-stone-400" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
              Contractor Performance Database
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 ml-13">
            Track and evaluate county government contractors across Kenya
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Registered</p>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-50 mt-1">{totalContractors}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Active Contracts</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{activeContracts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Value</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">KSh {fmtM(totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Avg Completion</p>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{avgCompletion}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Tabs */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Search contractors, registration numbers..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={countyFilter} onValueChange={setCountyFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-500 dark:text-stone-400">Sort by:</span>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleSort('completionRate')}>
                Completion <SortIcon field="completionRate" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleSort('totalValue')}>
                Value <SortIcon field="totalValue" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleSort('rating')}>
                Rating <SortIcon field="rating" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleSort('avgDelayDays')}>
                Delay <SortIcon field="avgDelayDays" />
              </Button>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant={tab === 'all' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTab('all')}
              >
                All Contractors ({CONTRACTORS.length})
              </Button>
              <Button
                variant={tab === 'leaderboard' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTab('leaderboard')}
              >
                <Trophy className="w-3.5 h-3.5 mr-1" />
                Top Performers
              </Button>
              <Button
                variant={tab === 'watchlist' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTab('watchlist')}
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Watchlist
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contractor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-500 dark:text-stone-400">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No contractors match your filters.</p>
            </div>
          )}
          {filtered.map((c) => (
            <Card key={c.id} className={c.onWatchlist ? 'border-red-200 dark:border-red-900/50' : ''}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate">{c.name}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{c.regNumber}</p>
                  </div>
                  {c.onWatchlist && (
                    <Badge variant="destructive" className="text-[10px] shrink-0">Watchlist</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{c.county}</Badge>
                  <Badge variant="outline" className="text-[10px]">{c.sector}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">Total Value</span>
                    <p className="font-medium text-stone-900 dark:text-stone-50">KSh {fmtM(c.totalValue)}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-stone-400">Avg Delay</span>
                    <p className={`font-medium ${c.avgDelayDays > 30 ? 'text-red-600 dark:text-red-400' : c.avgDelayDays > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{c.avgDelayDays} days</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-500 dark:text-stone-400">Completion Rate</span>
                    <span className={`text-xs font-semibold ${completionColor(c.completionRate)}`}>{c.completionRate}%</span>
                  </div>
                  <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${progressColor(c.completionRate)}`} style={{ width: `${c.completionRate}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Stars count={c.rating} />
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Badge variant="secondary" className="h-5 flex items-center gap-1">
                      <CircleDot className="w-2.5 h-2.5" /> {c.activeContracts}
                    </Badge>
                    <Badge variant="outline" className="h-5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {c.pendingContracts}
                    </Badge>
                    <Badge variant="outline" className="h-5 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {c.completedContracts}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leaderboard Section */}
        {tab === 'leaderboard' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top Contractors Leaderboard
              </CardTitle>
              <CardDescription>Highest rated contractors with strong delivery records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filtered.slice(0, 5).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                    <span className={`text-lg font-bold w-8 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-stone-400' : i === 2 ? 'text-amber-700' : 'text-stone-500'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">{c.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{c.county} -- {c.sector}</p>
                    </div>
                    <Stars count={c.rating} />
                    <span className={`text-sm font-semibold ${completionColor(c.completionRate)}`}>{c.completionRate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Section */}
        {tab === 'watchlist' && (
          <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <ShieldAlert className="w-4 h-4" />
                Penalty / Watchlist
              </CardTitle>
              <CardDescription>Contractors flagged for poor performance, delays, or compliance issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filtered.map((c) => (
                    <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">{c.name}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{c.county} -- Avg delay: {c.avgDelayDays} days -- Rating: {c.rating}/5</p>
                      </div>
                      <Badge variant="destructive" className="text-[10px] shrink-0">
                        {c.completionRate < 50 ? 'Critical' : 'Warning'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
