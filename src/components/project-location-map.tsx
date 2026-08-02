'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  MapPin, Filter, X, Search, Layers, ChevronRight,
  Construction, CheckCircle2, AlertTriangle, PauseCircle,
  BarChart3, Map as MapIcon, Tag, DollarSign,
  Clock, Eye, Crosshair, Box,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────

type ProjectStatus = 'active' | 'stalled' | 'completed' | 'suspended';
type ProjectCategory = 'infrastructure' | 'health' | 'education' | 'water' | 'agriculture' | 'energy';

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  category: ProjectCategory;
  county: string;
  lat: number;
  lng: number;
  budget: number;
  completionPct: number;
  description: string;
  startDate: string;
}

interface PinPosition {
  x: number;
  y: number;
}

// ─── Status Config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProjectStatus, { color: string; bgClass: string; label: string; icon: React.ReactNode }> = {
  active: { color: '#059669', bgClass: 'bg-emerald-500', label: 'Active', icon: <Construction className="h-3 w-3" /> },
  stalled: { color: '#dc2626', bgClass: 'bg-red-500', label: 'Stalled', icon: <AlertTriangle className="h-3 w-3" /> },
  completed: { color: '#78716c', bgClass: 'bg-stone-400', label: 'Completed', icon: <CheckCircle2 className="h-3 w-3" /> },
  suspended: { color: '#d97706', bgClass: 'bg-amber-500', label: 'Suspended', icon: <PauseCircle className="h-3 w-3" /> },
};

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  infrastructure: 'Infrastructure',
  health: 'Health',
  education: 'Education',
  water: 'Water & Sanitation',
  agriculture: 'Agriculture',
  energy: 'Energy',
};

// ─── Mock Projects ────────────────────────────────────────────────

// Kenya approximate bounds: lat -4.7 to 5.0, lng 33.9 to 42.0
// Map container percentage positions
const LAT_MIN = -4.7;
const LAT_MAX = 5.0;
const LNG_MIN = 33.9;
const LNG_MAX = 42.0;

function toMapPosition(lat: number, lng: number): PinPosition {
  // Invert lat because SVG y increases downward
  const yPct = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  const xPct = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  return { x: Math.max(5, Math.min(95, xPct)), y: Math.max(5, Math.min(95, yPct)) };
}

const mockProjects: Project[] = [
  { id: 'p001', name: 'Nairobi Expressway Phase II', status: 'active', category: 'infrastructure', county: 'Nairobi City', lat: -1.286, lng: 36.817, budget: 42000000000, completionPct: 62, description: 'Expansion of the Nairobi Southern Bypass dual carriageway', startDate: '2023-03-15' },
  { id: 'p002', name: 'Mombasa Port Access Road', status: 'active', category: 'infrastructure', county: 'Mombasa', lat: -4.043, lng: 39.668, budget: 18500000000, completionPct: 78, description: 'Modernization of road network connecting to the port', startDate: '2022-08-01' },
  { id: 'p003', name: 'Kisumu Level 5 Hospital Wing', status: 'completed', category: 'health', county: 'Kisumu', lat: -0.102, lng: 34.762, budget: 8200000000, completionPct: 100, description: 'Construction of a new 200-bed wing at Jaramogi Oginga Odinga Hospital', startDate: '2021-06-01' },
  { id: 'p004', name: 'Turkana Wind Power Extension', status: 'active', category: 'energy', county: 'Turkana', lat: 2.52, lng: 36.12, budget: 15000000000, completionPct: 45, description: 'Phase II of the Lake Turkana Wind Power farm expansion', startDate: '2023-11-01' },
  { id: 'p005', name: 'Machakos Water Treatment Plant', status: 'stalled', category: 'water', county: 'Machakos', lat: -1.517, lng: 37.264, budget: 5600000000, completionPct: 32, description: 'Construction of a 50,000 cubic meter daily capacity treatment plant', startDate: '2022-01-15' },
  { id: 'p006', name: 'Nakuru Technical Institute', status: 'active', category: 'education', county: 'Nakuru', lat: -0.303, lng: 36.065, budget: 3800000000, completionPct: 55, description: 'Construction of a modern TVET institution with capacity for 2,000 students', startDate: '2023-06-01' },
  { id: 'p007', name: 'Garissa Irrigation Scheme', status: 'active', category: 'agriculture', county: 'Garissa', lat: -0.453, lng: 39.655, budget: 7800000000, completionPct: 48, description: 'Development of 5,000-acre irrigation scheme along Tana River', startDate: '2023-04-01' },
  { id: 'p008', name: 'Eldoret Water Supply Upgrade', status: 'suspended', category: 'water', county: 'Uasin Gishu', lat: 0.514, lng: 35.269, budget: 4500000000, completionPct: 22, description: 'Expansion of water supply infrastructure for Eldoret municipality', startDate: '2022-09-01' },
  { id: 'p009', name: 'Malindi Sea Wall Protection', status: 'stalled', category: 'infrastructure', county: 'Kilifi', lat: -3.218, lng: 40.116, budget: 2900000000, completionPct: 38, description: 'Construction of coastal protection infrastructure along Malindi shoreline', startDate: '2022-05-15' },
  { id: 'p010', name: 'Kakamega County Referral Hospital', status: 'active', category: 'health', county: 'Kakamega', lat: 0.283, lng: 34.752, budget: 6100000000, completionPct: 58, description: 'Upgrade of Kakamega County General Hospital to Level 5 status', startDate: '2023-02-01' },
  { id: 'p011', name: 'Marsabit-Borana Highway', status: 'completed', category: 'infrastructure', county: 'Marsabit', lat: 2.33, lng: 37.89, budget: 12400000000, completionPct: 100, description: '240km tarmacked road connecting Marsabit to the Ethiopian border', startDate: '2020-01-01' },
  { id: 'p012', name: 'Meru Milk Processing Plant', status: 'active', category: 'agriculture', county: 'Meru', lat: 0.048, lng: 37.653, budget: 3200000000, completionPct: 70, description: 'Construction of a dairy processing facility for Imenti region farmers', startDate: '2023-01-15' },
  { id: 'p013', name: 'Nyeri Smart Classroom Initiative', status: 'completed', category: 'education', county: 'Nyeri', lat: -0.423, lng: 36.95, budget: 1800000000, completionPct: 100, description: 'Installation of digital learning infrastructure across 45 primary schools', startDate: '2022-03-01' },
  { id: 'p014', name: 'Mandera Solar Grid Project', status: 'suspended', category: 'energy', county: 'Mandera', lat: 3.93, lng: 41.87, budget: 9500000000, completionPct: 15, description: '50MW solar power plant to serve Mandera and Wajir counties', startDate: '2023-07-01' },
  { id: 'p015', name: 'Kisii Teaching and Referral Hospital', status: 'active', category: 'health', county: 'Kisii', lat: -0.677, lng: 34.779, budget: 5200000000, completionPct: 42, description: 'Construction of a 300-bed teaching and referral hospital complex', startDate: '2023-09-01' },
];

// ─── Kenya outline as CSS clip-path (simplified) ───────────────────

const KENYA_OUTLINE_POINTS = [
  '5%, 18%', '8%, 14%', '14%, 12%', '22%, 10%', '30%, 10%',
  '38%, 12%', '45%, 14%', '52%, 18%', '58%, 22%', '62%, 28%',
  '65%, 35%', '68%, 42%', '70%, 50%', '72%, 58%', '74%, 65%',
  '76%, 72%', '78%, 78%', '80%, 82%', '78%, 86%', '75%, 88%',
  '70%, 90%', '64%, 92%', '58%, 94%', '52%, 95%', '46%, 94%',
  '40%', '92%', '36%', '88%', '32%', '84%', '28%', '80%',
  '24%', '76%', '20%', '72%', '16%', '66%', '12%', '58%',
  '9%', '50%', '7%', '42%', '5%', '35%', '4%', '26%',
].join(', ');

// ─── Cluster Logic ─────────────────────────────────────────────────

interface Cluster {
  x: number;
  y: number;
  count: number;
  projectIds: string[];
}

function buildClusters(projects: Project[], threshold: number = 8): { pins: Project[]; clusters: Cluster[] } {
  const positions = projects.map(p => ({ project: p, ...toMapPosition(p.lat, p.lng) }));
  const used = new Set<string>();
  const clusters: Cluster[] = [];
  const pins: Project[] = [];

  for (const pos of positions) {
    if (used.has(pos.project.id)) continue;
    const nearby = positions.filter(other =>
      !used.has(other.project.id) &&
      Math.abs(other.x - pos.x) < threshold &&
      Math.abs(other.y - pos.y) < threshold &&
      other.project.id !== pos.project.id
    );

    if (nearby.length > 0) {
      const group = [pos, ...nearby];
      const avgX = group.reduce((s, g) => s + g.x, 0) / group.length;
      const avgY = group.reduce((s, g) => s + g.y, 0) / group.length;
      clusters.push({
        x: avgX, y: avgY,
        count: group.length + 1,
        projectIds: group.map(g => g.project.id),
      });
      group.forEach(g => used.add(g.project.id));
    } else {
      pins.push(pos.project);
    }
  }

  return { pins, clusters };
}

// ─── Component ────────────────────────────────────────────────────

export default function ProjectLocationMap() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showClusters, setShowClusters] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const counties = useMemo(() => {
    const set = new Set(mockProjects.map(p => p.county));
    return Array.from(set).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (countyFilter !== 'all' && p.county !== countyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.county.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [statusFilter, categoryFilter, countyFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { active: 0, stalled: 0, completed: 0, suspended: 0 };
    filteredProjects.forEach(p => { counts[p.status]++; });
    return counts;
  }, [filteredProjects]);

  const { pins, clusters } = useMemo(() => {
    if (showClusters) return buildClusters(filteredProjects);
    return { pins: filteredProjects, clusters: [] };
  }, [filteredProjects, showClusters]);

  const totalBudget = useMemo(() => {
    return filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  }, [filteredProjects]);

  const formatBudget = (val: number) => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    return `${(val / 1e6).toFixed(0)}M`;
  };

  const handlePinClick = useCallback((project: Project) => {
    setSelectedProject(prev => prev?.id === project.id ? null : project);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">Total Mapped</p>
              <p className="text-lg font-bold text-stone-800 dark:text-stone-200">{filteredProjects.length}</p>
            </div>
          </CardContent>
        </Card>
        {(['active', 'stalled', 'completed', 'suspended'] as ProjectStatus[]).map(status => {
          const cfg = STATUS_CONFIG[status];
          return (
            <Card key={status} className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${cfg.bgClass}/10`}>
                  <CheckCircle2 className={`h-4 w-4 ${cfg.color === '#059669' ? 'text-emerald-600' : cfg.color === '#dc2626' ? 'text-red-500' : cfg.color === '#d97706' ? 'text-amber-500' : 'text-stone-500'}`} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 capitalize">{cfg.label}</p>
                  <p className="text-lg font-bold text-stone-800 dark:text-stone-200">{statusCounts[status]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-stone-400 hover:text-stone-600" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <Filter className="h-4 w-4 mr-2 text-stone-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.entries(STATUS_CONFIG) as [ProjectStatus, typeof STATUS_CONFIG[ProjectStatus]][]).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[170px] bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <Tag className="h-4 w-4 mr-2 text-stone-400" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.entries(CATEGORY_LABELS) as [ProjectCategory, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={countyFilter} onValueChange={setCountyFilter}>
          <SelectTrigger className="w-[160px] bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <MapIcon className="h-4 w-4 mr-2 text-stone-400" />
            <SelectValue placeholder="County" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counties</SelectItem>
            {counties.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showClusters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowClusters(!showClusters)}
          className={showClusters ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300'}
        >
          <Layers className="h-4 w-4 mr-1" />
          Clusters
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Map Area */}
        <Card className="flex-1 overflow-hidden bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
          <CardContent className="p-2 h-full">
            <div
              ref={mapRef}
              className="relative w-full h-full rounded-lg overflow-hidden"
              style={{ minHeight: 450, background: 'linear-gradient(135deg, #e8e4df 0%, #d6d0c8 50%, #c8c0b5 100%)' }}
            >
              {/* Kenya outline background */}
              <div
                className="absolute inset-[8%] rounded-[40%_50%_45%_55%/50%_45%_55%_50%]"
                style={{
                  background: 'linear-gradient(180deg, #d4cfc8 0%, #c5bfb5 50%, #b8b0a4 100%)',
                  border: '2px dashed #a8a29e',
                }}
              />

              {/* Grid lines */}
              {[20, 40, 60, 80].map(pct => (
                <React.Fragment key={`grid-${pct}`}>
                  <div className="absolute top-0 bottom-0 w-px bg-stone-300/30" style={{ left: `${pct}%` }} />
                  <div className="absolute left-0 right-0 h-px bg-stone-300/30" style={{ top: `${pct}%` }} />
                </React.Fragment>
              ))}

              {/* Coordinate labels */}
              <span className="absolute top-1 left-1 text-[9px] text-stone-400 font-mono">4.5N, 34.0E</span>
              <span className="absolute top-1 right-1 text-[9px] text-stone-400 font-mono">4.5N, 41.5E</span>
              <span className="absolute bottom-1 left-1 text-[9px] text-stone-400 font-mono">-4.5S, 34.0E</span>
              <span className="absolute bottom-1 right-1 text-[9px] text-stone-400 font-mono">-4.5S, 41.5E</span>

              {/* Project Pins */}
              {pins.map(project => {
                const pos = toMapPosition(project.lat, project.lng);
                const cfg = STATUS_CONFIG[project.status];
                const isHovered = hoveredProject?.id === project.id;
                const isSelected = selectedProject?.id === project.id;

                return (
                  <div
                    key={project.id}
                    className="absolute group"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: 'translate(-50%, -100%)',
                      zIndex: isHovered || isSelected ? 20 : 10,
                    }}
                    onMouseEnter={() => setHoveredProject(project)}
                    onMouseLeave={() => setHoveredProject(null)}
                    onClick={() => handlePinClick(project)}
                  >
                    {/* Pin shape */}
                    <div className="relative cursor-pointer">
                      <div
                        className={`w-6 h-8 rounded-t-full flex items-center justify-center shadow-md transition-transform ${isHovered || isSelected ? 'scale-125' : 'hover:scale-110'}`}
                        style={{ backgroundColor: cfg.color }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white/80" />
                      </div>
                      <div
                        className="w-3 h-1.5 rounded-b-full mx-auto"
                        style={{ backgroundColor: `${cfg.color}99` }}
                      />
                    </div>

                    {/* Hover tooltip */}
                    {isHovered && !isSelected && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap z-30 pointer-events-none">
                        <p className="text-xs font-semibold">{project.name}</p>
                        <p className="text-[10px] opacity-80">{project.county}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Cluster badges */}
              {clusters.map((cluster, i) => (
                <div
                  key={`cluster-${i}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${cluster.x}%`,
                    top: `${cluster.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 15,
                  }}
                  onMouseEnter={() => {
                    const firstId = cluster.projectIds[0];
                    const p = mockProjects.find(x => x.id === firstId);
                    if (p) setHoveredProject(p);
                  }}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-600 border-3 border-white shadow-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{cluster.count}</span>
                  </div>
                </div>
              ))}

              {/* Selected project popup */}
              {selectedProject && (
                <div className="absolute top-3 right-3 w-[280px] bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 shadow-xl z-30">
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200 pr-4 leading-tight">{selectedProject.name}</h4>
                      <button onClick={() => setSelectedProject(null)}>
                        <X className="h-4 w-4 text-stone-400 hover:text-stone-600 shrink-0" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 line-clamp-2">{selectedProject.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        style={{ borderColor: STATUS_CONFIG[selectedProject.status].color, color: STATUS_CONFIG[selectedProject.status].color }}
                        className="text-[10px]"
                      >
                        {STATUS_CONFIG[selectedProject.status].label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        {CATEGORY_LABELS[selectedProject.category]}
                      </Badge>
                    </div>
                    <Separator className="mb-2 bg-stone-200 dark:bg-stone-700" />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-stone-500">County</p>
                        <p className="font-medium text-stone-700 dark:text-stone-300">{selectedProject.county}</p>
                      </div>
                      <div>
                        <p className="text-stone-500">Budget</p>
                        <p className="font-medium text-stone-700 dark:text-stone-300">KES {formatBudget(selectedProject.budget)}</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between mb-1">
                          <p className="text-stone-500">Completion</p>
                          <p className="font-medium text-emerald-600">{selectedProject.completionPct}%</p>
                        </div>
                        <Progress value={selectedProject.completionPct} className="h-1.5 bg-stone-200 dark:bg-stone-700" />
                      </div>
                      <div>
                        <p className="text-stone-500">Started</p>
                        <p className="font-medium text-stone-700 dark:text-stone-300">{selectedProject.startDate}</p>
                      </div>
                      <div>
                        <p className="text-stone-500">Coordinates</p>
                        <p className="font-medium text-stone-700 dark:text-stone-300 font-mono text-[10px]">
                          {selectedProject.lat.toFixed(3)}, {selectedProject.lng.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Legend */}
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-lg p-2.5 border border-stone-200 dark:border-stone-700 shadow-sm">
                <p className="text-[10px] font-medium text-stone-500 dark:text-stone-400 mb-1.5">Pin Status</p>
                <div className="flex flex-col gap-1">
                  {(Object.entries(STATUS_CONFIG) as [ProjectStatus, typeof STATUS_CONFIG[ProjectStatus]][]).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className="w-3 h-4 rounded-t-full" style={{ backgroundColor: cfg.color }} />
                      <span className="text-[10px] text-stone-600 dark:text-stone-400">{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Budget Badge */}
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-stone-200 dark:border-stone-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-[10px] text-stone-500">Total Budget</p>
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-200">KES {formatBudget(totalBudget)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project List Sidebar */}
        <div className="w-[300px] flex flex-col shrink-0">
          <Card className="flex-1 overflow-hidden bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm text-stone-800 dark:text-stone-200">Project List</CardTitle>
              <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[460px]">
                <div className="px-3 pb-3 space-y-2">
                  {filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <Crosshair className="h-8 w-8 text-stone-300 dark:text-stone-600 mb-2" />
                      <p className="text-xs text-stone-500 dark:text-stone-400">No projects match the current filters</p>
                    </div>
                  ) : (
                    filteredProjects.map(project => {
                      const cfg = STATUS_CONFIG[project.status];
                      const pos = toMapPosition(project.lat, project.lng);
                      const isSelected = selectedProject?.id === project.id;

                      return (
                        <button
                          key={project.id}
                          onClick={() => handlePinClick(project)}
                          onMouseEnter={() => setHoveredProject(project)}
                          onMouseLeave={() => setHoveredProject(null)}
                          className={`w-full text-left p-2.5 rounded-lg transition-colors border ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                              : 'bg-white dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                              style={{ backgroundColor: cfg.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">{project.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-stone-500">{project.county}</span>
                                <span className="text-stone-300 dark:text-stone-600">|</span>
                                <span className="text-[10px] text-stone-500">KES {formatBudget(project.budget)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge
                                  variant="outline"
                                  style={{ borderColor: cfg.color, color: cfg.color }}
                                  className="text-[9px] px-1 py-0 h-4"
                                >
                                  {cfg.label}
                                </Badge>
                                <span className="text-[10px] text-stone-500 font-mono">
                                  {pos.x.toFixed(1)}%, {pos.y.toFixed(1)}%
                                </span>
                              </div>
                              <div className="mt-1.5">
                                <Progress
                                  value={project.completionPct}
                                  className={`h-1 bg-stone-200 dark:bg-stone-700 ${project.completionPct >= 75 ? '[&>div]:bg-emerald-500' : project.completionPct >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-400'}`}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
