'use client';

import React, { useState, useMemo } from 'react';
import { MzalendoMember } from '@/data/types';
import { mzalendoMembers, getAllMembers, getMembersByGender, getMembersByCounty } from '@/data/mzalendo-members';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Search, ExternalLink, User, Users, BarChart3, CheckCircle2,
  XCircle, Minus, Globe, Filter, Vote, Building2, TrendingUp,
  GraduationCap, MapPin, Calendar, ArrowUpDown,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────
const COALITION_COLORS: Record<string, string> = {
  'Kenya Kwanza Alliance': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Azimio la Umoja One Kenya Coalition': 'bg-blue-100 text-blue-800 border-blue-300',
  'Independent': 'bg-gray-100 text-gray-700 border-gray-300',
};

const COALITION_DOT_COLORS: Record<string, string> = {
  'Kenya Kwanza Alliance': 'bg-emerald-500',
  'Azimio la Umoja One Kenya Coalition': 'bg-blue-500',
  'Independent': 'bg-gray-500',
};

function getAttendanceColor(rate: number): string {
  if (rate > 85) return 'text-emerald-600';
  if (rate >= 70) return 'text-amber-600';
  return 'text-red-600';
}

function getAttendanceBarColor(rate: number): string {
  if (rate > 85) return '[&>div]:!bg-emerald-500';
  if (rate >= 70) return '[&>div]:!bg-amber-500';
  return '[&>div]:!bg-red-500';
}

function getAttendanceBadgeClass(rate: number): string {
  if (rate > 85) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (rate >= 70) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

function formatBillDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getVoteIcon(vote: 'aye' | 'nay' | 'absent') {
  switch (vote) {
    case 'aye':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
    case 'nay':
      return <XCircle className="h-3.5 w-3.5 text-red-600" />;
    case 'absent':
      return <Minus className="h-3.5 w-3.5 text-gray-400" />;
  }
}

function getVoteLabel(vote: 'aye' | 'nay' | 'absent') {
  switch (vote) {
    case 'aye': return 'Aye';
    case 'nay': return 'Nay';
    case 'absent': return 'Absent';
  }
}

// ─── County list derived from data ──────────────────────────────
function getUniqueCounties(members: MzalendoMember[]): string[] {
  const counties = new Set(members.map(m => m.county));
  return Array.from(counties).sort();
}

// ─── Gender Icon ────────────────────────────────────────────────
function GenderIcon({ gender }: { gender: 'male' | 'female' }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full h-6 w-6 text-xs font-medium ${
      gender === 'female'
        ? 'bg-pink-100 text-pink-700'
        : 'bg-sky-100 text-sky-700'
    }`}>
      {gender === 'female' ? '♀' : '♂'}
    </span>
  );
}

// ─── Social Links ──────────────────────────────────────────────
function SocialLinks({ social }: { social: MzalendoMember['socialMedia'] }) {
  if (!social) return null;
  const hasAny = social.x || social.facebook || social.instagram || social.website;
  if (!hasAny) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      {social.x && (
        <a
          href={`https://x.com/${social.x.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          aria-label="X (Twitter) profile"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">{social.x}</span>
        </a>
      )}
      {social.facebook && (
        <a
          href={`https://facebook.com${social.facebook}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          aria-label="Facebook profile"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      )}
      {social.instagram && (
        <a
          href={`https://instagram.com/${social.instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          aria-label="Instagram profile"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </a>
      )}
      {social.website && (
        <a
          href={social.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
          aria-label="Official website"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Website</span>
        </a>
      )}
    </div>
  );
}

// ─── Vote Record (Expandable) ──────────────────────────────────
function VoteRecordSection({ member }: { member: MzalendoMember }) {
  const [open, setOpen] = useState(false);
  const record = member.voteRecord;

  if (!record) return (
    <p className="text-xs text-stone-400 dark:text-stone-500 mt-2 italic">
      Vote record data not available
    </p>
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 h-8 text-xs gap-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 justify-start px-2"
        >
          <Vote className="h-3.5 w-3.5" />
          Vote Record
          {open ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-3 p-3 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Vote className="h-3.5 w-3.5 text-stone-500" />
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Total Votes</span>
              </div>
              <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{record.totalVotes}</span>
            </div>
            <Badge variant="outline" className={`text-xs ${getAttendanceBadgeClass(record.attendanceRate)}`}>
              {record.attendanceRate}% attendance
            </Badge>
          </div>

          {/* Attendance bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500 dark:text-stone-400">Attendance</span>
              <span className={`text-xs font-semibold ${getAttendanceColor(record.attendanceRate)}`}>
                {record.attendanceRate}%
              </span>
            </div>
            <Progress value={record.attendanceRate} className={`h-2 ${getAttendanceBarColor(record.attendanceRate)}`} />
          </div>

          <Separator />

          {/* Recent bills */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-600 dark:text-stone-300">Recent Bills</h4>
            <div className="space-y-1.5">
              {record.recentBills.map((bill, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="mt-0.5 shrink-0">{getVoteIcon(bill.vote)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-700 dark:text-stone-300 leading-snug truncate">
                      {bill.billTitle}
                    </p>
                    <p className="text-stone-400 dark:text-stone-500 mt-0.5">
                      {formatBillDate(bill.date)} · <span className={
                        bill.vote === 'aye' ? 'text-emerald-600' :
                        bill.vote === 'nay' ? 'text-red-600' : 'text-gray-400'
                      }>{getVoteLabel(bill.vote)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Member Card ───────────────────────────────────────────────
function MemberCard({ member }: { member: MzalendoMember }) {
  const coalitionLabel = member.coalition === 'Kenya Kwanza Alliance'
    ? 'Kenya Kwanza'
    : member.coalition === 'Azimio la Umoja One Kenya Coalition'
      ? 'Azimio'
      : member.coalition || 'Unknown';

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-stone-200 dark:border-stone-700 dark:bg-stone-900">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <GenderIcon gender={member.gender} />
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold leading-tight text-stone-900 dark:text-stone-100 truncate">
                {member.name}
              </CardTitle>
              <CardDescription className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                {member.position}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        {/* County + Age */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
            <MapPin className="h-3 w-3" />
            {member.county}
          </Badge>
          {member.age && (
            <Badge variant="outline" className="text-xs gap-1 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300">
              <Calendar className="h-3 w-3" />
              {member.age} yrs
            </Badge>
          )}
        </div>

        {/* Party + Coalition badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="text-xs font-medium bg-stone-800 text-stone-50 dark:bg-stone-200 dark:text-stone-800">
            {member.party}
          </Badge>
          {member.coalition && (
            <Badge variant="outline" className={`text-xs ${COALITION_COLORS[member.coalition] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
              <span className={`inline-block h-2 w-2 rounded-full mr-1 ${COALITION_DOT_COLORS[member.coalition] || 'bg-gray-500'}`} />
              {coalitionLabel}
            </Badge>
          )}
        </div>

        {/* Social Links */}
        <SocialLinks social={member.socialMedia} />

        {/* Vote Record */}
        <VoteRecordSection member={member} />

        {/* Mzalendo profile link */}
        {member.profileUrl && (
          <a
            href={member.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View on Mzalendo
          </a>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Statistics Panel ───────────────────────────────────────────
function StatisticsPanel({ members }: { members: MzalendoMember[] }) {
  const totalMembers = members.length;
  const maleCount = members.filter(m => m.gender === 'male').length;
  const femaleCount = members.filter(m => m.gender === 'female').length;

  const coalitions = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      const c = m.coalition || 'Unknown';
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [members]);

  const membersWithAttendance = members.filter(m => m.voteRecord);
  const avgAttendance = membersWithAttendance.length > 0
    ? Math.round(membersWithAttendance.reduce((sum, m) => sum + (m.voteRecord?.attendanceRate || 0), 0) / membersWithAttendance.length)
    : 0;

  return (
    <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
          <BarChart3 className="h-4 w-4 text-emerald-600" />
          Overview Statistics
        </CardTitle>
        <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
          Based on {totalMembers} members in the current dataset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <Users className="h-4 w-4 text-stone-400" />
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">{totalMembers}</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Total Members</p>
          </div>

          {/* Gender ratio */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{maleCount}</span>
              <span className="text-stone-300 dark:text-stone-600">/</span>
              <span className="text-lg font-bold text-pink-600 dark:text-pink-400">{femaleCount}</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Male / Female</p>
          </div>

          {/* Coalition distribution */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {Object.entries(coalitions).map(([name, count]) => {
                const label = name === 'Kenya Kwanza Alliance'
                  ? 'KK'
                  : name === 'Azimio la Umoja One Kenya Coalition'
                    ? 'AZ'
                    : 'IND';
                const color = COALITION_DOT_COLORS[name] || 'bg-gray-500';
                return (
                  <span key={name} className="flex items-center gap-0.5 text-xs">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="font-semibold text-stone-700 dark:text-stone-300">{count}</span>
                    <span className="text-stone-400 dark:text-stone-500">{label}</span>
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Coalitions</p>
          </div>

          {/* Average attendance */}
          <div className="text-center space-y-1">
            <span className={`text-2xl font-bold ${getAttendanceColor(avgAttendance)}`}>
              {avgAttendance}%
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400">Avg Attendance</p>
          </div>
        </div>

        {/* Gender visual bar */}
        <div className="mt-4">
          <div className="flex h-2 rounded-full overflow-hidden">
            {totalMembers > 0 && (
              <>
                <div
                  className="bg-sky-400 dark:bg-sky-500 transition-all"
                  style={{ width: `${(maleCount / totalMembers) * 100}%` }}
                />
                <div
                  className="bg-pink-400 dark:bg-pink-500 transition-all"
                  style={{ width: `${(femaleCount / totalMembers) * 100}%` }}
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-400 dark:bg-sky-500" /> Male {totalMembers > 0 ? Math.round((maleCount / totalMembers) * 100) : 0}%
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
              Female {totalMembers > 0 ? Math.round((femaleCount / totalMembers) * 100) : 0}% <span className="h-2 w-2 rounded-full bg-pink-400 dark:bg-pink-500" />
            </span>
          </div>
        </div>

        {/* Coalition visual bar */}
        {Object.keys(coalitions).length > 0 && (
          <div className="mt-3">
            <div className="flex h-2 rounded-full overflow-hidden">
              {Object.entries(coalitions).map(([name, count]) => (
                <div
                  key={name}
                  className={`transition-all ${COALITION_DOT_COLORS[name] || 'bg-gray-500'}`}
                  style={{ width: `${(count / totalMembers) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
              {Object.entries(coalitions).map(([name, count]) => {
                const label = name === 'Kenya Kwanza Alliance'
                  ? 'Kenya Kwanza'
                  : name === 'Azimio la Umoja One Kenya Coalition'
                    ? 'Azimio'
                    : name;
                const pct = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;
                return (
                  <span key={name} className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${COALITION_DOT_COLORS[name] || 'bg-gray-500'}`} />
                    {label} {pct}%
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function MzalendoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [coalitionFilter, setCoalitionFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);

  const allMembers = getAllMembers();
  const counties = useMemo(() => getUniqueCounties(allMembers), [allMembers]);

  const filteredMembers = useMemo(() => {
    return allMembers.filter(member => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !member.name.toLowerCase().includes(q) &&
          !member.position.toLowerCase().includes(q) &&
          !member.county.toLowerCase().includes(q) &&
          !member.party.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Gender filter
      if (genderFilter !== 'all' && member.gender !== genderFilter) {
        return false;
      }

      // Coalition filter
      if (coalitionFilter !== 'all') {
        if (coalitionFilter === 'Independent') {
          if (member.coalition !== 'Independent') return false;
        } else if (coalitionFilter === 'Kenya Kwanza Alliance') {
          if (member.coalition !== 'Kenya Kwanza Alliance') return false;
        } else if (coalitionFilter === 'Azimio la Umoja One Kenya Coalition') {
          if (member.coalition !== 'Azimio la Umoja One Kenya Coalition') return false;
        }
      }

      // County filter
      if (countyFilter !== 'all' && member.county !== countyFilter) {
        return false;
      }

      return true;
    });
  }, [allMembers, searchQuery, genderFilter, coalitionFilter, countyFilter]);

  const hasActiveFilters = searchQuery.trim() !== '' || genderFilter !== 'all' || coalitionFilter !== 'all' || countyFilter !== 'all';

  function clearFilters() {
    setSearchQuery('');
    setGenderFilter('all');
    setCoalitionFilter('all');
    setCountyFilter('all');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-emerald-600" />
          Mzalendo Parliament Profiles
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Browse Kenyan parliament members — track voting records, attendance, and coalition affiliations
        </p>
      </div>

      {/* Statistics Panel */}
      <StatisticsPanel members={allMembers} />

      {/* Filters */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-stone-800 dark:text-stone-200">
              <Filter className="h-4 w-4 text-emerald-600" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <Input
                placeholder="Search by name, position, county..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 text-xs pl-8 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              />
            </div>

            {/* Gender */}
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>

            {/* Coalition */}
            <Select value={coalitionFilter} onValueChange={setCoalitionFilter}>
              <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <SelectValue placeholder="Coalition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coalitions</SelectItem>
                <SelectItem value="Kenya Kwanza Alliance">Kenya Kwanza</SelectItem>
                <SelectItem value="Azimio la Umoja One Kenya Coalition">Azimio</SelectItem>
                <SelectItem value="Independent">Independent</SelectItem>
              </SelectContent>
            </Select>

            {/* County */}
            <Select value={countyFilter} onValueChange={setCountyFilter}>
              <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <SelectValue placeholder="County" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">All Counties</SelectItem>
                {counties.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Result count */}
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">
            Showing {filteredMembers.length} of {allMembers.length} members
          </p>
        </CardContent>
      </Card>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900 py-12">
          <CardContent className="text-center">
            <Search className="h-8 w-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No members found</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              Try adjusting your filters or search query
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 h-8 text-xs"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
