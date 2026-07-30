'use client';

import React from 'react';
import {
  Crown, Scale, Heart, Building2, Users,
  Shield, FileText, Gavel, Landmark, Handshake,
  CheckCircle2, BookOpen, Clock, UserCheck,
  Briefcase, AlertTriangle, GraduationCap, DollarSign,
  Stethoscope, Truck, Leaf, Droplets, MapPin,
  Megaphone, Vote, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// ─── Role Mandates & Duties ──────────────────────────────────────────
// Based on the Constitution of Kenya 2010, County Government Act 2012,
// and the Standing Orders of the Senate and National Assembly.

interface RoleDuty {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface RoleMandate {
  roleTitle: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  duties: RoleDuty[];
  constitutionalBasis: string;
  termLength: string;
  salaryRange: string;
  oversightRole: string;
}

const ROLE_MANDATES: Record<string, RoleMandate> = {
  governor: {
    roleTitle: 'Governor',
    icon: <Crown className="h-5 w-5" />,
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    constitutionalBasis: 'Article 179, Constitution of Kenya 2010',
    termLength: '5 years (maximum two terms)',
    salaryRange: 'KSh 924,000–1.1M/month (SRC scale)',
    oversightRole: 'Oversees county executive; reports to county assembly',
    duties: [
      {
        title: 'County Chief Executive',
        description: 'Implement county legislation and national legislation within the county. Provide leadership in county governance and coordinate all county organs.',
        icon: <Building2 className="h-4 w-4 text-amber-600" />,
      },
      {
        title: 'Budget Preparation',
        description: 'Prepare annual county budget estimates and submit to the county assembly for approval. Oversee county finance management and ensure prudent expenditure.',
        icon: <DollarSign className="h-4 w-4 text-amber-600" />,
      },
      {
        title: 'Appointment Powers',
        description: 'Appoint the County Secretary, CEC Members, and other county public servants with approval of the county assembly. Dismiss CEC members with assembly consent.',
        icon: <UserCheck className="h-4 w-4 text-amber-600" />,
      },
      {
        title: 'Policy & Planning',
        description: 'Develop county integrated development plans, county spatial plans, and sectoral strategies. Chair the County Executive Committee meetings.',
        icon: <FileText className="h-4 w-4 text-amber-600" />,
      },
      {
        title: 'Service Delivery',
        description: 'Ensure efficient delivery of devolved functions: health, agriculture, education (ECDE), roads, trade, county planning, and disaster management.',
        icon: <Stethoscope className="h-4 w-4 text-amber-600" />,
      },
      {
        title: 'Accountability',
        description: 'Attend county assembly sessions to answer questions. Submit annual reports on county implementation. Subject to recall by county voters (Art. 181).',
        icon: <Shield className="h-4 w-4 text-amber-600" />,
      },
    ],
  },
  senator: {
    roleTitle: 'Senator',
    icon: <Scale className="h-5 w-5" />,
    colorClass: 'text-indigo-700',
    bgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
    constitutionalBasis: 'Article 96, Constitution of Kenya 2010',
    termLength: '5 years (no term limits)',
    salaryRange: 'KSh 740,000–870,000/month (SRC scale)',
    oversightRole: 'Protects county interests in Senate; oversight of national revenue allocation',
    duties: [
      {
        title: 'County Representation',
        description: 'Represent the county and its government in the Senate. Advocate for county interests, priorities, and special needs at the national level.',
        icon: <Vote className="h-4 w-4 text-indigo-600" />,
      },
      {
        title: 'Revenue Oversight',
        description: 'Oversee the equitable sharing of national revenue between national and county governments. Review and approve the Commission on Revenue Allocation (CRA) formula.',
        icon: <DollarSign className="h-4 w-4 text-indigo-600" />,
      },
      {
        title: 'County Oversight',
        description: 'Oversee county government expenditure, implementation of county budgets, and delivery of devolved services. Can summon county officials for questioning.',
        icon: <Shield className="h-4 w-4 text-indigo-600" />,
      },
      {
        title: 'Legislative Role',
        description: 'Participate in Senate debates and vote on bills affecting counties: County Allocation of Revenue Bill, Division of Revenue Bill, and county-specific legislation.',
        icon: <Gavel className="h-4 w-4 text-indigo-600" />,
      },
      {
        title: 'Impeachment Tribunal',
        description: 'Serve on a special tribunal to hear and determine any charge against a Governor under Article 181(4) when the county assembly has voted to impeach.',
        icon: <Gavel className="h-4 w-4 text-indigo-600" />,
      },
      {
        title: 'Constitutional Protection',
        description: 'Defend the devolution framework, county autonomy, and the principle of equitable resource distribution as enshrined in the Constitution.',
        icon: <Shield className="h-4 w-4 text-indigo-600" />,
      },
    ],
  },
  womanRep: {
    roleTitle: 'Woman Representative',
    icon: <Heart className="h-5 w-5" />,
    colorClass: 'text-rose-700',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    constitutionalBasis: 'Article 97, Constitution of Kenya 2010',
    termLength: '5 years (no term limits)',
    salaryRange: 'KSh 710,000–840,000/month (SRC scale)',
    oversightRole: 'Represents women\'s interests in National Assembly; sponsors gender-responsive legislation',
    duties: [
      {
        title: 'Women\'s Representation',
        description: 'Represent the special interests of women, youth, and persons with disabilities in the National Assembly. Advocate for policies that promote gender equity and inclusion.',
        icon: <Heart className="h-4 w-4 text-rose-600" />,
      },
      {
        title: 'Legislative Participation',
        description: 'Introduce, debate, and vote on bills in the National Assembly. Sponsor private member\'s bills focusing on women\'s rights, gender-based violence, and child welfare.',
        icon: <Gavel className="h-4 w-4 text-rose-600" />,
      },
      {
        title: 'Committee Work',
        description: 'Serve in National Assembly committees, particularly those related to health, education, social protection, and gender equality. Scrutinize government spending on social programs.',
        icon: <BookOpen className="h-4 w-4 text-rose-600" />,
      },
      {
        title: 'Constituency Oversight',
        description: 'Oversee the use of the National Government Constituencies Development Fund (NG-CDF) in partnership with the constituency MP. Monitor projects benefitting women and marginalized groups.',
        icon: <Briefcase className="h-4 w-4 text-rose-600" />,
      },
      {
        title: 'Constituent Services',
        description: 'Provide linkage between women in the county and national government services. Facilitate access to health programs (NHIF, UHC), education bursaries, and women empowerment funds.',
        icon: <Users className="h-4 w-4 text-rose-600" />,
      },
      {
        title: 'Affirmative Action Champion',
        description: 'Champion the implementation of the two-thirds gender rule (Article 81(b)), advocate for women\'s economic empowerment, and push for anti-FGM, anti-GBV legislation.',
        icon: <Megaphone className="h-4 w-4 text-rose-600" />,
      },
    ],
  },
  mp: {
    roleTitle: 'Member of Parliament (MP)',
    icon: <Building2 className="h-5 w-5" />,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    constitutionalBasis: 'Article 95, Constitution of Kenya 2010',
    termLength: '5 years (no term limits)',
    salaryRange: 'KSh 710,000–840,000/month (SRC scale)',
    oversightRole: 'Constituency representation; oversight of national executive; NG-CDF management',
    duties: [
      {
        title: 'Constituency Representation',
        description: 'Represent the people of the constituency in the National Assembly. Articulate constituency needs, priorities, and development agenda in Parliament.',
        icon: <Users className="h-4 w-4 text-emerald-600" />,
      },
      {
        title: 'Legislative Role',
        description: 'Debate, amend, and vote on bills in the National Assembly. Participate in committee hearings, question cabinet secretaries, and oversight of the national executive.',
        icon: <Gavel className="h-4 w-4 text-emerald-600" />,
      },
      {
        title: 'NG-CDF Oversight',
        description: 'Oversee the National Government Constituencies Development Fund (NG-CDF). Prioritize projects, ensure proper procurement, and monitor implementation of funded projects.',
        icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
      },
      {
        title: 'Executive Oversight',
        description: 'Scrutinize cabinet secretaries and other senior government officials through committee hearings, parliamentary questions, and special investigations.',
        icon: <Shield className="h-4 w-4 text-emerald-600" />,
      },
      {
        title: 'Constituent Services',
        description: 'Facilitate access to government services: education bursaries, health services, infrastructure development (roads, water, electricity), and agricultural support.',
        icon: <MapPin className="h-4 w-4 text-emerald-600" />,
      },
      {
        title: 'Budget Approval',
        description: 'Review and approve national budgets, taxation measures, and government borrowing. Ensure constituency interests are reflected in national resource allocation.',
        icon: <FileText className="h-4 w-4 text-emerald-600" />,
      },
    ],
  },
  mca: {
    roleTitle: 'Member of County Assembly (MCA)',
    icon: <Landmark className="h-5 w-5" />,
    colorClass: 'text-teal-700',
    bgClass: 'bg-teal-50',
    borderClass: 'border-teal-200',
    constitutionalBasis: 'Article 177, Constitution of Kenya 2010; County Government Act 2012',
    termLength: '5 years (no term limits)',
    salaryRange: 'KSh 80,000–165,000/month (varies by county)',
    oversightRole: 'Ward-level representation; county legislation; oversight of county executive',
    duties: [
      {
        title: 'Ward Representation',
        description: 'Represent the residents of the ward in the County Assembly. Identify ward development priorities and advocate for resources and services at the county level.',
        icon: <Users className="h-4 w-4 text-teal-600" />,
      },
      {
        title: 'County Legislation',
        description: 'Debate, amend, and vote on county bills and ordinances. Approve county budgets, plans, and policies that affect service delivery in the ward and county.',
        icon: <Gavel className="h-4 w-4 text-teal-600" />,
      },
      {
        title: 'Executive Oversight',
        description: 'Oversee the county executive committee and county public service. Question CEC members, summon county officials, and review county expenditure reports.',
        icon: <Shield className="h-4 w-4 text-teal-600" />,
      },
      {
        title: 'Ward Development',
        description: 'Utilize the Ward Development Fund to initiate and monitor local projects: feeder roads, water points, health dispensaries, ECDE centers, and markets.',
        icon: <MapPin className="h-4 w-4 text-teal-600" />,
      },
      {
        title: 'Public Participation',
        description: 'Facilitate citizen participation in county governance. Organize ward development forums, collect public input on county policies, and ensure community voices reach the assembly.',
        icon: <Handshake className="h-4 w-4 text-teal-600" />,
      },
      {
        title: 'Budget & Appropriation',
        description: 'Review, amend, and approve the County Appropriation Bill. Ensure ward-level projects receive adequate funding. Track actual spending against approved budgets.',
        icon: <DollarSign className="h-4 w-4 text-teal-600" />,
      },
    ],
  },
};

// ─── Profile Card Component ────────────────────────────────────────────

interface RepresentativeProfile {
  name: string;
  party?: string;
  coalition?: string;
  qualification?: string;
}

interface RepresentativePreviewCardProps {
  roleKey: string;
  profile?: RepresentativeProfile | null;
  wardName?: string;       // For MCA cards — show which ward
  constituencyName?: string; // For MP/MCA — show which constituency
  compact?: boolean;       // If true, show minimal view
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  governor: 'bg-amber-100 text-amber-700 ring-amber-300',
  senator: 'bg-indigo-100 text-indigo-700 ring-indigo-300',
  womanRep: 'bg-rose-100 text-rose-700 ring-rose-300',
  mp: 'bg-emerald-100 text-emerald-700 ring-emerald-300',
  mca: 'bg-teal-100 text-teal-700 ring-teal-300',
};

export function RepresentativePreviewCard({
  roleKey,
  profile,
  wardName,
  constituencyName,
  compact = false,
}: RepresentativePreviewCardProps) {
  const mandate = ROLE_MANDATES[roleKey];
  if (!mandate) return null;

  const isPlaceholder = !profile || profile.name.includes('(TBD)') || profile.name.includes('TBD');
  const avatarColor = AVATAR_COLORS[roleKey] || 'bg-gray-100 text-gray-700 ring-gray-300';

  if (compact) {
    // Compact card: just profile + key duties
    return (
      <Card className={`border ${mandate.borderClass} overflow-hidden`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold ring-2 shrink-0 ${
                isPlaceholder ? 'bg-gray-100 text-gray-400 ring-gray-200' : avatarColor
              }`}
            >
              {isPlaceholder ? '?' : getInitials(profile.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-bold ${mandate.colorClass}`}>
                  {mandate.roleTitle}
                </span>
                {wardName && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-teal-600 border-teal-200">
                    {wardName}
                  </Badge>
                )}
                {constituencyName && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-emerald-600 border-emerald-200">
                    {constituencyName}
                  </Badge>
                )}
              </div>
              <p className={`text-xs font-medium truncate mt-0.5 ${isPlaceholder ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                {profile?.name || `${mandate.roleTitle} — TBD`}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {profile?.party && !isPlaceholder && (
                  <span className="text-[10px] text-gray-500">{profile.party}</span>
                )}
                {profile?.coalition && !isPlaceholder && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-gray-200 text-gray-500">
                    {profile.coalition.length > 20 ? profile.coalition.split(' ').slice(0, 2).join(' ') : profile.coalition}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {/* Key duties (compact) */}
          <div className="mt-2.5 space-y-1">
            {mandate.duties.slice(0, 3).map((duty, i) => (
              <div key={i} className="flex items-start gap-1.5">
                {duty.icon}
                <span className="text-[10px] text-gray-600 leading-tight">{duty.title}</span>
              </div>
            ))}
            {mandate.duties.length > 3 && (
              <span className="text-[9px] text-gray-400 italic">+{mandate.duties.length - 3} more duties</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full card: profile + all duties + constitutional basis
  return (
    <Card className={`border ${mandate.borderClass} overflow-hidden`}>
      {/* Role Header */}
      <div className={`${mandate.bgClass} px-4 py-3 border-b ${mandate.borderClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`${mandate.colorClass}`}>{mandate.icon}</div>
            <div>
              <h4 className={`text-sm font-bold ${mandate.colorClass}`}>{mandate.roleTitle}</h4>
              <p className="text-[10px] text-gray-500">{mandate.constitutionalBasis}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500">Term: {mandate.termLength}</p>
            <p className="text-[10px] text-gray-500">{mandate.salaryRange}</p>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Profile Section */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center text-base font-bold ring-2 shrink-0 ${
              isPlaceholder ? 'bg-gray-100 text-gray-400 ring-gray-200' : avatarColor
            }`}
          >
            {isPlaceholder ? '?' : getInitials(profile?.name || '')}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-bold ${isPlaceholder ? 'text-gray-400 italic' : 'text-gray-900'}`}>
              {profile?.name || `${mandate.roleTitle} — To Be Determined`}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {profile?.party && !isPlaceholder && (
                <Badge variant="outline" className="text-[9px] h-5 border-gray-200">
                  {profile.party}
                </Badge>
              )}
              {profile?.coalition && !isPlaceholder && (
                <Badge className={`text-[9px] h-5 ${
                  profile.coalition === 'Kenya Kwanza Alliance'
                    ? 'bg-blue-100 text-blue-700'
                    : profile.coalition === 'Azimio la Umoja One Kenya Coalition'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {profile.coalition === 'Kenya Kwanza Alliance' ? 'Kenya Kwanza' : profile.coalition === 'Azimio la Umoja One Kenya Coalition' ? 'Azimio' : 'Independent'}
                </Badge>
              )}
              {wardName && (
                <Badge variant="outline" className="text-[9px] h-5 text-teal-600 border-teal-200">
                  <MapPin className="h-2.5 w-2.5 mr-0.5" /> {wardName}
                </Badge>
              )}
              {constituencyName && (
                <Badge variant="outline" className="text-[9px] h-5 text-emerald-600 border-emerald-200">
                  {constituencyName}
                </Badge>
              )}
            </div>
            {isPlaceholder && (
              <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Awaiting official appointment data from IEBC
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Duties */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className={`h-3.5 w-3.5 ${mandate.colorClass}`} />
            <span className={`text-xs font-semibold ${mandate.colorClass}`}>Key Duties & Mandate</span>
          </div>
          <div className="space-y-2">
            {mandate.duties.map((duty, i) => (
              <div key={i} className="flex items-start gap-2.5 group">
                <div className={`mt-0.5 shrink-0 ${mandate.colorClass} opacity-60 group-hover:opacity-100 transition-opacity`}>
                  {duty.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-700">{duty.title}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{duty.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Oversight */}
        <div className={`${mandate.bgClass} rounded-lg px-3 py-2`}>
          <div className="flex items-start gap-1.5">
            <Shield className={`h-3.5 w-3.5 ${mandate.colorClass} shrink-0 mt-0.5`} />
            <div>
              <p className="text-[10px] font-semibold text-gray-700">Oversight Role</p>
              <p className="text-[10px] text-gray-600 leading-relaxed">{mandate.oversightRole}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Representative Preview Grid ──────────────────────────────────────
// Shows all 5 role types as preview cards for a selected county

interface CountyLeadershipInfo {
  governor?: { name: string; party: string; coalition: string };
  deputyGovernor?: { name: string; party: string };
  senator?: { name: string; party: string; coalition: string };
  womanRep?: { name: string; party: string; coalition: string };
  constituencies?: Array<{
    name: string;
    mp: { name: string; party: string; coalition?: string };
    wards: Array<{ name: string; mca: string }>;
  }>;
}

interface RepresentativePreviewGridProps {
  leadership: CountyLeadershipInfo;
  countyName: string;
  showExpanded?: boolean; // If true, show full cards; if false, show compact
}

export function RepresentativePreviewGrid({
  leadership,
  countyName,
  showExpanded = false,
}: RepresentativePreviewGridProps) {
  const totalMCAs = leadership.constituencies?.reduce(
    (sum, con) => sum + (con.wards?.length || 0), 0
  ) || 0;
  const totalMPs = leadership.constituencies?.length || 0;
  const totalConstituencies = leadership.constituencies?.length || 0;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-800">
            {countyName} — Representatives & Duties
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-emerald-200 text-emerald-600">
            {totalConstituencies} Constituencies
          </Badge>
          <Badge variant="outline" className="text-[9px] border-blue-200 text-blue-600">
            {totalMPs} MPs
          </Badge>
          <Badge variant="outline" className="text-[9px] border-teal-200 text-teal-600">
            {totalMCAs} MCAs
          </Badge>
        </div>
      </div>

      {/* Top-level representatives: Governor, Senator, Woman Rep */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RepresentativePreviewCard
          roleKey="governor"
          profile={leadership.governor}
          compact={!showExpanded}
        />
        <RepresentativePreviewCard
          roleKey="senator"
          profile={leadership.senator}
          compact={!showExpanded}
        />
        <RepresentativePreviewCard
          roleKey="womanRep"
          profile={leadership.womanRep}
          compact={!showExpanded}
        />
      </div>

      {/* MPs and MCAs — show by constituency */}
      {leadership.constituencies && leadership.constituencies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-gray-700">
              Constituency Representatives
            </h4>
            <span className="text-[10px] text-gray-400">
              ({totalConstituencies} constituencies, {totalMPs} MPs, {totalMCAs} MCAs)
            </span>
          </div>

          {leadership.constituencies.map((constituency, ci) => (
            <Card key={`preview-con-${ci}`} className="border-emerald-100 overflow-hidden">
              <div className="bg-emerald-50/50 px-3 py-2 border-b border-emerald-100 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800">{constituency.name}</span>
                <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 border-emerald-200 text-emerald-600 ml-auto">
                  {constituency.wards?.length || 0} wards
                </Badge>
              </div>
              <CardContent className="p-3 space-y-2">
                {/* MP */}
                <RepresentativePreviewCard
                  roleKey="mp"
                  profile={constituency.mp}
                  constituencyName={constituency.name}
                  compact
                />
                {/* MCAs */}
                {constituency.wards && constituency.wards.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Landmark className="h-3 w-3 text-teal-500" />
                      <span className="text-[10px] font-medium text-teal-600">
                        Ward Representatives (MCAs)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {constituency.wards.map((ward, wi) => (
                        <RepresentativePreviewCard
                          key={`preview-ward-${wi}`}
                          roleKey="mca"
                          profile={{ name: ward.mca }}
                          wardName={ward.name}
                          constituencyName={constituency.name}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Standalone Role Duty Reference Card ──────────────────────────────
// Shows what each role does (without a specific person)

export function RoleDutyReference({ roleKey }: { roleKey: string }) {
  const mandate = ROLE_MANDATES[roleKey];
  if (!mandate) return null;

  return (
    <Card className={`border ${mandate.borderClass} overflow-hidden`}>
      <div className={`${mandate.bgClass} px-4 py-2.5 border-b ${mandate.borderClass}`}>
        <div className="flex items-center gap-2">
          <div className={`${mandate.colorClass}`}>{mandate.icon}</div>
          <div>
            <h4 className={`text-xs font-bold ${mandate.colorClass}`}>{mandate.roleTitle}</h4>
            <p className="text-[9px] text-gray-500">{mandate.constitutionalBasis}</p>
          </div>
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div>
            <span className="text-gray-400">Term:</span>
            <span className="text-gray-700 font-medium ml-1">{mandate.termLength}</span>
          </div>
          <div>
            <span className="text-gray-400">Salary:</span>
            <span className="text-gray-700 font-medium ml-1">{mandate.salaryRange}</span>
          </div>
        </div>
        <Separator />
        <div className="space-y-1.5">
          {mandate.duties.map((duty, i) => (
            <div key={i} className="flex items-start gap-1.5">
              {duty.icon}
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-700">{duty.title}</p>
                <p className="text-[9px] text-gray-500 leading-relaxed">{duty.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Export role mandates for use in other components ────────────────
export { ROLE_MANDATES };
