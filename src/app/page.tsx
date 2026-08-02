'use client';

import React, { useState, useMemo, Suspense } from 'react';
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

// Lazy-loaded new feature components
const WhistleblowerPortal = React.lazy(() => import('@/components/whistleblower-portal'));
const PetitionBuilderNew = React.lazy(() => import('@/components/petition-builder'));
const RTILetterGenerator = React.lazy(() => import('@/components/rti-letter-generator'));
const SmsUssdHub = React.lazy(() => import('@/components/sms-ussd-hub'));
const BudgetTrackingDashboard = React.lazy(() => import('@/components/budget-tracking-dashboard'));
const ContractorDatabase = React.lazy(() => import('@/components/contractor-database'));
const PublicParticipationTracker = React.lazy(() => import('@/components/public-participation-tracker'));
const CountyHealthScore = React.lazy(() => import('@/components/county-health-score'));
const AIFactChecker = React.lazy(() => import('@/components/ai-fact-checker'));
const SmartAlertsSystem = React.lazy(() => import('@/components/smart-alerts-system'));
const PredictiveRiskDashboard = React.lazy(() => import('@/components/predictive-risk-dashboard'));
const EnhancedCountyHeatmap = React.lazy(() => import('@/components/enhanced-county-heatmap'));
const ProjectLocationMap = React.lazy(() => import('@/components/project-location-map'));
const BeforeAfterSlider = React.lazy(() => import('@/components/before-after-slider'));
const CommunityForums = React.lazy(() => import('@/components/community-forums'));
const CitizenJournalistProgram = React.lazy(() => import('@/components/citizen-journalist-program'));
const GovernorReportCardRatings = React.lazy(() => import('@/components/governor-report-card-ratings'));
const ElectionPromiseTracker = React.lazy(() => import('@/components/election-promise-tracker'));
const EnhancedCountyComparison = React.lazy(() => import('@/components/enhanced-county-comparison'));
const CountyGovernanceTimeline = React.lazy(() => import('@/components/county-governance-timeline'));
const OfflineModeDashboard = React.lazy(() => import('@/components/offline-mode-dashboard'));
const VoiceSearchInterface = React.lazy(() => import('@/components/voice-search-interface'));
const PWAEnhancementPanel = React.lazy(() => import('@/components/pwa-enhancement-panel'));

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
  AlignJustify, AlignCenter, ChevronLeft,
  HardHat, HeartPulse, SearchCheck,
  ArrowLeftRight, Wifi, Mic, Settings, Smartphone,
} from 'lucide-react';

// ─── shadcn/ui ───────────────────────────────────────────────────
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import DownloadLink from '@/components/download-link';
import WelcomeOnboarding from '@/components/welcome-onboarding';
import KenyanFlagLogo from '@/components/kenyan-flag-logo';
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
  // ── Civic Engagement (New) ──
  { id: 'whistleblower', labelKey: 'nav.items.whistleblower', icon: Lock, sectionKey: 'nav.sections.civicEngagement' },
  { id: 'petitions', labelKey: 'nav.items.petitions', icon: ClipboardList, sectionKey: 'nav.sections.civicEngagement' },
  { id: 'rtiLetters', labelKey: 'nav.items.rtiLetters', icon: Mail, sectionKey: 'nav.sections.civicEngagement' },
  { id: 'smsUssd', labelKey: 'nav.items.smsUssd', icon: Smartphone, sectionKey: 'nav.sections.civicEngagement' },
  // ── Data & Analytics (New) ──
  { id: 'budgetTracking', labelKey: 'nav.items.budgetTracking', icon: Receipt, sectionKey: 'nav.sections.dataAnalytics' },
  { id: 'contractors', labelKey: 'nav.items.contractors', icon: HardHat, sectionKey: 'nav.sections.dataAnalytics' },
  { id: 'publicParticipation', labelKey: 'nav.items.publicParticipation', icon: Users, sectionKey: 'nav.sections.dataAnalytics' },
  { id: 'countyHealth', labelKey: 'nav.items.countyHealth', icon: HeartPulse, sectionKey: 'nav.sections.dataAnalytics' },
  // ── AI & Smart Tools (New) ──
  { id: 'factChecker', labelKey: 'nav.items.factChecker', icon: SearchCheck, sectionKey: 'nav.sections.aiSmartTools' },
  { id: 'smartAlerts', labelKey: 'nav.items.smartAlerts', icon: Bell, sectionKey: 'nav.sections.aiSmartTools' },
  { id: 'predictiveRisk', labelKey: 'nav.items.predictiveRisk', icon: TrendingUp, sectionKey: 'nav.sections.aiSmartTools' },
  // ── Maps & Visualization (New) ──
  { id: 'countyHeatmap', labelKey: 'nav.items.countyHeatmap', icon: Map, sectionKey: 'nav.sections.mapsViz' },
  { id: 'projectMap', labelKey: 'nav.items.projectMap', icon: MapPin, sectionKey: 'nav.sections.mapsViz' },
  { id: 'beforeAfter', labelKey: 'nav.items.beforeAfter', icon: ArrowLeftRight, sectionKey: 'nav.sections.mapsViz' },
  // ── Community & Social (New) ──
  { id: 'forums', labelKey: 'nav.items.forums', icon: MessageSquare, sectionKey: 'nav.sections.communitySocial' },
  { id: 'citizenJournalist', labelKey: 'nav.items.citizenJournalist', icon: Award, sectionKey: 'nav.sections.communitySocial' },
  { id: 'governorRatings', labelKey: 'nav.items.governorRatings', icon: Star, sectionKey: 'nav.sections.communitySocial' },
  // ── Accountability & Tracking (New) ──
  { id: 'promiseTracker', labelKey: 'nav.items.promiseTracker', icon: Target, sectionKey: 'nav.sections.accountability' },
  { id: 'enhancedCompareNew', labelKey: 'nav.items.enhancedCompareNew', icon: GitCompare, sectionKey: 'nav.sections.accountability' },
  { id: 'governanceTimeline', labelKey: 'nav.items.governanceTimeline', icon: Clock, sectionKey: 'nav.sections.accountability' },
  // ── App & Settings (New) ──
  { id: 'offlineMode', labelKey: 'nav.items.offlineMode', icon: Wifi, sectionKey: 'nav.sections.appSettings' },
  { id: 'voiceSearch', labelKey: 'nav.items.voiceSearch', icon: Mic, sectionKey: 'nav.sections.appSettings' },
  { id: 'pwaSettings', labelKey: 'nav.items.pwaSettings', icon: Settings, sectionKey: 'nav.sections.appSettings' },
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
  const [compact, setCompact] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['nav.sections.civicTools', 'nav.sections.citizenAction', 'nav.sections.dataAlerts', 'nav.sections.analytics', 'nav.sections.leadershipProjects', 'nav.sections.insights', 'nav.sections.civicEngagement', 'nav.sections.dataAnalytics', 'nav.sections.aiSmartTools', 'nav.sections.mapsViz', 'nav.sections.communitySocial', 'nav.sections.accountability', 'nav.sections.appSettings']));
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionKey)) { next.delete(sectionKey); } else { next.add(sectionKey); }
      return next;
    });
  };
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
  const civicEngagementItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.civicEngagement');
  const dataAnalyticsItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.dataAnalytics');
  const aiSmartToolsItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.aiSmartTools');
  const mapsVizItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.mapsViz');
  const communitySocialItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.communitySocial');
  const accountabilityItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.accountability');
  const appSettingsItems = navItemDefs.filter(n => n.sectionKey === 'nav.sections.appSettings');

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
    'nav.sections.civicEngagement': t('nav.sections.civicEngagement'),
    'nav.sections.dataAnalytics': t('nav.sections.dataAnalytics'),
    'nav.sections.aiSmartTools': t('nav.sections.aiSmartTools'),
    'nav.sections.mapsViz': t('nav.sections.mapsViz'),
    'nav.sections.communitySocial': t('nav.sections.communitySocial'),
    'nav.sections.accountability': t('nav.sections.accountability'),
    'nav.sections.appSettings': t('nav.sections.appSettings'),
  }), [t]);

  // Helper to get localized label for a nav item
  const getItemLabel = (id: TabId) => navItems.find(n => n.id === id)?.label ?? id;

  // Breadcrumb items generator
  const getBreadcrumbItems = (tab: TabId): { id: TabId; label: string }[] => {
    const navDef = navItemDefs.find(n => n.id === tab);
    if (!navDef) return [{ id: tab, label: tab }];

    // For hub tabs (aiHub, fiscalHub, etc.) — just show the hub label as leaf
    if (tab === 'summary') return [{ id: 'summary', label: 'Home' }];

    // Get the section label for the parent
    const parentLabel = getSectionLabel(navDef.sectionKey);
    const tabLabel = getItemLabel(tab);

    return [{ id: navItemDefs.find(n => n.sectionKey === navDef.sectionKey)?.id ?? tab, label: parentLabel }, { id: tab, label: tabLabel }];
  };

  // Helper to get localized section label
  const getSectionLabel = (sectionKey: string) => sectionLabels[sectionKey] ?? sectionKey;

  // Sidebar section renderer helper
  const renderSidebarSection = (items: NavItem[], sectionKey: string, activeColor: string) => (
    <div>
      {sidebarCollapsed ? (
        <div className="flex justify-center py-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${activeColor.replace('bg-', 'bg-').replace('-600', '-500')}`} />
        </div>
      ) : (
        <button onClick={() => toggleSection(sectionKey)} className="flex items-center justify-between w-full px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${activeColor.replace('bg-', 'bg-').replace('-600', '-500')}`} />
            <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{getSectionLabel(sectionKey)}</span>
          </div>
          <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform duration-200 ${collapsedSections.has(sectionKey) ? '-rotate-90' : ''}`} />
        </button>
      )}
      <div className={`overflow-hidden transition-all duration-200 ${collapsedSections.has(sectionKey) ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
        {items.map((item) => (
          sidebarCollapsed ? (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { setActiveTab(item.id); }}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                  className={`mx-auto w-10 h-10 rounded-lg flex items-center justify-center transition-colors mb-0.5 ${
                    activeTab === item.id
                      ? `${activeColor} text-white shadow-sm`
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {getItemLabel(item.id)}
              </TooltipContent>
            </Tooltip>
          ) : (
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
          )
        ))}
      </div>
    </div>
  );

  // Mobile sidebar section renderer helper
  const renderMobileSidebarSection = (items: NavItem[], sectionKey: string, activeColor: string) => (
    <div>
      <button onClick={() => toggleSection(sectionKey)} className="flex items-center justify-between w-full px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${activeColor.replace('bg-', 'bg-').replace('-600', '-500')}`} />
          <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{getSectionLabel(sectionKey)}</span>
        </div>
        <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform duration-200 ${collapsedSections.has(sectionKey) ? '-rotate-90' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${collapsedSections.has(sectionKey) ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
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
        <WelcomeOnboarding />

        {/* ══════════ HEADER / TOPBAR ══════════ */}
        <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50">
          {/* ── Top row: Logo + Actions ── */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Open navigation menu"
                  className="lg:hidden h-9 w-9 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:bg-stone-800 transition-colors"
                >
                  <Menu className="h-4 w-4 text-stone-600 dark:text-stone-300" aria-hidden="true" />
                </button>
                <KenyanFlagLogo size={32} />
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight truncate">
                    {t('app.title')}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-stone-500 hidden sm:block">
                    {t('app.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {comparisonList.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {t('app.headerCompare', { count: comparisonList.length })}
                  </Badge>
                )}
                <button
                  onClick={() => commandPaletteRef.current?.open()}
                  aria-label={t('app.searchShortcut')}
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:bg-stone-800 transition-colors"
                >
                  <Keyboard className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label={t('app.darkModeShortcut')}
                  className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:bg-stone-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" aria-hidden="true" /> : <Moon className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" aria-hidden="true" />}
                </button>
                <LanguageToggle />
              </div>
            </div>
          </div>
          {/* ── Quick-access feature tabs ── */}
          <div className="border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50 backdrop-blur-sm">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="overflow-x-auto scrollbar-none">
                <nav className="flex items-center gap-1 py-1.5" aria-label="Quick access features">
                  {[
                    { id: 'summary' as TabId, icon: BarChart3, labelKey: 'topbar.dashboard' },
                    { id: 'tree' as TabId, icon: TreePine, labelKey: 'topbar.counties' },
                    { id: 'aiHub' as TabId, icon: Bot, labelKey: 'topbar.ai' },
                    { id: 'county' as TabId, icon: MapPin, labelKey: 'topbar.deepDive' },
                    { id: 'compare' as TabId, icon: GitCompare, labelKey: 'topbar.compare' },
                    { id: 'fiscalHub' as TabId, icon: Zap, labelKey: 'topbar.fiscal' },
                    { id: 'leadership' as TabId, icon: Network, labelKey: 'topbar.leadership' },
                    { id: 'rti' as TabId, icon: FileCheck, labelKey: 'topbar.rti' },
                    { id: 'budgetsim' as TabId, icon: PieChart, labelKey: 'topbar.budget' },
                    { id: 'mzalendo' as TabId, icon: Vote, labelKey: 'topbar.mzalendo' },
                    { id: 'heatmap' as TabId, icon: Thermometer, labelKey: 'topbar.heatmap' },
                    { id: 'countymap' as TabId, icon: Map, labelKey: 'topbar.map' },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t(item.labelKey)}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════ BREADCRUMB ══════════ */}
        <div className="bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
              <ChevronRight className="h-3 w-3 text-stone-400 rotate-180" />
              {getBreadcrumbItems(activeTab).map((item, i) => (
                <React.Fragment key={item.id}>
                  {i > 0 && <ChevronRight className="h-3 w-3 text-stone-400" />}
                  {i < getBreadcrumbItems(activeTab).length - 1 ? (
                    <button onClick={() => setActiveTab(item.id)} className="text-stone-500 hover:text-emerald-600 transition-colors">
                      {item.label}
                    </button>
                  ) : (
                    <span className="text-stone-900 dark:text-stone-100 font-medium">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* ══════════ LAYOUT: SIDEBAR + MAIN ══════════ */}
        <div className="flex flex-1">
          {/* Sidebar - Desktop (always visible on lg+) */}
          <aside className={`hidden lg:flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-60'} border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto transition-all duration-200`}>
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
              {sidebarCollapsed ? (
                <div className="flex justify-center py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
              ) : (
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
              )}

              {/* Sidebar Widgets */}
              {!sidebarCollapsed && (
              <div className="px-3 py-2 space-y-3">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('sidebar.liveWidgets')}</p>
                <SidebarMiniMap onCountyClick={(code) => { setSelectedCounty(code); setActiveTab('county'); }} />
                <WeatherWidget lat={-1.2921} lng={36.8219} location="Nairobi" />
                <CitizenAuditorDashboard />
                <AIInsightsWidget />
              </div>
              )}

              {/* Primary Sources Links */}
              {!sidebarCollapsed && (
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
              )}

              {/* Collapse Toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mx-2 mb-2 flex items-center justify-center gap-1.5 h-8 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-[10px] text-stone-500"
              >
                {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                {!sidebarCollapsed && <span>Collapse</span>}
              </button>
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
                  <Separator />
                  {renderMobileSidebarSection(civicEngagementItems, 'nav.sections.civicEngagement', 'bg-red-600')}
                  <Separator />
                  {renderMobileSidebarSection(dataAnalyticsItems, 'nav.sections.dataAnalytics', 'bg-cyan-600')}
                  <Separator />
                  {renderMobileSidebarSection(aiSmartToolsItems, 'nav.sections.aiSmartTools', 'bg-violet-600')}
                  <Separator />
                  {renderMobileSidebarSection(mapsVizItems, 'nav.sections.mapsViz', 'bg-lime-600')}
                  <Separator />
                  {renderMobileSidebarSection(communitySocialItems, 'nav.sections.communitySocial', 'bg-pink-600')}
                  <Separator />
                  {renderMobileSidebarSection(accountabilityItems, 'nav.sections.accountability', 'bg-orange-600')}
                  <Separator />
                  {renderMobileSidebarSection(appSettingsItems, 'nav.sections.appSettings', 'bg-stone-600')}
                </nav>
              </aside>
            </div>
          )}

          {/* ══════════ MAIN CONTENT ══════════ */}
          <main id="main-content" data-compact={compact} className={`flex-1 ${compact ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 w-full`}>
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
            {/* ── New Feature Tabs ── */}
            <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" /></div>}>
            {activeTab === 'whistleblower' && <WhistleblowerPortal />}
            {activeTab === 'petitions' && <PetitionBuilderNew />}
            {activeTab === 'rtiLetters' && <RTILetterGenerator />}
            {activeTab === 'smsUssd' && <SmsUssdHub />}
            {activeTab === 'budgetTracking' && <BudgetTrackingDashboard />}
            {activeTab === 'contractors' && <ContractorDatabase />}
            {activeTab === 'publicParticipation' && <PublicParticipationTracker />}
            {activeTab === 'countyHealth' && <CountyHealthScore />}
            {activeTab === 'factChecker' && <AIFactChecker />}
            {activeTab === 'smartAlerts' && <SmartAlertsSystem />}
            {activeTab === 'predictiveRisk' && <PredictiveRiskDashboard />}
            {activeTab === 'countyHeatmap' && <EnhancedCountyHeatmap />}
            {activeTab === 'projectMap' && <ProjectLocationMap />}
            {activeTab === 'beforeAfter' && <BeforeAfterSlider />}
            {activeTab === 'forums' && <CommunityForums />}
            {activeTab === 'citizenJournalist' && <CitizenJournalistProgram />}
            {activeTab === 'governorRatings' && <GovernorReportCardRatings />}
            {activeTab === 'promiseTracker' && <ElectionPromiseTracker />}
            {activeTab === 'enhancedCompareNew' && <EnhancedCountyComparison />}
            {activeTab === 'governanceTimeline' && <CountyGovernanceTimeline />}
            {activeTab === 'offlineMode' && <OfflineModeDashboard />}
            {activeTab === 'voiceSearch' && <VoiceSearchInterface />}
            {activeTab === 'pwaSettings' && <PWAEnhancementPanel />}
            </Suspense>
          </main>

          {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
          <nav aria-label="Quick navigation" className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 z-50 px-2 py-1.5">
            <div className="flex items-center justify-around">
              {[
                { id: 'summary' as TabId, icon: BarChart3, labelKey: 'nav.mobileBottom.home' },
                { id: 'aiHub' as TabId, icon: Bot, labelKey: 'nav.mobileBottom.ai' },
                { id: 'tree' as TabId, icon: TreePine, labelKey: 'nav.mobileBottom.counties' },
                { id: 'representatives' as TabId, icon: Wallet, labelKey: 'nav.mobileBottom.reps' },
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
              {/* Search button — opens command palette */}
              <button
                onClick={() => commandPaletteRef.current?.open()}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="text-[9px] font-medium">{t('nav.mobileBottom.search')}</span>
              </button>
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
