'use client';

import React, { useState, useMemo } from 'react';
import {
  all47Governors, getPlaceholderCounties,
} from '@/data/governors';
import { kajiadoCounty } from '@/data/kajiado-county';
import { getCountyAuditRecords } from '@/data/county-audit-data';
import { getCountyBudget } from '@/data/county-budget-data';
import { allSources } from '@/data/sources';
import {
  County, Representative, FilterState, ComparisonItem,
} from '@/data/types';
import type { TabId } from '@/components/tab-types';
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
import GovernorReportCardPage from '@/components/governor-report-card-page';
import AuditTrendsPage from '@/components/audit-trends-page';
import BudgetScatterPage from '@/components/budget-scatter-page';
import CoalitionComparisonPage from '@/components/coalition-comparison-page';
import DevolutionQuizPage from '@/components/devolution-quiz-page';
import ServiceDeliveryPage from '@/components/service-delivery-page';
import CitizenStoriesPage from '@/components/citizen-stories-page';
import CBEFMeetingPage from '@/components/cbef-meeting-page';
import ProcurementRedFlagsPage from '@/components/procurement-redflags-page';
import EmbedWidgetPage from '@/components/embed-widget-page';
import MzalendoPage from '@/components/mzalendo-page';
import RepresentativeProfilesPage from '@/components/representative-profiles-page';

import CountyLeadershipTreePage from '@/components/county-leadership-tree';
import ProjectsBrowserPage from '@/components/projects-browser-page';
import SecureWhistleblowerModal from '@/components/secure-whistleblower-modal';
import { DataFreshnessIndicator } from '@/components/data-freshness';
import CommandPalette from '@/components/command-palette';
import CountyRankingsPage from '@/components/county-rankings-page';
import DevolutionMilestonesPage from '@/components/devolution-milestones-page';
import FYComparisonPage from '@/components/fy-comparison-page';
import { KenyaMiniMap } from '@/components/kenya-county-map';
import CountyComparisonEnhanced from '@/components/county-comparison-enhanced';
import { WeatherWidget, CitizenAuditorDashboard, AIInsightsWidget, ProjectVelocityChart, RiskForecastWidget, SidebarMiniMap } from '@/components/sidebar-widgets';
import { useTheme } from 'next-themes';

// Extracted components
import NationalSummaryDashboard from '@/components/national-summary-dashboard';
import GovernorsTreeView from '@/components/governors-tree-view';
import { CountyExplorer } from '@/components/county-explorer';
import SourcesHub from '@/components/sources-hub';
import ComparisonView from '@/components/comparison-view';
import JsonSchemaView from '@/components/json-schema-view';

// ─── ICONS ────────────────────────────────────────────────────────
import {
  Shield, Search, Filter,
  Users, MapPin, Building2, Scale, FileText,
  BarChart3, GitCompare, TreePine, Database,
  ExternalLink, AlertTriangle, CheckCircle2,
  XCircle, Globe, Phone, Mail,
  Landmark, User, GripVertical, Star,
  Library, ChevronDown, ChevronRight, Leaf, Gavel,
  Radio, Megaphone, BookOpen, Hand, Layers,
  ArrowRight, TrendingUp, TrendingDown, Minus,
  Eye, BookMarked, Menu, X, Volume2,
  Map, MailWarning, MessageSquare, Bell,
  Thermometer, FileOutput, ClipboardList,
  Receipt, Hash, Send, Timer,
  FolderSearch, ShoppingCart, AlertCircle,
  PieChart, Clock, FileCheck, Target, Sun, Moon,
  Keyboard, GraduationCap,
  AlertOctagon, Calendar, Code2, Zap,
  Network, FolderOpen, Vote, ShieldCheck, Lock,
  Trophy, Flag,
} from 'lucide-react';

// ─── shadcn/ui ───────────────────────────────────────────────────
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ─── SIDEBAR NAV ITEMS ───────────────────────────────────────────
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
  { id: 'reportcard', label: 'Report Card', icon: Star, section: 'Citizen Action' },
  { id: 'quiz', label: 'Devolution Quiz', icon: GraduationCap, section: 'Citizen Action' },
  { id: 'stories', label: 'Experience Stories', icon: MessageSquare, section: 'Citizen Action' },
  { id: 'cbef', label: 'CBEF Meetings', icon: Calendar, section: 'Citizen Action' },
  // ── Data & Alerts ──
  { id: 'datafetcher', label: 'Live Data', icon: FolderSearch, section: 'Data & Alerts' },
  { id: 'alerts', label: 'Alerts', icon: Bell, section: 'Data & Alerts' },
  // ── Analytics ──
  { id: 'audittrends', label: 'Audit Trends', icon: Zap, section: 'Analytics' },
  { id: 'budgetscatter', label: 'Budget Scatter', icon: PieChart, section: 'Analytics' },
  { id: 'coalition', label: 'Coalition Compare', icon: GitCompare, section: 'Analytics' },
  { id: 'servicedelivery', label: 'Service Delivery', icon: Building2, section: 'Analytics' },
  { id: 'redflags', label: 'Red Flags', icon: AlertOctagon, section: 'Analytics' },
  { id: 'embed', label: 'Embed Widgets', icon: Code2, section: 'Analytics' },
  // ── Leadership & Projects ──
  { id: 'leadership', label: 'Leadership Tree', icon: Network, section: 'Leadership & Projects' },
  { id: 'projects', label: 'Projects & Audits', icon: FolderOpen, section: 'Leadership & Projects' },
  { id: 'representatives', label: 'Representative Profiles', icon: Users, section: 'Leadership & Projects' },
  { id: 'mzalendo', label: 'Mzalendo Profiles', icon: Vote, section: 'Leadership & Projects' },
  { id: 'securetip', label: 'Secure Whistleblower', icon: ShieldCheck, section: 'Leadership & Projects' },
  { id: 'compareEnhanced', label: 'Comparison Matrix', icon: GitCompare, section: 'Analytics' },
  // ── Insights ──
  { id: 'rankings', label: 'County Rankings', icon: Trophy, section: 'Insights' },
  { id: 'milestones', label: 'Devolution Timeline', icon: Flag, section: 'Insights' },
  { id: 'fycomparison', label: 'FY Comparison', icon: BarChart3, section: 'Insights' },
];

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
  const commandPaletteRef = React.useRef<{ open: () => void; close: () => void }>(null);

  const allCounties = useMemo((): County[] => {
    const placeholders = getPlaceholderCounties();
    return placeholders.map((c) => {
      if (c.code === '034') return kajiadoCounty;
      // Inject real audit opinion from county-audit-data
      const auditRecords = getCountyAuditRecords(c.code);
      const latestAudit = auditRecords.find(a => a.financialYear === 'FY 2024/25');
      const latestBudget = getCountyBudget(c.code, 'FY 2024/25');
      return {
        ...c,
        executiveAuditOpinion: latestAudit?.executiveOpinion || undefined,
        executiveAuditSource: latestAudit?.source,
        developmentAbsorptionRate: latestBudget?.devAbsorptionRate || undefined,
        developmentAbsorptionSource: latestBudget ? {
          source: latestBudget.source.source,
          reportTitle: latestBudget.source.reportTitle,
          financialYear: latestBudget.source.financialYear,
          url: latestBudget.source.url,
          accessedDate: latestBudget.source.accessedDate,
        } : undefined,
        dataAvailability: 'partial' as const,
        dataAvailabilityNote: `Audit opinion: ${latestAudit?.executiveOpinion || 'pending'} (FY 2024/25). Budget absorption: ${latestBudget?.devAbsorptionRate ?? 'pending'}%. Full official data from oagkenya.go.ke and cob.go.ke.`,
      };
    });
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
  const analyticsItems = navItems.filter(n => n.section === 'Analytics');
  const leadershipItems = navItems.filter(n => n.section === 'Leadership & Projects');
  const insightItems = navItems.filter(n => n.section === 'Insights');

  const { theme, setTheme } = useTheme();

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSidebarOpen(false); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); commandPaletteRef.current?.open(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); setTheme(theme === 'dark' ? 'light' : 'dark'); return; }
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        alert('Keyboard Shortcuts:\nCtrl+K: Search\nCtrl+D: Toggle Dark Mode\nEsc: Close panels\n?: This help');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [theme, setTheme]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
        {/* ══════════ HEADER ══════════ */}
        <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50">
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
                  <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                    Kenya Governance Explorer
                  </h1>
                  <p className="text-[10px] sm:text-xs text-stone-500">
                    2022–2027 · 47 Counties · Evidence-Based
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {comparisonList.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {comparisonList.length}/4 compare
                  </Badge>
                )}
                <button
                  onClick={() => commandPaletteRef.current?.open()}
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  title="Search (Ctrl+K)"
                >
                  <Keyboard className="h-3.5 w-3.5 text-stone-600" />
                </button>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  title="Toggle Dark Mode (Ctrl+D)"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-stone-600" /> : <Moon className="h-3.5 w-3.5 text-stone-600" />}
                </button>
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

              {/* Analytics Section */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Analytics</p>
                {analyticsItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
                      activeTab === item.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-stone-100" />

              {/* Leadership & Projects Section */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Leadership & Projects</p>
                {leadershipItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
                      activeTab === item.id
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-stone-100" />

              {/* Insights Section */}
              <div>
                <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Insights</p>
                {insightItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
                      activeTab === item.id
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-stone-100" />
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
                {/* Data Freshness */}
                <div className="mt-3 pt-2 border-t border-stone-100">
                  <DataFreshnessIndicator compact />
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="px-3 py-2 space-y-3">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Live Widgets</p>
                <SidebarMiniMap onCountyClick={(code) => { setSelectedCounty(code); setActiveTab('county'); }} />
                <WeatherWidget lat={-1.2921} lng={36.8219} location="Nairobi" />
                <CitizenAuditorDashboard />
                <AIInsightsWidget />
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
                  <Separator />
                  <div>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Analytics</p>
                    {analyticsItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                          activeTab === item.id
                            ? 'bg-indigo-600 text-white'
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
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Leadership & Projects</p>
                    {leadershipItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                          activeTab === item.id
                            ? 'bg-rose-600 text-white'
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
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Insights</p>
                    {insightItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                          activeTab === item.id
                            ? 'bg-teal-600 text-white'
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
          <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 w-full">
            {activeTab === 'summary' && <NationalSummaryDashboard onNavigate={setActiveTab} />}
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
            {activeTab === 'countymap' && (
              <CountyMapPage
                onCountyDeepDive={(code) => {
                  setSelectedCounty(code);
                  setActiveTab('county');
                }}
              />
            )}
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
            {activeTab === 'reportcard' && <GovernorReportCardPage />}
            {activeTab === 'audittrends' && <AuditTrendsPage />}
            {activeTab === 'budgetscatter' && <BudgetScatterPage />}
            {activeTab === 'coalition' && <CoalitionComparisonPage />}
            {activeTab === 'quiz' && <DevolutionQuizPage />}
            {activeTab === 'servicedelivery' && <ServiceDeliveryPage />}
            {activeTab === 'stories' && <CitizenStoriesPage />}
            {activeTab === 'cbef' && <CBEFMeetingPage />}
            {activeTab === 'redflags' && <ProcurementRedFlagsPage />}
            {activeTab === 'embed' && <EmbedWidgetPage />}
            {activeTab === 'leadership' && <CountyLeadershipTreePage />}
            {activeTab === 'projects' && (
            <div className="space-y-4">
              <ProjectsBrowserPage />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProjectVelocityChart projectRef="PRJ-034-001" />
                <RiskForecastWidget projectId="PRJ-034-001" />
              </div>
            </div>
            )}
            {activeTab === 'mzalendo' && <MzalendoPage />}
            {activeTab === 'securetip' && <SecureWhistleblowerModal />}
            {activeTab === 'compareEnhanced' && <CountyComparisonEnhanced />}
            {activeTab === 'rankings' && <CountyRankingsPage />}
            {activeTab === 'milestones' && <DevolutionMilestonesPage />}
            {activeTab === 'fycomparison' && <FYComparisonPage />}
            {activeTab === 'representatives' && <RepresentativeProfilesPage />}
          </main>

          {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 z-50 px-2 py-1.5">
            <div className="flex items-center justify-around">
              {[
                { id: 'summary' as TabId, icon: BarChart3, label: 'Home' },
                { id: 'countymap' as TabId, icon: Map, label: 'Map' },
                { id: 'tree' as TabId, icon: TreePine, label: 'Counties' },
                { id: 'representatives' as TabId, icon: Users, label: 'Reps' },
                { id: 'alerts' as TabId, icon: Bell, label: 'Alerts' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-[9px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
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
              <p>Last updated: 2026-07-28 · {allSources.length} data sources indexed · 47 counties with OAG audit data</p>
            </div>
          </div>
        </footer>
      </div>
      <CommandPalette ref={commandPaletteRef} onNavigate={(tabId) => setActiveTab(tabId as TabId)} />
    </TooltipProvider>
  );
}
