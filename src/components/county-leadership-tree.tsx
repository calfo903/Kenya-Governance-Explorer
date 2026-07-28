'use client';

import React, { useState, useMemo } from 'react';
import { getAllLeadership, CountyLeadershipData } from '@/data/county-leadership';
import { getCountyBudget, CountyBudgetRecord } from '@/data/county-budget-data';
import { getCountyAuditRecords, CountyAuditRecord } from '@/data/county-audit-data';
import { getAuditColor, AuditOpinion } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown, ChevronRight, User, Building2, Landmark, Users,
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Shield, FileText, ExternalLink,
  MapPin, Stethoscope, GraduationCap, Droplets, Truck, Leaf,
  Handshake, Scale, Eye, Briefcase, Heart, Award,
} from 'lucide-react';

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
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left py-1.5 px-1 rounded-md hover:bg-emerald-50 transition-colors group"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-emerald-600 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 text-emerald-600 shrink-0" />
        )}
        <span className="shrink-0">{icon}</span>
        <span className="text-xs font-semibold text-gray-800">{label}</span>
        {badge && (
          <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full">
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
}: {
  name: string;
  party?: string;
  coalition?: string;
  role: string;
  icon?: React.ReactNode;
}) {
  const isPlaceholder = name.includes('(TBD)');
  return (
    <div className="flex items-center gap-2.5 py-1.5 px-1 rounded-md hover:bg-gray-50 transition-colors">
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            isPlaceholder ? 'bg-gray-100 text-gray-400' : getAvatarColor(name)
          }`}
        >
          {getInitials(name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-medium truncate ${
              isPlaceholder ? 'text-gray-400 italic' : 'text-gray-800'
            }`}
          >
            {name}
          </span>
          {coalition && !isPlaceholder && (
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 font-normal border-emerald-300 text-emerald-700 bg-emerald-50"
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
    </div>
  );
}

// ─── CEC Row Component ─────────────────────────────────────────────

function CECRow({ portfolio, fullName }: { portfolio: string; fullName: string }) {
  return (
    <div className="flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 transition-colors">
      {portfolioIcon(portfolio)}
      <div className="min-w-0 flex-1">
        <span
          className={`text-[11px] font-medium truncate ${
            fullName.includes('(TBD)') ? 'text-gray-400 italic' : 'text-gray-700'
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
      <span className="text-[11px] text-gray-600">{wardName}</span>
      {mcaName && <span className="text-[10px] text-gray-400">— {mcaName}</span>}
    </div>
  );
}

// ─── Audit Opinion Badge ───────────────────────────────────────────

function AuditBadge({ opinion }: { opinion: AuditOpinion | string | null | undefined }) {
  if (!opinion) {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">
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
  const colorClass = colorMap[opinion] || 'bg-gray-100 text-gray-500 border-gray-300';
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
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
    if (!budgetData) return { color: 'text-gray-400', bg: 'bg-gray-50', label: 'N/A' };
    const bills = budgetData.pendingBills;
    const totalBudgetM = budgetData.totalBudget * 1000;
    if (bills === 0) return { color: 'text-gray-400', bg: 'bg-gray-50', label: 'None reported' };
    if (bills > totalBudgetM * 0.5) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' };
    if (bills > totalBudgetM * 0.3) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' };
    if (bills > totalBudgetM * 0.15) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Moderate' };
    return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Low' };
  }, [budgetData]);

  return (
    <div className="space-y-4">
      {/* ── County Selector ──────────────────────────────────────── */}
      <Card className="border-emerald-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">Select County</span>
            </div>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Choose a county..." />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {COUNTY_LIST.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-6">{c.code}</span>
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Empty State ──────────────────────────────────────────── */}
      {!selectedCounty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <Landmark className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">County Leadership Explorer</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Select a county above to view the leadership hierarchy and financial dashboard.
            Explore governors, MCAs, MPs, budget data, and audit opinions.
          </p>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      {selectedCounty && currentCounty && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ─── LEFT COLUMN: Leadership Tree (55%) ──────────────── */}
          <div className="lg:col-span-7 space-y-3">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-800">
                    {currentCounty.countyName} — Leadership Structure
                  </CardTitle>
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
                  >
                    {currentCounty.governor && (
                      <PersonRow
                        name={currentCounty.governor.fullName}
                        party={currentCounty.governor.politicalParty}
                        coalition={currentCounty.governor.coalition}
                        role="Governor"
                      />
                    )}
                    {currentCounty.deputyGovernor && (
                      <PersonRow
                        name={currentCounty.deputyGovernor.fullName}
                        party={currentCounty.deputyGovernor.politicalParty}
                        coalition={currentCounty.deputyGovernor.coalition}
                        role="Deputy Governor"
                      />
                    )}
                    {currentCounty.countySecretary && (
                      <PersonRow
                        name={currentCounty.countySecretary.fullName}
                        role="County Secretary"
                      />
                    )}
                    {currentCounty.cecMembers && currentCounty.cecMembers.length > 0 && (
                      <div className="mt-1">
                        <TreeNode
                          label="CEC Members"
                          icon={<Users className="h-3.5 w-3.5 text-emerald-600" />}
                          defaultOpen={true}
                          badge={`${currentCounty.cecMembers.length}`}
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
                  >
                    {currentCounty.senator && (
                      <PersonRow
                        name={currentCounty.senator.fullName}
                        party={currentCounty.senator.politicalParty}
                        coalition={currentCounty.senator.coalition}
                        role="Senator"
                      />
                    )}
                    {currentCounty.womanRep && (
                      <PersonRow
                        name={currentCounty.womanRep.fullName}
                        party={currentCounty.womanRep.politicalParty}
                        coalition={currentCounty.womanRep.coalition}
                        role="Woman Representative"
                      />
                    )}
                  </TreeNode>

                  {/* Constituencies */}
                  <TreeNode
                    label="Constituencies"
                    icon={<MapPin className="h-3.5 w-3.5 text-emerald-600" />}
                    defaultOpen={false}
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
                          >
                            {constituency.mp && (
                              <PersonRow
                                name={constituency.mp.fullName}
                                party={constituency.mp.politicalParty}
                                coalition={constituency.mp.coalition}
                                role="Member of Parliament"
                              />
                            )}
                            {constituency.wards && constituency.wards.length > 0 && (
                              <div className="mt-0.5">
                                <TreeNode
                                  label={`${constituency.wards.length} Wards`}
                                  icon={<Users className="h-3 w-3 text-gray-400" />}
                                  defaultOpen={false}
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

          {/* ─── RIGHT COLUMN: Financial Dashboard (45%) ────────── */}
          <div className="lg:col-span-5 space-y-3">
            {/* Funding Sources Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800">Funding Sources</CardTitle>
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
                  <CardTitle className="text-sm font-semibold text-gray-800">Budget Absorption</CardTitle>
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
                        <span className="font-medium text-gray-700">Development</span>
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
                        <span className="font-medium text-gray-700">Recurrent</span>
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
                  <CardTitle className="text-sm font-semibold text-gray-800">Expense Breakdown</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                {expenseBreakdown ? (
                  expenseBreakdown.map((item) => (
                    <div key={item.label} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                  <CardTitle className="text-sm font-semibold text-gray-800">Pending Bills</CardTitle>
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
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800">OAG Audit Opinion</CardTitle>
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
                        <span className="text-[10px] font-semibold text-gray-600">Key Findings</span>
                        <ul className="space-y-1">
                          {latestAudit.keyFindings.slice(0, 3).map((f, i) => (
                            <li
                              key={i}
                              className="text-[10px] text-gray-500 flex items-start gap-1.5"
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

            {/* Disbursement Summary Card */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm font-semibold text-gray-800">Disbursement Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                {budgetData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-emerald-50 p-3 text-center">
                        <div className="text-[10px] text-gray-500 font-medium mb-1">Total Allocation</div>
                        <div className="text-sm font-bold text-emerald-700">
                          {formatBillions(budgetData.totalBudget)}
                        </div>
                      </div>
                      <div className="rounded-lg bg-amber-50 p-3 text-center">
                        <div className="text-[10px] text-gray-500 font-medium mb-1">Est. Spending</div>
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
                        <span className="text-gray-500">Dev Budget</span>
                        <span className="text-gray-700 font-medium">
                          {formatBillions(budgetData.developmentBudget)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Recurrent Budget</span>
                        <span className="text-gray-700 font-medium">
                          {formatBillions(budgetData.recurrentBudget)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Own Revenue</span>
                        <span className="text-gray-700 font-medium">
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
        </div>
      )}
    </div>
  );
}
