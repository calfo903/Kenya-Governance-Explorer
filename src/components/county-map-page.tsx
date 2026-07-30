'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { all47Governors, GovernorEntry } from '@/data/governors';
import { REGIONS } from '@/data/types';
import {
  Map, Filter, X,
  Users, MapPin, Building2, TrendingDown, AlertTriangle,
  Layers, Search, ShieldCheck, ArrowRight, GitCompare, BarChart3, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KenyaCountyMap, kenyaCountyPaths, type CountyShape } from '@/components/kenya-county-map';
import { countyAuditData } from '@/data/county-audit-data';
import { countyBudgetData } from '@/data/county-budget-data';

type ColorMode = 'coalition' | 'region' | 'audit' | 'budget' | 'population';

interface CountyMapPageProps {
  onCountyDeepDive?: (countyCode: string) => void;
}

export default function CountyMapPage({ onCountyDeepDive }: CountyMapPageProps) {
  const t = useTranslations();
  const [colorMode, setColorMode] = useState<ColorMode>('coalition');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [coalitionFilter, setCoalitionFilter] = useState<string>('all');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [hoveredCounty, setHoveredCounty] = useState<CountyShape | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<GovernorEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFY, setSelectedFY] = useState('FY 2024/25');
  const [multiSelectedCounties, setMultiSelectedCounties] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  const FINANCIAL_YEARS = ['FY 2022/23', 'FY 2023/24', 'FY 2024/25'];

  // Track shift key for multi-select
  const shiftHeldRef = useRef(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftHeldRef.current = true; };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftHeldRef.current = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const governorMap = useMemo(() => {
    const map = new Map<string, GovernorEntry>();
    all47Governors.forEach(g => map.set(g.county, g));
    return map;
  }, []);

  const filteredShapes = useMemo(() => {
    let shapes = kenyaCountyPaths;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      shapes = shapes.filter(s => s.name.toLowerCase().includes(q));
    }
    if (regionFilter !== 'all') {
      shapes = shapes.filter(s => governorMap.get(s.name)?.region === regionFilter);
    }
    if (coalitionFilter !== 'all' && colorMode === 'coalition') {
      shapes = shapes.filter(s => governorMap.get(s.name)?.coalition === coalitionFilter);
    }
    if (auditFilter !== 'all' && colorMode === 'audit') {
      const capitalizedOpinion = auditFilter.charAt(0).toUpperCase() + auditFilter.slice(1);
      shapes = shapes.filter(s => {
        const rec = countyAuditData.find(a => a.countyCode === s.code && a.financialYear === selectedFY);
        return rec && rec.executiveOpinion === capitalizedOpinion;
      });
    }
    // Apply quick filter
    if (quickFilter === 'adverse') {
      shapes = shapes.filter(s => {
        const rec = countyAuditData.find(a => a.countyCode === s.code && a.financialYear === selectedFY);
        return rec && rec.executiveOpinion === 'Adverse';
      });
    } else if (quickFilter === 'top5-budget') {
      const budgetForFY = countyBudgetData
        .filter(b => b.financialYear === selectedFY)
        .sort((a, b) => b.devAbsorptionRate - a.devAbsorptionRate)
        .slice(0, 5)
        .map(b => b.countyCode);
      shapes = shapes.filter(s => budgetForFY.includes(s.code));
    } else if (quickFilter === 'largest-pop') {
      const top10 = [...all47Governors].sort((a, b) => b.population - a.population).slice(0, 10).map(g => g.code);
      shapes = shapes.filter(s => top10.includes(s.code));
    }
    return shapes;
  }, [regionFilter, coalitionFilter, auditFilter, searchQuery, colorMode, governorMap, quickFilter, selectedFY, countyAuditData, countyBudgetData]);

  // Quick filter counts
  const quickFilterCounts = useMemo(() => {
    const adverseCount = countyAuditData.filter(a => a.financialYear === selectedFY && a.executiveOpinion === 'Adverse').length;
    return {
      'adverse': adverseCount,
      'top5-budget': 5,
      'largest-pop': 10,
    };
  }, [selectedFY]);

  const QUICK_FILTERS = [
    { key: 'adverse', labelKey: 'map.adverseAudit', icon: AlertTriangle },
    { key: 'top5-budget', labelKey: 'map.top5BudgetAbsorption', icon: BarChart3 },
    { key: 'largest-pop', labelKey: 'map.largestPopulation', icon: Users },
  ];

  // Audit coverage for selected FY
  const auditCoverage = useMemo(() => {
    const uniqueCounties = new Set(countyAuditData.filter(a => a.financialYear === selectedFY).map(a => a.countyCode));
    return uniqueCounties.size;
  }, [selectedFY]);

  const handleMapCountyClick = useCallback((code: string, name: string) => {
    if (shiftHeldRef.current) {
      setMultiSelectedCounties(prev =>
        prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
      );
    } else {
      const gov = all47Governors.find(g => g.code === code);
      if (gov) setSelectedCounty(gov);
    }
  }, []);

  const removeMultiSelected = useCallback((code: string) => {
    setMultiSelectedCounties(prev => prev.filter(c => c !== code));
  }, []);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Map className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{t('map.countyMapExplorer')}</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              {t('map.mapSubtitle')}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-blue-500/20 rounded-lg text-[11px] font-medium text-blue-300 flex items-center gap-1"><Layers className="h-3 w-3" /> {t('map.countiesCount', { count: 47 })}</span>
              <span className="px-2.5 py-1 bg-emerald-500/20 rounded-lg text-[11px] font-medium text-emerald-300 flex items-center gap-1"><Users className="h-3 w-3" /> {t('map.governorsCount', { count: 47 })}</span>
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[11px] font-medium text-amber-300 flex items-center gap-1"><MapPin className="h-3 w-3" /> {t('map.regionsCount', { count: 8 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardContent className="py-4 px-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder={t('map.searchCounty')}
                className="h-9 pl-9 text-xs border-stone-200 dark:border-stone-700"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={colorMode} onValueChange={v => setColorMode(v as ColorMode)}>
                <SelectTrigger className="h-9 w-36 text-xs border-stone-200 dark:border-stone-700"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coalition">{t('map.coalition')}</SelectItem>
                  <SelectItem value="region">{t('map.region')}</SelectItem>
                  <SelectItem value="audit">{t('map.auditOpinion')}</SelectItem>
                  <SelectItem value="budget">{t('map.budgetAbsorption')}</SelectItem>
                  <SelectItem value="population">{t('map.populationMode')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="h-9 w-36 text-xs border-stone-200 dark:border-stone-700"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('map.allRegions')}</SelectItem>
                  {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              {colorMode === 'coalition' && (
                <Select value={coalitionFilter} onValueChange={setCoalitionFilter}>
                  <SelectTrigger className="h-9 w-40 text-xs border-stone-200 dark:border-stone-700"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('map.allCoalitions')}</SelectItem>
                    <SelectItem value="Kenya Kwanza Alliance">Kenya Kwanza</SelectItem>
                    <SelectItem value="Azimio la Umoja One Kenya Coalition">Azimio</SelectItem>
                    <SelectItem value="Independent">{t('county.independent')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {colorMode === 'audit' && (
                <Select value={auditFilter} onValueChange={setAuditFilter}>
                  <SelectTrigger className="h-9 w-40 text-xs border-stone-200 dark:border-stone-700"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('map.allOpinions')}</SelectItem>
                    <SelectItem value="unmodified">{t('audit.unmodified')}</SelectItem>
                    <SelectItem value="qualified">{t('audit.qualified')}</SelectItem>
                    <SelectItem value="adverse">{t('audit.adverse')}</SelectItem>
                    <SelectItem value="disclaimer">{t('audit.disclaimer')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider self-center mr-1">
              <Filter className="h-3 w-3 inline mr-1" />{t('map.quickFilters')}
            </span>
            {QUICK_FILTERS.map(qf => (
              <button
                key={qf.key}
                onClick={() => setQuickFilter(prev => prev === qf.key ? null : qf.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                  quickFilter === qf.key
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:bg-stone-700'
                }`}
              >
                <qf.icon className="h-3 w-3" />
                {t(qf.labelKey as any)}
                <span className={`ml-0.5 text-[9px] px-1.5 py-0.5 rounded-full ${
                  quickFilter === qf.key ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-500 dark:text-stone-400'
                }`}>
                  {quickFilterCounts[qf.key as keyof typeof quickFilterCounts]}
                </span>
                {quickFilter === qf.key && <X className="h-2.5 w-2.5 ml-0.5" />}
              </button>
            ))}
          </div>
          {/* Temporal FY Selector - visible in audit mode */}
          {colorMode === 'audit' && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider self-center mr-1">
                Financial Year:
              </span>
              {FINANCIAL_YEARS.map(fy => (
                <button
                  key={fy}
                  onClick={() => setSelectedFY(fy)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                    selectedFY === fy
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'
                  }`}
                >
                  {fy}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden">
            <CardContent className="p-4">
              <div className="relative bg-stone-50 dark:bg-stone-800 rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
                {/* Animated transition wrapper */}
                <div key={colorMode} className="animate-in fade-in duration-300">
                <KenyaCountyMap
                  colorMode={colorMode}
                  financialYear={selectedFY}
                  selectedCounties={multiSelectedCounties}
                  onCountyClick={handleMapCountyClick}
                  onCountyHover={(code) => {
                    if (code) {
                      const shape = kenyaCountyPaths.find(s => s.code === code);
                      if (shape) setHoveredCounty(shape);
                    } else {
                      setHoveredCounty(null);
                    }
                  }}
                  highlightedCounties={selectedCounty ? [selectedCounty.code] : []}
                  showLabels={true}
                />
                </div>
                {/* Tooltip */}
                {hoveredCounty && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 p-3 max-w-52 z-10">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{hoveredCounty.name}</p>
                    {(() => {
                      const gov = governorMap.get(hoveredCounty.name);
                      return gov ? (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Gov: {gov.name}</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Party: {gov.party} ({gov.coalition})</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Region: {gov.region}</p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">Pop: {gov.population.toLocaleString()}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              {/* Legend is rendered by KenyaCountyMap internally */}
            </CardContent>
          </Card>
        </div>

        {/* County Details Panel */}
        <div className="lg:col-span-1">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
                County Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCounty ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedCounty.county}</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{selectedCounty.region} Region</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedCounty(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Users className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">Governor</p>
                        <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">{selectedCounty.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">Party / Coalition</p>
                        <div className="flex gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[9px] h-5">{selectedCounty.party}</Badge>
                          <Badge className={`text-[9px] h-5 ${selectedCounty.coalition === 'Kenya Kwanza Alliance' ? 'bg-blue-100 text-blue-700' : selectedCounty.coalition === 'Azimio la Umoja One Kenya Coalition' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200'}`}>{selectedCounty.coalition === 'Kenya Kwanza Alliance' ? 'KK' : selectedCounty.coalition === 'Azimio la Umoja One Kenya Coalition' ? 'Azimio' : 'Ind'}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">Capital</p>
                        <p className="text-xs text-stone-800 dark:text-stone-100">{selectedCounty.capital}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <p className="text-[9px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Population</p>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{(selectedCounty.population / 1e6).toFixed(1)}M</p>
                      </div>
                      <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <p className="text-[9px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Area</p>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{(selectedCounty.areaSqKm).toLocaleString()} km²</p>
                      </div>
                      <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <p className="text-[9px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Constituencies</p>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{selectedCounty.constituenciesCount}</p>
                      </div>
                      <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <p className="text-[9px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Wards</p>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{selectedCounty.wardsCount}</p>
                      </div>
                    </div>
                    <Separator />
                    {/* Real audit & budget data */}
                    {(() => {
                      const auditRec = countyAuditData.find(a => a.countyCode === selectedCounty.code && a.financialYear === selectedFY);
                      const budgetRec = countyBudgetData.find(b => b.countyCode === selectedCounty.code && b.financialYear === selectedFY);
                      return (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-stone-600 dark:text-stone-300">{selectedFY} Data</p>
                          {auditRec && (
                            <div className="flex items-start gap-2">
                              <ShieldCheck className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-stone-500 dark:text-stone-400">OAG Audit Opinion</p>
                                <Badge className={`text-[9px] h-5 mt-0.5 ${auditRec.executiveOpinion === 'Unmodified' ? 'bg-green-100 text-green-800' : auditRec.executiveOpinion === 'Qualified' ? 'bg-yellow-100 text-yellow-800' : auditRec.executiveOpinion === 'Adverse' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                  {auditRec.executiveOpinion || 'Pending'}
                                </Badge>
                              </div>
                            </div>
                          )}
                          {budgetRec && (
                            <>
                              <div className="flex items-start gap-2">
                                <TrendingDown className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Dev Budget Absorption</p>
                                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{budgetRec.devAbsorptionRate}%</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Building2 className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Total Budget</p>
                                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">KSh {budgetRec.totalBudget}B</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-stone-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Pending Bills</p>
                                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">KSh {budgetRec.pendingBills}M</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}
                    {/* Deep Dive Button */}
                    <Button
                      size="sm"
                      className="w-full mt-3 gap-2"
                      onClick={() => onCountyDeepDive?.(selectedCounty.code)}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Deep Dive
                      <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 dark:text-stone-400">Click a county on the map to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Bar - shows when 2+ counties are shift-selected */}
      {multiSelectedCounties.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-stone-200 dark:border-stone-700 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <GitCompare className="h-4 w-4 text-stone-500 dark:text-stone-400 shrink-0" />
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider shrink-0">
                Comparing ({multiSelectedCounties.length}):
              </span>
              {multiSelectedCounties.map(code => {
                const gov = all47Governors.find(g => g.code === code);
                return (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="text-[11px] h-7 pr-1 pl-2.5 gap-1.5 shrink-0"
                  >
                    {gov?.county || code}
                    <button
                      onClick={() => removeMultiSelected(code)}
                      className="h-4 w-4 rounded-full hover:bg-stone-300/50 flex items-center justify-center transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Button
              size="sm"
              className="shrink-0 gap-1.5 h-8 text-xs"
              variant="default"
              onClick={() => {
                setMultiSelectedCounties([]);
              }}
            >
              <GitCompare className="h-3.5 w-3.5" />
              Compare Counties
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 h-8 text-xs text-stone-500 dark:text-stone-400"
              onClick={() => setMultiSelectedCounties([])}
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Map Statistics Footer Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                <Layers className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Counties Colored</p>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{filteredShapes.length} <span className="text-[10px] font-normal text-stone-400">/ 47</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <Filter className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Current Filter</p>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{quickFilter ? QUICK_FILTERS.find(f => f.key === quickFilter)?.label || quickFilter : 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${multiSelectedCounties.length >= 2 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-stone-50 dark:bg-stone-800'}`}>
                <GitCompare className={`h-4 w-4 ${multiSelectedCounties.length >= 2 ? 'text-blue-600' : 'text-stone-400'}`} />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Selected for Comparison</p>
                <p className={`text-sm font-bold ${multiSelectedCounties.length >= 2 ? 'text-blue-700' : 'text-stone-800 dark:text-stone-100'}`}>{multiSelectedCounties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">Audit Coverage</p>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{auditCoverage} <span className="text-[10px] font-normal text-stone-400">/ 47 ({selectedFY})</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed">
              <span className="font-bold">Note:</span> County boundary shapes are simplified approximations for visualization. Coalition data from IEBC 2022 results.
              Audit opinions based on OAG {selectedFY} summary. Hold <kbd className="px-1 py-0.5 bg-stone-200 rounded text-[9px] font-mono">Shift</kbd> + Click to select counties for comparison.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
