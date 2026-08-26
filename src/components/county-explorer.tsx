'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  County, Representative, ScorecardMetrics, ComparisonItem,
  getScoreColor, getScoreLabel, getAuditColor,
} from '@/data/types';
import {
  MapPin, User, Mail, Globe, ExternalLink, GitCompare, AlertTriangle, Scale, Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DownloadLink from '@/components/download-link';
import RepChatWidget from '@/components/rep-chat-widget';
import RepAvatar from '@/components/rep-avatar';

// ══════════════════════════════════════════════════════════════════
// COUNTY EXPLORER
// ══════════════════════════════════════════════════════════════════
export function CountyExplorer({ countyCode, allCounties, onSelectCounty, addToComparison, comparisonList }: {
  countyCode: string; allCounties: County[]; onSelectCounty: (code: string) => void;
  addToComparison: (rep: Representative, countyName: string) => void; comparisonList: ComparisonItem[];
}) {
  const t = useTranslations();
  const county = allCounties.find(c => c.code === countyCode) || allCounties[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 print:hidden">
        <MapPin className="h-4 w-4 text-emerald-600" />
        <Select value={county.code} onValueChange={onSelectCounty}>
          <SelectTrigger className="h-9 text-sm flex-1 max-w-md border-stone-200"><SelectValue /></SelectTrigger>
          <SelectContent>{allCounties.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {c.name} ({c.region}) {c.dataAvailability === 'full' ? '★' : c.dataAvailability === 'partial' ? '◐' : '○'}</SelectItem>)}</SelectContent>
        </Select>
        <Button
          onClick={() => window.print()}
          variant="outline"
          size="sm"
          className="h-9 text-xs border-stone-200 text-stone-600 hover:bg-stone-50 flex items-center gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Scorecard
        </Button>
      </div>

      {/* County Header Card */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{t('explorer.countyHeader', { name: county.name })}</CardTitle>
              <p className="text-xs text-stone-500 mt-1">{t('county.code')}: {county.code} · {county.region} · {t('county.capital')}: {county.capital}</p>
            </div>
            <div className="flex gap-1.5">
              {county.executiveAuditOpinion && <Badge className={`text-[10px] border ${getAuditColor(county.executiveAuditOpinion)}`}>{t('audit.audit')}: {county.executiveAuditOpinion}</Badge>}
              <Badge variant="outline" className={`text-[10px] ${county.dataAvailability === 'partial' ? 'text-yellow-600 border-yellow-200' : 'text-stone-400'}`}>{county.dataAvailability}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[{ l: t('county.population'), v: county.population.toLocaleString() }, { l: t('county.area'), v: county.areaSqKm.toLocaleString() }, { l: t('county.constituencies'), v: county.constituenciesCount.toString() }, { l: t('county.wards'), v: county.wardsCount.toString() }, { l: t('county.term'), v: '2022–2027' }].map(s => (
              <div key={s.l} className="p-2 bg-stone-50 rounded-lg text-center">
                <p className="text-[10px] text-stone-500">{s.l}</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">{s.v}</p>
              </div>
            ))}
          </div>
          {county.dataAvailabilityNote && (
            <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${county.dataAvailability === 'partial' ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' : 'bg-orange-50 text-orange-800 border border-orange-100'}`}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><p>{county.dataAvailabilityNote}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Officials */}
      {county.dataAvailability !== 'placeholder' ? (
        <div className="space-y-3">
          {[county.governor, county.deputyGovernor, county.senator, county.womanRep, county.countyAssembly?.speaker].filter(Boolean).map(rep => rep && (
            <OfficialFullCard key={rep!.id} rep={rep!} countyName={county.name} onCompare={addToComparison} />
          ))}

          {county.countyAssembly?.auditOpinion && (
            <Card className="border-stone-200 bg-white">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs"><Scale className="h-4 w-4 text-emerald-600" /><span className="font-semibold">{t('county.assemblyAudit')}:</span><Badge className={`border ${getAuditColor(county.countyAssembly!.auditOpinion)}`}>{county.countyAssembly!.auditOpinion}</Badge></div>
                {county.countyAssembly!.auditSource?.url && <DownloadLink href={county.countyAssembly!.auditSource!.url} className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {t('common.report')}</DownloadLink>}
              </CardContent>
            </Card>
          )}

          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t('county.constituenciesAndWards')}</CardTitle></CardHeader>
            <CardContent>
              {county.constituencies.length > 0 ? (
                <Accordion type="multiple" className="space-y-1.5">
                  {county.constituencies.map(con => (
                    <AccordionItem key={con.id} value={con.id} className="border border-stone-100 rounded-lg px-3">
                      <AccordionTrigger className="py-2 hover:no-underline text-xs">
                        <span className="font-medium">{con.name}</span>{con.mp && <Badge variant="secondary" className="text-[10px] ml-2">{con.mp.fullName} ({con.mp.politicalParty})</Badge>}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        {con.mp && <div className="mb-2 p-2 bg-emerald-50 rounded-lg text-xs"><span className="font-medium text-emerald-800">{con.mp.fullName}</span> · {con.mp.politicalParty} <Button variant="ghost" size="sm" className="h-5 text-[10px] ml-2" onClick={() => addToComparison(con.mp!, county.name)}><GitCompare className="h-3 w-3 mr-0.5" />{t('common.compare')}</Button></div>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">{con.wards.map(w => (
                          <div key={w.id} className="p-1.5 bg-stone-50 rounded text-[11px]"><p className="font-medium">{w.name}</p>{w.mca ? <p className="text-stone-400">MCA: {w.mca.fullName}</p> : <p className="text-stone-400 italic">{t('county.mcaPendingVerification')}</p>}</div>
                        ))}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : <div className="p-3 text-xs text-stone-500 bg-orange-50 rounded-lg border border-orange-100 flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {t('county.constituencyDataNotLoaded')}</div>}
            </CardContent>
          </Card>

          {county.countyExecutive && county.countyExecutive.length > 0 && (
            <Card className="border-stone-200 bg-white">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{t('county.countyExecutiveCommittee')}</CardTitle><CardDescription className="text-xs">{t('county.appointedByGovernor')}</CardDescription></CardHeader>
              <CardContent><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{county.countyExecutive.map(cecm => (
                <div key={cecm.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-100"><p className="text-xs font-semibold text-emerald-800">{cecm.portfolio}</p><p className="text-[11px] text-stone-500 mt-0.5">{cecm.fullName.includes('not publicly') ? <span className="italic text-amber-600"><AlertTriangle className="h-3 w-3 inline mr-0.5" />{t('county.namePendingVerification')}</span> : cecm.fullName}</p></div>
              ))}</div></CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-amber-800 text-sm">{t('county.placeholderTitle')}</h3>
            <p className="text-xs text-amber-700 mt-2 max-w-md mx-auto">{t('county.placeholderDescription')}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">{[
              { l: 'OAG', u: 'https://oagkenya.go.ke/reports/county-government-audit-reports/' }, { l: 'CoB', u: 'https://cob.go.ke/county-budget-implementation-review-reports/' }, { l: 'TI-Kenya', u: 'https://tikenya.org/' }, { l: 'IEBC', u: 'https://www.iebc.or.ke/' },
            ].map(s => <a key={s.l} href={s.u} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 bg-white rounded border border-amber-200 text-amber-800 hover:bg-amber-100 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {s.l}</a>)}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// OFFICIAL FULL CARD WITH SCORECARD
// ══════════════════════════════════════════════════════════════════
export function OfficialFullCard({ rep, countyName, onCompare }: { rep: Representative; countyName: string; onCompare: (rep: Representative, countyName: string) => void }) {
  const t = useTranslations();
  const metricLabels: Record<keyof ScorecardMetrics, string> = {
    overallAccountabilityScore: t('explorer.scorecardLabels.accountability'),
    transparencyAssetDeclaration: t('explorer.scorecardLabels.transparency'),
    projectDeliveryAbsorptionRate: t('explorer.scorecardLabels.projectDelivery'),
    manifestoPromiseFulfillment: t('explorer.scorecardLabels.manifesto'),
    legislativeOversightPerformance: t('explorer.scorecardLabels.oversight'),
    ethicsIntegrity: t('explorer.scorecardLabels.ethics'),
    publicSentimentCitizenAwareness: t('explorer.scorecardLabels.sentiment'),
  };
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RepAvatar name={rep.fullName} county={countyName} size="h-6 w-6" className="mt-0.5" />
              {rep.fullName}
            </CardTitle>
            <p className="text-xs text-stone-500">{rep.officialTitle} · {rep.politicalParty} {rep.coalition ? `(${rep.coalition})` : ''} · {rep.jurisdiction}</p>
          </div>
          <div className="flex items-center gap-1">
            <RepChatWidget rep={{ name: rep.fullName, title: rep.officialTitle, county: countyName, party: rep.politicalParty, coalition: rep.coalition, bio: rep.biography }} />
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => onCompare(rep, countyName)}><GitCompare className="h-3 w-3" /> {t('common.compare')}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rep.biography && <p className="text-xs leading-relaxed text-stone-600">{rep.biography}</p>}
        {rep.contacts && Object.values(rep.contacts).some(Boolean) && (
          <div className="flex flex-wrap gap-3 text-[11px]">
            {rep.contacts.email && <span className="flex items-center gap-1 text-stone-500"><Mail className="h-3 w-3" /> {rep.contacts.email}</span>}
            {rep.contacts.xHandle && <span className="flex items-center gap-1 text-stone-500"><Globe className="h-3 w-3" /> @{rep.contacts.xHandle}</span>}
            {rep.contacts.website && <a href={rep.contacts.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline"><ExternalLink className="h-3 w-3" /> {t('common.website')}</a>}
          </div>
        )}
        {rep.scorecard && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">{t('common.scorecard')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
              {(Object.entries(metricLabels) as [keyof ScorecardMetrics, string][]).map(([key, label]) => {
                const value = rep.scorecard!.metrics[key];
                const source = rep.scorecard!.sources[key];
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild><div className={`p-2 rounded-lg border text-center ${getScoreColor(value)}`}><p className="text-[10px] opacity-75">{label}</p><p className="text-lg font-bold mt-0.5">{getScoreLabel(value)}</p></div></TooltipTrigger>
                    <TooltipContent className="max-w-xs"><p className="text-[11px]">{label}: {getScoreLabel(value)}/100</p>{source && <p className="text-[10px] text-stone-400 mt-1">{source.source} — {source.reportTitle}<br />FY: {source.financialYear}{source.url && <> · <DownloadLink href={source.url} className="text-emerald-500 underline">Source</DownloadLink></>}</p>}{!source && <p className="text-[10px] text-stone-400 mt-1">{t('common.noSpecificSource')}</p>}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            {rep.scorecard.dataGapsNote && <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-[11px] flex items-start gap-1.5 text-yellow-800"><AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{rep.scorecard.dataGapsNote}</div>}
          </div>
        )}
        {rep.promiseVsDelivery && <div className="p-2 bg-stone-50 rounded-lg text-[11px] text-stone-600">{rep.promiseVsDelivery}</div>}
      </CardContent>
    </Card>
  );
}
