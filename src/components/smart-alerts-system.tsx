'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell, BellRing, Shield, Building2, Milestone, Vote,
  Newspaper, FileText, CheckCircle, Eye, Trash2,
  Clock, ChevronDown, ChevronRight, MapPin, AlertTriangle,
  AlertCircle, Info, X, Settings, Calendar, Filter,
  Loader2, Volume2, BarChart3, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ─────────────────────────────────────────────────────────
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type AlertCategory = 'budget' | 'audit' | 'project' | 'assembly' | 'news' | 'petition';

interface SmartAlert {
  id: number;
  title: string;
  description: string;
  fullContext: string;
  severity: AlertSeverity;
  category: AlertCategory;
  county: string;
  timestamp: string;
  read: boolean;
  dismissed: boolean;
  actionLabel: string;
}

interface AlertCategoryConfig {
  id: AlertCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

// ─── Constants ────────────────────────────────────────────────────
const ALERT_CATEGORIES: AlertCategoryConfig[] = [
  { id: 'budget', label: 'Budget Anomalies', description: 'Unusual budget patterns, absorption rate drops, pending bills spikes', icon: <BarChart3 className="h-4 w-4" />, enabled: true },
  { id: 'audit', label: 'Audit Reports', description: 'New OAG audit opinions, special audits, and query responses', icon: <FileText className="h-4 w-4" />, enabled: true },
  { id: 'project', label: 'Project Milestones', description: 'Major project completions, delays, and stalling indicators', icon: <Milestone className="h-4 w-4" />, enabled: true },
  { id: 'assembly', label: 'Assembly Votes', description: 'County assembly motions, bill passages, and session highlights', icon: <Vote className="h-4 w-4" />, enabled: false },
  { id: 'news', label: 'County News', description: 'Breaking news, press releases, and governance developments', icon: <Newspaper className="h-4 w-4" />, enabled: true },
  { id: 'petition', label: 'Petition Updates', description: 'New public petitions, signature milestones, and assembly responses', icon: <Shield className="h-4 w-4" />, enabled: false },
];

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Nakuru', 'Kisumu', 'Kakamega',
  'Machakos', 'Uasin Gishu', 'Kiambu', 'Narok', 'Kajiado',
  'Turkana', 'Mandera', 'Wajir', 'Garissa', 'Marsabit',
  'Isiolo', 'Meru', 'Embu', 'Kitui', 'Makueni',
  'Kilifi', 'Kwale', 'Tana River', 'Lamu', 'Bungoma',
  'Busia', 'Siaya', 'Homa Bay', 'Migori', 'Kisii',
];

const FREQUENCY_OPTIONS = [
  { value: 'instant', label: 'Instant', description: 'Receive alerts immediately' },
  { value: 'daily', label: 'Daily Digest', description: 'Summary once per day' },
  { value: 'weekly', label: 'Weekly Summary', description: 'Summary every Monday' },
];

// ─── Severity Config ──────────────────────────────────────────────
const SEVERITY_CONFIG: Record<AlertSeverity, { bg: string; color: string; border: string; icon: React.ReactNode; label: string }> = {
  critical: { bg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700', icon: <AlertCircle className="h-3.5 w-3.5" />, label: 'Critical' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/40', color: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700', icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'High' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', color: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-700', icon: <Info className="h-3.5 w-3.5" />, label: 'Medium' },
  low: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700', icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'Low' },
  info: { bg: 'bg-blue-100 dark:bg-blue-900/40', color: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700', icon: <Info className="h-3.5 w-3.5" />, label: 'Info' },
};

// ─── Category Icon Helper ──────────────────────────────────────────
function getCategoryIcon(cat: AlertCategory): React.ReactNode {
  const found = ALERT_CATEGORIES.find(c => c.id === cat);
  return found ? found.icon : <Bell className="h-4 w-4" />;
}

// ─── Mock Alerts ──────────────────────────────────────────────────
const MOCK_ALERTS: SmartAlert[] = [
  {
    id: 1, title: 'Nakuru County Budget Absorption Drops Below 30%',
    description: 'Development budget absorption rate has fallen to 28.4%, well below the 50% threshold recommended by the Controller of Budget.',
    fullContext: 'Nakuru County\'s development budget absorption rate for Q3 FY 2024/25 has dropped to 28.4%, marking a significant decline from 47.1% in Q2. The Controller of Budget report indicates this is the third consecutive quarter of declining absorption. Key departments affected include Roads (12.3%), Health (34.2%), and Water (19.8%). The county has accumulated KES 4.2 billion in pending bills, raising concerns about fiscal management. The county treasury has attributed the decline to delayed disbursements from the national government, but internal procurement delays have also been cited in the OAG special audit report.',
    severity: 'critical', category: 'budget', county: 'Nakuru', timestamp: '2025-01-15T09:30:00Z', read: false, dismissed: false, actionLabel: 'View CoB Report',
  },
  {
    id: 2, title: 'New OAG Special Audit: Mombasa County Health Spending',
    description: 'The Office of the Auditor General has issued a special audit report on Mombasa County health department expenditure amounting to KES 3.8 billion.',
    fullContext: 'The OAG special audit covering FY 2023/24 found that Mombasa County health department could not account for KES 420 million in expenditure. The audit revealed irregular procurement processes for medical supplies, unverified payments to contractors, and discrepancies between budget allocations and actual spending. The audit recommends that the County Assembly summon the CECM for Health to provide explanations. This is the third consecutive year the health department has received an adverse opinion.',
    severity: 'critical', category: 'audit', county: 'Mombasa', timestamp: '2025-01-15T08:15:00Z', read: false, dismissed: false, actionLabel: 'Read Audit Report',
  },
  {
    id: 3, title: 'Kisumu Level 5 Hospital Expansion Completed',
    description: 'The KES 1.2 billion Kisumu Level 5 Hospital expansion project has been completed, adding 200 new beds and a modern ICU wing.',
    fullContext: 'The Kisumu Level 5 Hospital expansion project, funded through a partnership between the county government and the World Bank, has been completed 4 months ahead of schedule. The project added 200 new beds, a modern ICU wing with 20 beds, a maternity wing with 30 beds, and a pediatric emergency unit. The project employed over 800 local youth during construction and is expected to serve over 500,000 residents annually. The county has also procured new medical equipment worth KES 150 million.',
    severity: 'low', category: 'project', county: 'Kisumu', timestamp: '2025-01-14T16:45:00Z', read: false, dismissed: false, actionLabel: 'View Project Details',
  },
  {
    id: 4, title: 'Machakos County Assembly Passes Finance Bill 2025',
    description: 'The county assembly has passed the Finance Bill 2025 with amendments to own-source revenue collection targets.',
    fullContext: 'The Machakos County Assembly has passed the Finance Bill 2025 with key amendments including a 15% increase in own-source revenue collection targets (from KES 1.8 billion to KES 2.07 billion), new digital revenue collection systems, and revised parking fees for the Machakos CBD. The bill also includes provisions for a county innovation fund targeting youth entrepreneurship. The bill now awaits the governor\'s assent before implementation. The assembly debate lasted 3 days with 32 MCAs supporting and 8 opposing.',
    severity: 'medium', category: 'assembly', county: 'Machakos', timestamp: '2025-01-14T14:20:00Z', read: true, dismissed: false, actionLabel: 'Read Bill Summary',
  },
  {
    id: 5, title: 'Public Petition Reaches 10,000 Signatures: Stop Lamu Coal Plant',
    description: 'A petition opposing the proposed Lamu coal power plant has reached 10,000 verified signatures, triggering assembly consideration.',
    fullContext: 'The petition calling on the Lamu County Assembly to formally oppose the proposed Lamu coal power plant has reached 10,000 verified signatures under Article 37 of the Constitution. The petition cites environmental concerns including potential damage to the Lamu Old Town UNESCO World Heritage Site, impact on fishing communities, and health risks from coal emissions. The county assembly speaker has acknowledged receipt and scheduled a debate for next week. The petition was organized by the Lamu Environmental Conservation Network.',
    severity: 'high', category: 'petition', county: 'Lamu', timestamp: '2025-01-14T11:00:00Z', read: false, dismissed: false, actionLabel: 'View Petition',
  },
  {
    id: 6, title: 'Budget Alert: Kakamega Pending Bills Exceed KES 5 Billion',
    description: 'Kakamega County pending bills have surpassed KES 5.3 billion, the highest among Western region counties.',
    fullContext: 'According to the latest Controller of Budget report, Kakamega County\'s pending bills have reached KES 5.3 billion as of December 2024. This represents a 28% increase from the previous quarter. The largest portion (KES 2.1 billion) relates to incomplete road construction projects, while KES 1.4 billion is attributed to health sector suppliers. The county has been placed on the CoB watchlist for fiscal distress. The County Public Accounts Committee has initiated investigations into the accumulation pattern.',
    severity: 'critical', category: 'budget', county: 'Kakamega', timestamp: '2025-01-13T15:30:00Z', read: false, dismissed: false, actionLabel: 'View Financial Report',
  },
  {
    id: 7, title: 'Garissa Water Project Stalls for 6 Months',
    description: 'The KES 800 million Garissa town water supply improvement project has not seen any progress in 6 months.',
    fullContext: 'The Garissa Town Water Supply Improvement Project, funded by the Water Services Trust Fund and the county government, has stalled for 6 months. The main contractor has cited payment delays from the county government as the primary reason for the stoppage. The project was 45% complete when work stopped. Approximately 150,000 residents in Garissa town are affected by the delays, with water rationing increasing from 2 to 4 days per week. The county executive has promised to release outstanding payments totaling KES 120 million.',
    severity: 'high', category: 'project', county: 'Garissa', timestamp: '2025-01-13T10:00:00Z', read: true, dismissed: false, actionLabel: 'View Project Status',
  },
  {
    id: 8, title: 'Uasin Gishu County Allocates KES 200M for Youth Fund',
    description: 'The county executive has proposed a KES 200 million allocation for the county youth empowerment fund in the supplementary budget.',
    fullContext: 'Uasin Gishu Governor has submitted a supplementary budget proposal allocating KES 200 million for the establishment of a County Youth Empowerment Fund. The fund is intended to provide business loans of up to KES 500,000 to youth-owned enterprises at 3% interest, with a 6-month grace period. The proposal also includes KES 50 million for skills training programs targeting 2,000 youth. The County Assembly Budget Committee will begin hearings next week.',
    severity: 'info', category: 'news', county: 'Uasin Gishu', timestamp: '2025-01-13T08:45:00Z', read: false, dismissed: false, actionLabel: 'Read Full Story',
  },
  {
    id: 9, title: 'OAG Adverse Opinion: Turkana County Education Department',
    description: 'The Auditor General has issued an adverse opinion on Turkana County Education department for FY 2023/24.',
    fullContext: 'The Office of the Auditor General has issued an adverse opinion on the Turkana County Education, Youth, Sports, and Culture department for the financial year 2023/24. Key findings include KES 87 million in unsupported expenditure, irregular procurement of learning materials worth KES 45 million, and ghost workers in the Early Childhood Development program. The audit also noted that the department failed to account for 12 county bursary disbursements totaling KES 23 million. The CECM has been asked to appear before the Public Accounts Committee.',
    severity: 'high', category: 'audit', county: 'Turkana', timestamp: '2025-01-12T14:15:00Z', read: true, dismissed: false, actionLabel: 'View Audit Findings',
  },
  {
    id: 10, title: 'Nairobi County Launches Digital Revenue System',
    description: 'Nairobi County has launched a new integrated digital revenue collection system targeting KES 20 billion in annual collections.',
    fullContext: 'Nairobi County Government has launched a new integrated digital revenue collection system that unifies parking, market fees, business permits, and land rates into a single mobile platform. The system, developed at a cost of KES 180 million, is expected to increase revenue collection from the current KES 12 billion to a target of KES 20 billion annually. The platform supports M-Pesa, Airtel Money, and bank transfers. The county has also deployed 500 enforcement officers to ensure compliance with the new system.',
    severity: 'info', category: 'news', county: 'Nairobi', timestamp: '2025-01-12T09:00:00Z', read: false, dismissed: false, actionLabel: 'Read Press Release',
  },
  {
    id: 11, title: 'Mandera Health Worker Strike Enters Week 3',
    description: 'Health workers in Mandera County have been on strike for 3 weeks over unpaid salaries and poor working conditions.',
    fullContext: 'Health workers in Mandera County have been on strike for 21 days, demanding payment of 4 months\' salary arrears, deployment of additional medical staff, and improvement of health facility infrastructure. The strike has affected all 47 public health facilities in the county, leaving an estimated 800,000 residents without access to essential healthcare services. The Kenya Medical Practitioners and Dentists Council has called on the county government to urgently address the grievances. The County Assembly has formed an ad-hoc committee to mediate.',
    severity: 'critical', category: 'news', county: 'Mandera', timestamp: '2025-01-11T12:30:00Z', read: false, dismissed: false, actionLabel: 'Read Coverage',
  },
  {
    id: 12, title: 'Kiambu County Road Project 78% Complete',
    description: 'The KES 1.5 billion Kiambu-Ruiru road dualing project is now 78% complete and on schedule for June 2025 completion.',
    fullContext: 'The Kiambu-Ruiru road dualing project, funded jointly by the county and the Kenya Urban Roads Authority, has reached 78% completion. The 12km dual carriageway project includes drainage systems, street lighting, and pedestrian walkways. The contractor has confirmed that the project is on track for completion by June 2025. Traffic diversions are in place for the remaining construction phases. The project has created 400 direct jobs and is expected to significantly reduce commute times between Kiambu and Nairobi.',
    severity: 'low', category: 'project', county: 'Kiambu', timestamp: '2025-01-11T07:00:00Z', read: true, dismissed: false, actionLabel: 'View Progress Report',
  },
];

// ─── Component ────────────────────────────────────────────────────
export default function SmartAlertsSystem() {
  const [alerts, setAlerts] = useState<SmartAlert[]>(MOCK_ALERTS);
  const [categoryToggles, setCategoryToggles] = useState<Record<AlertCategory, boolean>>(
    Object.fromEntries(ALERT_CATEGORIES.map(c => [c.id, c.enabled])) as Record<AlertCategory, boolean>,
  );
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set(['Nairobi', 'Nakuru', 'Mombasa', 'Kisumu']));
  const [frequency, setFrequency] = useState('daily');
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');
  const [bellAnimating, setBellAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'preferences' | 'history'>('feed');

  const unreadCount = useMemo(() => alerts.filter(a => !a.read && !a.dismissed).length, [alerts]);

  const visibleAlerts = useMemo(() => {
    const now = new Date();
    return alerts
      .filter(a => {
        if (a.dismissed) return false;
        if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
        if (!categoryToggles[a.category]) return false;
        if (selectedCounties.size > 0 && !selectedCounties.has(a.county)) return false;
        if (dateRange === '7days') {
          const alertDate = new Date(a.timestamp);
          const diff = (now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        }
        if (dateRange === '30days') {
          const alertDate = new Date(a.timestamp);
          const diff = (now.getTime() - alertDate.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 30;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alerts, severityFilter, categoryToggles, selectedCounties, dateRange]);

  const handleMarkRead = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleDismiss = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const toggleCategory = (cat: AlertCategory) => {
    setCategoryToggles(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleCounty = (county: string) => {
    setSelectedCounties(prev => {
      const next = new Set(prev);
      if (next.has(county)) next.delete(county);
      else next.add(county);
      return next;
    });
  };

  const handleBellClick = () => {
    setBellAnimating(true);
    handleMarkAllRead();
    setTimeout(() => setBellAnimating(false), 1000);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return `${Math.floor(diffHours * 60)}m ago`;
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Bell className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Smart Alerts System</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Real-time governance monitoring alerts</p>
          </div>
        </div>
        <button
          onClick={handleBellClick}
          className="relative p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <BellRing className={`h-5 w-5 text-stone-600 dark:text-stone-400 ${bellAnimating ? 'animate-bounce' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-stone-100 dark:bg-stone-800 w-fit">
        {[
          { key: 'feed' as const, label: 'Alert Feed', icon: <Bell className="h-3.5 w-3.5" /> },
          { key: 'preferences' as const, label: 'Preferences', icon: <Settings className="h-3.5 w-3.5" /> },
          { key: 'history' as const, label: 'History', icon: <Clock className="h-3.5 w-3.5" /> },
        ].map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            className={`text-xs ${activeTab === tab.key ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}`}
          >
            <span className="flex items-center gap-1.5">{tab.icon} {tab.label}</span>
          </Button>
        ))}
      </div>

      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Feed Filters */}
          <div className="space-y-4">
            <Card className="border-stone-200 dark:border-stone-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-stone-800 dark:text-stone-200">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 block">Severity</label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="h-8 text-xs border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="h-8 text-xs border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div>
                  <label className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 block">County Filter</label>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {COUNTIES.slice(0, 15).map(county => (
                      <label key={county} className="flex items-center gap-2 cursor-pointer py-0.5">
                        <Checkbox
                          checked={selectedCounties.has(county)}
                          onCheckedChange={() => toggleCounty(county)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <span className="text-xs text-stone-700 dark:text-stone-300">{county}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Feed */}
          <div className="lg:col-span-3 space-y-3">
            {visibleAlerts.length === 0 ? (
              <Card className="border-stone-200 dark:border-stone-700">
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                    <Bell className="h-8 w-8 text-stone-400" />
                  </div>
                  <p className="text-sm text-stone-500">No alerts match your current filters</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-emerald-600" onClick={() => { setSeverityFilter('all'); setDateRange('all'); setSelectedCounties(new Set()); }}>
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              visibleAlerts.map(alert => {
                const sevConfig = SEVERITY_CONFIG[alert.severity];
                const isExpanded = expandedAlertId === alert.id;
                return (
                  <Card
                    key={alert.id}
                    className={`border transition-colors ${!alert.read ? 'border-l-4 border-l-emerald-500 border-stone-200 dark:border-stone-700 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-stone-200 dark:border-stone-700'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${sevConfig.bg}`}>
                          {getCategoryIcon(alert.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${!alert.read ? 'text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}`}>
                              {alert.title}
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={`text-[10px] px-1.5 py-0 ${sevConfig.bg} ${sevConfig.color} border ${sevConfig.border}`}>
                                {sevConfig.label}
                              </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              <MapPin className="h-2.5 w-2.5 mr-0.5" />
                              {alert.county}
                            </Badge>
                            <span className="text-[10px] text-stone-400 whitespace-nowrap">{formatDate(alert.timestamp)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">
                            {alert.description}
                          </p>
                          {isExpanded && (
                            <div className="mb-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{alert.fullContext}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                            >
                              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              {isExpanded ? 'Less' : 'Full context'}
                            </button>
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400">
                              {alert.actionLabel}
                            </Button>
                            {!alert.read && (
                              <button onClick={() => handleMarkRead(alert.id)} className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-0.5">
                                <Eye className="h-3 w-3" /> Mark read
                              </button>
                            )}
                            <button onClick={() => handleDismiss(alert.id)} className="text-[11px] text-stone-400 hover:text-red-500 flex items-center gap-0.5 ml-auto">
                              <Trash2 className="h-3 w-3" /> Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Categories */}
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 dark:text-stone-200">Alert Categories</CardTitle>
              <CardDescription>Toggle which types of alerts you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALERT_CATEGORIES.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryToggles[cat.id] ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{cat.label}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{cat.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={categoryToggles[cat.id]}
                    onCheckedChange={() => toggleCategory(cat.id)}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* County Selection & Frequency */}
          <div className="space-y-4">
            <Card className="border-stone-200 dark:border-stone-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-stone-800 dark:text-stone-200">County Selection</CardTitle>
                <CardDescription>Select counties to monitor ({selectedCounties.size} selected)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1.5 max-h-[300px] overflow-y-auto">
                  {COUNTIES.map(county => (
                    <label key={county} className="flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <Checkbox
                        checked={selectedCounties.has(county)}
                        onCheckedChange={() => toggleCounty(county)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span className="text-xs text-stone-700 dark:text-stone-300 truncate">{county}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedCounties(new Set(COUNTIES))}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setSelectedCounties(new Set())}>
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200 dark:border-stone-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-stone-800 dark:text-stone-200">Notification Frequency</CardTitle>
                <CardDescription>How often do you want to receive alert notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {FREQUENCY_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${frequency === opt.value ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${frequency === opt.value ? 'border-emerald-600' : 'border-stone-400'}`}>
                      {frequency === opt.value && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{opt.label}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{opt.description}</p>
                    </div>
                    <input
                      type="radio"
                      name="frequency"
                      value={opt.value}
                      checked={frequency === opt.value}
                      onChange={() => setFrequency(opt.value)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <Card className="border-stone-200 dark:border-stone-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-stone-800 dark:text-stone-200">Alert History</CardTitle>
                <CardDescription>{alerts.length} total alerts tracked</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-8 w-[140px] text-xs border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                    <Calendar className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleMarkAllRead}>
                  <Eye className="h-3 w-3 mr-1" /> Mark All Read
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {alerts
                .filter(a => dateRange === 'all' || (() => { const d = (new Date().getTime() - new Date(a.timestamp).getTime()) / (1000*60*60*24); return dateRange === '7days' ? d <= 7 : d <= 30; })())
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map(alert => (
                  <div
                    key={alert.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${alert.dismissed ? 'opacity-50 line-through' : ''} hover:bg-stone-50 dark:hover:bg-stone-800/50`}
                  >
                    <div className={`p-1.5 rounded ${SEVERITY_CONFIG[alert.severity].bg}`}>
                      {getCategoryIcon(alert.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-800 dark:text-stone-200 truncate">{alert.title}</p>
                      <p className="text-[10px] text-stone-400">{alert.county} -- {formatDate(alert.timestamp)}</p>
                    </div>
                    <Badge className={`text-[10px] px-1.5 py-0 ${SEVERITY_CONFIG[alert.severity].bg} ${SEVERITY_CONFIG[alert.severity].color} border ${SEVERITY_CONFIG[alert.severity].border}`}>
                      {SEVERITY_CONFIG[alert.severity].label}
                    </Badge>
                    {alert.read ? (
                      <CheckCircle className="h-3.5 w-3.5 text-stone-400" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
