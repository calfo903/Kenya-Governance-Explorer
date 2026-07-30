'use client';

import React, { useState, useMemo } from 'react';
import { countyLeadershipData } from '@/data/county-leadership';
import { all47Governors } from '@/data/governors';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import {
  User, MapPin, Shield, Scale, Landmark, Building2, Users,
  Search, ChevronRight, ChevronDown, GraduationCap, BookOpen, Vote,
  Gavel, ClipboardList, Calendar, FileText, TrendingUp,
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────────

type RepType = 'governors' | 'senators' | 'womenReps' | 'mps' | 'mcas';

interface RepresentativeProfile {
  name: string;
  title: string;
  jurisdiction: string;
  county: string;
  region: string;
  party: string;
  coalition: string;
  termStart: string;
  termEnd: string;
  repType: RepType;
  bio: string;
  ward?: string;
  constituency?: string;
}

// ─── CONSTANTS ───────────────────────────────────────────────────

const REGIONS = ['All', 'Coast', 'North Eastern', 'Eastern', 'Central', 'Rift Valley', 'Western', 'Nyanza', 'Nairobi'] as const;

const REP_TYPE_CONFIG: Record<RepType, {
  label: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  gridCols: string;
  article: string;
  duties: string[];
}> = {
  governors: {
    label: 'Governors',
    icon: Landmark,
    accentColor: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-600',
    accentText: 'text-emerald-800',
    gridCols: 'grid-cols-1 md:grid-cols-2',
    article: 'Article 179',
    duties: [
      'Chief executive of the county government',
      'Implements county legislation and policies',
      'Appoints County Executive Committee Members (CECMs)',
      'Manages and coordinates the county public service',
      'Submits budget estimates to the county assembly',
      'Oversees all county departments and agencies',
      'Delivers annual State of the County address',
    ],
  },
  senators: {
    label: 'Senators',
    icon: Shield,
    accentColor: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-600',
    accentText: 'text-blue-800',
    gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    article: 'Article 96',
    duties: [
      'Represents the county and its interests at the Senate level',
      'Protects county interests and devolution',
      'Oversees county revenue allocation and national share',
      'Reviews national legislation affecting counties',
      'Participates in impeachment of state officers',
      'Serves on Senate committees for oversight',
      'Debates and approves county allocation bills',
    ],
  },
  womenReps: {
    label: 'Women Representatives',
    icon: Users,
    accentColor: 'text-purple-600',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-600',
    accentText: 'text-purple-800',
    gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    article: 'Article 97',
    duties: [
      'Represents women at the National Assembly level',
      'Champions gender-responsive legislation',
      'Advocates for women\'s rights and equality',
      'Participates in bills and committee work',
      'Oversees executive action on gender matters',
      'Liaises with county women representatives and groups',
      'Promotes women\'s participation in governance',
    ],
  },
  mps: {
    label: 'MPs',
    icon: Vote,
    accentColor: 'text-amber-600',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-600',
    accentText: 'text-amber-800',
    gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    article: 'Article 95',
    duties: [
      'Represents the constituency at the National Assembly',
      'Introduces and debates bills in Parliament',
      'Approves budget estimates for national government',
      'Oversees executive action and state organs',
      'Participates in committee oversight work',
      'Addresses constituency development needs',
      'Serves on standing and select committees',
    ],
  },
  mcas: {
    label: 'MCAs',
    icon: Building2,
    accentColor: 'text-teal-600',
    accentBg: 'bg-teal-50',
    accentBorder: 'border-teal-600',
    accentText: 'text-teal-800',
    gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    article: 'Article 185',
    duties: [
      'Represents the ward at the county assembly',
      'Makes county laws through the assembly',
      'Approves county plans and budgets',
      'Exercises oversight over the county executive',
      'Considers and approves county borrowing',
      'Reviews county annual development plans',
      'Oversees county appointment nominations',
    ],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────

function getInitials(name: string): string {
  const cleaned = name.replace(/^(Hon\.?|Dr\.?|Maj\.?|Eng\.?|Prof\.?)\s*/i, '');
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0] ? parts[0].substring(0, 2).toUpperCase() : '??';
}

function formatTerm(start: string, end: string): string {
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function shortenCoalition(coalition: string): string {
  if (coalition.includes('Kenya Kwanza')) return 'Kenya Kwanza';
  if (coalition.includes('Azimio')) return 'Azimio';
  if (coalition === 'Independent') return 'Independent';
  return coalition.length > 30 ? coalition.substring(0, 28) + '…' : coalition;
}

// ─── BIO GENERATION ──────────────────────────────────────────────

function getGovernorBio(name: string, county: string, party: string): string {
  return `Elected Governor of ${county} County in the August 2022 General Election on a ${party} ticket. As county chief executive, responsible for implementing county legislation, coordinating county administration, and delivering services to the people of ${county}.`;
}

function getSenatorBio(name: string, county: string, party: string): string {
  return `Elected Senator for ${county} County in August 2022. Represents the county at the Senate, protecting county interests, overseeing revenue allocation, and participating in the legislative process at the national level.`;
}

function getWomanRepBio(name: string, county: string, party: string): string {
  return `Elected Women Representative for ${county} County in August 2022. Represents women\'s interests at the National Assembly and champions gender-responsive legislation and women\'s participation in governance.`;
}

function getMpbio(name: string, constituency: string, county: string, party: string): string {
  return `Elected Member of the National Assembly for ${constituency} Constituency, ${county} County, in August 2022. Represents constituency interests in Parliament, debates legislation, and oversees executive action.`;
}

function getMcabio(name: string, ward: string, constituency: string, county: string): string {
  return `Elected Member of the County Assembly representing ${ward} Ward in ${constituency} Constituency, ${county} County. Makes county laws, approves budgets, and provides oversight of the county executive.`;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────

export default function RepresentativeProfilesPage() {
  const [activeRepTab, setActiveRepTab] = useState<RepType>('governors');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // ── Build all representative profiles ──
  const allProfiles = useMemo(() => {
    const profiles: RepresentativeProfile[] = [];

    for (const county of countyLeadershipData) {
      // Governor
      const govEntry = all47Governors.find(g => g.code === county.countyCode);
      profiles.push({
        name: county.governor.name,
        title: 'Governor',
        jurisdiction: `${county.countyName} County`,
        county: county.countyName,
        region: county.region,
        party: county.governor.party,
        coalition: county.governor.coalition,
        termStart: county.governor.termStart,
        termEnd: county.governor.termEnd,
        repType: 'governors',
        bio: getGovernorBio(county.governor.name, county.countyName, county.governor.party),
      });

      // Senator
      profiles.push({
        name: county.senator.name,
        title: 'Senator',
        jurisdiction: `${county.countyName} County`,
        county: county.countyName,
        region: county.region,
        party: county.senator.party,
        coalition: county.senator.coalition,
        termStart: govEntry?.termStart ?? '2022-08-22',
        termEnd: govEntry?.termEnd ?? '2027-08-22',
        repType: 'senators',
        bio: getSenatorBio(county.senator.name, county.countyName, county.senator.party),
      });

      // Woman Rep
      profiles.push({
        name: county.womanRep.name,
        title: 'Women Representative',
        jurisdiction: `${county.countyName} County`,
        county: county.countyName,
        region: county.region,
        party: county.womanRep.party,
        coalition: county.womanRep.coalition,
        termStart: govEntry?.termStart ?? '2022-08-22',
        termEnd: govEntry?.termEnd ?? '2027-08-22',
        repType: 'womenReps',
        bio: getWomanRepBio(county.womanRep.name, county.countyName, county.womanRep.party),
      });

      // MPs
      for (const con of county.constituencies) {
        profiles.push({
          name: con.mp.name,
          title: 'Member of National Assembly',
          jurisdiction: `${con.name} Constituency`,
          county: county.countyName,
          region: county.region,
          party: con.mp.party,
          coalition: '',
          termStart: govEntry?.termStart ?? '2022-08-22',
          termEnd: govEntry?.termEnd ?? '2027-08-22',
          repType: 'mps',
          bio: getMpbio(con.mp.name, con.name, county.countyName, con.mp.party),
          constituency: con.name,
        });

        // MCAs
        for (const ward of con.wards) {
          profiles.push({
            name: ward.mca,
            title: 'Member of County Assembly',
            jurisdiction: `${ward.name} Ward`,
            county: county.countyName,
            region: county.region,
            party: '',
            coalition: '',
            termStart: govEntry?.termStart ?? '2022-08-22',
            termEnd: govEntry?.termEnd ?? '2027-08-22',
            repType: 'mcas',
            bio: getMcabio(ward.mca, ward.name, con.name, county.countyName),
            constituency: con.name,
            ward: ward.name,
          });
        }
      }
    }

    return profiles;
  }, []);

  // ── Filter profiles ──
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter(p => {
      if (p.repType !== activeRepTab) return false;
      if (selectedCounty !== 'all' && p.county !== selectedCounty) return false;
      if (selectedRegion !== 'All' && p.region !== selectedRegion) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.county.toLowerCase().includes(q) && !p.jurisdiction.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allProfiles, activeRepTab, selectedCounty, selectedRegion, searchQuery]);

  // ── Compute stats ──
  const stats = useMemo(() => {
    const counts = { governors: 0, senators: 0, womenReps: 0, mps: 0, mcas: 0 };
    for (const p of allProfiles) { counts[p.repType]++; }
    return counts;
  }, [allProfiles]);

  const config = REP_TYPE_CONFIG[activeRepTab];
  const Icon = config.icon;

  const toggleCard = (id: string) => {
    const next = new Set(expandedCards);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedCards(next);
  };

  return (
    <div className="space-y-4">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={`h-10 w-10 rounded-xl ${config.accentBg} flex items-center justify-center shrink-0`}>
            <Users className={`h-5 w-5 ${config.accentColor}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Representative Profiles</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Browse all elected representatives across Kenya&apos;s 47 counties — Governors, Senators, Women Reps, MPs &amp; MCAs (2022–2027 term).
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          {([['governors', 'Governors', Landmark], ['senators', 'Senators', Shield], ['womenReps', 'Women Reps', Users], ['mps', 'MPs', Vote], ['mcas', 'MCAs', Building2]] as const).map(([key, label, StatIcon]) => (
            <button
              key={key}
              onClick={() => { setActiveRepTab(key as RepType); setSelectedCounty('all'); setSelectedRegion('All'); setSearchQuery(''); }}
              className={`p-3 rounded-xl border text-center transition-all ${
                activeRepTab === key
                  ? `${REP_TYPE_CONFIG[key as RepType].accentBg} ${REP_TYPE_CONFIG[key as RepType].accentBorder} border-l-4`
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <StatIcon className={`h-4 w-4 mx-auto mb-1 ${activeRepTab === key ? REP_TYPE_CONFIG[key as RepType].accentColor : 'text-stone-400'}`} />
              <p className={`text-lg font-bold ${activeRepTab === key ? REP_TYPE_CONFIG[key as RepType].accentText : 'text-stone-700'}`}>{stats[key as keyof typeof stats].toLocaleString()}</p>
              <p className="text-[10px] text-stone-500 font-medium">{label}</p>
            </button>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs value={activeRepTab} onValueChange={(v) => { setActiveRepTab(v as RepType); setSearchQuery(''); }}>
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-stone-100 p-1">
            {(Object.entries(REP_TYPE_CONFIG) as [RepType, typeof REP_TYPE_CONFIG[RepType]][]).map(([key, cfg]) => (
              <TabsTrigger
                key={key}
                value={key}
                className={`flex-1 min-w-[100px] gap-1.5 data-[state=active]:shadow-sm ${
                  activeRepTab === key
                    ? `${cfg.accentColor} data-[state=active]:bg-white data-[state=active]:text-inherit`
                    : 'text-stone-600'
                }`}
              >
                <cfg.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">{cfg.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder={`Search ${config.label.toLowerCase()} by name, county, or jurisdiction...`}
                className="h-10 pl-10 text-sm border-stone-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* County Selector */}
            <Select value={selectedCounty} onValueChange={(v) => { setSelectedCounty(v); setSelectedRegion('All'); }}>
              <SelectTrigger className="h-10 w-full sm:w-[200px] text-sm border-stone-200">
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All 47 Counties</SelectItem>
                <Separator className="my-1" />
                {countyLeadershipData
                  .sort((a, b) => a.countyName.localeCompare(b.countyName))
                  .map((c) => (
                    <SelectItem key={c.countyCode} value={c.countyName}>
                      {c.countyName} <span className="text-stone-400">({c.region})</span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => { setSelectedRegion(region); setSelectedCounty('all'); }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                  selectedRegion === region
                    ? `${config.accentBg} ${config.accentColor} ${config.accentBorder}`
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {region}{region === 'All' ? ` (${allProfiles.filter(p => p.repType === activeRepTab).length})` : ''}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Showing <span className="font-semibold text-stone-700">{filteredProfiles.length.toLocaleString()}</span> of {stats[activeRepTab].toLocaleString()} {config.label.toLowerCase()}
            </p>
            {(selectedCounty !== 'all' || selectedRegion !== 'All' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-stone-500 hover:text-stone-700"
                onClick={() => { setSelectedCounty('all'); setSelectedRegion('All'); setSearchQuery(''); }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* ── Tab Contents ── */}
          {(['governors', 'senators', 'womenReps', 'mps', 'mcas'] as RepType[]).map((type) => {
            const typeConfig = REP_TYPE_CONFIG[type];
            const typeProfiles = filteredProfiles.filter(p => p.repType === type);
            const TypeIcon = typeConfig.icon;

            return (
              <TabsContent key={type} value={type} className="mt-4">
                {typeProfiles.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                    <Search className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-stone-700 text-sm">No {typeConfig.label.toLowerCase()} found</h3>
                    <p className="text-xs text-stone-400 mt-1">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[70vh]">
                    <div className={`grid ${typeConfig.gridCols} gap-4 pr-4`}>
                      {typeProfiles.map((profile, idx) => {
                        const cardId = `${profile.repType}-${profile.name}-${profile.county}`;
                        const isExpanded = expandedCards.has(cardId);

                        return (
                          <Card
                            key={cardId}
                            className={`bg-white border-stone-200 hover:shadow-md transition-shadow ${
                              isExpanded ? `border-l-4 ${typeConfig.accentBorder}` : ''
                            }`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div
                                  className={`h-12 w-12 rounded-full ${typeConfig.accentBg} flex items-center justify-center shrink-0 text-sm font-bold ${typeConfig.accentText}`}
                                >
                                  {getInitials(profile.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-sm font-bold text-stone-900 leading-tight">
                                    {profile.name}
                                  </CardTitle>
                                  <p className={`text-xs font-medium ${typeConfig.accentColor} mt-0.5`}>{profile.title}</p>
                                  <div className="flex items-center gap-1 mt-1 text-stone-500">
                                    <MapPin className="h-3 w-3 shrink-0" />
                                    <span className="text-[11px] truncate">{profile.jurisdiction}</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-0 pb-4 space-y-3">
                              {/* Party + Coalition */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {profile.party && (
                                  <Badge variant="secondary" className="text-[10px] font-semibold">
                                    {profile.party}
                                  </Badge>
                                )}
                                {profile.coalition && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {shortenCoalition(profile.coalition)}
                                  </Badge>
                                )}
                              </div>

                              {/* Term */}
                              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>{formatTerm(profile.termStart, profile.termEnd)}</span>
                              </div>

                              {/* Bio */}
                              <p className="text-[11px] leading-relaxed text-stone-600">{profile.bio}</p>

                              {/* Region tag */}
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] text-stone-400">
                                  {profile.region}
                                </Badge>
                                {profile.constituency && (
                                  <Badge variant="outline" className="text-[10px] text-stone-400">
                                    {profile.constituency}
                                  </Badge>
                                )}
                              </div>

                              <Separator className="my-2" />

                              {/* Constitutional Duties (Collapsible) */}
                              <Collapsible open={isExpanded} onOpenChange={() => toggleCard(cardId)}>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`w-full h-8 justify-between text-xs font-medium ${typeConfig.accentColor} hover:${typeConfig.accentBg}`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <BookOpen className="h-3.5 w-3.5" />
                                      {typeConfig.article} — Constitutional Duties
                                    </span>
                                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className={`mt-2 p-3 rounded-lg ${typeConfig.accentBg} border border-opacity-50`}>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${typeConfig.accentText} mb-2`}>
                                      Kenya Constitution 2010 — {typeConfig.article}
                                    </p>
                                    <ul className="space-y-1.5">
                                      {typeConfig.duties.map((duty, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[11px] text-stone-700">
                                          <Gavel className={`h-3 w-3 shrink-0 mt-0.5 ${typeConfig.accentColor}`} />
                                          <span>{duty}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* ── Constitutional Reference Card ── */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-600" />
            Constitutional Reference — Devolution Chapter
          </CardTitle>
          <CardDescription className="text-xs">
            Kenya Constitution 2010, Chapter 11 — Devolution (Articles 174–200)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(
              [
                ['Article 174', 'Objects of Devolution', 'Promote democratic and accountable exercise of power, foster national unity, recognize diversity, give powers of self-governance, and protect marginalized groups.'],
                ['Article 179', 'County Executive', 'Each county has a Governor elected directly, a Deputy Governor, and a County Executive Committee. The Governor is the chief executive.'],
                ['Article 185', 'County Assembly Authority', 'The county assembly makes laws, approves plans and budgets, and exercises oversight over the county executive committee.'],
                ['Article 95', 'National Assembly', 'Represents the people, legislates, oversees the executive, and approves budgets and expenditure.'],
                ['Article 96', 'Senate', 'Represents counties, protects county interests, oversees national revenue allocation, and considers county bills.'],
                ['Article 97', 'Membership of National Assembly', 'Includes 290 elected MPs, 47 Women Representatives, and 12 nominated members representing special interests.'],
              ] as const
            ).map(([article, title, desc]) => (
              <div key={article} className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <p className="text-[10px] font-bold text-emerald-700">{article}</p>
                <p className="text-xs font-semibold text-stone-800 mt-0.5">{title}</p>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
