'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { getAllLeadership, CountyLeadershipData } from '@/data/county-leadership';
import { getCountyBudget, CountyBudgetRecord } from '@/data/county-budget-data';
import { getCountyAuditRecords, CountyAuditRecord } from '@/data/county-audit-data';
import { getAuditColor, AuditOpinion } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RepresentativePreviewGrid } from '@/components/representative-preview';
import {
  ChevronDown, ChevronRight, User, Building2, Landmark, Users,
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Shield, FileText, ExternalLink,
  MapPin, Stethoscope, GraduationCap, Droplets, Truck, Leaf,
  Handshake, Scale, Eye, Briefcase, Heart, Award,
  Search, Shuffle, ChevronsUpDown, ChevronsDownUp, Globe,
  IdCard,
} from 'lucide-react';
import RepChatWidget from '@/components/rep-chat-widget';
import RepAvatar from '@/components/rep-avatar';

// ─── County List (all 47) ──────────────────────────────────────────

const COUNTY_LIST = [
  { code: '001', name: 'Mombasa' },
  { code: '002', name: 'Kwale' },
  { code: '003', name: 'Kilifi' },
  { code: '004', name: 'Tana River' },
  { code: '005', name: 'Lamu' },
  { code: '006', name: 'Taita Taveta' },
  { code: '007', name: 'Garissa' },
  { code: '008', name: 'Wajir' },
  { code: '009', name: 'Mandera' },
  { code: '010', name: 'Marsabit' },
  { code: '011', name: 'Isiolo' },
  { code: '012', name: 'Meru' },
  { code: '013', name: 'Tharaka Nithi' },
  { code: '014', name: 'Embu' },
  { code: '015', name: 'Kitui' },
  { code: '016', name: 'Machakos' },
  { code: '017', name: 'Makueni' },
  { code: '018', name: 'Nyandarua' },
  { code: '019', name: 'Nyeri' },
  { code: '020', name: 'Kirinyaga' },
  { code: '021', name: "Murang'a" },
  { code: '022', name: 'Kiambu' },
  { code: '023', name: 'Turkana' },
  { code: '024', name: 'West Pokot' },
  { code: '025', name: 'Samburu' },
  { code: '026', name: 'Trans Nzoia' },
  { code: '027', name: 'Uasin Gishu' },
  { code: '028', name: 'Elgeyo Marakwet' },
  { code: '029', name: 'Nandi' },
  { code: '030', name: 'Baringo' },
  { code: '031', name: 'Laikipia' },
  { code: '032', name: 'Nakuru' },
  { code: '033', name: 'Narok' },
  { code: '034', name: 'Kajiado' },
  { code: '035', name: 'Kericho' },
  { code: '036', name: 'Bomet' },
  { code: '037', name: 'Kakamega' },
  { code: '038', name: 'Vihiga' },
  { code: '039', name: 'Bungoma' },
  { code: '040', name: 'Busia' },
  { code: '041', name: 'Siaya' },
  { code: '042', name: 'Kisumu' },
  { code: '043', name: 'Homa Bay' },
  { code: '044', name: 'Migori' },
  { code: '045', name: 'Kisii' },
  { code: '046', name: 'Nyamira' },
  { code: '047', name: 'Nairobi City' },
];

// ─── County Metadata (population, area, capital) ────────────────────

const COUNTY_METADATA: Record<string, { population: number; area: number; capital: string }> = {
  '001': { population: 1200000, area: 212.5, capital: 'Mombasa' },
  '002': { population: 870000, area: 8270, capital: 'Kwale' },
  '003': { population: 1400000, area: 12410, capital: 'Kilifi' },
  '004': { population: 310000, area: 38500, capital: 'Hola' },
  '005': { population: 143000, area: 6820, capital: 'Lamu' },
  '006': { population: 340000, area: 17040, capital: 'Voi' },
  '007': { population: 840000, area: 45720, capital: 'Garissa' },
  '008': { population: 820000, area: 55800, capital: 'Wajir' },
  '009': { population: 1040000, area: 25990, capital: 'Mandera' },
  '010': { population: 460000, area: 70900, capital: 'Marsabit' },
  '011': { population: 268000, area: 5570, capital: 'Isiolo' },
  '012': { population: 900000, area: 17100, capital: 'Meru' },
  '013': { population: 400000, area: 1560, capital: 'Chuka' },
  '014': { population: 600000, area: 2800, capital: 'Embu' },
  '015': { population: 1100000, area: 24300, capital: 'Kitui' },
  '016': { population: 1500000, area: 5950, capital: 'Machakos' },
  '017': { population: 1000000, area: 8100, capital: 'Wote' },
  '018': { population: 640000, area: 3240, capital: 'Ol Kalou' },
  '019': { population: 760000, area: 4760, capital: 'Nyeri' },
  '020': { population: 620000, area: 1470, capital: 'Kerugoya' },
  '021': { population: 1100000, area: 2360, capital: "Murang'a" },
  '022': { population: 2500000, area: 2325, capital: 'Kiambu' },
  '023': { population: 1000000, area: 68300, capital: 'Lodwar' },
  '024': { population: 620000, area: 9100, capital: 'Kapenguria' },
  '025': { population: 310000, area: 20500, capital: 'Maralal' },
  '026': { population: 990000, area: 2490, capital: 'Kitale' },
  '027': { population: 1700000, area: 3340, capital: 'Eldoret' },
  '028': { population: 460000, area: 3050, capital: 'Iten' },
  '029': { population: 830000, area: 2880, capital: 'Kapsabet' },
  '030': { population: 670000, area: 10900, capital: 'Kabarnet' },
  '031': { population: 530000, area: 9620, capital: 'Nanyuki' },
  '032': { population: 2200000, area: 7100, capital: 'Nakuru' },
  '033': { population: 1160000, area: 12950, capital: 'Narok' },
  '034': { population: 1100000, area: 21700, capital: 'Kajiado' },
  '035': { population: 590000, area: 2480, capital: 'Kericho' },
  '036': { population: 780000, area: 2000, capital: 'Bomet' },
  '037': { population: 1900000, area: 3030, capital: 'Kakamega' },
  '038': { population: 560000, area: 1310, capital: 'Vihiga' },
  '039': { population: 1700000, area: 3030, capital: 'Bungoma' },
  '040': { population: 890000, area: 1630, capital: 'Busia' },
  '041': { population: 1000000, area: 2530, capital: 'Siaya' },
  '042': { population: 1200000, area: 2085, capital: 'Kisumu' },
  '043': { population: 1200000, area: 3190, capital: 'Homa Bay' },
  '044': { population: 1000000, area: 2610, capital: 'Migori' },
  '045': { population: 1300000, area: 1330, capital: 'Kisii' },
  '046': { population: 610000, area: 900, capital: 'Nyamira' },
  '047': { population: 4400000, area: 696, capital: 'Nairobi' },
};

// ─── Sample Leadership Data (used when real data is empty) ──────────

// Normalizer: maps data file fields to component-expected shape
function normalizeLeadershipData(raw: any) {
  return {
    countyCode: raw.countyCode,
    countyName: raw.countyName,
    region: raw.region,
    governor: {
      fullName: raw.governor?.name || raw.governor?.fullName || 'Governor (TBD)',
      politicalParty: raw.governor?.party || raw.governor?.politicalParty || '-',
      coalition: raw.governor?.coalition || undefined,
    },
    deputyGovernor: {
      fullName: raw.deputyGovernor?.name || raw.deputyGovernor?.fullName || 'Deputy (TBD)',
      politicalParty: raw.deputyGovernor?.party || '-',
      coalition: raw.deputyGovernor?.coalition || undefined,
    },
    countySecretary: { fullName: raw.countySecretary?.name || 'County Secretary (TBD)' },
    cecMembers: (raw.cecms || []).map((c: any) => ({
      portfolio: c.portfolio || c.name || 'Unknown',
      fullName: c.name || c.fullName || 'CEC (TBD)',
    })),
    assembly: {
      speaker: {
        fullName: raw.assemblySpeaker?.name || 'Speaker (TBD)',
        politicalParty: raw.assemblySpeaker?.party || '-',
      },
      wardCount: raw.assemblySpeaker ? 30 : 0,
    },
    senator: {
      fullName: raw.senator?.name || raw.senator?.fullName || 'Senator (TBD)',
      politicalParty: raw.senator?.party || '-',
      coalition: raw.senator?.coalition || undefined,
    },
    womanRep: {
      fullName: raw.womanRep?.name || raw.womanRep?.fullName || 'Woman Rep (TBD)',
      politicalParty: raw.womanRep?.party || '-',
      coalition: raw.womanRep?.coalition || undefined,
    },
    constituencies: (raw.constituencies || []).map((con: any) => ({
      name: con.name,
      mp: {
        fullName: con.mp?.name || con.mp?.fullName || 'MP (TBD)',
        politicalParty: con.mp?.party || '-',
        coalition: con.mp?.coalition || undefined,
      },
      wards: (con.wards || []).map((w: any) => ({
        name: w.name,
        mca: { fullName: w.mca || 'MCA (TBD)' },
      })),
    })),
  };
}

function generateSampleLeadership(countyCode: string, countyName: string): CountyLeadershipData {
  return {
    countyCode,
    countyName,
    region: 'Sample Region',
    governor: { fullName: 'Hon. Governor (TBD)', politicalParty: '-', coalition: undefined },
    deputyGovernor: { fullName: 'Deputy Governor (TBD)' },
    countySecretary: { fullName: 'County Secretary (TBD)' },
    cecMembers: [
      { portfolio: 'Finance', fullName: 'CEC Finance (TBD)' },
      { portfolio: 'Health', fullName: 'CEC Health (TBD)' },
      { portfolio: 'Education', fullName: 'CEC Education (TBD)' },
      { portfolio: 'Infrastructure', fullName: 'CEC Infrastructure (TBD)' },
      { portfolio: 'Agriculture', fullName: 'CEC Agriculture (TBD)' },
    ],
    assembly: {
      speaker: { fullName: 'Speaker (TBD)' },
      wardCount: 30,
    },
    senator: { fullName: 'Senator (TBD)' },
    womanRep: { fullName: 'Woman Rep (TBD)' },
    constituencies: [
      {
        name: `${countyName} Central`,
        mp: { fullName: 'MP (TBD)' },
        wards: [
          { name: 'Ward A', mca: { fullName: 'MCA (TBD)' } },
          { name: 'Ward B', mca: { fullName: 'MCA (TBD)' } },
        ],
      },
      {
        name: `${countyName} West`,
        mp: { fullName: 'MP (TBD)' },
        wards: [
          { name: 'Ward C', mca: { fullName: 'MCA (TBD)' } },
        ],
      },
    ],
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-lime-100 text-lime-700',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function portfolioIcon(portfolio: string) {
  const lower = portfolio.toLowerCase();
  if (lower.includes('health') || lower.includes('medical')) return <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('education') || lower.includes('learn')) return <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('water') || lower.includes('irrigation')) return <Droplets className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('road') || lower.includes('infra') || lower.includes('transport')) return <Truck className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('agric') || lower.includes('livestock')) return <Leaf className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('finance') || lower.includes('treasury') || lower.includes('economic')) return <DollarSign className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('trade') || lower.includes('cooper')) return <Handshake className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('land') || lower.includes('housing') || lower.includes('urban')) return <Building2 className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('youth') || lower.includes('gender') || lower.includes('sport') || lower.includes('culture')) return <Award className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('admin') || lower.includes('devolution') || lower.includes('service')) return <Briefcase className="h-3.5 w-3.5 text-emerald-600" />;
  if (lower.includes('tourism') || lower.includes('environment')) return <MapPin className="h-3.5 w-3.5 text-emerald-600" />;
  return <Briefcase className="h-3.5 w-3.5 text-emerald-600" />;
}

function formatCurrency(millions: number): string {
  if (millions >= 1000) return `KSh ${(millions / 1000).toFixed(1)}B`;
  return `KSh ${millions.toFixed(0)}M`;
}

function formatBillions(billions: number): string {
  return `KSh ${billions.toFixed(1)}B`;
}

// ─── Tree Node Component ────────────────────────────────────────────

function TreeNode({
  label,
  icon,
  children,
  defaultOpen = false,
  badge,
  forceOpen,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  forceOpen?: boolean | null;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = forceOpen !== undefined && forceOpen !== null ? forceOpen : internalOpen;
  return (
    <div>
      <button
        onClick={() => {
          if (forceOpen === undefined || forceOpen === null) setInternalOpen(!internalOpen);
        }}
        className="flex items-center gap-2 w-full text-left py-1.5 px-1 rounded-md hover:bg-emerald-50 dark:bg-emerald-950 transition-colors group"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-emerald-600 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 text-emerald-600 shrink-0" />
        )}
        <span className="shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{label}</span>
        {badge && (
          <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div className="ml-4 border-l-2 border-emerald-200 pl-3 mt-1 space-y-1">{children}</div>
      )}
    </div>
  );
}

// ─── Person Row Component ──────────────────────────────────────────

function PersonRow({
  name,
  party,
  coalition,
  role,
  icon,
  countyName,
}: {
  name: string;
  party?: string;
  coalition?: string;
  role: string;
  icon?: React.ReactNode;
  countyName?: string;
}) {
  const isPlaceholder = name.includes('(TBD)');
  return (
    <div className="relative flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 dark:hover:bg-gray-900 dark:bg-gray-900 transition-colors">
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        isPlaceholder ? (
          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-400">
            {getInitials(name)}
          </div>
        ) : (
          <RepAvatar name={name} county={countyName} size="h-6 w-6" />
        )
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-medium truncate ${
              isPlaceholder ? 'text-gray-400 italic' : 'text-gray-800 dark:text-gray-100'
            }`}
          >
            {name}
          </span>
          {coalition && !isPlaceholder && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 font-normal border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950"
            >
              {coalition}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {party && !isPlaceholder && party !== '-' && (
            <span className="text-[10px] text-gray-400">{party}</span>
          )}
          <span className="text-[10px] text-gray-400">· {role}</span>
        </div>
      </div>
      {!isPlaceholder && (
        <RepChatWidget rep={{ name, title: role, county: countyName, party, coalition }} />
      )}
    </div>
  );
}

// ─── CEC Row Component ─────────────────────────────────────────────

function CECRow({ portfolio, fullName }: { portfolio: string; fullName: string }) {
  return (
    <div className="flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 dark:hover:bg-gray-900 dark:bg-gray-900 transition-colors">
      {portfolioIcon(portfolio)}
      <div className="min-w-0 flex-1">
        <span
          className={`text-[11px] font-medium truncate ${
            fullName.includes('(TBD)') ? 'text-gray-400 italic' : 'text-gray-700 dark:text-gray-200'
          }`}
        >
          {fullName}
        </span>
        <span className="text-[10px] text-gray-400 ml-1.5">{portfolio}</span>
      </div>
    </div>
  );
}

// ─── Ward Row Component ─────────────────────────────────────────────

function WardRow({ wardName, mcaName }: { wardName: string; mcaName?: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5 px-1">
      <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
      <span className="text-[11px] text-gray-600 dark:text-gray-300">{wardName}</span>
      {mcaName && <span className="text-[10px] text-gray-400">— {mcaName}</span>}
    </div>
  );
}

// ─── Audit Opinion Badge ───────────────────────────────────────────

function AuditBadge({ opinion }: { opinion: AuditOpinion | string | null | undefined }) {
  if (!opinion) {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700">
        N/A
      </span>
    );
  }
  const colorMap: Record<string, string> = {
    Unmodified: 'bg-green-100 text-green-700 border-green-300',
    Qualified: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Adverse: 'bg-orange-100 text-orange-700 border-orange-300',
    Disclaimer: 'bg-red-100 text-red-700 border-red-300',
  };
  const colorClass = colorMap[opinion] || 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600';
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colorClass}`}>
      {opinion}
    </span>
  );
}

// ─── Horizontal Bar Component ───────────────────────────────────────

function HorizontalBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export default function CountyLeadershipTreePage() {
  const [selectedCounty, setSelectedCounty] = useState<string>('');

  const leadershipData = useMemo(() => {
    try {
      return getAllLeadership();
    } catch {
      return [];
    }
  }, []);

  const currentCounty = useMemo(() => {
    if (!selectedCounty) return null;
    const real = leadershipData.find((c) => c.countyCode === selectedCounty);
    if (real) return normalizeLeadershipData(real);
    const countyName = COUNTY_LIST.find((c) => c.code === selectedCounty)?.name || selectedCounty;
    return generateSampleLeadership(selectedCounty, countyName);
  }, [selectedCounty, leadershipData]);

  const budgetData = useMemo(() => {
    if (!selectedCounty) return null;
    try {
      return getCountyBudget(selectedCounty);
    } catch {
      return null;
    }
  }, [selectedCounty]);

  const auditData = useMemo(() => {
    if (!selectedCounty) return [];
    try {
      return getCountyAuditRecords(selectedCounty);
    } catch {
      return [];
    }
  }, [selectedCounty]);

  const latestAudit = useMemo(() => {
    if (auditData.length === 0) return null;
    return auditData.sort((a, b) => b.financialYear.localeCompare(a.financialYear))[0];
  }, [auditData]);

  const expenseBreakdown = useMemo(() => {
    if (!budgetData) return null;
    const total = budgetData.totalBudget;
    if (total <= 0) return null;
    return [
      { label: 'Health', pct: 22, color: 'bg-rose-400', icon: <Stethoscope className="h-3 w-3" /> },
      { label: 'Education', pct: 18, color: 'bg-amber-400', icon: <GraduationCap className="h-3 w-3" /> },
      { label: 'Infrastructure', pct: 20, color: 'bg-sky-400', icon: <Truck className="h-3 w-3" /> },
      { label: 'Agriculture', pct: 12, color: 'bg-emerald-400', icon: <Leaf className="h-3 w-3" /> },
      { label: 'Admin', pct: 18, color: 'bg-violet-400', icon: <Briefcase className="h-3 w-3" /> },
      { label: 'Other', pct: 10, color: 'bg-gray-400', icon: <FileText className="h-3 w-3" /> },
    ];
  }, [budgetData]);

  const pendingBillsSeverity = useMemo(() => {
    if (!budgetData) return { color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900', label: 'N/A' };
    const bills = budgetData.pendingBills;
    const totalBudgetM = budgetData.totalBudget * 1000;
    if (bills === 0) return { color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900', label: 'None reported' };
    if (bills > totalBudgetM * 0.5) return { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', label: 'Critical' };
    if (bills > totalBudgetM * 0.3) return { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', label: 'High' };
    if (bills > totalBudgetM * 0.15) return { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', label: 'Moderate' };
    return { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', label: 'Low' };
  }, [budgetData]);

  // ── New state: search, tabs, expand/collapse, refs ──
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('leadership');
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  const financialRef = useRef<HTMLDivElement>(null);
  const auditRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const leadershipRef = useRef<HTMLDivElement>(null);
  const representativesRef = useRef<HTMLDivElement>(null);

  const filteredCounties = useMemo(() => {
    if (!searchQuery.trim()) return COUNTY_LIST;
    const q = searchQuery.toLowerCase();
    return COUNTY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        (COUNTY_METADATA[c.code]?.capital || '').toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const handleRandomCounty = useCallback(() => {
    const idx = Math.floor(Math.random() * COUNTY_LIST.length);
    setSelectedCounty(COUNTY_LIST[idx].code);
    setSearchQuery('');
  }, []);

  const scrollToSection = useCallback((tab: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      if (tab === 'financial') financialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tab === 'audit') auditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tab === 'contact') contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tab === 'leadership') leadershipRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tab === 'representatives') representativesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const dataQuality = useMemo(() => {
    if (!currentCounty) return null;
    const govOk = !currentCounty.governor?.fullName.includes('(TBD)');
    const cecTotal = currentCounty.cecMembers?.length || 0;
    const cecVerified = currentCounty.cecMembers?.filter((c) => !c.fullName.includes('(TBD)')).length || 0;
    let mcaTotal = 0;
    let mcaVerified = 0;
    currentCounty.constituencies?.forEach((con) => {
      con.wards?.forEach((w) => {
        mcaTotal++;
        if (w.mca?.fullName && !w.mca.fullName.includes('(TBD)')) mcaVerified++;
      });
    });
    if (govOk && cecVerified >= 3) return { level: 'verified', label: 'Verified Data', cecVerified, cecTotal, mcaVerified, mcaTotal };
    if (cecVerified > 0 || mcaVerified > 0) return { level: 'partial', label: 'Partial Data', cecVerified, cecTotal, mcaVerified, mcaTotal };
    return { level: 'placeholder', label: 'Placeholder Data', cecVerified, cecTotal, mcaVerified, mcaTotal };
  }, [currentCounty]);

  const countyMeta = useMemo(() => {
    if (!selectedCounty) return null;
    return COUNTY_METADATA[selectedCounty] || null;
  }, [selectedCounty]);

  const totalWards = useMemo(() => {
    if (!currentCounty) return 0;
    return currentCounty.constituencies?.reduce((sum, con) => sum + (con.wards?.length || 0), 0) || 0;
  }, [currentCounty]);

  const totalConstituencies = useMemo(() => {
    if (!currentCounty) return 0;
    return currentCounty.constituencies?.length || 0;
  }, [currentCounty]);

  return (
    <div className="space-y-4">
      {/* ── County Selector ──────────────────────────────────────── */}
      <Card className="border-emerald-200">
        <CardContent className="p-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search counties by name, code, or capital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select County</span>
            </div>
            <Select value={selectedCounty} onValueChange={(v) => { setSelectedCounty(v); setExpandAll(null); }}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Choose a county..." />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {filteredCounties.length === 0 && (
                  <div className="px-2 py-3 text-xs text-gray-400 text-center">No counties match your search.</div>
                )}
                {filteredCounties.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-6">{c.code}</span>
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950"
              onClick={handleRandomCounty}
            >
              <Shuffle className="h-3 w-3" />
              Random
            </Button>
            {selectedCounty && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 text-xs gap-1 ${expandAll === true ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 dark:hover:bg-gray-900 dark:bg-gray-900'}`}
                  onClick={() => setExpandAll(true)}
                >
                  <ChevronsUpDown className="h-3 w-3" />
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 text-xs gap-1 ${expandAll === false ? 'bg-gray-100 dark:bg-gray-800 border-gray-400 text-gray-800 dark:text-gray-100' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 dark:bg-gray-900 dark:hover:bg-gray-900 dark:bg-gray-900'}`}
                  onClick={() => setExpandAll(false)}
                >
                  <ChevronsDownUp className="h-3 w-3" />
                  Collapse All
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── County Overview Stats Bar ────────────────────────────── */}
      {selectedCounty && countyMeta && (
        <Card className="border-emerald-200">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="text-center">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Population</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{(countyMeta.population / 1000000).toFixed(1)}M</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Area</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{countyMeta.area.toLocaleString()} km²</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Constituencies</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{totalConstituencies}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Wards</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">{totalWards}</div>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">MCA Verified</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5">
                  {dataQuality ? `${dataQuality.mcaVerified}/${dataQuality.mcaTotal}` : '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Empty State ──────────────────────────────────────────── */}
      {!selectedCounty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-4">
            <Landmark className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">County Leadership Explorer</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Select a county above to view the leadership hierarchy and financial dashboard.
            Explore governors, MCAs, MPs, budget data, and audit opinions.
          </p>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      {selectedCounty && currentCounty && (
        <>
          {/* ── Mini Navigation Tabs ─────────────────────────────── */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { key: 'leadership', label: 'Leadership', icon: <Users className="h-3 w-3" /> },
              { key: 'representatives', label: 'Representatives', icon: <IdCard className="h-3 w-3" /> },
              { key: 'financial', label: 'Financial', icon: <DollarSign className="h-3 w-3" /> },
              { key: 'audit', label: 'Audit', icon: <Shield className="h-3 w-3" /> },
              { key: 'contact', label: 'Contact', icon: <Globe className="h-3 w-3" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-800 dark:bg-gray-800 border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            {dataQuality && (
              <Badge
                className={`ml-auto text-[10px] shrink-0 ${
                  dataQuality.level === 'verified'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : dataQuality.level === 'partial'
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                }`}
                variant="outline"
              >
                {dataQuality.level === 'verified' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {dataQuality.label}
              </Badge>
            )}
          </div>
          {dataQuality && (dataQuality.cecTotal > 0 || dataQuality.mcaTotal > 0) && (
            <p className="text-[10px] text-gray-400 -mt-2">
              {dataQuality.cecTotal > 0 && `${dataQuality.cecVerified}/${dataQuality.cecTotal} CECMs verified`}
              {dataQuality.cecTotal > 0 && dataQuality.mcaTotal > 0 && ', '}
              {dataQuality.mcaTotal > 0 && `${dataQuality.mcaVerified}/${dataQuality.mcaTotal} MCAs verified`}
            </p>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ─── LEFT COLUMN: Leadership Tree (55%) ──────────────── */}
          <div className="lg:col-span-7 space-y-3" ref={leadershipRef}>
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {currentCounty.countyName} — Leadership Structure
                    </CardTitle>
                    {dataQuality && (
                      <Badge
                        className={`text-[10px] ${
                          dataQuality.level === 'verified'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : dataQuality.level === 'partial'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
                        }`}
                        variant="outline"
                      >
                        {dataQuality.label}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                    {currentCounty.countyCode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="max-h-[72vh] overflow-y-auto pr-1 space-y-1">
                  {/* County Executive */}
                  <TreeNode
                    label="County Executive"
                    icon={<Building2 className="h-3.5 w-3.5 text-emerald-600" />}
                    defaultOpen={true}
                    forceOpen={expandAll}
                  >
                    {currentCounty.governor && (
                      <PersonRow
                        name={currentCounty.governor.fullName}
                        party={currentCounty.governor.politicalParty}
                        coalition={currentCounty.governor.coalition}
                        role="Governor"
                        countyName={currentCounty.countyName}
                      />
                    )}
                    {currentCounty.deputyGovernor && (
                      <PersonRow
                        name={currentCounty.deputyGovernor.fullName}
                        party={currentCounty.deputyGovernor.politicalParty}
                        coalition={currentCounty.deputyGovernor.coalition}
                        role="Deputy Governor"
                        countyName={currentCounty.countyName}
                      />
                    )}
                    {currentCounty.countySecretary && (
                      <PersonRow
                        name={currentCounty.countySecretary.fullName}
                        role="County Secretary"
                        countyName={currentCounty.countyName}
                      />
                    )}
                    {currentCounty.cecMembers && currentCounty.cecMembers.length > 0 && (
                      <div className="mt-1">
                        <TreeNode
                          label="CEC Members"
                          icon={<Users className="h-3.5 w-3.5 text-emerald-600" />}
                          defaultOpen={true}
                          badge={`${currentCounty.cecMembers.length}`}
                          forceOpen={expandAll}
                        >
                          {currentCounty.cecMembers.map((cec, i) => (
                            <CECRow
                              key={`cec-${i}`}
                              portfolio={cec.portfolio}
                              fullName={cec.fullName}
                            />
                          ))}
                        </TreeNode>
                      </div>
                    )}
                  </TreeNode>

                  {/* County Assembly */}
                  <TreeNode
                    label="County Assembly"
                    icon={<Landmark className="h-3.5 w-3.5 text-emerald-600" />}
                    defaultOpen={false}
                    forceOpen={expandAll}
                    badge={
                      currentCounty.assembly
                        ? `${currentCounty.assembly.wardCount} Wards`
                        : undefined
                    }
                  >
                    {currentCounty.assembly?.speaker && (
                      <PersonRow
                        name={currentCounty.assembly.speaker.fullName}
                        party={currentCounty.assembly.speaker.politicalParty}
                        coalition={currentCounty.assembly.speaker.coalition}
                        role="Speaker"
                        countyName={currentCounty.countyName}
                      />
                    )}
                    {currentCounty.assembly && (
                      <div className="text-[10px] text-gray-400 px-1 py-0.5">
                        {currentCounty.assembly.wardCount} Ward Representatives (MCAs)
                      </div>
                    )}
                  </TreeNode>

                  {/* Senate Representatives */}
                  <TreeNode
                    label="Senate Representatives"
                    icon={<Scale className="h-3.5 w-3.5 text-emerald-600" />}
                    defaultOpen={false}
                    forceOpen={expandAll}
                  >
                    {currentCounty.senator && (
                      <PersonRow
                        name={currentCounty.senator.fullName}
                        party={currentCounty.senator.politicalParty}
                        coalition={currentCounty.senator.coalition}
                        role="Senator"
                        countyName={currentCounty.countyName}
                      />
                    )}
                    {currentCounty.womanRep && (
                      <PersonRow
                        name={currentCounty.womanRep.fullName}
                        party={currentCounty.womanRep.politicalParty}
                        coalition={currentCounty.womanRep.coalition}
                        role="Woman Representative"
                        countyName={currentCounty.countyName}
                      />
                    )}
                  </TreeNode>

                  {/* Constituencies */}
                  <TreeNode
                    label="Constituencies"
                    icon={<MapPin className="h-3.5 w-3.5 text-emerald-600" />}
                    defaultOpen={false}
                    forceOpen={expandAll}
                    badge={
                      currentCounty.constituencies
                        ? `${currentCounty.constituencies.length}`
                        : undefined
                    }
                  >
                    {currentCounty.constituencies &&
                      currentCounty.constituencies.map((constituency, ci) => (
                        <div key={`con-${ci}`}>
                          <TreeNode
                            label={constituency.name}
                            icon={<User className="h-3.5 w-3.5 text-emerald-600" />}
                            defaultOpen={false}
                            forceOpen={expandAll}
                          >
                            {constituency.mp && (
                              <PersonRow
                                name={constituency.mp.fullName}
                                party={constituency.mp.politicalParty}
                                coalition={constituency.mp.coalition}
                                role="Member of Parliament"
                                countyName={currentCounty.countyName}
                              />
                            )}
                            {constituency.wards && constituency.wards.length > 0 && (
                              <div className="mt-0.5">
                                <TreeNode
                                  label={`${constituency.wards.length} Wards`}
                                  icon={<Users className="h-3 w-3 text-gray-400" />}
                                  defaultOpen={false}
                                  forceOpen={expandAll}
                                >
                                  {constituency.wards.map((ward, wi) => (
                                    <WardRow
                                      key={`ward-${wi}`}
                                      wardName={ward.name}
                                      mcaName={ward.mca?.fullName}
                                    />
                                  ))}
                                </TreeNode>
                              </div>
                            )}
                          </TreeNode>
                        </div>
                      ))}
                  </TreeNode>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── REPRESENTATIVES & DUTIES (full width) ────────── */}
          <div className="lg:col-span-12 space-y-3" ref={representativesRef}>
            <Card className="border-emerald-200">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Representatives & Duties
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300 ml-auto">
                    Constitutional Mandates (Art. 95-179)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <RepresentativePreviewGrid
                  leadership={{
                    governor: {
                      name: currentCounty.governor?.fullName || '',
                      party: currentCounty.governor?.politicalParty || '',
                      coalition: currentCounty.governor?.coalition || '',
                    },
                    senator: {
                      name: currentCounty.senator?.fullName || '',
                      party: currentCounty.senator?.politicalParty || '',
                      coalition: currentCounty.senator?.coalition || '',
                    },
                    womanRep: {
                      name: currentCounty.womanRep?.fullName || '',
                      party: currentCounty.womanRep?.politicalParty || '',
                      coalition: currentCounty.womanRep?.coalition || '',
                    },
                    constituencies: currentCounty.constituencies?.map((con) => ({
                      name: con.name,
                      mp: {
                        name: con.mp?.fullName || '',
                        party: con.mp?.politicalParty || '',
                        coalition: con.mp?.coalition || '',
                      },
                      wards: con.wards?.map((w) => ({
                        name: w.name,
                        mca: w.mca?.fullName || '',
                      })) || [],
                    })) || [],
                  }}
                  countyName={currentCounty.countyName}
                  showExpanded={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* ─── RIGHT COLUMN: Financial Dashboard (45%) ────────── */}
          <div className="lg:col-span-5 space-y-3" ref={financialRef}>
            {/* Funding Sources Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">Funding Sources</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3">
                {budgetData ? (
                  <>
                    <HorizontalBar
                      label="Equitable Share"
                      value={budgetData.totalBudget - budgetData.ownSourceRevenue / 1000}
                      max={budgetData.totalBudget}
                      color="bg-emerald-400"
                    />
                    <HorizontalBar
                      label="Own Revenue"
                      value={budgetData.ownSourceRevenue / 1000}
                      max={budgetData.totalBudget}
                      color="bg-amber-400"
                    />
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Total: {formatBillions(budgetData.totalBudget)}</span>
                      <span>Own Rev: {formatCurrency(budgetData.ownSourceRevenue)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">No budget data available.</p>
                )}
              </CardContent>
            </Card>

            {/* Budget Absorption Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">Budget Absorption</CardTitle>
                </div>
                {budgetData && (
                  <p className="text-[10px] text-gray-400">
                    {budgetData.financialYear} · {budgetData.period}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3">
                {budgetData ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Development</span>
                        <span
                          className={`font-semibold ${
                            budgetData.devAbsorptionRate >= 50
                              ? 'text-emerald-600'
                              : budgetData.devAbsorptionRate >= 30
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {budgetData.devAbsorptionRate}%
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={budgetData.devAbsorptionRate} className="h-2.5" />
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                          style={{ left: '50%' }}
                          title="50% target"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-0.5 bg-red-400" />
                        <span className="text-[9px] text-gray-400">50% CoB Target</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Recurrent</span>
                        <span
                          className={`font-semibold ${
                            budgetData.recurrentAbsorptionRate >= 85
                              ? 'text-emerald-600'
                              : budgetData.recurrentAbsorptionRate >= 70
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {budgetData.recurrentAbsorptionRate}%
                        </span>
                      </div>
                      <Progress value={budgetData.recurrentAbsorptionRate} className="h-2.5" />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">No budget data available.</p>
                )}
              </CardContent>
            </Card>

            {/* Expense Breakdown Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">Expense Breakdown</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                {expenseBreakdown ? (
                  expenseBreakdown.map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No data available.</p>
                )}
              </CardContent>
            </Card>

            {/* Pending Bills Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">Pending Bills</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                {budgetData ? (
                  <div className="space-y-2">
                    <div className={`rounded-lg p-3 ${pendingBillsSeverity.bg}`}>
                      <div className={`text-lg font-bold ${pendingBillsSeverity.color}`}>
                        {formatCurrency(budgetData.pendingBills)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${pendingBillsSeverity.bg} ${pendingBillsSeverity.color} border border-current/20`}
                        >
                          {pendingBillsSeverity.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          of {formatBillions(budgetData.totalBudget)} total budget
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No data available.</p>
                )}
              </CardContent>
            </Card>

            {/* OAG Audit Card */}
            <div ref={auditRef}>
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">OAG Audit Opinion</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                {latestAudit ? (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <AuditBadge opinion={latestAudit.executiveOpinion} />
                      <span className="text-[10px] text-gray-400">
                        Executive · {latestAudit.financialYear}
                      </span>
                    </div>
                    {latestAudit.assemblyOpinion && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <AuditBadge opinion={latestAudit.assemblyOpinion} />
                        <span className="text-[10px] text-gray-400">Assembly</span>
                      </div>
                    )}
                    {latestAudit.keyFindings && latestAudit.keyFindings.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">Key Findings</span>
                        <ul className="space-y-1">
                          {latestAudit.keyFindings.slice(0, 3).map((f, i) => (
                            <li
                              key={i}
                              className="text-[10px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5"
                            >
                              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {latestAudit.source.url && (
                      <a
                        href={latestAudit.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-800 hover:underline mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View OAG Report
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">No audit data available.</p>
                )}
              </CardContent>
            </Card>
            </div>

            {/* Disbursement Summary Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">Disbursement Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                {budgetData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-3 text-center">
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">Total Allocation</div>
                        <div className="text-sm font-bold text-emerald-700">
                          {formatBillions(budgetData.totalBudget)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 text-center">
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">Est. Spending</div>
                        <div className="text-sm font-bold text-amber-700">
                          {formatBillions(
                            budgetData.totalBudget *
                              ((budgetData.devAbsorptionRate *
                                (budgetData.developmentBudget / budgetData.totalBudget) +
                                budgetData.recurrentAbsorptionRate *
                                  (budgetData.recurrentBudget / budgetData.totalBudget)) /
                                100),
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 dark:text-gray-400">Dev Budget</span>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                          {formatBillions(budgetData.developmentBudget)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 dark:text-gray-400">Recurrent Budget</span>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                          {formatBillions(budgetData.recurrentBudget)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500 dark:text-gray-400">Own Revenue</span>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                          {formatCurrency(budgetData.ownSourceRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No data available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── CONTACT CARD (below grid) ────────────────────── */}
          <div ref={contactRef} className="lg:col-span-12">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">County Contact & Links</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Capital Town</div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{countyMeta?.capital || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">County Code</div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">{selectedCounty}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Official Website</div>
                    {countyMeta ? (
                      <a
                        href={`https://${currentCounty.countyName.toLowerCase().replace(/\s+/g, '')}.go.ke`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-800 hover:underline mt-0.5"
                      >
                        {currentCounty.countyName.toLowerCase().replace(/\s+/g, '')}.go.ke
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 mt-0.5 block">N/A</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
