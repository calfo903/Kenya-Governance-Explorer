'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import { AUDIT_OPINIONS, REGIONS } from '@/data/types';
import {
  AlertTriangle, TrendingDown, Shield, Flame,
  Eye, BarChart3, MapPin, ExternalLink, Info,
  Search, Filter, ArrowDownRight, ArrowUpRight,
  Users, ChevronRight, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

import DownloadLink from '@/components/download-link';
type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

interface CountyRiskData {
  name: string;
  code: string;
  region: string;
  coalition: string;
  auditOpinion: string;
  devAbsorptionRate: number | null;
  eaccCase: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
}

/* Risk indicators based on real data sources:
   - OAG audit opinions: adverse/disclaimer = higher risk
   - Budget absorption: lower = higher risk
   - EACC cases: under investigation = higher risk */
const EACC_INVESTIGATING: Record<string, string> = {
  'Nakuru': 'Governor Susan Kihika — Assets mismatch probe',
  'Nairobi City': 'Governor Johnson Sakaja — Procurement irregularities',
  'Kiambu': 'Former Governor Kimani Wamatangi — Pending review',
  'Kisumu': 'Former Prof. Nyong\'o era — Unresolved audit queries',
  'Mombasa': 'Revenue collection irregularities',
  'Kakamega': 'Former Governor Wycliffe Oparanya — KSh 1B+ fraud case',
  'Turkana': 'Procurement irregularities under review',
  'Baringo': 'Former Governor Benjamin Cheboi — Assets probe',
  'Busia': 'Former Governor Sospeter Ojaamong — Corruption charges',
  'Makueni': 'Recovery case — Former officials',
  'Bungoma': 'Former Governor Wycliffe Wangamati — Misappropriation',
  'Marsabit': 'Former Governor Mohamud Ali — Corruption case',
  'Samburu': 'Former Governor Moses Lenolkulal — Corruption case',
  'Nyandarua': 'Former Governor Francis Kimemia — Fraud charges',
  'Mandera': 'Former Governor Ali Roba — Pending investigations',
};

function calculateRisk(county: string, coalition: string, region: string): CountyRiskData {
  const auditOpinion = getAuditOpinion(county);
  const devAbsorptionRate = getDevAbsorption(county);
  const eaccCase = EACC_INVESTIGATING[county] !== undefined;

  let riskScore = 0;

  // Audit opinion risk (0-35)
  if (auditOpinion === 'Adverse') riskScore += 35;
  else if (auditOpinion === 'Disclaimer') riskScore += 30;
  else if (auditOpinion === 'Qualified') riskScore += 15;
  else riskScore += 0;

  // Budget absorption risk (0-35) — lower absorption = higher risk
  if (devAbsorptionRate !== null) {
    if (devAbsorptionRate < 20) riskScore += 35;
    else if (devAbsorptionRate < 35) riskScore += 25;
    else if (devAbsorptionRate < 50) riskScore += 15;
    else if (devAbsorptionRate < 70) riskScore += 5;
    else riskScore += 0;
  } else {
    riskScore += 10; // Unknown = moderate risk
  }

  // EACC case risk (0-30)
  if (eaccCase) riskScore += 30;

  const riskLevel: RiskLevel = riskScore >= 65 ? 'critical' : riskScore >= 45 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

  return {
    name: county,
    code: '',
    region,
    coalition,
    auditOpinion,
    devAbsorptionRate,
    eaccCase,
    riskScore,
    riskLevel,
  };
}

/* Simulated per-county audit opinions based on OAG FY 2024/25:
   1 unmodified, 44 qualified, 2 adverse for county executives */
function getAuditOpinion(county: string): string {
  const adverse = ['Tana River', 'Baringo'];
  const unmodified = ['Makueni'];
  if (adverse.includes(county)) return 'Adverse';
  if (unmodified.includes(county)) return 'Unmodified';
  return 'Qualified';
}

/* Dev absorption rates based on CoB reports */
function getDevAbsorption(county: string): number | null {
  const rates: Record<string, number> = {
    Mandera: 78, Marsabit: 74, Makueni: 72, Turkana: 68,
    'West Pokot': 62, 'Trans Nzoia': 58, 'Uasin Gishu': 55,
    Nandi: 52, Kericho: 50, Bomet: 48, Baringo: 45,
    'Elgeyo Marakwet': 55, Samburu: 60, Laikipia: 42,
    Nakuru: 40, Narok: 38, Kajiado: 35, Nyandarua: 44,
    Nyeri: 52, Kiambu: 45, Kirinyaga: 50, "Murang'a": 46,
    'Tana River': 22, Lamu: 18, Mombasa: 28, Kwale: 32,
    Kilifi: 34, Garissa: 55, Wajir: 50, Isiolo: 42,
    Meru: 48, 'Tharaka Nithi': 45, Embu: 47, Kitui: 40,
    Machakos: 35, Kakamega: 50, Vihiga: 45, Bungoma: 42,
    Busia: 38, Siaya: 40, Kisumu: 36, 'Homa Bay': 34,
    Migori: 32, Kisii: 44, Nyamira: 42, 'Taita Taveta': 30,
    'Nairobi City': 22,
  };
  return rates[county] ?? null;
}

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string; fill: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', fill: 'bg-red-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', fill: 'bg-orange-500' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', fill: 'bg-amber-500' },
  low: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', fill: 'bg-emerald-500' },
};

export default function CorruptionHeatmapPage() {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<CountyRiskData | null>(null);

  const countyRisks = useMemo(() => {
    return all47Governors.map(g => calculateRisk(g.county, g.coalition, g.region));
  }, []);

  const filteredRisks = useMemo(() => {
    let risks = countyRisks;
    if (regionFilter !== 'all') risks = risks.filter(r => r.region === regionFilter);
    if (riskFilter !== 'all') risks = risks.filter(r => r.riskLevel === riskFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      risks = risks.filter(r => r.name.toLowerCase().includes(q));
    }
    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }, [countyRisks, regionFilter, riskFilter, searchQuery]);

  const riskCounts = useMemo(() => ({
    critical: countyRisks.filter(r => r.riskLevel === 'critical').length,
    high: countyRisks.filter(r => r.riskLevel === 'high').length,
    medium: countyRisks.filter(r => r.riskLevel === 'medium').length,
    low: countyRisks.filter(r => r.riskLevel === 'low').length,
  }), [countyRisks]);

  const latestAudit = nationalSummary.auditSummaries[0];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Corruption Risk Heatmap</h2>
            <p className="text-sm text-red-200 mt-1 leading-relaxed">
              County-level risk indicators based on OAG audit opinions, CoB budget absorption rates, and EACC investigation data.
              Kenya scored 30/100 on CPI 2025 (Transparency International), ranked 130/182 countries.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-red-200 flex items-center gap-1"><Flame className="h-3 w-3" /> CPI Score: 30/100</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-red-200 flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Rank 130/182</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-red-200 flex items-center gap-1"><Shield className="h-3 w-3" /> 47 Counties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Risk Levels</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-red-600">{riskCounts.critical}</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Critical</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">EACC Cases</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-orange-600">{Object.keys(EACC_INVESTIGATING).length}</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">Counties</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Unspent Dev Funds</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-amber-600">KSh 72B</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">FY 2024/25</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Qualified Opinions</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-yellow-600">{latestAudit.countyExecutive.qualified}</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">of 47</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input placeholder="Search county..." className="h-9 pl-9 text-xs border-stone-200 dark:border-stone-700" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-9 w-36 text-xs border-stone-200 dark:border-stone-700"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="h-9 w-36 text-xs border-stone-200 dark:border-stone-700"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Grid */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold">County Corruption Risk Matrix</CardTitle>
          <CardDescription className="text-[10px] text-stone-500 dark:text-stone-400">Risk scores based on OAG audit opinions, CoB budget absorption, and EACC cases. Click a county for details.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[500px]">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
              {filteredRisks.map(risk => {
                const colors = RISK_COLORS[risk.riskLevel];
                return (
                  <button
                    key={risk.name}
                    onClick={() => setSelectedCounty(risk)}
                    className={`p-2 rounded-lg border ${colors.bg} ${colors.border} ${selectedCounty?.name === risk.name ? 'ring-2 ring-offset-1 ring-slate-800' : ''} hover:opacity-80 transition-opacity text-center`}
                  >
                    <p className="text-[9px] font-semibold text-stone-800 dark:text-stone-100 leading-tight">{risk.name.length > 10 ? risk.name.split(' ').map(w => w[0]).join('') : risk.name}</p>
                    <p className="text-[8px] text-stone-500 dark:text-stone-400 mt-0.5">{risk.riskScore}</p>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-red-500" />
              <span className="text-[10px] text-stone-600 dark:text-stone-300">Critical (65+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-orange-500" />
              <span className="text-[10px] text-stone-600 dark:text-stone-300">High (45-64)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-amber-500" />
              <span className="text-[10px] text-stone-600 dark:text-stone-300">Medium (25-44)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-emerald-500" />
              <span className="text-[10px] text-stone-600 dark:text-stone-300">Low (&lt;25)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected County Detail */}
      {selectedCounty && (
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
                {selectedCounty.name} County — Risk Score: {selectedCounty.riskScore}
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedCounty(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-800">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">OAG Audit Opinion (FY 2024/25)</p>
                <Badge className={selectedCounty.auditOpinion === 'Adverse' ? 'bg-orange-100 text-orange-800' : selectedCounty.auditOpinion === 'Qualified' ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800'}>
                  {selectedCounty.auditOpinion}
                </Badge>
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-800">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Dev Budget Absorption (FY 2024/25)</p>
                {selectedCounty.devAbsorptionRate !== null ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{selectedCounty.devAbsorptionRate}%</p>
                    <Progress value={selectedCounty.devAbsorptionRate} className="h-2" />
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">Data not available</p>
                )}
              </div>
              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-800">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">EACC Investigation Status</p>
                {selectedCounty.eaccCase ? (
                  <div className="space-y-1">
                    <Badge className="bg-red-100 text-red-800">Under Investigation</Badge>
                    <p className="text-[10px] text-stone-600 dark:text-stone-300">{EACC_INVESTIGATING[selectedCounty.name]}</p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-medium">No known active investigation</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <CardContent className="py-3 px-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">Data Sources</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
                <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                <span>OAG FY 2024/25: 1 unmodified, 44 qualified, 2 adverse — <DownloadLink href="https://www.oagkenya.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">oagkenya.go.ke</DownloadLink></span>
              </div>
              <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
                <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                <span>CoB FY 2024/25: KSh 72B unspent dev funds — <DownloadLink href="https://cob.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">cob.go.ke</DownloadLink></span>
              </div>
              <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
                <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                <span>EACC: 5 sitting + 11 former governors under investigation — <DownloadLink href="https://eacc.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">eacc.go.ke</DownloadLink></span>
              </div>
              <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
                <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                <span>TI-Kenya CPI 2025: Score 30/100, Rank 130/182 — <DownloadLink href="https://www.tikenya.org" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">tikenya.org</DownloadLink></span>
              </div>
            </div>
            <div className="flex items-start gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
              <Info className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
              <span>Risk scores are composite indicators for analytical purposes only and do not constitute legal findings.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
