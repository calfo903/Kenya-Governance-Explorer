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
  Maximize2, Minimize2,
} from 'lucide-react';
import { getAuditColor } from '@/data/types';
import { toast } from 'sonner';

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
  const [isDrawerFullscreen, setIsDrawerFullscreen] = useState(false);

  // ─── Citizen Auditor Gamified States ────────────────────────────
  const [auditorXP, setAuditorXP] = useState(450);
  const [auditorLevel, setAuditorLevel] = useState(3);
  const [proofProject, setProofProject] = useState('');
  const [proofStatus, setProofStatus] = useState('stalled');
  const [proofNotes, setProofNotes] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  const handleAuditorProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofProject || proofNotes.trim().length < 15) {
      return;
    }

    setSubmittingProof(true);

    setTimeout(() => {
      setSubmittingProof(false);
      
      const addedXP = 150;
      const nextXP = auditorXP + addedXP;
      
      if (nextXP >= 600) {
        setAuditorLevel(prev => prev + 1);
        setAuditorXP(nextXP - 600);
        toast(`🏆 LEVEL UP! You are now a Level ${auditorLevel + 1} - Devolution Sentinel!`, {
          description: `Excellent work crowdsourcing ground-truth data in Kenya's counties!`,
        });
      } else {
        setAuditorXP(nextXP);
        toast(`📸 Field Proof Submitted! +150 XP Earned`, {
          description: `Your contribution helps audit paper budgets against physical realities.`,
        });
      }

      setProofProject('');
      setProofNotes('');
      setProofFileName('');
    }, 1200);
  };

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
  const openDrawer = (project: ProjectRecord) => {
    setSelectedProject(project);
    setIsDrawerFullscreen(false);
  };
  const closeDrawer = () => {
    setSelectedProject(null);
    setIsDrawerFullscreen(false);
  };

  // Scroll-to-fullscreen: listen for scroll in the drawer panel
  const drawerPanelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const panel = drawerPanelRef.current;
    if (!panel) return;
    const handleScroll = () => {
      // Auto-enter fullscreen when user scrolls past 120px
      if (panel.scrollTop > 120 && !isDrawerFullscreen) {
        setIsDrawerFullscreen(true);
      }
    };
    panel.addEventListener('scroll', handleScroll, { passive: true });
    return () => panel.removeEventListener('scroll', handleScroll);
  }, [isDrawerFullscreen]);

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

      {/* Citizen Auditor Gamified Dashboard (Suggestion 5) */}
      <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 via-white to-stone-50/50 dark:from-indigo-950/20 dark:via-stone-900 dark:to-stone-950 shadow-md">
        <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-950">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                <Camera className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-indigo-900 dark:text-indigo-300">Citizen Auditor Portal</CardTitle>
                <CardDescription className="text-xs text-indigo-600/80 dark:text-indigo-400/85">
                  Verify paper budgets on the ground. Level up and earn digital badges for civic oversight!
                </CardDescription>
              </div>
            </div>
            {/* Level and XP Badge */}
            <div className="flex items-center gap-3 bg-white dark:bg-stone-900 border border-indigo-100 dark:border-indigo-950 px-4 py-2 rounded-xl shrink-0">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-500 block">Auditor Rank</span>
                <span className="text-xs font-bold text-stone-800 dark:text-stone-100">Level {auditorLevel} — Devolution Sentinel</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-600/20">
                L{auditorLevel}
              </div>
            </div>
          </div>
          {/* XP Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              <span>XP Progress</span>
              <span>{auditorXP} / 600 XP</span>
            </div>
            <Progress value={(auditorXP / 600) * 100} className="h-2 bg-indigo-100 dark:bg-indigo-950/40 [&>[data-slot=progress-indicator]]:bg-indigo-600 dark:[&>[data-slot=progress-indicator]]:bg-indigo-500" />
          </div>
        </CardHeader>

        <CardContent className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Quests */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Zap className="size-3.5" />
              Active Auditor Quests
            </h4>
            
            <div className="space-y-2.5">
              {[
                { id: 'q1', label: '📸 Upload field photo of Kajiado Borehole #34', xp: '+150 XP', county: 'Kajiado', desc: 'Borehole drilling at Oloolua' },
                { id: 'q2', label: '📊 Verify cost absorption for School Project #12', xp: '+100 XP', county: 'Nairobi', desc: 'Medical clinic rehabilitation' },
                { id: 'q3', label: '📝 Submit rating for Mombasa Local Health Center', xp: '+50 XP', county: 'Mombasa', desc: 'Renovation of clinic' }
              ].map((quest) => (
                <div key={quest.id} className="flex items-start gap-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-3 rounded-xl hover:shadow-sm transition-shadow">
                  <input
                    type="checkbox"
                    checked={completedQuests.has(quest.id)}
                    onChange={() => {
                      if (completedQuests.has(quest.id)) {
                        setCompletedQuests(prev => { const n = new Set(prev); n.delete(quest.id); return n; });
                        setAuditorXP(prev => Math.max(0, prev - 100));
                      } else {
                        setCompletedQuests(prev => { const n = new Set(prev); n.add(quest.id); return n; });
                        setAuditorXP(prev => {
                          const n = prev + 100;
                          if (n >= 600) {
                            setAuditorLevel(l => l + 1);
                            toast.success(`🏆 LEVEL UP! You are now Level ${auditorLevel + 1}!`);
                            return n - 600;
                          }
                          toast.success('Quest Checked! +100 XP Earned.');
                          return n;
                        });
                      }
                    }}
                    className="mt-1 size-4 rounded border-stone-300 dark:border-stone-700 text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${completedQuests.has(quest.id) ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-800 dark:text-stone-200'}`}>
                      {quest.label}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{quest.desc} · {quest.county}</p>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/80 font-mono text-[9px] font-bold shrink-0">
                    {quest.xp}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator className="lg:hidden bg-indigo-100 dark:bg-indigo-950" />

          {/* Submit Ground Truth */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Camera className="size-3.5" />
              Submit Local Field Proof
            </h4>

            <form onSubmit={handleAuditorProofSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Select Local Project</Label>
                  <Select value={proofProject} onValueChange={setProofProject}>
                    <SelectTrigger className="h-9 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 text-xs">
                      <SelectValue placeholder="Select target project..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 text-xs">
                      {projects.slice(0, 5).map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.id} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Field Ground Status</Label>
                  <Select value={proofStatus} onValueChange={setProofStatus}>
                    <SelectTrigger className="h-9 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 text-xs">
                      <SelectValue placeholder="Status on the ground" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 text-xs">
                      <SelectItem value="stalled" className="text-xs">Stalled / Abandoned</SelectItem>
                      <SelectItem value="active" className="text-xs">Active / Ongoing</SelectItem>
                      <SelectItem value="completed" className="text-xs">Fully Functional / Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Ground Observations & Notes</Label>
                  <Input
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="Describe actual state (Minimum 15 characters)..."
                    className="h-9 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-850 text-xs placeholder:text-stone-400"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">Add Photo Proof (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={proofFileName}
                      readOnly
                      placeholder="No file uploaded"
                      className="h-9 bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-850 text-xs shrink truncate"
                    />
                    <label className="h-9 px-3 bg-stone-100 hover:bg-stone-250 dark:bg-stone-800 hover:dark:bg-stone-705 border border-stone-200 dark:border-stone-850 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer shrink-0">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setProofFileName(f.name);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submittingProof || !proofProject || proofNotes.trim().length < 15}
                className={`w-full h-9 font-semibold text-xs transition-all gap-1.5 ${
                  proofProject && proofNotes.trim().length >= 15 && !submittingProof
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                }`}
              >
                {submittingProof ? (
                  <>
                    <Clock className="size-3.5 animate-spin" />
                    Processing ground proof upload...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Submit Ground Proof &amp; Earn +150 XP
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

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
          {/* Backdrop — only visible & clickable when NOT fullscreen */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isDrawerFullscreen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={closeDrawer}
          />
          {/* Drawer panel */}
          <div
            ref={drawerPanelRef}
            className={`absolute top-0 bottom-0 bg-white dark:bg-stone-900 shadow-2xl overflow-y-auto transition-all duration-300 ease-in-out ${
              isDrawerFullscreen
                ? 'left-0 right-0 w-full'
                : 'right-0 left-auto w-full sm:w-[70%] lg:w-[60%]'
            }`}
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100">Project Details</h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDrawerFullscreen(!isDrawerFullscreen)}
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full h-8 w-8 p-0"
                  title={isDrawerFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isDrawerFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDrawer}
                  className="text-stone-500 dark:text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ProjectDetailDrawer project={selectedProject} onClose={closeDrawer} />
          </div>
        </div>
      )}
    </div>
  );
}
