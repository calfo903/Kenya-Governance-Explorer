'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import { nationalSummary } from '@/data/national-summary';
import {
  Target, CheckCircle2, Clock, XCircle, AlertCircle,
  TrendingUp, BarChart3, ExternalLink, Info, MapPin,
  ChevronRight, Building2, Users, BookOpen, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

import DownloadLink from '@/components/download-link';
type DeliveryStatus = 'completed' | 'in_progress' | 'not_started' | 'blocked';

interface CampaignPromise {
  category: string;
  description: string;
  status: DeliveryStatus;
  evidence?: string;
  source?: string;
}

interface GovernorTracking {
  name: string;
  county: string;
  party: string;
  coalition: string;
  termStart: string;
  promises: CampaignPromise[];
  overallProgress: number;
  notes: string;
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3 text-emerald-600" /> },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', icon: <Clock className="h-3 w-3 text-blue-600" /> },
  not_started: { label: 'Not Started', color: 'text-stone-600 dark:text-stone-300', bg: 'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-700', icon: <AlertCircle className="h-3 w-3 text-stone-500 dark:text-stone-400" /> },
  blocked: { label: 'Blocked', color: 'text-red-700', bg: 'bg-red-100 border-red-200', icon: <XCircle className="h-3 w-3 text-red-600" /> },
};

/* Tracked governors with real publicly available data */
const trackedGovernors: GovernorTracking[] = [
  {
    name: 'Mutula Kilonzo Jr',
    county: 'Makueni',
    party: 'Wiper',
    coalition: 'Azimio la Umoja One Kenya Coalition',
    termStart: '2022-08-22',
    promises: [
      { category: 'Healthcare', description: 'Upgrade all Level 4 hospitals to county referral status', status: 'in_progress', evidence: 'Makueni County Referral Hospital operational; several sub-county hospitals upgraded', source: 'CoB FY 2024/25 Report' },
      { category: 'Water', description: 'Achieve universal water access through sand dams and boreholes', status: 'in_progress', evidence: 'Makueni sand dam program ongoing; over 500 sand dams constructed cumulatively', source: 'CIDP 2023-2027' },
      { category: 'Agriculture', description: 'Support mango farmers with processing plant and market access', status: 'completed', evidence: 'Makueni Fruit Processing Plant operational since 2021; expanded capacity', source: 'County Government Reports' },
      { category: 'Education', description: 'ECDE center construction and teacher recruitment', status: 'in_progress', evidence: 'New ECDE centers being built; recruitment ongoing', source: 'County Budget' },
      { category: 'Budget Absorption', description: 'Maintain high development budget absorption rate', status: 'completed', evidence: 'Makueni achieved 72% dev absorption FY 2024/25 (CoB top performer)', source: 'CoB Budget Review FY 2024/25' },
    ],
    overallProgress: 68,
    notes: 'Makueni consistently ranks among top performers in budget absorption. Dev absorption: 72% FY 2024/25 (CoB).',
  },
  {
    name: 'Mohamed Adan Khalif',
    county: 'Mandera',
    party: 'UDA',
    coalition: 'Kenya Kwanza Alliance',
    termStart: '2022-08-22',
    promises: [
      { category: 'Infrastructure', description: 'Complete tarmacking of Mandera-Wajir road and town roads', status: 'in_progress', evidence: 'Major road construction ongoing; Mandera town roads improvement', source: 'CoB Report' },
      { category: 'Water', description: 'Increase water coverage through boreholes and pipeline extension', status: 'in_progress', evidence: 'New boreholes commissioned; pipeline extensions ongoing', source: 'CIDP 2023-2027' },
      { category: 'Healthcare', description: 'Staff all health facilities and improve referral services', status: 'in_progress', evidence: 'Recruitment drives ongoing; Mandera County Referral Hospital upgraded', source: 'County Reports' },
      { category: 'Development Spending', description: 'Maximize development budget absorption', status: 'completed', evidence: 'Highest dev absorption in Kenya: 78% FY 2024/25', source: 'CoB Budget Review FY 2024/25' },
      { category: 'Education', description: 'Expand secondary schools and vocational training', status: 'in_progress', evidence: 'New schools being constructed; VTCs established', source: 'County Budget' },
    ],
    overallProgress: 65,
    notes: 'Mandera leads nationally in dev budget absorption at 78% (FY 2024/25). CoB top performer.',
  },
  {
    name: 'Johnson Sakaja',
    county: 'Nairobi City',
    party: 'UDA',
    coalition: 'Kenya Kwanza Alliance',
    termStart: '2022-08-22',
    promises: [
      { category: 'Healthcare', description: 'Rehabilitate and equip all health centers in Nairobi', status: 'in_progress', evidence: 'Several health centers renovated; staffing challenges persist', source: 'CoB Report' },
      { category: 'Markets', description: 'Modernize and construct new markets for traders', status: 'in_progress', evidence: 'Wakulima Market reconstruction; new markets planned', source: 'County Budget' },
      { category: 'Roads', description: 'Fix potholes and improve city road infrastructure', status: 'in_progress', evidence: 'Road repair program ongoing; significant pothole filling campaign', source: 'County Reports' },
      { category: 'Housing', description: 'Implement affordable housing and settlement programs', status: 'blocked', evidence: 'Housing levy implementation contested; court cases pending', source: 'Media Reports' },
      { category: 'Governance', description: 'Improve revenue collection and county service delivery', status: 'in_progress', evidence: 'Revenue collection digitized; EACC investigating procurement irregularities', source: 'EACC, CoB Reports' },
    ],
    overallProgress: 40,
    notes: 'Lowest dev budget absorption at 22% FY 2024/25 (CoB). EACC investigating procurement irregularities.',
  },
  {
    name: 'Susan Kihika',
    county: 'Nakuru',
    party: 'UDA',
    coalition: 'Kenya Kwanza Alliance',
    termStart: '2022-08-22',
    promises: [
      { category: 'Infrastructure', description: 'Improve road network and street lighting across the county', status: 'in_progress', evidence: 'Major road projects ongoing; street lighting expanded', source: 'CoB Report' },
      { category: 'Healthcare', description: 'Upgrade health facilities and recruit medical staff', status: 'in_progress', evidence: 'Several hospitals upgraded; recruitment ongoing', source: 'CIDP' },
      { category: 'Agriculture', description: 'Support dairy and horticulture farmers with subsidies', status: 'in_progress', evidence: 'Agricultural programs operational; subsidy distribution', source: 'County Reports' },
      { category: 'Governance', description: 'Improve county transparency and accountability', status: 'blocked', evidence: 'EACC investigating asset mismatch; governor under probe', source: 'EACC' },
      { category: 'Youth Empowerment', description: 'Create youth employment and entrepreneurship programs', status: 'not_started', evidence: 'Programs announced but implementation not yet tracked', source: 'N/A' },
    ],
    overallProgress: 38,
    notes: 'EACC investigating Governor Kihika for asset mismatch. Dev absorption: 40% FY 2024/25.',
  },
  {
    name: 'Abdulswamad Sheriff Nassir',
    county: 'Mombasa',
    party: 'ODM',
    coalition: 'Azimio la Umoja One Kenya Coalition',
    termStart: '2022-08-22',
    promises: [
      { category: 'Tourism', description: 'Revitalize tourism infrastructure and marketing', status: 'in_progress', evidence: 'Beach cleanups; tourism marketing campaigns launched', source: 'County Reports' },
      { category: 'Revenue', description: 'Digitize revenue collection and increase county own-source revenue', status: 'in_progress', evidence: 'Digital revenue systems implemented; EACC investigating revenue irregularities', source: 'CoB, EACC' },
      { category: 'Healthcare', description: 'Upgrade Coast General Teaching and Referral Hospital', status: 'in_progress', evidence: 'Renovations ongoing; new equipment procurement', source: 'County Budget' },
      { category: 'Water', description: 'Address water scarcity through desalination and distribution', status: 'not_started', evidence: 'Feasibility studies conducted; implementation pending', source: 'CIDP' },
      { category: 'Governance', description: 'Ensure transparent procurement and financial management', status: 'blocked', evidence: 'Revenue collection irregularities under EACC investigation', source: 'EACC' },
    ],
    overallProgress: 35,
    notes: 'Dev absorption: 28% FY 2024/25 (bottom performer). EACC investigating revenue irregularities.',
  },
  {
    name: 'Anne Waiguru',
    county: 'Kirinyaga',
    party: 'UDA',
    coalition: 'Kenya Kwanza Alliance',
    termStart: '2022-08-22',
    promises: [
      { category: 'Agriculture', description: 'Support tea and coffee farmers with better prices and processing', status: 'in_progress', evidence: 'Tea factory construction ongoing; farmer cooperatives supported', source: 'County Reports' },
      { category: 'Healthcare', description: 'Improve health facilities and expand NHIF coverage', status: 'in_progress', evidence: 'Level 4 hospitals upgraded; NHIF enrollment campaigns', source: 'CoB Report' },
      { category: 'Infrastructure', description: 'Complete road construction and rural access roads', status: 'in_progress', evidence: 'Major road projects ongoing', source: 'County Budget' },
      { category: 'Water', description: 'Expand piped water supply to rural areas', status: 'in_progress', evidence: 'Water projects ongoing across constituencies', source: 'CIDP' },
      { category: 'Youth', description: 'Youth empowerment through bursaries and training', status: 'in_progress', evidence: 'Bursary disbursement ongoing; VTCs established', source: 'County Reports' },
    ],
    overallProgress: 55,
    notes: 'Kirinyaga maintains moderate dev absorption at 50%. Qualified audit opinion FY 2024/25.',
  },
  {
    name: 'James Orengo',
    county: 'Siaya',
    party: 'ODM',
    coalition: 'Azimio la Umoja One Kenya Coalition',
    termStart: '2022-08-22',
    promises: [
      { category: 'Agriculture', description: 'Support sugarcane and fish farming industries', status: 'in_progress', evidence: 'Agricultural support programs ongoing; fish farming expansion', source: 'County Reports' },
      { category: 'Healthcare', description: 'Upgrade health centers and maternal care services', status: 'in_progress', evidence: 'Health facility upgrades ongoing', source: 'CIDP' },
      { category: 'Education', description: 'Improve school infrastructure and ECDE centers', status: 'in_progress', evidence: 'ECDE center construction ongoing', source: 'County Budget' },
      { category: 'Infrastructure', description: 'Improve rural road network and water access', status: 'not_started', evidence: 'Plans documented in CIDP; implementation pending', source: 'CIDP 2023-2027' },
      { category: 'Governance', description: 'Enhance transparency and citizen participation', status: 'in_progress', evidence: 'Public participation forums held; budget transparency improved', source: 'County Reports' },
    ],
    overallProgress: 45,
    notes: 'Dev absorption: 40% FY 2024/25. Qualified audit opinion.',
  },
  {
    name: 'Kakamega Fernandes Barasa',
    county: 'Kakamega',
    party: 'ODM',
    coalition: 'Azimio la Umoja One Kenya Coalition',
    termStart: '2022-08-22',
    promises: [
      { category: 'Healthcare', description: 'Equip all sub-county hospitals and upgrade Kakamega County Referral Hospital', status: 'in_progress', evidence: 'Hospital upgrades ongoing; equipment procurement', source: 'CoB Report' },
      { category: 'Sugar Industry', description: 'Revitalize sugar factories and support sugarcane farmers', status: 'blocked', evidence: 'Former Governor Oparanya KSh 1B+ fraud case; industry challenges persist', source: 'EACC, Media' },
      { category: 'Education', description: 'Expand ECDE, vocational training, and bursary programs', status: 'in_progress', evidence: 'Bursary disbursement; ECDE construction ongoing', source: 'County Budget' },
      { category: 'Infrastructure', description: 'Improve road network and street lighting in towns', status: 'in_progress', evidence: 'Road construction ongoing', source: 'CIDP' },
      { category: 'Water', description: 'Increase piped water coverage in rural Kakamega', status: 'not_started', evidence: 'Plans documented; implementation pending', source: 'CIDP 2023-2027' },
    ],
    overallProgress: 38,
    notes: 'Former Governor Oparanya faces KSh 1B+ fraud case. Dev absorption: 50% FY 2024/25.',
  },
  {
    name: 'Joseph Ole Lenku',
    county: 'Kajiado',
    party: 'ODM',
    coalition: 'Azimio la Umoja One Kenya Coalition',
    termStart: '2022-08-22',
    promises: [
      { category: 'Water', description: 'Expand water infrastructure for pastoral communities', status: 'in_progress', evidence: 'Borehole drilling and water pan construction ongoing', source: 'CIDP' },
      { category: 'Livestock', description: 'Support pastoralists with livestock insurance and markets', status: 'in_progress', evidence: 'Livestock programs operational; market access improved', source: 'County Reports' },
      { category: 'Education', description: 'Expand schools and address dropout rates among pastoral children', status: 'in_progress', evidence: 'Mobile schools and boarding programs launched', source: 'County Budget' },
      { category: 'Infrastructure', description: 'Improve road access to remote pastoral areas', status: 'not_started', evidence: 'Road plans documented; implementation pending', source: 'CIDP' },
      { category: 'Healthcare', description: 'Expand health outreach to remote communities', status: 'in_progress', evidence: 'Mobile health clinics operational', source: 'County Reports' },
    ],
    overallProgress: 48,
    notes: 'Dev absorption: 35% FY 2024/25. Unique challenges as pastoral county.',
  },
  {
    name: 'Jonathan Bii (Chelule)',
    county: 'Uasin Gishu',
    party: 'UDA',
    coalition: 'Kenya Kwanza Alliance',
    termStart: '2022-08-22',
    promises: [
      { category: 'Agriculture', description: 'Support maize farmers and improve food security', status: 'in_progress', evidence: 'Agricultural subsidy programs; input distribution', source: 'County Reports' },
      { category: 'Infrastructure', description: 'Maintain and expand county road network', status: 'in_progress', evidence: 'Road construction and maintenance ongoing', source: 'CoB Report' },
      { category: 'Healthcare', description: 'Upgrade health facilities in all sub-counties', status: 'in_progress', evidence: 'Hospital upgrades ongoing', source: 'CIDP' },
      { category: 'Education', description: 'Expand ECDE centers and vocational training', status: 'in_progress', evidence: 'ECDE construction; VTCs established', source: 'County Budget' },
      { category: 'Governance', description: 'Improve transparency and accountability', status: 'not_started', evidence: 'Plans documented; implementation tracking limited', source: 'N/A' },
    ],
    overallProgress: 50,
    notes: 'Dev absorption: 55% FY 2024/25. Qualified audit opinion.',
  },
];

export default function ManifestoTrackerPage() {
  const [selectedGovernor, setSelectedGovernor] = useState<GovernorTracking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredGovernors = useMemo(() => {
    if (statusFilter === 'all') return trackedGovernors;
    return trackedGovernors.map(g => ({
      ...g,
      promises: g.promises.filter(p => p.status === statusFilter),
    })).filter(g => g.promises.length > 0);
  }, [statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { completed: 0, in_progress: 0, not_started: 0, blocked: 0 };
    trackedGovernors.forEach(g => g.promises.forEach(p => { counts[p.status]++; }));
    return counts;
  }, []);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Target className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Campaign Manifesto Tracker</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Tracking campaign promises against delivery data from CIDP plans, CoB budget implementation reviews, OAG audit findings, and publicly available county reports.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-emerald-500/20 rounded-lg text-[11px] font-medium text-emerald-300 flex items-center gap-1"><Target className="h-3 w-3" /> 10 Governors</span>
              <span className="px-2.5 py-1 bg-blue-500/20 rounded-lg text-[11px] font-medium text-blue-300 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {statusCounts.completed} Completed</span>
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[11px] font-medium text-amber-300 flex items-center gap-1"><Clock className="h-3 w-3" /> {statusCounts.in_progress} In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <span className="font-bold">Disclaimer:</span> Individual manifesto tracking requires primary research — verifying each promise against official county reports, CoB reviews, OAG audits, and ground-level citizen feedback.
              The tracking shown here uses publicly available data and may not reflect the complete picture. For comprehensive manifesto tracking, cross-reference with CIDP plans, county budget documents, and official county communication channels.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-40 text-xs border-stone-200 dark:border-stone-700"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <Badge key={key} variant="outline" className="text-[10px] gap-1">
                  {cfg.icon} {cfg.label}: {statusCounts[key as DeliveryStatus]}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governor Cards */}
      <div className="space-y-3">
        {filteredGovernors.map((gov, idx) => (
          <Card key={gov.county} className={`border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 ${selectedGovernor?.county === gov.county ? 'ring-2 ring-emerald-500' : ''} transition-all cursor-pointer hover:border-slate-300`} onClick={() => setSelectedGovernor(selectedGovernor?.county === gov.county ? null : gov)}>
            <CardContent className="py-4 px-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Governor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{gov.name}</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{gov.county} County — {gov.party} ({gov.coalition === 'Kenya Kwanza Alliance' ? 'KK' : 'Azimio'})</p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">Delivery</span>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">{gov.overallProgress}%</span>
                    </div>
                    <Progress value={gov.overallProgress} className="h-2" />
                  </div>
                  <div className="flex gap-1">
                    {gov.promises.map((p, i) => (
                      <div key={i} className={`h-5 w-5 rounded-sm flex items-center justify-center ${STATUS_CONFIG[p.status].bg} border`} title={`${p.category}: ${STATUS_CONFIG[p.status].label}`}>
                        {STATUS_CONFIG[p.status].icon}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expanded promises */}
              {selectedGovernor?.county === gov.county && (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mb-1">{gov.notes}</p>
                  {gov.promises.map((promise, i) => (
                    <div key={i} className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="text-[9px] h-5 shrink-0">{promise.category}</Badge>
                          <p className="text-[11px] text-stone-700 dark:text-stone-200 truncate">{promise.description}</p>
                        </div>
                        <Badge className={`text-[9px] h-5 shrink-0 ${STATUS_CONFIG[promise.status].bg}`}>
                          {STATUS_CONFIG[promise.status].icon} {STATUS_CONFIG[promise.status].label}
                        </Badge>
                      </div>
                      {promise.evidence && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1.5">{promise.evidence}</p>
                      )}
                      {promise.source && (
                        <p className="text-[9px] text-emerald-600 mt-0.5">Source: {promise.source}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sources */}
      <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <CardContent className="py-3 px-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">Data Sources</p>
            <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
              <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
              <span>CIDP Plans: County Integrated Development Plans 2023-2027 — each county&apos;s 5-year strategic plan</span>
            </div>
            <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
              <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
              <span>CoB Budget Implementation Reviews: <DownloadLink href="https://cob.go.ke/county-budget-implementation-review-reports/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">cob.go.ke</DownloadLink></span>
            </div>
            <div className="flex items-start gap-1.5 text-[10px] text-stone-600 dark:text-stone-300">
              <ChevronRight className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
              <span>OAG Audit Reports: <DownloadLink href="https://www.oagkenya.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">oagkenya.go.ke</DownloadLink></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
