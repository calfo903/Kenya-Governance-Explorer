'use client';

import React, { useState, useMemo } from 'react';
import {
  all47Governors, getPlaceholderCounties,
} from '@/data/governors';
import {
  nationalSummary, getLatestAuditSummary, getLatestBudgetSummary,
  governorCoalitionDistribution, governorPartyDistribution,
} from '@/data/national-summary';
import { kajiadoCounty } from '@/data/kajiado-county';
import { sourceCategories, allSources, SourceEntry, SourceCategoryGroup } from '@/data/sources';
import {
  County, Representative, ScorecardMetrics, FilterState, ComparisonItem,
  getScoreColor, getScoreLabel, getAuditColor, AUDIT_OPINIONS, REGIONS,
} from '@/data/types';
import WhistleblowerPage from '@/components/whistleblower-page';
import ConstitutionPage from '@/components/constitution-page';
import PoliticalXPostsPage from '@/components/political-x-posts-page';
import CountyMapPage from '@/components/county-map-page';
import RtiGeneratorPage from '@/components/rti-generator-page';
import PetitionBuilderPage from '@/components/petition-builder-page';
import CorruptionHeatmapPage from '@/components/corruption-heatmap-page';
import ManifestoTrackerPage from '@/components/manifesto-tracker-page';
import AnonymousTipPage from '@/components/anonymous-tip-page';
import CitizenFeedbackPage from '@/components/citizen-feedback-page';
import TimelinePage from '@/components/timeline-page';
import BudgetSimulatorPage from '@/components/budget-simulator-page';
import DataFetcherPage from '@/components/data-fetcher-page';
import AlertsSubscriptionPage from '@/components/alerts-subscription-page';
import ProcurementMonitorPage from '@/components/procurement-monitor-page';

// ─── ICONS ────────────────────────────────────────────────────────
import {
  Shield, ChevronDown, ChevronRight, Search, Filter,
  Users, MapPin, Building2, Scale, FileText,
  BarChart3, GitCompare, TreePine, Database,
  ExternalLink, AlertTriangle, CheckCircle2,
  XCircle, Globe, Phone, Mail,
  Landmark, User, GripVertical, Star,
  Library, ChevronUp, Leaf, Zap, Gavel,
  Radio, Megaphone, BookOpen, Hand, Layers,
  ArrowRight, TrendingUp, TrendingDown, Minus,
  Eye, BookMarked, Menu, X, Volume2,
  Map, MailWarning, MessageSquare, Bell,
  Thermometer, FileOutput, ClipboardList,
  Receipt, Hash, Send, Timer,
  FolderSearch, ShoppingCart, AlertCircle,
  PieChart, Clock, FileCheck, Target,
} from 'lucide-react';

// ─── shadcn/ui ───────────────────────────────────────────────────
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── SIDEBAR NAV ITEMS ───────────────────────────────────────────
type TabId = 'summary' | 'tree' | 'county' | 'sources' | 'compare' | 'schema'
  | 'whistleblower' | 'constitution' | 'xposts'
  | 'countymap' | 'rti' | 'petition' | 'heatmap'
  | 'manifesto' | 'tiptsubmit' | 'feedback'
  | 'timeline' | 'budgetsim' | 'datafetcher'
  | 'alerts' | 'procurement';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  section?: string;
}

const navItems: NavItem[] = [
  // ── Governance ──
  { id: 'summary', label: 'National Summary', icon: BarChart3, section: 'Governance' },
  { id: 'tree', label: '47 Counties', icon: TreePine, section: 'Governance' },
  { id: 'countymap', label: 'County Map', icon: Map, section: 'Governance' },
  { id: 'county', label: 'County Deep-Dive', icon: MapPin, section: 'Governance' },
  { id: 'compare', label: 'Compare', icon: GitCompare, section: 'Governance' },
  { id: 'heatmap', label: 'Risk Heatmap', icon: Thermometer, section: 'Governance' },
  { id: 'sources', label: 'Sources Hub', icon: Library, section: 'Governance' },
  { id: 'schema', label: 'JSON Schema', icon: Database, section: 'Governance' },
  { id: 'timeline', label: 'Timeline', icon: Clock, section: 'Governance' },
  { id: 'budgetsim', label: 'Budget Simulator', icon: PieChart, section: 'Governance' },
  { id: 'manifesto', label: 'Manifesto Tracker', icon: Target, section: 'Governance' },
  // ── Civic Tools ──
  { id: 'whistleblower', label: 'Whistleblower', icon: Eye, section: 'Civic Tools' },
  { id: 'tiptsubmit', label: 'Submit Tip', icon: Send, section: 'Civic Tools' },
  { id: 'constitution', label: 'Constitution', icon: BookMarked, section: 'Civic Tools' },
  { id: 'xposts', label: 'Political X Posts', icon: Volume2, section: 'Civic Tools' },
  // ── Citizen Action ──
  { id: 'rti', label: 'RTI Generator', icon: FileCheck, section: 'Citizen Action' },
  { id: 'petition', label: 'Petition Builder', icon: ClipboardList, section: 'Citizen Action' },
  { id: 'feedback', label: 'Rate Services', icon: MessageSquare, section: 'Citizen Action' },
  { id: 'procurement', label: 'Procurement Watch', icon: ShoppingCart, section: 'Citizen Action' },
  // ── Data & Alerts ──
  { id: 'datafetcher', label: 'Live Data', icon: FolderSearch, section: 'Data & Alerts' },
  { id: 'alerts', label: 'Alerts', icon: Bell, section: 'Data & Alerts' },
];

// ─── ICON MAP FOR SOURCES ────────────────────────────────────────
function SourceIcon({ name, className }: { name: string; className?: string }) {
  const props = { className: className || 'h-5 w-5' };
  switch (name) {
    case 'Scale': return <Scale {...props} />;
    case 'BarChart3': return <BarChart3 {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'Landmark': return <Landmark {...props} />;
    case 'Globe': return <Globe {...props} />;
    case 'Building2': return <Building2 {...props} />;
    case 'Users': return <Users {...props} />;
    case 'Database': return <Database {...props} />;
    case 'CheckCircle2': return <CheckCircle2 {...props} />;
    case 'Search': return <Search {...props} />;
    default: return <Library {...props} />;
  }
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function KenyaGovernancePage() {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [selectedCounty, setSelectedCounty] = useState<string>('034');
  const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
  const [comparisonList, setComparisonList] = useState<ComparisonItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allCounties = useMemo(() => {
    const placeholders = getPlaceholderCounties();
    return placeholders.map((c) => c.code === '034' ? kajiadoCounty : c);
  }, []);

  const toggleCounty = (code: string) => {
    const next = new Set(expandedCounties);
    if (next.has(code)) next.delete(code); else next.add(code);
    setExpandedCounties(next);
  };

  const addToComparison = (rep: Representative, countyName: string) => {
    if (comparisonList.length >= 4) return;
    if (comparisonList.find(c => c.representative.id === rep.id)) return;
    setComparisonList([...comparisonList, { representative: rep, countyName }]);
  };

  const removeFromComparison = (id: string) => {
    setComparisonList(comparisonList.filter(c => c.representative.id !== id));
  };

  const filteredGovernors = useMemo(() => {
    return all47Governors.filter((g) => {
      if (filters.region && g.region !== filters.region) return false;
      if (filters.coalition && g.coalition !== filters.coalition) return false;
      if (filters.party && g.party !== filters.party) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!g.name.toLowerCase().includes(kw) && !g.county.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [filters]);

  // Group nav items by section
  const governanceItems = navItems.filter(n => n.section === 'Governance');
  const civicItems = navItems.filter(n => n.section === 'Civic Tools');
  const citizenItems = navItems.filter(n => n.section === 'Citizen Action');
  const dataItems = navItems.filter(n => n.section === 'Data & Alerts');

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-stone-50">
        {/* ══════════ HEADER ══════════ */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden h-9 w-9 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                >
                  <Menu className="h-4 w-4 text-stone-600" />
                </button>
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-tight">
                    Kenya Governance Explorer
                  </h1>
                  <p className="text-[10px] sm:text-xs text-stone-500">
                    2022–2027 · 47 Counties · Evidence-Based
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {comparisonList.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-6 bg-emerald-100 text-emerald-700">
                    {comparisonList.length}/4 compare
                  </Badge>
                )}
                <a href="https://kenyalaw.org/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 text-[10px] text-stone-400 hover:text-emerald-600 transition-colors">
                  <BookMarked className="h-3 w-3" />Constitution
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════ LAYOUT: SIDEBAR + MAIN ══════════ */}
        <div className="flex flex-1">
          {/* Sidebar - Desktop (always visible on lg+) */}
          <aside className="hidden lg:flex flex-col w-60 border-r border-stone-200 bg-white shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
            <nav className="flex-1 py-3 px-2 space-y-4">
              {/* Governance Section */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Governance</p>
                {governanceItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
                      activeTab === item.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-stone-100" />

              {/* Civic Tools Section */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Civic Tools</p>
                {civicItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-stone-100" />

              {/* Citizen Action Section */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Citizen Action</p>
                {citizenItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
                      activeTab === item.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-stone-100" />

              {/* Data & Alerts Section */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Data & Alerts</p>
                {dataItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
                      activeTab === item.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-stone-100" />

              {/* Quick Stats */}
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Quick Stats</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Counties</span>
                    <span className="font-bold text-stone-700">47</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Data Sources</span>
                    <span className="font-bold text-stone-700">{allSources.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Term</span>
                    <span className="font-bold text-stone-700">2022–2027</span>
                  </div>
                </div>
              </div>

              {/* Primary Sources Links */}
              <div className="px-3 py-2 mt-auto">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Primary Sources</p>
                <div className="space-y-1">
                  {[
                    { label: 'OAG Kenya', url: 'https://oagkenya.go.ke/' },
                    { label: 'Controller of Budget', url: 'https://cob.go.ke/' },
                    { label: 'TI-Kenya', url: 'https://tikenya.org/' },
                    { label: 'IEBC', url: 'https://www.iebc.or.ke/' },
                    { label: 'EACC', url: 'https://eacc.go.ke/' },
                  ].map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] text-stone-500 hover:text-emerald-600 transition-colors">
                      <ExternalLink className="h-2.5 w-2.5" /> {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-stone-200 flex flex-col shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
                  <span className="text-sm font-bold text-stone-800">Navigation</span>
                  <button onClick={() => setSidebarOpen(false)} className="h-8 w-8 rounded-lg hover:bg-stone-100 flex items-center justify-center">
                    <X className="h-4 w-4 text-stone-500" />
                  </button>
                </div>
                <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
                  <div>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Governance</p>
                    {governanceItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                          activeTab === item.id
                            ? 'bg-emerald-600 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Civic Tools</p>
                    {civicItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                          activeTab === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Citizen Action</p>
                    {citizenItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                          activeTab === item.id
                            ? 'bg-amber-600 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Data & Alerts</p>
                    {dataItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                          activeTab === item.id
                            ? 'bg-purple-600 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              </aside>
            </div>
          )}

          {/* ══════════ MAIN CONTENT ══════════ */}
          <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
            {activeTab === 'summary' && <NationalSummaryDashboard />}
            {activeTab === 'tree' && (
              <GovernorsTreeView
                governors={filteredGovernors}
                expandedCounties={expandedCounties}
                toggleCounty={toggleCounty}
                allCounties={allCounties}
                filters={filters}
                setFilters={setFilters}
                addToComparison={addToComparison}
                comparisonList={comparisonList}
              />
            )}
            {activeTab === 'county' && (
              <CountyExplorer
                countyCode={selectedCounty}
                allCounties={allCounties}
                onSelectCounty={setSelectedCounty}
                addToComparison={addToComparison}
                comparisonList={comparisonList}
              />
            )}
            {activeTab === 'sources' && <SourcesHub />}
            {activeTab === 'compare' && (
              <ComparisonView
                comparisonList={comparisonList}
                removeFromComparison={removeFromComparison}
                addToComparison={addToComparison}
                allCounties={allCounties}
              />
            )}
            {activeTab === 'schema' && <JsonSchemaView />}
            {activeTab === 'whistleblower' && <WhistleblowerPage />}
            {activeTab === 'constitution' && <ConstitutionPage />}
            {activeTab === 'xposts' && <PoliticalXPostsPage />}
            {activeTab === 'countymap' && <CountyMapPage />}
            {activeTab === 'rti' && <RtiGeneratorPage />}
            {activeTab === 'petition' && <PetitionBuilderPage />}
            {activeTab === 'heatmap' && <CorruptionHeatmapPage />}
            {activeTab === 'manifesto' && <ManifestoTrackerPage />}
            {activeTab === 'tiptsubmit' && <AnonymousTipPage />}
            {activeTab === 'feedback' && <CitizenFeedbackPage />}
            {activeTab === 'timeline' && <TimelinePage />}
            {activeTab === 'budgetsim' && <BudgetSimulatorPage />}
            {activeTab === 'datafetcher' && <DataFetcherPage />}
            {activeTab === 'alerts' && <AlertsSubscriptionPage />}
            {activeTab === 'procurement' && <ProcurementMonitorPage />}
          </main>
        </div>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="bg-stone-900 text-stone-400 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
              <div>
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">Primary Sources</h3>
                <ul className="space-y-1.5 text-xs">
                  {[
                    { label: 'OAG', url: 'https://oagkenya.go.ke/' },
                    { label: 'CoB', url: 'https://cob.go.ke/' },
                    { label: 'TI-Kenya', url: 'https://tikenya.org/' },
                    { label: 'IEBC', url: 'https://www.iebc.or.ke/' },
                    { label: 'EACC', url: 'https://eacc.go.ke/' },
                  ].map(s => (
                    <li key={s.label}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                        <ExternalLink className="h-3 w-3" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">Parliament & Oversight</h3>
                <ul className="space-y-1.5 text-xs">
                  {[
                    { label: 'Parliament Hansard', url: 'https://parliament.go.ke/' },
                    { label: 'Senate CPAIC', url: 'https://parliament.go.ke/committees' },
                    { label: 'PPRA / PPIP', url: 'https://ppra.go.ke/' },
                    { label: 'CRA', url: 'https://cra.go.ke/' },
                    { label: 'PSC', url: 'https://psc.go.ke/' },
                    { label: 'CAJ Ombudsman', url: 'https://caj.go.ke/' },
                  ].map(s => (
                    <li key={s.label}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                        <ExternalLink className="h-3 w-3" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">Resources & Data</h3>
                <ul className="space-y-1.5 text-xs">
                  {[
                    { label: 'KNBS Statistics', url: 'https://www.knbs.or.ke/' },
                    { label: 'Kenya Open Data', url: 'https://opendata.go.ke/' },
                    { label: 'National Treasury', url: 'https://treasury.go.ke/' },
                    { label: 'NLC Land', url: 'https://nlc.go.ke/' },
                    { label: 'WASREB Water', url: 'https://wasreb.go.ke/' },
                    { label: 'KFS Forests', url: 'https://kenyaforestservice.org/' },
                  ].map(s => (
                    <li key={s.label}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                        <ExternalLink className="h-3 w-3" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">Civil Society</h3>
                <ul className="space-y-1.5 text-xs">
                  {[
                    { label: 'Mzalendo', url: 'https://mzalendo.com/' },
                    { label: 'PesaCheck', url: 'https://pesacheck.africa/' },
                    { label: 'Katiba Institute', url: 'https://katibainstitute.org/' },
                    { label: 'AfriCOG', url: 'https://africog.org/' },
                    { label: 'Bajeti Hub', url: 'https://bajeti.go.ke/' },
                    { label: 'IEA Kenya', url: 'https://ieakenya.or.ke/' },
                  ].map(s => (
                    <li key={s.label}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                        <ExternalLink className="h-3 w-3" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Separator className="my-6 bg-stone-700" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
              <p>Kenya County Governance Explorer · Strictly Non-Partisan · Evidence-Based</p>
              <p>Last updated: 2026-07-25 · {allSources.length} data sources indexed</p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

// ══════════════════════════════════════════════════════════════════
// NATIONAL SUMMARY DASHBOARD
// ══════════════════════════════════════════════════════════════════
function NationalSummaryDashboard() {
  const latestAudit = getLatestAuditSummary();
  const prevAudit = nationalSummary.auditSummaries[1];
  const latestBudget = getLatestBudgetSummary();

  return (
    <div className="space-y-5">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Counties', value: '47', sub: 'Devolved Units', icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Clean Audits (Exec)', value: latestAudit.countyExecutive.unmodified.toString(), sub: `of 47 (${latestAudit.financialYear})`, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Dev Absorption', value: `${latestBudget.avgDevelopmentAbsorption}%`, sub: latestBudget.period, icon: TrendingDown, color: 'text-red-600 bg-red-50' },
          { label: 'Unspent Funds', value: latestBudget.totalUnspentAmount || '—', sub: 'Development Budget', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-stone-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 leading-tight">{stat.value}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* OAG Audit */}
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-600" /> OAG Audit Opinions — {latestAudit.financialYear}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">Latest</Badge>
            </div>
            <CardDescription className="text-xs">{latestAudit.source.source} — {latestAudit.source.reportTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-2.5">County Executives</p>
              <div className="space-y-2">
                {[
                  { label: 'Unmodified', count: latestAudit.countyExecutive.unmodified, color: 'bg-green-500' },
                  { label: 'Qualified', count: latestAudit.countyExecutive.qualified, color: 'bg-yellow-500' },
                  { label: 'Adverse', count: latestAudit.countyExecutive.adverse, color: 'bg-orange-500' },
                  { label: 'Disclaimer', count: latestAudit.countyExecutive.disclaimer, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-xs w-24 text-stone-600">{item.label}</span>
                    <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full flex items-center justify-end pr-1.5 transition-all`}
                        style={{ width: `${Math.max((item.count / 47) * 100, item.count > 0 ? 6 : 0)}%` }}>
                        <span className="text-[10px] font-bold text-white">{item.count}</span>
                      </div>
                    </div>
                    <span className="text-xs w-9 text-right text-stone-500">{Math.round((item.count / 47) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-2.5">County Assemblies</p>
              <div className="space-y-2">
                {[
                  { label: 'Unmodified', count: latestAudit.countyAssembly.unmodified, color: 'bg-green-500' },
                  { label: 'Qualified', count: latestAudit.countyAssembly.qualified, color: 'bg-yellow-500' },
                  { label: 'Adverse', count: latestAudit.countyAssembly.adverse, color: 'bg-orange-500' },
                  { label: 'Disclaimer', count: latestAudit.countyAssembly.disclaimer, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-xs w-24 text-stone-600">{item.label}</span>
                    <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full flex items-center justify-end pr-1.5 transition-all`}
                        style={{ width: `${Math.max((item.count / 47) * 100, item.count > 0 ? 6 : 0)}%` }}>
                        <span className="text-[10px] font-bold text-white">{item.count}</span>
                      </div>
                    </div>
                    <span className="text-xs w-9 text-right text-stone-500">{Math.round((item.count / 47) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            {latestAudit.source.url && (
              <a href={latestAudit.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> View full report
              </a>
            )}
          </CardContent>
        </Card>

        {/* CoB Budget */}
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-600" /> CoB Budget Absorption — {latestBudget.financialYear}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">{latestBudget.period}</Badge>
            </div>
            <CardDescription className="text-xs">{latestBudget.source.source} — {latestBudget.source.reportTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-xl text-center border border-red-100">
                <p className="text-[10px] font-medium text-red-600 uppercase tracking-wider">Development</p>
                <p className="text-3xl font-bold text-red-700 mt-0.5">{latestBudget.avgDevelopmentAbsorption}%</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Recurrent</p>
                <p className="text-3xl font-bold text-emerald-700 mt-0.5">{latestBudget.avgRecurrentAbsorption}%</p>
              </div>
            </div>
            {latestBudget.totalUnspentAmount && (
              <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">Total Unspent</p>
                <p className="text-xl font-bold text-amber-800 mt-0.5">{latestBudget.totalUnspentAmount}</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Top Performers</p>
              {latestBudget.topPerformers.map(c => (
                <div key={c.county} className="flex justify-between items-center px-3 py-1.5 bg-green-50 rounded-lg text-xs">
                  <span className="font-medium">{c.county}</span>
                  <span className="font-bold text-green-700">{c.rate}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Bottom Performers</p>
              {latestBudget.bottomPerformers.map(c => (
                <div key={c.county} className="flex justify-between items-center px-3 py-1.5 bg-red-50 rounded-lg text-xs">
                  <span className="font-medium">{c.county}</span>
                  <span className="font-bold text-red-700">{c.rate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* YoY + Coalition + Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {prevAudit && (
          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Year-over-Year Trend</CardTitle>
              <CardDescription className="text-xs">FY {prevAudit.financialYear} → {latestAudit.financialYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Exec Clean', prev: prevAudit.countyExecutive.unmodified, curr: latestAudit.countyExecutive.unmodified },
                  { label: 'Exec Qualified', prev: prevAudit.countyExecutive.qualified, curr: latestAudit.countyExecutive.qualified },
                  { label: 'Assembly Clean', prev: prevAudit.countyAssembly.unmodified, curr: latestAudit.countyAssembly.unmodified },
                  { label: 'Adverse', prev: prevAudit.countyExecutive.adverse, curr: latestAudit.countyExecutive.adverse },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-stone-600 w-28">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400">{item.prev}</span>
                      {item.curr > item.prev ? <TrendingUp className="h-3 w-3 text-green-600" /> : item.curr < item.prev ? <TrendingDown className="h-3 w-3 text-red-600" /> : <Minus className="h-3 w-3 text-stone-400" />}
                      <span className="font-bold">{item.curr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Governor Coalition Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(governorCoalitionDistribution).map(([coal, count]) => (
              <div key={coal} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  coal === 'Kenya Kwanza Alliance' ? 'bg-yellow-100 text-yellow-800' :
                  coal === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-100 text-blue-800' :
                  'bg-stone-100 text-stone-700'
                }`}>{count}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{coal}</p>
                  <div className="h-1.5 bg-stone-100 rounded-full mt-1">
                    <div className={`h-full rounded-full ${coal === 'Kenya Kwanza Alliance' ? 'bg-yellow-400' : coal === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-400' : 'bg-stone-400'}`}
                      style={{ width: `${(count / 47) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs text-stone-400">{Math.round((count / 47) * 100)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Score Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { color: 'bg-green-500', label: '80–100', desc: 'Strong performance', text: 'text-green-700' },
              { color: 'bg-yellow-500', label: '50–79', desc: 'Moderate', text: 'text-yellow-700' },
              { color: 'bg-red-500', label: '< 50', desc: 'Weak performance', text: 'text-red-700' },
              { color: 'bg-stone-300', label: 'N/A', desc: 'Data not available', text: 'text-stone-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-xs">
                <span className={`w-6 h-6 rounded ${item.color}`} />
                <div>
                  <span className={`font-semibold ${item.text}`}>{item.label}</span>
                  <span className="text-stone-500 ml-1.5">{item.desc}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// GOVERNORS TREE VIEW
// ══════════════════════════════════════════════════════════════════
function GovernorsTreeView({ governors, expandedCounties, toggleCounty, allCounties, filters, setFilters, addToComparison, comparisonList }: {
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
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-stone-400" />
          <h3 className="text-sm font-semibold text-stone-700">Find a Governor</h3>
          <span className="ml-auto text-xs text-stone-400">{governors.length} of 47</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative col-span-2 md:col-span-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <Input placeholder="Name or county..." className="h-9 text-xs pl-8 border-stone-200" value={filters.keyword || ''} onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value || undefined }))} />
          </div>
          <Select value={filters.region || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, region: v === '_all' ? undefined : v as typeof REGIONS[number] }))}>
            <SelectTrigger className="h-9 text-xs border-stone-200"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent><SelectItem value="_all">All Regions</SelectItem>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filters.coalition || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, coalition: v === '_all' ? undefined : v as any }))}>
            <SelectTrigger className="h-9 text-xs border-stone-200"><SelectValue placeholder="Coalition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Coalitions</SelectItem>
              <SelectItem value="Kenya Kwanza Alliance">Kenya Kwanza</SelectItem>
              <SelectItem value="Azimio la Umoja One Kenya Coalition">Azimio</SelectItem>
              <SelectItem value="Independent">Independent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.party || '_all'} onValueChange={(v) => setFilters(f => ({ ...f, party: v === '_all' ? undefined : v }))}>
            <SelectTrigger className="h-9 text-xs border-stone-200"><SelectValue placeholder="Party" /></SelectTrigger>
            <SelectContent><SelectItem value="_all">All Parties</SelectItem>{Object.keys(governorPartyDistribution).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Regions */}
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([region, govs]) => (
        <Accordion key={region} type="multiple" defaultValue={[region]}>
          <AccordionItem value={region} className="border border-stone-200 rounded-xl overflow-hidden bg-white">
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
                    <div key={g.code} className="border border-stone-100 rounded-lg overflow-hidden">
                      <button onClick={() => toggleCounty(g.code)} className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-stone-50 transition-colors text-left">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium">{g.name}</span>
                              <Badge className={`text-[10px] px-1.5 py-0 ${g.coalition === 'Kenya Kwanza Alliance' ? 'bg-yellow-100 text-yellow-800' : g.coalition === 'Azimio la Umoja One Kenya Coalition' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-600'}`}>{g.party}</Badge>
                              {county?.executiveAuditOpinion && <Badge className={`text-[10px] px-1.5 py-0 border ${getAuditColor(county.executiveAuditOpinion)}`}>{county.executiveAuditOpinion}</Badge>}
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5">{g.county} · Pop. {g.population.toLocaleString()} · {g.constituenciesCount} const. · {g.wardsCount} wards</p>
                          </div>
                        </div>
                        {isCompared && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                      </button>
                      {isExpanded && county && (
                        <div className="border-t border-stone-100 bg-stone-50/50 px-3.5 py-3">
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
        {county.countyAssembly?.speaker && <MiniRow rep={county.countyAssembly.speaker} onCompare={() => onAddComparison(county.countyAssembly.speaker!, county.name)} />}
      </div>
      <div className="space-y-1.5">
        {county.constituencies.length > 0 ? county.constituencies.map(con => (
          <div key={con.id} className="flex items-center justify-between px-2.5 py-2 bg-white rounded-lg border border-stone-100 text-xs">
            <div><span className="font-medium">{con.name}</span>{con.mp && <span className="text-stone-400 ml-1.5">{con.mp.fullName} ({con.mp.politicalParty})</span>}</div>
            {con.mp && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onAddComparison(con.mp, county.name)}><GitCompare className="h-3 w-3" /></Button>}
          </div>
        )) : <p className="text-xs text-stone-400 px-2.5 py-2 bg-white rounded-lg border border-stone-100 italic">Constituency data requires expansion from IEBC records.</p>}
      </div>
    </div>
  );
}

function MiniRow({ rep, onCompare }: { rep: Representative; onCompare: () => void }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-2 bg-white rounded-lg border border-stone-100 text-xs">
      <div className="min-w-0">
        <span className="font-medium">{rep.fullName}</span>
        <span className="text-stone-400 ml-1.5">{rep.officialTitle}{rep.politicalParty ? ` · ${rep.politicalParty}` : ''}</span>
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={onCompare}><GitCompare className="h-3 w-3" /></Button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COUNTY EXPLORER
// ══════════════════════════════════════════════════════════════════
function CountyExplorer({ countyCode, allCounties, onSelectCounty, addToComparison, comparisonList }: {
  countyCode: string; allCounties: County[]; onSelectCounty: (code: string) => void;
  addToComparison: (rep: Representative, countyName: string) => void; comparisonList: ComparisonItem[];
}) {
  const county = allCounties.find(c => c.code === countyCode) || allCounties[0];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MapPin className="h-4 w-4 text-emerald-600" />
        <Select value={county.code} onValueChange={onSelectCounty}>
          <SelectTrigger className="h-9 text-sm flex-1 max-w-md border-stone-200"><SelectValue /></SelectTrigger>
          <SelectContent>{allCounties.map(c => <SelectItem key={c.code} value={c.code}>{c.code} — {c.name} ({c.region}) {c.dataAvailability === 'full' ? '★' : c.dataAvailability === 'partial' ? '◐' : '○'}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* County Header Card */}
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{county.name} County</CardTitle>
              <p className="text-xs text-stone-500 mt-1">Code: {county.code} · {county.region} · Capital: {county.capital}</p>
            </div>
            <div className="flex gap-1.5">
              {county.executiveAuditOpinion && <Badge className={`text-[10px] border ${getAuditColor(county.executiveAuditOpinion)}`}>Audit: {county.executiveAuditOpinion}</Badge>}
              <Badge variant="outline" className={`text-[10px] ${county.dataAvailability === 'partial' ? 'text-yellow-600 border-yellow-200' : 'text-stone-400'}`}>{county.dataAvailability}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[{ l: 'Population', v: county.population.toLocaleString() }, { l: 'Area (km²)', v: county.areaSqKm.toLocaleString() }, { l: 'Constituencies', v: county.constituenciesCount.toString() }, { l: 'Wards', v: county.wardsCount.toString() }, { l: 'Term', v: '2022–2027' }].map(s => (
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
                <div className="flex items-center gap-2 text-xs"><Scale className="h-4 w-4 text-emerald-600" /><span className="font-semibold">Assembly Audit:</span><Badge className={`border ${getAuditColor(county.countyAssembly.auditOpinion)}`}>{county.countyAssembly.auditOpinion}</Badge></div>
                {county.countyAssembly.auditSource?.url && <a href={county.countyAssembly.auditSource.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Report</a>}
              </CardContent>
            </Card>
          )}

          <Card className="border-stone-200 bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Constituencies & Wards</CardTitle></CardHeader>
            <CardContent>
              {county.constituencies.length > 0 ? (
                <Accordion type="multiple" className="space-y-1.5">
                  {county.constituencies.map(con => (
                    <AccordionItem key={con.id} value={con.id} className="border border-stone-100 rounded-lg px-3">
                      <AccordionTrigger className="py-2 hover:no-underline text-xs">
                        <span className="font-medium">{con.name}</span>{con.mp && <Badge variant="secondary" className="text-[10px] ml-2">{con.mp.fullName} ({con.mp.politicalParty})</Badge>}
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        {con.mp && <div className="mb-2 p-2 bg-emerald-50 rounded-lg text-xs"><span className="font-medium text-emerald-800">{con.mp.fullName}</span> · {con.mp.politicalParty} <Button variant="ghost" size="sm" className="h-5 text-[10px] ml-2" onClick={() => addToComparison(con.mp, county.name)}><GitCompare className="h-3 w-3 mr-0.5" />Compare</Button></div>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">{con.wards.map(w => (
                          <div key={w.id} className="p-1.5 bg-stone-50 rounded text-[11px]"><p className="font-medium">{w.name}</p>{w.mca ? <p className="text-stone-400">MCA: {w.mca.fullName}</p> : <p className="text-stone-400 italic">MCA: pending verification</p>}</div>
                        ))}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : <div className="p-3 text-xs text-stone-500 bg-orange-50 rounded-lg border border-orange-100 flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> Constituency data not loaded — pull from IEBC and county assembly records.</div>}
            </CardContent>
          </Card>

          {county.countyExecutive && county.countyExecutive.length > 0 && (
            <Card className="border-stone-200 bg-white">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">County Executive Committee</CardTitle><CardDescription className="text-xs">Appointed by the Governor — Article 179</CardDescription></CardHeader>
              <CardContent><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{county.countyExecutive.map(cecm => (
                <div key={cecm.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-100"><p className="text-xs font-semibold text-emerald-800">{cecm.portfolio}</p><p className="text-[11px] text-stone-500 mt-0.5">{cecm.fullName.includes('not publicly') ? <span className="italic text-amber-600"><AlertTriangle className="h-3 w-3 inline mr-0.5" />Name pending verification</span> : cem.fullName}</p></div>
              ))}</div></CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-amber-800 text-sm">Placeholder — Data Not Yet Loaded</h3>
            <p className="text-xs text-amber-700 mt-2 max-w-md mx-auto">Pull from IEBC, OAG, CoB, county portal, and county assembly to expand.</p>
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
function OfficialFullCard({ rep, countyName, onCompare }: { rep: Representative; countyName: string; onCompare: (rep: Representative, countyName: string) => void }) {
  const metricLabels: Record<keyof ScorecardMetrics, string> = {
    overallAccountabilityScore: 'Accountability', transparencyAssetDeclaration: 'Transparency', projectDeliveryAbsorptionRate: 'Project Delivery',
    manifestoPromiseFulfillment: 'Manifesto', legislativeOversightPerformance: 'Oversight', ethicsIntegrity: 'Ethics', publicSentimentCitizenAwareness: 'Sentiment',
  };
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-emerald-600" /> {rep.fullName}</CardTitle>
            <p className="text-xs text-stone-500">{rep.officialTitle} · {rep.politicalParty} {rep.coalition ? `(${rep.coalition})` : ''} · {rep.jurisdiction}</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => onCompare(rep, countyName)}><GitCompare className="h-3 w-3" /> Compare</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rep.biography && <p className="text-xs leading-relaxed text-stone-600">{rep.biography}</p>}
        {rep.contacts && Object.values(rep.contacts).some(Boolean) && (
          <div className="flex flex-wrap gap-3 text-[11px]">
            {rep.contacts.email && <span className="flex items-center gap-1 text-stone-500"><Mail className="h-3 w-3" /> {rep.contacts.email}</span>}
            {rep.contacts.xHandle && <span className="flex items-center gap-1 text-stone-500"><Globe className="h-3 w-3" /> @{rep.contacts.xHandle}</span>}
            {rep.contacts.website && <a href={rep.contacts.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline"><ExternalLink className="h-3 w-3" /> Website</a>}
          </div>
        )}
        {rep.scorecard && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Scorecard (0–100)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
              {(Object.entries(metricLabels) as [keyof ScorecardMetrics, string][]).map(([key, label]) => {
                const value = rep.scorecard!.metrics[key];
                const source = rep.scorecard!.sources[key];
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild><div className={`p-2 rounded-lg border text-center ${getScoreColor(value)}`}><p className="text-[10px] opacity-75">{label}</p><p className="text-lg font-bold mt-0.5">{getScoreLabel(value)}</p></div></TooltipTrigger>
                    <TooltipContent className="max-w-xs"><p className="text-[11px]">{label}: {getScoreLabel(value)}/100</p>{source && <p className="text-[10px] text-stone-400 mt-1">{source.source} — {source.reportTitle}<br />FY: {source.financialYear}{source.url && <> · <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-emerald-500 underline">Source</a></>}</p>}{!source && <p className="text-[10px] text-stone-400 mt-1">No specific source cited.</p>}</TooltipContent>
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

// ══════════════════════════════════════════════════════════════════
// SOURCES HUB — NEW TAB
// ══════════════════════════════════════════════════════════════════
function SourcesHub() {
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

// ══════════════════════════════════════════════════════════════════
// COMPARISON VIEW
// ══════════════════════════════════════════════════════════════════
function ComparisonView({ comparisonList, removeFromComparison, addToComparison, allCounties }: {
  comparisonList: ComparisonItem[]; removeFromComparison: (id: string) => void;
  addToComparison: (rep: Representative, countyName: string) => void; allCounties: County[];
}) {
  const metricLabels: Record<keyof ScorecardMetrics, string> = {
    overallAccountabilityScore: 'Accountability', transparencyAssetDeclaration: 'Transparency', projectDeliveryAbsorptionRate: 'Delivery',
    manifestoPromiseFulfillment: 'Manifesto', legislativeOversightPerformance: 'Oversight', ethicsIntegrity: 'Ethics', publicSentimentCitizenAwareness: 'Sentiment',
  };
  return (
    <div className="space-y-5">
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><GitCompare className="h-4 w-4 text-emerald-600" /> Side-by-Side Comparison (max 4)</CardTitle><CardDescription className="text-xs">Add officials from the Tree or County Explorer tabs.</CardDescription></CardHeader>
        <CardContent>
          {comparisonList.length > 0 ? (
            <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-stone-200"><th className="text-left py-2 px-2 font-semibold sticky left-0 bg-white min-w-[150px]">Metric</th>{comparisonList.map(item => <th key={item.representative.id} className="text-left py-2 px-2 min-w-[180px]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold">{item.representative.fullName}</p><p className="text-[10px] text-stone-400 font-normal">{item.representative.officialTitle} · {item.countyName}</p></div><Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeFromComparison(item.representative.id)}><XCircle className="h-3.5 w-3.5 text-red-400" /></Button></div></th>)}</tr></thead>
            <tbody>
              <tr className="border-b border-stone-100 bg-stone-50"><td className="py-1.5 px-2 font-medium">Party</td>{comparisonList.map(item => <td key={item.representative.id} className="py-1.5 px-2"><Badge variant="secondary" className="text-[10px]">{item.representative.politicalParty}</Badge></td>)}</tr>
              {(Object.entries(metricLabels) as [keyof ScorecardMetrics, string][]).map(([key, label]) => (
                <tr key={key} className="border-b border-stone-100 hover:bg-stone-50"><td className="py-1.5 px-2">{label}</td>{comparisonList.map(item => { const val = item.representative.scorecard?.metrics[key]; return <td key={item.representative.id} className="py-1.5 px-2"><span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-bold ${getScoreColor(val)}`}>{getScoreLabel(val)}</span></td>; })}</tr>
              ))}
            </tbody></table></div>
          ) : (
            <div className="text-center py-12"><GitCompare className="h-10 w-10 text-stone-300 mx-auto mb-2" /><p className="text-xs text-stone-400">Select officials from the Tree or County Explorer to compare.</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// JSON SCHEMA VIEW
// ══════════════════════════════════════════════════════════════════
function JsonSchemaView() {
  const jsonSchema = { "$schema": "https://json-schema.org/draft/2020-12/schema", title: "Kenya County Governance Data Schema", version: "1.0.0", lastUpdated: "2026-07-25", sourceCount: allSources.length, types: { SourceCitation: { type: "object", properties: { source: { type: "string" }, reportTitle: { type: "string" }, financialYear: { type: "string", pattern: "^FY \\d{4}/\\d{2}$" }, url: { type: "string", format: "uri" }, section: { type: "string" }, accessedDate: { type: "string", format: "date" } }, required: ["source", "reportTitle", "financialYear", "accessedDate"] }, ScorecardMetrics: { type: "object", properties: { overallAccountabilityScore: { type: ["number", "null"], min: 0, max: 100 }, transparencyAssetDeclaration: { type: ["number", "null"], min: 0, max: 100 }, projectDeliveryAbsorptionRate: { type: ["number", "null"], min: 0, max: 100 }, manifestoPromiseFulfillment: { type: ["number", "null"], min: 0, max: 100 }, legislativeOversightPerformance: { type: ["number", "null"], min: 0, max: 100 }, ethicsIntegrity: { type: ["number", "null"], min: 0, max: 100 }, publicSentimentCitizenAwareness: { type: ["number", "null"], min: 0, max: 100 } } }, Representative: { type: "object", properties: { id: { type: "string" }, fullName: { type: "string" }, officialTitle: { type: "string" }, politicalParty: { type: "string" }, coalition: { type: "string" }, termStart: { type: "string" }, termEnd: { type: "string" }, jurisdiction: { type: "string" }, level: { type: "string", enum: ["national", "county", "constituency", "ward"] }, biography: { type: "string" }, scorecard: { "$ref": "#/types/ScorecardMetrics" } }, required: ["id", "fullName", "officialTitle", "politicalParty", "termStart", "termEnd", "jurisdiction", "level"] } }, liveFeedEndpoints: { oag: "https://oagkenya.go.ke/", cob: "https://cob.go.ke/", tikenya: "https://tikenya.org/", eacc: "https://eacc.go.ke/", iebc: "https://www.iebc.or.ke/", ppra: "https://ppra.go.ke/", nlc: "https://nlc.go.ke/", wasreb: "https://wasreb.go.ke/", knbs: "https://www.knbs.or.ke/" } };

  return (
    <div className="space-y-5">
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-emerald-600" /> Reusable JSON Schema</CardTitle><CardDescription className="text-xs">Downloadable schema with source citation fields and live feed endpoints for {allSources.length} data sources.</CardDescription></CardHeader>
        <CardContent>
          <div className="bg-stone-900 rounded-lg p-4 overflow-auto max-h-[500px]"><pre className="text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap break-words">{JSON.stringify(jsonSchema, null, 2)}</pre></div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonSchema, null, 2))}>Copy JSON</Button>
            <Button variant="outline" size="sm" className="text-xs" asChild><a href="data:application/json;charset=utf-8," download="kenya-governance-schema.json" onClick={(e) => { (e.currentTarget as HTMLAnchorElement).href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonSchema, null, 2))}`; }}>Download</a></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Expanding Any County — Step-by-Step</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs">
          {[{ title: '1. Pull Election Data', desc: 'IEBC official results for Governor, Deputy, Senator, Woman Rep, MPs, MCAs. Verify against official gazette.', url: 'https://www.iebc.or.ke/' },
            { title: '2. Pull Audit Data', desc: 'Download county-specific audit reports from OAG. Extract audit opinion for Executive and Assembly.', url: 'https://oagkenya.go.ke/reports/county-government-audit-reports/' },
            { title: '3. Pull Budget Data', desc: 'Download CBIRR from CoB. Extract development absorption rate, recurrent absorption, pending bills.', url: 'https://cob.go.ke/county-budget-implementation-review-reports/' },
            { title: '4. Pull Procurement Data', desc: 'Search PPIP for county tender awards, contract values, and supplier patterns.', url: 'https://ppip.go.ke/' },
            { title: '5. Pull Governance Indices', desc: 'Check TI-Kenya CGSR, PesaCheck fact-checks, and EACC public reports.', url: 'https://tikenya.org/' },
            { title: '6. Check Natural Resources', desc: 'NLC for land, WASREB for water, KFS for forests, Mining for minerals.', url: 'https://nlc.go.ke/' },
            { title: '7. Verify Contacts', desc: 'Only include publicly available contacts from official county websites.', url: 'https://opendata.go.ke/' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
              <span className="font-bold text-emerald-700 shrink-0">{step.title}</span>
              <p className="text-stone-600">{step.desc} <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline ml-1">→</a></p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
