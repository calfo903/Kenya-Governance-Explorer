'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ClipboardCheck, MessageSquare, ShieldAlert,
  Clock, CheckCircle2, AlertCircle, Eye,
  Filter, FileText, Inbox, RefreshCw,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

type ReportTab = 'stories' | 'tips' | 'all';
type StoryStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';
type TipStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

interface Story {
  id: string;
  countyName: string;
  sector: string;
  title: string;
  experience: string;
  rating: number;
  anonymous: boolean;
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
}

interface Tip {
  id: string;
  countyName: string;
  category: string;
  anonymous: boolean;
  status: TipStatus;
  adminNotes: string | null;
  descriptionPreview: string;
  createdAt: string;
  updatedAt: string;
}

type UnifiedReport =
  | { type: 'story'; data: Story }
  | { type: 'tip'; data: Tip };

// ─── Status Config ───────────────────────────────────────────────

const STORY_STATUS_STYLES: Record<StoryStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  reviewed: { label: 'Reviewed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  actioned: { label: 'Actioned', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  dismissed: { label: 'Dismissed', className: 'bg-stone-100 text-stone-600 dark:bg-stone-800/30 dark:text-stone-400' },
};

const TIP_STATUS_STYLES: Record<TipStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  investigating: { label: 'Investigating', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  dismissed: { label: 'Dismissed', className: 'bg-stone-100 text-stone-600 dark:bg-stone-800/30 dark:text-stone-400' },
};

const STORY_NEXT_ACTIONS: Record<StoryStatus, { label: string; next: StoryStatus }[]> = {
  pending: [
    { label: 'Mark Reviewed', next: 'reviewed' },
    { label: 'Dismiss', next: 'dismissed' },
  ],
  reviewed: [
    { label: 'Mark Actioned', next: 'actioned' },
    { label: 'Dismiss', next: 'dismissed' },
  ],
  actioned: [],
  dismissed: [],
};

const TIP_NEXT_ACTIONS: Record<TipStatus, { label: string; next: TipStatus }[]> = {
  pending: [
    { label: 'Start Investigation', next: 'investigating' },
    { label: 'Dismiss', next: 'dismissed' },
  ],
  investigating: [
    { label: 'Mark Resolved', next: 'resolved' },
    { label: 'Dismiss', next: 'dismissed' },
  ],
  resolved: [],
  dismissed: [],
};

// ─── Constants ──────────────────────────────────────────────────

const COUNTIES = [
  'Mombasa', 'Kilifi', 'Kwale', 'Lamu', 'Taita-Taveta', 'Tana River',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru',
  'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi',
  'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho',
  'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya',
  'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi',
];

const SECTORS = ['health', 'education', 'infrastructure', 'agriculture', 'water', 'roads', 'trade', 'youth', 'environment', 'other'];
const TIP_CATEGORIES = ['corruption', 'embezzlement', 'procurement_irregularity', 'nepotism', 'misappropriation', 'fraud', 'bribery', 'conflict_of_interest', 'undue_influence', 'other'];

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatStatusLabel(status: string): string {
  const s = (STORY_STATUS_STYLES as Record<string, { label: string }>)[status]
    || (TIP_STATUS_STYLES as Record<string, { label: string }>)[status];
  return s?.label || status;
}

function getStatusBadge(status: string): string {
  const s = (STORY_STATUS_STYLES as Record<string, { className: string }>)[status]
    || (TIP_STATUS_STYLES as Record<string, { className: string }>)[status];
  return s?.className || 'bg-stone-100 text-stone-600 dark:bg-stone-800/30 dark:text-stone-400';
}

// ─── Component ──────────────────────────────────────────────────

export default function CitizenReportDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ReportTab>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (countyFilter !== 'all') params.set('county', countyFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    params.set('page', String(page));
    params.set('limit', '20');
    return params.toString();
  }, [countyFilter, statusFilter, dateFrom, dateTo, page]);

  // Reset page on filter change
  const handleFilterChange = useCallback(() => setPage(1), []);

  // ─── Queries ────────────────────────────────────────────────

  const storiesQuery = useQuery({
    queryKey: ['db-stories', queryParams],
    queryFn: () => fetch(`/api/db/stories?${queryParams}`).then(r => r.json()),
    enabled: activeTab === 'stories' || activeTab === 'all',
  });

  const tipsQuery = useQuery({
    queryKey: ['db-tips', queryParams],
    queryFn: () => fetch(`/api/db/tips?${queryParams}`).then(r => r.json()),
    enabled: activeTab === 'tips' || activeTab === 'all',
  });

  // ─── Mutations ──────────────────────────────────────────────

  const storyStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StoryStatus }) =>
      fetch(`/api/db/stories/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-stories'] });
      queryClient.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });

  const tipStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TipStatus }) =>
      fetch(`/api/db/tips/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['db-tips'] });
      queryClient.invalidateQueries({ queryKey: ['report-stats'] });
    },
  });

  // ─── Stats ──────────────────────────────────────────────────

  const stories = (storiesQuery.data?.stories || []) as Story[];
  const tips = (tipsQuery.data?.tips || []) as Tip[];

  const allReports: UnifiedReport[] = useMemo(() => {
    const merged: UnifiedReport[] = [
      ...stories.map(s => ({ type: 'story' as const, data: s })),
      ...tips.map(t => ({ type: 'tip' as const, data: t })),
    ];
    merged.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
    return merged;
  }, [stories, tips]);

  const totalCount = allReports.length;
  const pendingCount = allReports.filter(r => r.data.status === 'pending').length;
  const inProgressCount = allReports.filter(r =>
    r.data.status === 'reviewed' || r.data.status === 'investigating'
  ).length;
  const resolvedCount = allReports.filter(r =>
    r.data.status === 'actioned' || r.data.status === 'resolved'
  ).length;

  // ─── Render ─────────────────────────────────────────────────

  const displayReports = activeTab === 'all'
    ? allReports
    : activeTab === 'stories'
      ? stories.map(s => ({ type: 'story' as const, data: s }))
      : tips.map(t => ({ type: 'tip' as const, data: t }));

  const totalStories = storiesQuery.data?.count ?? 0;
  const totalTips = tipsQuery.data?.count ?? 0;
  const currentTotal = activeTab === 'all'
    ? totalStories + totalTips
    : activeTab === 'stories'
      ? totalStories
      : totalTips;

  const isLoading = (activeTab === 'stories' || activeTab === 'all') && storiesQuery.isLoading
    || (activeTab === 'tips' || activeTab === 'all') && tipsQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ClipboardCheck className="size-6 text-emerald-600" />
          Citizen Report Tracker
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Track and manage citizen stories and whistleblower tips submitted across all 47 counties.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Total Reports</p>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{totalCount}</p>
              </div>
              <div className="rounded-full bg-stone-100 dark:bg-stone-800 p-2">
                <FileText className="size-5 text-stone-600 dark:text-stone-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount}</p>
              </div>
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-2">
                <Clock className="size-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Under Review</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                <Eye className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Resolved</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
              </div>
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Filters */}
      <Card className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ReportTab); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="all" className="gap-1.5">
                  <FileText className="size-3.5" />
                  All Reports
                </TabsTrigger>
                <TabsTrigger value="stories" className="gap-1.5">
                  <MessageSquare className="size-3.5" />
                  Stories
                </TabsTrigger>
                <TabsTrigger value="tips" className="gap-1.5">
                  <ShieldAlert className="size-3.5" />
                  Tips
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['db-stories'] });
                queryClient.invalidateQueries({ queryKey: ['db-tips'] });
              }}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-stone-400" />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Filters:</span>
            </div>

            <Select
              value={countyFilter}
              onValueChange={(v) => { setCountyFilter(v); handleFilterChange(); }}
            >
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="All Counties" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All Counties</SelectItem>
                {COUNTIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); handleFilterChange(); }}
            >
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); handleFilterChange(); }}
                className="h-8 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs px-2 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                aria-label="From date"
              />\n              <span className="text-xs text-stone-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); handleFilterChange(); }}
                className="h-8 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs px-2 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                aria-label="To date"
              />
            </div>
          </div>

          {/* Reports List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="size-8 text-stone-400 animate-spin" />
                <p className="text-sm text-stone-500">Loading reports...</p>
              </div>
            </div>
          ) : displayReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="size-12 text-stone-300 dark:text-stone-600 mb-4" />
              <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300">No Reports Found</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-md">
                {countyFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo
                  ? 'No reports match your current filters. Try adjusting or clearing them.'
                  : 'No citizen reports have been submitted yet. Reports will appear here once citizens share their experiences or tips.'}
              </p>
              {(countyFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => {
                    setCountyFilter('all');
                    setStatusFilter('all');
                    setDateFrom('');
                    setDateTo('');
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                Showing {displayReports.length} of {currentTotal} reports
              </p>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {displayReports.map((report) => {
                  if (report.type === 'story') {
                    return <StoryCard
                      key={report.data.id}
                      story={report.data}
                      onStatusChange={(s) => storyStatusMutation.mutate({ id: report.data.id, status: s })}
                      isUpdating={storyStatusMutation.isPending}
                    />;
                  }
                  return <TipCard
                    key={report.data.id}
                    tip={report.data}
                    onStatusChange={(s) => tipStatusMutation.mutate({ id: report.data.id, status: s })}
                    isUpdating={tipStatusMutation.isPending}
                  />;
                })}
              </div>

              {/* Pagination */}
              {currentTotal > 20 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-stone-600 dark:text-stone-400 px-3">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={displayReports.length < 20}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Story Card ────────────────────────────────────────────────────

function StoryCard({
  story,
  onStatusChange,
  isUpdating,
}: {
  story: Story;
  onStatusChange: (status: StoryStatus) => void;
  isUpdating: boolean;
}) {
  const actions = STORY_NEXT_ACTIONS[story.status] || [];

  return (
    <Card className="bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Type Icon */}
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2 shrink-0">
            <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <Badge variant="outline" className="text-xs bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700">
                Story
              </Badge>
              <Badge variant="outline" className="text-xs bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700">
                {story.countyName}
              </Badge>
              <Badge variant="outline" className="text-xs bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 capitalize">
                {story.sector}
              </Badge>
              <Badge className={`text-xs ${getStatusBadge(story.status)}`}>
                {formatStatusLabel(story.status)}
              </Badge>
            </div>

            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">
              {story.title}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
              {story.experience}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
              {formatDate(story.createdAt)}
              {story.anonymous && <span className="ml-2">· Anonymous</span>}
              {story.rating && <span className="ml-2">· {'★'.repeat(story.rating)}{'☆'.repeat(5 - story.rating)}</span>}
            </p>
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex flex-col gap-1.5 shrink-0 sm:ml-2">
              {actions.map(action => (
                <Button
                  key={action.next}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1.5"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(action.next)}
                >
                  {action.next === 'dismissed' && <AlertCircle className="size-3" />}
                  {action.next === 'reviewed' && <Eye className="size-3" />}
                  {action.next === 'actioned' && <CheckCircle2 className="size-3" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tip Card ──────────────────────────────────────────────────────

function TipCard({
  tip,
  onStatusChange,
  isUpdating,
}: {
  tip: Tip;
  onStatusChange: (status: TipStatus) => void;
  isUpdating: boolean;
}) {
  const actions = TIP_NEXT_ACTIONS[tip.status] || [];

  return (
    <Card className="bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Type Icon */}
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2 shrink-0">
            <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                Tip
              </Badge>
              <Badge variant="outline" className="text-xs bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700">
                {tip.countyName}
              </Badge>
              <Badge variant="outline" className="text-xs bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 capitalize">
                {tip.category.replace(/_/g, ' ')}
              </Badge>
              <Badge className={`text-xs ${getStatusBadge(tip.status)}`}>
                {formatStatusLabel(tip.status)}
              </Badge>
            </div>

            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Whistleblower Tip
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 italic">
              {tip.descriptionPreview}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
              {formatDate(tip.createdAt)}
              {tip.anonymous && <span className="ml-2">· Anonymous</span>}
            </p>
            {tip.adminNotes && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-1">
                <span className="font-medium">Admin note:</span> {tip.adminNotes}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex flex-col gap-1.5 shrink-0 sm:ml-2">
              {actions.map(action => (
                <Button
                  key={action.next}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1.5"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(action.next)}
                >
                  {action.next === 'dismissed' && <AlertCircle className="size-3" />}
                  {action.next === 'investigating' && <Eye className="size-3" />}
                  {action.next === 'resolved' && <CheckCircle2 className="size-3" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
