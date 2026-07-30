'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Shield, ExternalLink, Search, AlertTriangle, CheckCircle2,
  ChevronRight, FileText, Building2, Globe, BookOpen,
  Eye, Scale, Info, Gavel, Database, ArrowUpRight,
  AlertCircle, Phone, Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

interface RedFlag {
  id: string;
  label: string;
  description: string;
  legalBasis: string;
  riskLevel: 'high' | 'medium' | 'low';
}

const RED_FLAGS: RedFlag[] = [
  { id: 'single_source', label: 'Single Sourcing', description: 'Direct procurement without competitive bidding. Counties must use open tendering unless specific exemptions under PPAD Act Section 102 apply.', legalBasis: 'PPAD Act 2015, Sec. 102 (Exemptions)', riskLevel: 'high' },
  { id: 'repeated_supplier', label: 'Repeated Contracts to Same Supplier', description: 'Same supplier awarded multiple contracts without competitive re-tendering. May indicate favoritism or cartel arrangements.', legalBasis: 'PPAD Act 2015, Sec. 63 (Conflicts of Interest)', riskLevel: 'high' },
  { id: 'above_threshold', label: 'Contracts Above Threshold Without Approval', description: 'Contracts exceeding county approval thresholds without proper authorization from the County Assembly or relevant committee.', legalBasis: 'PPAD Act 2015, Sec. 106-108 (Thresholds)', riskLevel: 'high' },
  { id: 'missing_tender', label: 'Missing Tender Notices', description: 'Procurement carried out without published tender notices. All county tenders above minimum threshold must be published on the PPIP portal.', legalBasis: 'PPAD Act 2015, Sec. 117 (Public Notice)', riskLevel: 'high' },
  { id: 'split_tender', label: 'Tender Splitting', description: 'Splitting large procurement into smaller contracts to avoid higher approval thresholds. Undermines competitive bidding requirements.', legalBasis: 'PPAD Act 2015, Sec. 109 (Threshold Avoidance)', riskLevel: 'high' },
  { id: 'bid_rigging', label: 'Bid Rigging / Collusion', description: 'Suppliers coordinating bids to pre-determine the winner. Look for suspiciously similar pricing or rotating winners.', legalBasis: 'PPAD Act 2015, Sec. 155 (Collusion), Competition Act', riskLevel: 'high' },
  { id: 'late_payment', label: 'Delayed Payments to Suppliers', description: 'Systematic late payment to specific suppliers while others are paid promptly. May indicate manipulation of payment terms.', legalBasis: 'PPAD Act 2015, Sec. 158 (Payment Terms)', riskLevel: 'medium' },
  { id: 'incomplete_records', label: 'Incomplete Procurement Records', description: 'Missing procurement files, evaluation reports, or contract documents. OAG frequently flags this in audit findings.', legalBasis: 'PPAD Act 2015, Sec. 9 (Records)', riskLevel: 'medium' },
  { id: 'variation', label: 'Excessive Contract Variations', description: 'Contract costs significantly exceeding original award amounts without proper justification and approval.', legalBasis: 'PPAD Act 2015, Sec. 131 (Contract Variation)', riskLevel: 'medium' },
  { id: 'blacklist', label: 'Debarred Suppliers Receiving Contracts', description: 'Awarding contracts to suppliers debarred by PPRA. Debarment lists are published on the PPRA website.', legalBasis: 'PPAD Act 2015, Sec. 145 (Debarment)', riskLevel: 'high' },
];

const RISK_LEVELS: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-100 border-red-200', text: 'text-red-700', label: 'High Risk' },
  medium: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700', label: 'Medium Risk' },
  low: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-700', label: 'Low Risk' },
};

/* Real PPRA statistics and data */
const PPRA_STATS = [
  { label: 'Counties must publish all tenders on PPIP portal', source: 'PPAD Act 2015, Sec. 117' },
  { label: 'County procurement threshold for county assembly approval varies', source: 'PPAD Act 2015, Sec. 106-108' },
  { label: 'Annual procurement plans must be published by July 1 each year', source: 'PPAD Act 2015, Sec. 14' },
  { label: 'All procurement above KSh 1M requires evaluation committee', source: 'PPAD Act 2015, Sec. 50' },
  { label: 'Suppliers can be debarred for 3-10 years for procurement offenses', source: 'PPAD Act 2015, Sec. 145-147' },
  { label: 'PPRA publishes annual reports on procurement performance', source: 'PPRA Annual Reports' },
];

export default function ProcurementMonitorPage() {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedFlags, setCheckedFlags] = useState<Set<string>>(new Set());

  const filteredFlags = useMemo(() => {
    if (!searchQuery) return RED_FLAGS;
    const q = searchQuery.toLowerCase();
    return RED_FLAGS.filter(f =>
      f.label.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.legalBasis.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleFlag = (id: string) => {
    const next = new Set(checkedFlags);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedFlags(next);
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-amber-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Procurement Pattern Monitor</h2>
            <p className="text-sm text-amber-200 mt-1 leading-relaxed">
              Monitor county procurement for red flags, irregularities, and patterns of concern.
              Based on the Public Procurement and Asset Disposal Act (PPAD Act) 2015.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-amber-200 flex items-center gap-1"><Gavel className="h-3 w-3" /> PPAD Act 2015</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-amber-200 flex items-center gap-1"><Database className="h-3 w-3" /> PPRA / PPIP Data</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-amber-200 flex items-center gap-1"><Eye className="h-3 w-3" /> 10 Red Flags</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <a href="https://www.ppip.go.ke" target="_blank" rel="noopener noreferrer" className="block">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Database className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">PPIP Portal — Public Procurement Information Portal</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Searchable county procurement data, tender notices, contract awards, and supplier information</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-stone-400 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </a>
        <a href="https://www.ppra.go.ke" target="_blank" rel="noopener noreferrer" className="block">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">PPRA — Public Procurement Regulatory Authority</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Annual reports, debarment lists, procurement guidelines, threshold regulations</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-stone-400 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* County Search & Red Flags */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Search County on PPIP</label>
                  <div className="flex gap-2">
                    <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                      <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700 flex-1"><SelectValue placeholder="Select county..." /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {all47Governors.map(g => <SelectItem key={g.county} value={g.county}>{g.county}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-1.5" onClick={() => {
                      if (selectedCounty) {
                        window.open(`https://www.ppip.go.ke/tender/search?search=${encodeURIComponent(selectedCounty)}`, '_blank');
                      }
                    }} disabled={!selectedCounty}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Search PPIP</span>
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Search on Google (Gov sites)</label>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. Nakuru tender 2025" className="h-9 text-xs border-stone-200 dark:border-stone-700 flex-1" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <Button variant="outline" className="gap-1.5" onClick={() => {
                      if (selectedCounty && searchQuery) {
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(`${searchQuery} ${selectedCounty} county procurement site:ppip.go.ke OR site:ppra.go.ke`)}`, '_blank');
                      }
                    }} disabled={!selectedCounty || !searchQuery}>
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Red Flags Checklist */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Procurement Red Flags Checklist
              </CardTitle>
              <CardDescription className="text-[10px] text-stone-500 dark:text-stone-400">Check patterns you observe in your county&apos;s procurement records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredFlags.map(flag => {
                const risk = RISK_LEVELS[flag.riskLevel];
                return (
                  <div key={flag.id} className={`p-3 rounded-lg border transition-colors ${checkedFlags.has(flag.id) ? 'bg-amber-50 dark:bg-amber-950 border-amber-200' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800'}`}>
                    <div className="flex items-start gap-2">
                      <Checkbox checked={checkedFlags.has(flag.id)} onCheckedChange={() => toggleFlag(flag.id)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-100">{flag.label}</span>
                          <Badge variant="outline" className={`text-[8px] h-4 ${risk.bg} ${risk.text}`}>{risk.label}</Badge>
                        </div>
                        <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed">{flag.description}</p>
                        <p className="text-[9px] text-emerald-600 mt-1">
                          <Scale className="h-2.5 w-2.5 inline mr-0.5" />
                          {flag.legalBasis}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* PPRA Stats */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                Key Procurement Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {PPRA_STATS.map((stat, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{stat.label} <span className="text-stone-400">— {stat.source}</span></span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* PPAD Act Education */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Gavel className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                PPAD Act 2015 — Key Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-1">
                {[
                  { section: 'Sec. 102 — Exemptions', desc: 'Conditions under which direct procurement is allowed (emergency, single source, etc.)' },
                  { section: 'Sec. 117 — Public Notice', desc: 'Requirement to publish tender notices on PPIP portal and county notice boards' },
                  { section: 'Sec. 50 — Evaluation Committees', desc: 'Formation and procedures of tender evaluation committees for procurement above KSh 1M' },
                  { section: 'Sec. 131 — Contract Variation', desc: 'Limits on contract cost variations and approval requirements' },
                  { section: 'Sec. 145-147 — Debarment', desc: 'Process for debarment of suppliers who violate procurement laws (3-10 years)' },
                  { section: 'Sec. 172 — Whistleblower Protection', desc: 'Protection for persons reporting procurement irregularities' },
                  { section: 'Sec. 155 — Collusion', desc: 'Offenses related to bid rigging, collusion, and fraud in procurement' },
                ].map((item, i) => (
                  <AccordionItem key={i} value={`sec-${i}`} className="border border-stone-100 dark:border-stone-800 rounded-lg overflow-hidden">
                    <AccordionTrigger className="py-2 px-3 hover:no-underline">
                      <span className="text-[10px] font-semibold text-stone-700 dark:text-stone-200">{item.section}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-2">
                      <p className="text-[10px] text-stone-600 dark:text-stone-300">{item.desc}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Reporting */}
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardContent className="py-3 px-4 space-y-2">
              <p className="text-xs font-bold text-red-800 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Report Procurement Irregularities</p>
              <div className="space-y-1 text-[10px] text-red-700">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span>EACC Hotline: <span className="font-bold">1512</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span>EACC Email: <span className="font-bold">complaints@eacc.go.ke</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <a href="https://www.eacc.go.ke/report-corruption" target="_blank" rel="noopener noreferrer" className="underline font-bold">eacc.go.ke/report-corruption</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <a href="https://www.ppra.go.ke/report" target="_blank" rel="noopener noreferrer" className="underline font-bold">PPRA Complaints Portal</a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sources */}
      <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <CardContent className="py-3 px-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">Data Sources & References</p>
            <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
              <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
              <span>PPIP Portal: <a href="https://www.ppip.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">ppip.go.ke</a> — Searchable county procurement data, tender notices, and contract awards</span>
            </div>
            <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
              <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
              <span>PPRA: <a href="https://www.ppra.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">ppra.go.ke</a> — Annual reports, debarment lists, procurement regulations</span>
            </div>
            <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
              <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
              <span>PPAD Act 2015: Public Procurement and Asset Disposal Act — <a href="https://kenyalaw.org/klr/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">Full text at KenyaLaw.org</a></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
