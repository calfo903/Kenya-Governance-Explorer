'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { I18nProvider } from '@/i18n/i18n-provider';
import { LanguageToggle } from '@/components/language-toggle';
import { useLocaleStore } from '@/i18n/locale-store';
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
import ConstitutionPage from '@/components/constitution-page';
import PoliticalXPostsPage from '@/components/political-x-posts-page';
import CountyMapPage from '@/components/county-map-page';
import RtiGeneratorPage from '@/components/rti-generator-page';
import PetitionBuilderPage from '@/components/petition-builder-page';
import CorruptionHeatmapPage from '@/components/corruption-heatmap-page';
import ManifestoTrackerPage from '@/components/manifesto-tracker-page';
import CitizenFeedbackPage from '@/components/citizen-feedback-page';
import TimelinePage from '@/components/timeline-page';
import BudgetSimulatorPage from '@/components/budget-simulator-page';
import DataFetcherPage from '@/components/data-fetcher-page';
import AlertsSubscriptionPage from '@/components/alerts-subscription-page';
import GovernorReportCardPage from '@/components/governor-report-card-page';
import DevolutionQuizPage from '@/components/devolution-quiz-page';
import CitizenStoriesPage from '@/components/citizen-stories-page';
import CitizenReportDashboard from '@/components/citizen-report-dashboard';
import CBEFMeetingPage from '@/components/cbef-meeting-page';
import EmbedWidgetPage from '@/components/embed-widget-page';
import MzalendoPage from '@/components/mzalendo-page';
import BudgetAllocationPage from '@/components/budget-allocation-page';
import RepresentativeProfilesPage from '@/components/representative-profiles-page';

import CountyLeadershipTreePage from '@/components/county-leadership-tree';
import ProjectsBrowserPage from '@/components/projects-browser-page';
import { DataFreshnessIndicator } from '@/components/data-freshness';
import CommandPalette from '@/components/command-palette';
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
import AssemblyHansardPage from '@/components/assembly-hansard-page';

// Hub components (merged pages)
import AIHubPage from '@/components/ai-hub-page';
import FiscalAnalysisHub from '@/components/fiscal-analysis-hub';
import ProcurementHub from '@/components/procurement-hub';
import PerformanceHub from '@/components/performance-hub';
import InsightsHub from '@/components/insights-hub';
import IntegrityHub from '@/components/integrity-hub';

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
  Trophy, Flag, FileBarChart, Award,
  Bot, Brain, Sparkles, Newspaper, Wallet,
} from 'lucide-react';

// ─── shadcn/ui ───────────────────────────────────────────────────
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import DownloadLink from '@/components/download-link';
// ─── SIDEBAR NAV ITEMS (keys for i18n) ───────────────────────
interface NavItem {
  id: TabId;
  labelKey: string;
  icon: React.ElementType;
  sectionKey: string;
}

const navItemDefs: NavItem[] = [
  // ── Governance ──
  { id: 'summary', labelKey: 'nav.items.summary', icon: BarChart3, sectionKey: 'nav.sections.governance' },
  { id: 'tree', labelKey: 'nav.items.tree', icon: TreePine, sectionKey: 'nav.sections.governance' },
  { id: 'countymap', labelKey: 'nav.items.countymap', icon: Map, sectionKey: 'nav.sections.governance' },
  { id: 'county', labelKey: 'nav.items.county', icon: MapPin, sectionKey: 'nav.sections.governance' },
  { id: 'compare', labelKey: 'nav.items.compare', icon: GitCompare, sectionKey: 'nav.sections.governance' },
  { id: 'heatmap', labelKey: 'nav.items.heatmap', icon: Thermometer, sectionKey: 'nav.sections.governance' },
  { id: 'sources', labelKey: 'nav.items.sources', icon: Library, sectionKey: 'nav.sections.governance' },
  { id: 'schema', labelKey: 'nav.items.schema', icon: Database, sectionKey: 'nav.sections.governance' },
  { id: 'timeline', labelKey: 'nav.items.timeline', icon: Clock, sectionKey: 'nav.sections.governance' },
  { id: 'budgetsim', labelKey: 'nav.items.budgetsim', icon: PieChart, sectionKey: 'nav.sections.governance' },
  { id: 'manifesto', labelKey: 'nav.items.manifesto', icon: Target, sectionKey: 'nav.sections.governance' },
  // ── Civic Tools ──
  { id: 'constitution', labelKey: 'nav.items.constitution', icon: BookMarked, sectionKey: 'nav.sections.civicTools' },
  { id: 'xposts', labelKey: 'nav.items.xposts', icon: Volume2, sectionKey: 'nav.sections.civicTools' },
  { id: 'integrityHub', labelKey: 'nav.items.integrityHub', icon: Eye, sectionKey: 'nav.sections.civicTools' },
  // ── Citizen Action ──
  { id: 'rti', labelKey: 'nav.items.rti', icon: FileCheck, sectionKey: 'nav.sections.citizenAction' },
  { id: 'petition', labelKey: 'nav.items.petition', icon: ClipboardList, sectionKey: 'nav.sections.citizenAction' },
  { id: 'feedback', labelKey: 'nav.items.feedback', icon: MessageSquare, sectionKey: 'nav.sections.citizenAction' },
  { id: 'reportcard', labelKey: 'nav.items.reportcard', icon: Star, sectionKey: 'nav.sections.citizenAction' },
  { id: 'quiz', labelKey: 'nav.items.quiz', icon: GraduationCap, sectionKey: 'nav.sections.citizenAction' },
  { id: 'stories', labelKey: 'nav.items.stories', icon: MessageSquare, sectionKey: 'nav.sections.citizenAction' },
  { id: 'reports', labelKey: 'nav.items.reports', icon: FileBarChart, sectionKey: 'nav.sections.citizenAction' },
  { id: 'cbef', labelKey: 'nav.items.cbef', icon: Calendar, sectionKey: 'nav.sections.citizenAction' },
  // ── Data & Alerts ──
  { id: 'datafetcher', labelKey: 'nav.items.datafetcher', icon: FolderSearch, sectionKey: 'nav.sections.dataAlerts' },
  { id: 'alerts', labelKey: 'nav.items.alerts', icon: Bell, sectionKey: 'nav.sections.dataAlerts' },
  // ── Analytics ──
  { id: 'fiscalHub', labelKey: 'nav.items.fiscalHub', icon: Zap, sectionKey: 'nav.sections.analytics' },
  { id: 'procurementHub', labelKey: 'nav.items.procurementHub', icon: ShoppingCart, sectionKey: 'nav.sections.analytics' },
  { id: 'performanceHub', labelKey: 'nav.items.performanceHub', icon: Building2, sectionKey: 'nav.sections.analytics' },
  { id: 'embed', labelKey: 'nav.items.embed', icon: Code2, sectionKey: 'nav.sections.analytics' },
  // ── Leadership & Projects ──
  { id: 'leadership', labelKey: 'nav.items.leadership', icon: Network, sectionKey: 'nav.sections.leadershipProjects' },
  { id: 'projects', labelKey: 'nav.items.projects', icon: FolderOpen, sectionKey: 'nav.sections.leadershipProjects' },
  { id: 'representatives', labelKey: 'nav.items.representatives', icon: Wallet, sectionKey: 'nav.sections.leadershipProjects' },
  { id: 'mzalendo', labelKey: 'nav.items.mzalendo', icon: Vote, sectionKey: 'nav.sections.leadershipProjects' },
  { id: 'hansard', labelKey: 'nav.items.hansard', icon: BookOpen, sectionKey: 'nav.sections.leadershipProjects' },
  { id: 'compareEnhanced', labelKey: 'nav.items.compareEnhanced', icon: GitCompare, sectionKey: 'nav.sections.leadershipProjects' },
  // ── Insights ──
  { id: 'insightsHub', labelKey: 'nav.items.insightsHub', icon: Trophy, sectionKey: 'nav.sections.insights' },
  // ── AI Tools ──
  { id: 'aiHub', labelKey: 'nav.items.aiHub', icon: Bot, sectionKey: 'nav.sections.aiTools' },
];

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function KenyaGovernancePage() {
  return (
    <I18nProvider>
      <PageContent />
    </I18nProvider>
  );
}

function PageContent() {
  const t = useTranslations();
  const locale = useLocaleStore((s) => s.locale);
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [selectedCounty, setSelectedCounty] = useState<string>('034');
  const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
  const [comparisonList, setComparisonList] = useState<ComparisonItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const commandPaletteRef = React.useRef<{ open: () => void; close: () => void }>(null);

  // Localized nav items
  const navItems = useMemo(() => navItemDefs.map(def => ({
    ...def,
    label: t(def.labelKey),
  })), [t]);

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
  const governanceItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.governance');
  const civicItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.civicTools');
  const citizenItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.citizenAction');
  const dataItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.dataAlerts');
  const analyticsItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.analytics');
  const leadershipItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.leadershipProjects');
  const insightItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.insights');
  const aiItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.aiTools');

  // Section labels lookup
  const sectionLabels = useMemo(() => ({
    'nav.sections.governance': t('nav.sections.governance'),
    'nav.sections.civicTools': t('nav.sections.civicTools'),
    'nav.sections.citizenAction': t('nav.sections.citizenAction'),
    'nav.sections.dataAlerts': t('nav.sections.dataAlerts'),
    'nav.sections.analytics': t('nav.sections.analytics'),
    'nav.sections.leadershipProjects': t('nav.sections.leadershipProjects'),
    'nav.sections.insights': t('nav.sections.insights'),
    'nav.sections.aiTools': t('nav.sections.aiTools'),
  }), [t]);

  // Helper to get localized label for a nav item
  const getItemLabel = (id: TabId) => navItems.find(n => n.id === id)?.label ?? id;

  // Helper to get localized section label
  const getSectionLabel = (sectionKey: string) => sectionLabels[sectionKey] ?? sectionKey;

  // Sidebar section renderer helper
  const renderSidebarSection = (items: NavItem[], sectionKey: string, activeColor: string) => (
    <div>
      <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{getSectionLabel(sectionKey)}</p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          aria-current={activeTab === item.id ? 'page' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors mb-0.5 ${
            activeTab === item.id
              ? `${activeColor} text-white shadow-sm`
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{getItemLabel(item.id)}</span>
        </button>
      ))}
    </div>
  );

  // Mobile sidebar section renderer helper
  const renderMobileSidebarSection = (items: NavItem[], sectionKey: string, activeColor: string) => (
    <div>
      <p className="px-3 py-1.5 text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{getSectionLabel(sectionKey)}</p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
          aria-current={activeTab === item.id ? 'page' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
            activeTab === item.id
              ? `${activeColor} text-white`
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          <span>{getItemLabel(item.id)}</span>
        </button>
      ))}
    </div>
  );

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
        {/* ══════════ SKIP NAVIGATION ══════════ */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* ══════════ HEADER ══════════ */}
        <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Open navigation menu"
                  className="lg:hidden h-9 w-9 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-800 transition-colors"
                >
                  <Menu className="h-4 w-4 text-stone-600 dark:text-stone-300" aria-hidden="true" />
                </button>
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                    {t('app.title')}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-stone-500">
                    {t('app.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {comparisonList.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {t('app.headerCompare', { count: comparisonList.length })}
                  </Badge>
                )}
                <button
                  onClick={() => commandPaletteRef.current?.open()}
                  aria-label={t('app.searchShortcut')}
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-800 transition-colors"
                >
                  <Keyboard className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label={t('app.darkModeShortcut')}
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" aria-hidden="true" />}
                </button>
                <LanguageToggle />
                <DownloadLink href="https://kenyalaw.org/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 text-[10px] text-stone-500 hover:text-emerald-600 transition-colors">
                  <BookMarked className="h-3 w-3" aria-hidden="true" />{t('common.constitution')}
                </DownloadLink>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════ LAYOUT: SIDEBAR + MAIN ══════════ */}
        <div className="flex flex-1">
          {/* Sidebar - Desktop (always visible on lg+) */}
          <aside className="hidden lg:flex flex-col w-60 border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
            <nav aria-label="Main navigation" className="flex-1 py-3 px-2 space-y-4">
              {renderSidebarSection(governanceItems, 'nav.sections.governance', 'bg-emerald-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />

              {renderSidebarSection(civicItems, 'nav.sections.civicTools', 'bg-blue-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />

              {renderSidebarSection(citizenItems, 'nav.sections.citizenAction', 'bg-amber-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />

              {renderSidebarSection(dataItems, 'nav.sections.dataAlerts', 'bg-purple-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />

              {renderSidebarSection(analyticsItems, 'nav.sections.analytics', 'bg-indigo-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />

              {renderSidebarSection(leadershipItems, 'nav.sections.leadershipProjects', 'bg-rose-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />

              {renderSidebarSection(insightItems, 'nav.sections.insights', 'bg-teal-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />

              {renderSidebarSection(aiItems, 'nav.sections.aiTools', 'bg-emerald-600')}

              <Separator className="bg-stone-100 dark:bg-stone-700" />
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">{t('sidebar.quickStats')}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 dark:text-stone-400">{t('sidebar.counties')}</span>
                    <span className="font-bold text-stone-700 dark:text-stone-200">47</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 dark:text-stone-400">{t('sidebar.dataSources')}</span>
                    <span className="font-bold text-stone-700 dark:text-stone-200">{allSources.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 dark:text-stone-400">{t('sidebar.term')}</span>
                    <span className="font-bold text-stone-700 dark:text-stone-200">2022–2027</span>
                  </div>
                </div>
                {/* Data Freshness */}
                <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <DataFreshnessIndicator compact />
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="px-3 py-2 space-y-3">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('sidebar.liveWidgets')}</p>
                <SidebarMiniMap onCountyClick={(code) => { setSelectedCounty(code); setActiveTab('county'); }} />
                <WeatherWidget lat={-1.2921} lng={36.8219} location="Nairobi" />
                <CitizenAuditorDashboard />
                <AIInsightsWidget />
              </div>

              {/* Primary Sources Links */}
              <div className="px-3 py-2 mt-auto">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">{t('sidebar.primarySources')}</p>
                <div className="space-y-1">
                  {[
                    { label: 'OAG Kenya', url: 'https://oagkenya.go.ke/' },
                    { label: 'Controller of Budget', url: 'https://cob.go.ke/' },
                    { label: 'TI-Kenya', url: 'https://tikenya.org/' },
                    { label: 'IEBC', url: 'https://www.iebc.or.ke/' },
                    { label: 'EACC', url: 'https://eacc.go.ke/' },
                  ].map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-colors">
                      <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" /> {s.label}
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
              <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 flex flex-col shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-700">
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{t('common.navigation')}</span>
                  <button onClick={() => setSidebarOpen(false)} aria-label="Close navigation menu" className="h-8 w-8 rounded-lg hover:bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                    <X className="h-4 w-4 text-stone-500 dark:text-stone-400" aria-hidden="true" />
                  </button>
                </div>
                <nav aria-label="Main navigation" className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
                  {renderMobileSidebarSection(governanceItems, 'nav.sections.governance', 'bg-emerald-600')}
                  <Separator />
                  {renderMobileSidebarSection(civicItems, 'nav.sections.civicTools', 'bg-blue-600')}
                  <Separator />
                  {renderMobileSidebarSection(citizenItems, 'nav.sections.citizenAction', 'bg-amber-600')}
                  <Separator />
                  {renderMobileSidebarSection(dataItems, 'nav.sections.dataAlerts', 'bg-purple-600')}
                  <Separator />
                  {renderMobileSidebarSection(analyticsItems, 'nav.sections.analytics', 'bg-indigo-600')}
                  <Separator />
                  {renderMobileSidebarSection(leadershipItems, 'nav.sections.leadershipProjects', 'bg-rose-600')}
                  <Separator />
                  {renderMobileSidebarSection(insightItems, 'nav.sections.insights', 'bg-teal-600')}
                  <Separator />
                  {renderMobileSidebarSection(aiItems, 'nav.sections.aiTools', 'bg-emerald-600')}
                </nav>
              </aside>
            </div>
          )}

          {/* ══════════ MAIN CONTENT ══════════ */}
          <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 w-full">
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
            {activeTab === 'feedback' && <CitizenFeedbackPage />}
            {activeTab === 'timeline' && <TimelinePage />}
            {activeTab === 'budgetsim' && <BudgetSimulatorPage />}
            {activeTab === 'datafetcher' && <DataFetcherPage />}
            {activeTab === 'alerts' && <AlertsSubscriptionPage />}
            {activeTab === 'fiscalHub' && <FiscalAnalysisHub />}
            {activeTab === 'procurementHub' && <ProcurementHub />}
            {activeTab === 'reportcard' && <GovernorReportCardPage />}
            {activeTab === 'quiz' && <DevolutionQuizPage />}
            {activeTab === 'performanceHub' && <PerformanceHub />}
            {activeTab === 'stories' && <CitizenStoriesPage />}
            {activeTab === 'reports' && <CitizenReportDashboard />}
            {activeTab === 'cbef' && <CBEFMeetingPage />}
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
            {activeTab === 'compareEnhanced' && <CountyComparisonEnhanced />}
            {activeTab === 'hansard' && <AssemblyHansardPage />}
            {activeTab === 'representatives' && <BudgetAllocationPage />}
            {activeTab === 'integrityHub' && <IntegrityHub />}
            {activeTab === 'insightsHub' && <InsightsHub />}
            {activeTab === 'aiHub' && <AIHubPage />}
          </main>

          {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
          <nav aria-label="Quick navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 z-50 px-2 py-1.5">
            <div className="flex items-center justify-around">
              {[
                { id: 'summary' as TabId, icon: BarChart3, labelKey: 'nav.mobileBottom.home' },
                { id: 'countymap' as TabId, icon: Map, labelKey: 'nav.mobileBottom.map' },
                { id: 'tree' as TabId, icon: TreePine, labelKey: 'nav.mobileBottom.counties' },
                { id: 'representatives' as TabId, icon: Wallet, labelKey: 'nav.mobileBottom.reps' },
                { id: 'alerts' as TabId, icon: Bell, labelKey: 'nav.mobileBottom.alerts' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-[9px] font-medium">{t(item.labelKey)}</span>
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
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">{t('footer.primarySources')}</h3>
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
                        <ExternalLink className="h-3 w-3" aria-hidden="true" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">{t('footer.parliamentOversight')}</h3>
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
                        <ExternalLink className="h-3 w-3" aria-hidden="true" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">{t('footer.resourcesData')}</h3>
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
                        <ExternalLink className="h-3 w-3" aria-hidden="true" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-200 text-xs uppercase tracking-wider mb-3">{t('footer.civilSociety')}</h3>
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
                        <ExternalLink className="h-3 w-3" aria-hidden="true" /> {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Separator className="my-6 bg-stone-700" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
              <p>{t('app.footerLine1')}</p>
              <p>{t('app.footerLine2', { sources: allSources.length })}</p>
            </div>
          </div>
        </footer>
      </div>
      <CommandPalette ref={commandPaletteRef} onNavigate={(tabId) => setActiveTab(tabId as TabId)} />
    </TooltipProvider>
  );
}
