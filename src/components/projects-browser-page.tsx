'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ProjectRecord } from '@/data/types';
import { sampleProjects, getAllProjects } from '@/data/sample-projects';
import ProjectDetailDrawer from '@/components/project-detail-drawer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, Filter, MapPin, ArrowUpDown, TrendingUp, X, ChevronRight,
  DollarSign, AlertTriangle, CheckCircle2, Clock, Camera, Eye,
  Layers, Building2, Droplets, Heart, GraduationCap, Leaf, Activity,
} from 'lucide-react';
import { getAuditColor } from '@/data/types';

// ─── Constants & Helpers ──────────────────────────────────────────

const COUNTY_NAMES: Record<string, string> = {
  '001': 'Mombasa',
  '008': 'Garissa',
  '022': 'Kisumu',
  '034': 'Kajiado',
  '047': 'Nairobi',
};

function getCountyName(code: string): string {
  return COUNTY_NAMES[code] || code;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Layers },
  active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-300', icon: Activity },
  stalled: { label: 'Stalled', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle },
  completed: { label: 'Completed', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600', icon: CheckCircle2 },
  suspended: { label: 'Suspended', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock },
};

function getCategoryIcon(category: string): React.ElementType {
  const cat = category.toLowerCase();
  if (cat.includes('water')) return Droplets;
  if (cat.includes('health')) return Heart;
  if (cat.includes('education')) return GraduationCap;
  if (cat.includes('agriculture') || cat.includes('livestock')) return Leaf;
  return Building2;
}

function getCategoryColor(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('water')) return 'bg-sky-100 text-sky-800 border-sky-200';
  if (cat.includes('health')) return 'bg-rose-100 text-rose-800 border-rose-200';
  if (cat.includes('education')) return 'bg-violet-100 text-violet-800 border-violet-200';
  if (cat.includes('agriculture') || cat.includes('livestock')) return 'bg-lime-100 text-lime-800 border-lime-200';
  return 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700';
}

function getRiskConfig(score: number | undefined): { label: string; color: string; textColor: string; borderColor: string } {
  if (score === undefined) return { label: 'N/A', color: 'bg-gray-200 dark:bg-gray-700', textColor: 'text-gray-500 dark:text-gray-400', borderColor: 'border-gray-300 dark:border-gray-600' };
  if (score < 25) return { label: 'Low', color: 'bg-green-500', textColor: 'text-green-800', borderColor: 'border-green-300' };
  if (score <= 60) return { label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-800', borderColor: 'border-amber-300' };
  return { label: 'High', color: 'bg-red-500', textColor: 'text-red-800', borderColor: 'border-red-300' };
}

function formatBudget(amount: number): string {
  if (amount >= 1_000_000_000) return `KSh ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `KSh ${(amount / 1_000_000).toFixed(0)}M`;
  return `KSh ${amount.toLocaleString()}`;
}

function formatBudgetBillion(amount: number): string {
  return (amount / 1_000_000_000).toFixed(2);
}

// ─── Component ─────────────────────────────────────────────────────

export default function ProjectsBrowserPage() {
  const projects = useMemo(() => getAllProjects(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk');
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);

  // ─── Summary Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const stalled = projects.filter(p => p.status === 'stalled').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budgetAllocated, 0);
    return { total, active, stalled, totalBudget };
  }, [projects]);

  // ─── Filter & Sort ──────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          getCountyName(p.countyCode).toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Category
    if (categoryFilter !== 'all') {
      const catMap: Record<string, string[]> = {
        'Water': ['water'],
        'Infrastructure': ['infrastructure'],
        'Health': ['health'],
        'Education': ['education'],
        'Agriculture': ['agriculture', 'livestock'],
      };
      const keywords = catMap[categoryFilter] || [];
      if (keywords.length > 0) {
        result = result.filter(p =>
          keywords.some(kw => p.category.toLowerCase().includes(kw))
        );
      }
    }

    // Risk
    if (riskFilter !== 'all') {
      result = result.filter(p => {
        if (p.riskScore === undefined) return false;
        if (riskFilter === 'low') return p.riskScore < 25;
        if (riskFilter === 'medium') return p.riskScore >= 25 && p.riskScore <= 60;
        if (riskFilter === 'high') return p.riskScore > 60;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          return (b.riskScore ?? 0) - (a.riskScore ?? 0);
        case 'budget':
          return b.budgetAllocated - a.budgetAllocated;
        case 'county':
          return getCountyName(a.countyCode).localeCompare(getCountyName(b.countyCode));
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchQuery, statusFilter, categoryFilter, riskFilter, sortBy]);

  // ─── Drawer ──────────────────────────────────────────────────────
  const openDrawer = (project: ProjectRecord) => setSelectedProject(project);
  const closeDrawer = () => setSelectedProject(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProject) closeDrawer();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedProject]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-stone-200 dark:border-stone-700 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
              <Layers className="h-5 w-5 text-stone-600 dark:text-stone-300" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Total Projects</p>
              <p className="text-xl font-bold text-stone-800 dark:text-stone-100">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Active Projects</p>
              <p className="text-xl font-bold text-green-700">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Stalled Projects</p>
              <p className="text-xl font-bold text-red-700">{stats.stalled}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Total Budget</p>
              <p className="text-xl font-bold text-stone-800 dark:text-stone-100">{formatBudgetBillion(stats.totalBudget)}B <span className="text-xs font-normal text-stone-500 dark:text-stone-400">KSh</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="border-stone-200 dark:border-stone-700 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-stone-500 dark:text-stone-400" />
            <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">Filters</span>
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || riskFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 text-xs text-stone-500 dark:text-stone-400"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setRiskFilter('all');
                }}
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search project or county..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700"
              />
            </div>
            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="stalled">Stalled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            {/* Category */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-sm bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 text-sm bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-stone-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Risk Score</SelectItem>
                <SelectItem value="budget">Budget Size</SelectItem>
                <SelectItem value="county">County Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Risk filter chips */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Risk:</span>
            {[
              { value: 'all', label: 'All' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ].map(opt => (
              <Button
                key={opt.value}
                variant={riskFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                className={`h-7 text-xs px-3 ${
                  riskFilter === opt.value
                    ? ''
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'
                } ${
                  riskFilter === opt.value && opt.value === 'low' ? 'bg-green-600 hover:bg-green-700' : ''
                } ${
                  riskFilter === opt.value && opt.value === 'medium' ? 'bg-amber-500 hover:bg-amber-600' : ''
                } ${
                  riskFilter === opt.value && opt.value === 'high' ? 'bg-red-600 hover:bg-red-700' : ''
                }`}
                onClick={() => setRiskFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Search className="h-10 w-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No projects match your filters</p>
            <p className="text-xs text-stone-400 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredProjects.map(project => {
            const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
            const StatusIcon = statusCfg.icon;
            const CatIcon = getCategoryIcon(project.category);
            const riskCfg = getRiskConfig(project.riskScore);
            const budgetPercent = project.budgetAllocated > 0
              ? Math.min(100, Math.round((project.budgetSpent / project.budgetAllocated) * 100))
              : 0;

            return (
              <Card
                key={project.id}
                className="border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-stone-300 transition-all cursor-pointer group"
                onClick={() => openDrawer(project)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-bold text-stone-800 dark:text-stone-100 leading-snug group-hover:text-stone-900 dark:text-stone-50 line-clamp-2">
                        {project.name}
                      </CardTitle>
                    </div>
                    <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 dark:text-stone-400 flex-shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-5 border ${getCategoryColor(project.category)}`}
                    >
                      <CatIcon className="h-2.5 w-2.5 mr-0.5" />
                      {project.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-5 border ${statusCfg.color}`}
                    >
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                      {statusCfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  {/* County + Location */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <MapPin className="h-3 w-3 text-stone-400 flex-shrink-0" />
                    <span className="font-medium text-stone-600 dark:text-stone-300">{getCountyName(project.countyCode)}</span>
                    <span className="text-stone-300">·</span>
                    <span className="truncate">{project.location.name}</span>
                  </div>

                  {/* Budget Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400 font-medium">Budget Utilization</span>
                      <span className="text-stone-600 dark:text-stone-300 font-semibold">{budgetPercent}%</span>
                    </div>
                    <Progress value={budgetPercent} className="h-1.5 bg-stone-100 dark:bg-stone-700" />
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span>Spent: {formatBudget(project.budgetSpent)}</span>
                      <span>Allocated: {formatBudget(project.budgetAllocated)}</span>
                    </div>
                  </div>

                  {/* Risk + Audit + Photos Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {/* Risk Score */}
                      {project.riskScore !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <div className={`relative h-7 w-7 rounded-full flex items-center justify-center border-2 ${riskCfg.borderColor}`}>
                            <div
                              className={`absolute inset-[3px] rounded-full ${riskCfg.color} opacity-20`}
                            />
                            <span className={`relative text-[9px] font-bold ${riskCfg.textColor}`}>
                              {project.riskScore}
                            </span>
                          </div>
                          <span className={`text-[10px] font-medium ${riskCfg.textColor}`}>
                            {riskCfg.label}
                          </span>
                        </div>
                      )}

                      {/* Audit Opinion */}
                      {project.auditOpinion && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-5 border ${getAuditColor(project.auditOpinion)}`}
                        >
                          {project.auditOpinion}
                        </Badge>
                      )}
                    </div>

                    {/* Citizen Photos */}
                    {(project.citizenPhotos ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-stone-400">
                        <Camera className="h-3 w-3" />
                        <span className="text-[10px] font-medium">{project.citizenPhotos}</span>
                      </div>
                    )}

                    {/* Citizen Proofs indicator */}
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-5 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    >
                      <Eye className="h-2.5 w-2.5 mr-0.5" />
                      Proof Hub
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Project Detail Drawer */}
      {selectedProject && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[70%] lg:w-[60%] bg-white dark:bg-stone-900 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100">Project Details</h2>
              <Button variant="ghost" size="sm" onClick={closeDrawer}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ProjectDetailDrawer project={selectedProject} onClose={closeDrawer} />
          </div>
        </div>
      )}
    </div>
  );
}
