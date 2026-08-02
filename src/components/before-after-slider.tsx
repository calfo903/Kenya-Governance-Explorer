'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  ArrowLeftRight, Calendar, Clock, DollarSign, MapPin,
  ChevronLeft, ChevronRight, BarChart3, CheckCircle2,
  CircleDot, TrendingUp, Construction, Eye, Layers,
  CalendarDays, Flag, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────

type ProjectStatus = 'active' | 'completed' | 'stalled';

interface Milestone {
  label: string;
  date: string;
  completed: boolean;
}

interface BeforeAfterProject {
  id: string;
  name: string;
  county: string;
  startDate: string;
  beforeDate: string;
  afterDate: string;
  expectedCompletion: string;
  status: ProjectStatus;
  budgetTotal: number;
  budgetUtilization: number;
  milestones: Milestone[];
  beforeVisualization: BeforeState;
  afterVisualization: AfterState;
}

interface BeforeState {
  groundColor: string;
  structureColor: string;
  overlayColor: string;
  label: string;
  description: string;
}

interface AfterState {
  groundColor: string;
  structureColor: string;
  overlayColor: string;
  label: string;
  description: string;
}

// ─── Mock Data: 6 Projects ────────────────────────────────────────

const mockProjects: BeforeAfterProject[] = [
  {
    id: 'ba001',
    name: 'Kakamega County Referral Hospital Upgrade',
    county: 'Kakamega',
    startDate: '2022-03-01',
    beforeDate: '2022-01-15',
    afterDate: '2025-01-10',
    expectedCompletion: '2025-12-31',
    status: 'active',
    budgetTotal: 6100000000,
    budgetUtilization: 58,
    milestones: [
      { label: 'Project Design & Approval', date: '2022-02-15', completed: true },
      { label: 'Site Preparation & Foundation', date: '2022-06-30', completed: true },
      { label: 'Structural Works', date: '2023-04-30', completed: true },
      { label: 'Roofing & Finishing', date: '2024-03-31', completed: true },
      { label: 'Medical Equipment Installation', date: '2025-06-30', completed: false },
      { label: 'Commissioning & Handover', date: '2025-12-31', completed: false },
    ],
    beforeVisualization: {
      groundColor: '#a8a29e',
      structureColor: '#78716c',
      overlayColor: '#44403c80',
      label: 'Bare ground, old foundations',
      description: 'Dilapidated outpatient block with cracked walls and leaking roof, serving only 80 patients daily.',
    },
    afterVisualization: {
      groundColor: '#d1fae5',
      structureColor: '#059669',
      overlayColor: '#065f4650',
      label: 'Modern hospital wing taking shape',
      description: 'New 300-bed wing 58% complete with modern ICU, maternity, and surgical theatres under construction.',
    },
  },
  {
    id: 'ba002',
    name: 'Machakos Level 4 Water Treatment Plant',
    county: 'Machakos',
    startDate: '2021-09-01',
    beforeDate: '2021-07-01',
    afterDate: '2025-01-10',
    expectedCompletion: '2025-06-30',
    status: 'stalled',
    budgetTotal: 5600000000,
    budgetUtilization: 32,
    milestones: [
      { label: 'Feasibility Study', date: '2021-08-31', completed: true },
      { label: 'Land Acquisition', date: '2021-12-31', completed: true },
      { label: 'Civil Works Phase I', date: '2022-09-30', completed: true },
      { label: 'Equipment Procurement', date: '2023-06-30', completed: false },
      { label: 'Pipeline Connection', date: '2024-06-30', completed: false },
      { label: 'Testing & Commissioning', date: '2025-06-30', completed: false },
    ],
    beforeVisualization: {
      groundColor: '#d4a76a',
      structureColor: '#92400e',
      overlayColor: '#7c2d1220',
      label: 'Dry riverbed, no infrastructure',
      description: 'Undeveloped site near Athi River with no water treatment facilities, residents relying on boreholes.',
    },
    afterVisualization: {
      groundColor: '#93c5fd',
      structureColor: '#1d4ed8',
      overlayColor: '#1e3a5f40',
      label: 'Partial structures, stalled',
      description: 'Foundation and tank bases laid but construction halted due to contractor disputes. 32% complete.',
    },
  },
  {
    id: 'ba003',
    name: 'Kisumu Pier and Lakeside Promenade',
    county: 'Kisumu',
    startDate: '2021-01-15',
    beforeDate: '2020-10-01',
    afterDate: '2024-12-01',
    expectedCompletion: '2024-12-31',
    status: 'completed',
    budgetTotal: 2800000000,
    budgetUtilization: 95,
    milestones: [
      { label: 'Environmental Assessment', date: '2021-02-28', completed: true },
      { label: 'Pier Foundation', date: '2021-09-30', completed: true },
      { label: 'Pier Superstructure', date: '2022-06-30', completed: true },
      { label: 'Promenade Walkway', date: '2023-03-31', completed: true },
      { label: 'Landscaping & Lighting', date: '2024-06-30', completed: true },
      { label: 'Public Opening', date: '2024-12-15', completed: true },
    ],
    beforeVisualization: {
      groundColor: '#78716c',
      structureColor: '#57534e',
      overlayColor: '#1c191740',
      label: 'Collapsed pier, overgrown lakefront',
      description: 'Derelict colonial-era pier with collapsing concrete slabs and overgrown vegetation along the shoreline.',
    },
    afterVisualization: {
      groundColor: '#86efac',
      structureColor: '#15803d',
      overlayColor: '#065f4620',
      label: 'Completed modern pier and promenade',
      description: 'A modern 300-meter pier with recreational walkway, seating areas, and decorative lighting serving tourists.',
    },
  },
  {
    id: 'ba004',
    name: 'Nakuru-Naivasha Highway Dualing',
    county: 'Nakuru',
    startDate: '2022-06-01',
    beforeDate: '2022-03-01',
    afterDate: '2025-01-10',
    expectedCompletion: '2026-06-30',
    status: 'active',
    budgetTotal: 18500000000,
    budgetUtilization: 42,
    milestones: [
      { label: 'Design Finalization', date: '2022-05-31', completed: true },
      { label: 'Right of Way Clearance', date: '2022-11-30', completed: true },
      { label: 'Earthworks & Grading', date: '2023-06-30', completed: true },
      { label: 'Road Base Construction', date: '2024-03-31', completed: true },
      { label: 'Paving & Marking', date: '2025-09-30', completed: false },
      { label: 'Bridge Construction', date: '2026-03-31', completed: false },
      { label: 'Final Commissioning', date: '2026-06-30', completed: false },
    ],
    beforeVisualization: {
      groundColor: '#a8a29e',
      structureColor: '#6b7280',
      overlayColor: '#37415140',
      label: 'Narrow single-carriageway, potholed',
      description: 'Dangerous 42km single-lane road with frequent accidents, heavy truck traffic, and severe potholes.',
    },
    afterVisualization: {
      groundColor: '#e5e7eb',
      structureColor: '#2563eb',
      overlayColor: '#1e3a5f30',
      label: 'Dual carriageway taking shape',
      description: '42% complete dual carriageway with new bridges at Gilgil and Mai Mahiu. Base course laid for 18km.',
    },
  },
  {
    id: 'ba005',
    name: 'Mombasa Old Town Sewerage Rehabilitation',
    county: 'Mombasa',
    startDate: '2021-04-01',
    beforeDate: '2021-01-15',
    afterDate: '2025-01-10',
    expectedCompletion: '2025-09-30',
    status: 'active',
    budgetTotal: 4200000000,
    budgetUtilization: 72,
    milestones: [
      { label: 'Network Mapping', date: '2021-06-30', completed: true },
      { label: 'Pump Station Upgrade', date: '2022-03-31', completed: true },
      { label: 'Main Trunk Sewer Lining', date: '2023-03-31', completed: true },
      { label: 'House Connections', date: '2024-03-31', completed: true },
      { label: 'Treatment Works Upgrade', date: '2025-06-30', completed: false },
      { label: 'System Testing', date: '2025-09-30', completed: false },
    ],
    beforeVisualization: {
      groundColor: '#78716c',
      structureColor: '#57534e',
      overlayColor: '#1c191760',
      label: 'Collapsed sewer lines, raw sewage',
      description: 'Century-old clay pipes regularly collapsing, causing sewage overflows into streets and the ocean.',
    },
    afterVisualization: {
      groundColor: '#d1fae5',
      structureColor: '#059669',
      overlayColor: '#065f4630',
      label: 'Modern sewer network 72% complete',
      description: 'HDPE pipes laid for 65% of the network. New pump stations operational. Treatment works under upgrade.',
    },
  },
  {
    id: 'ba006',
    name: 'Garissa Solar-Powered Irrigation Scheme',
    county: 'Garissa',
    startDate: '2023-01-15',
    beforeDate: '2022-10-01',
    afterDate: '2025-01-10',
    expectedCompletion: '2026-12-31',
    status: 'active',
    budgetTotal: 7800000000,
    budgetUtilization: 35,
    milestones: [
      { label: 'Hydrological Survey', date: '2023-03-31', completed: true },
      { label: 'Solar Panel Installation', date: '2023-12-31', completed: true },
      { label: 'Borehole Drilling', date: '2024-06-30', completed: true },
      { label: 'Drip Irrigation Network', date: '2025-06-30', completed: false },
      { label: 'Farmer Training Program', date: '2025-12-31', completed: false },
      { label: 'Full Commissioning', date: '2026-12-31', completed: false },
    ],
    beforeVisualization: {
      groundColor: '#d4a76a',
      structureColor: '#92400e',
      overlayColor: '#7c2d1240',
      label: 'Arid land, subsistence farming',
      description: 'Barren semi-arid land with failed rain-fed crops. Families dependent on food aid during droughts.',
    },
    afterVisualization: {
      groundColor: '#86efac',
      structureColor: '#16a34a',
      overlayColor: '#065f4620',
      label: 'Solar panels installed, irrigation starting',
      description: 'Solar farm generating 2MW powering boreholes. 35% of drip irrigation network laid. Green shoots visible.',
    },
  },
];

const STATUS_CONFIG: Record<ProjectStatus, { color: string; label: string }> = {
  active: { color: '#059669', label: 'Active' },
  completed: { color: '#78716c', label: 'Completed' },
  stalled: { color: '#dc2626', label: 'Stalled' },
};

// ─── Visualization Sub-Component ──────────────────────────────────

function ProjectVisualization({
  state,
  side,
  projectName,
}: {
  state: BeforeState;
  side: 'before' | 'after';
  projectName: string;
}) {
  const isBefore = side === 'before';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Ground layer */}
      <div className="absolute inset-0" style={{ backgroundColor: state.groundColor }}>
        {/* Texture pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isBefore ? '#000' : '#fff'} 10px, ${isBefore ? '#000' : '#fff'} 11px)`,
        }} />
      </div>

      {/* Overlay tint */}
      <div className="absolute inset-0" style={{ backgroundColor: state.overlayColor }} />

      {/* Structure representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Main structure */}
          <div className="flex gap-3 items-end">
            {/* Building blocks */}
            <div
              className="w-16 h-24 rounded-t-md shadow-lg relative"
              style={{ backgroundColor: state.structureColor }}
            >
              {/* Windows */}
              <div className="absolute inset-2 grid grid-cols-2 gap-1.5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-sm"
                    style={{
                      backgroundColor: isBefore ? `${state.structureColor}60` : '#ffffff80',
                      height: 4,
                    }}
                  />
                ))}
              </div>
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-5 rounded-t-sm" style={{
                backgroundColor: isBefore ? '#44403c' : '#ffffff90',
              }} />
            </div>
            {/* Secondary structure */}
            <div
              className="w-10 h-16 rounded-t-md shadow-md"
              style={{
                backgroundColor: isBefore ? `${state.structureColor}80` : `${state.structureColor}cc`,
              }}
            >
              <div className="absolute inset-1.5 grid grid-cols-1 gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-sm" style={{
                    backgroundColor: isBefore ? `${state.structureColor}40` : '#ffffff60',
                    height: 3,
                  }} />
                ))}
              </div>
            </div>
            {/* Tower element */}
            <div
              className="w-6 h-32 rounded-t-full shadow-md"
              style={{
                backgroundColor: isBefore ? `${state.structureColor}60` : `${state.structureColor}dd`,
              }}
            />
          </div>

          {/* Ground line */}
          <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full" style={{
            backgroundColor: isBefore ? '#57534e' : '#065f46',
          }} />
        </div>
      </div>

      {/* Status badge overlay */}
      <div className="absolute top-3 left-3">
        <div className={`px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-sm ${
          isBefore ? 'bg-stone-800/70 text-white' : 'bg-emerald-800/70 text-white'
        }`}>
          {isBefore ? 'BEFORE' : 'AFTER'}
        </div>
      </div>

      {/* Label overlay */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-black/60 dark:bg-black/80 backdrop-blur-sm rounded-md px-3 py-2">
          <p className="text-[11px] font-semibold text-white">{state.label}</p>
          <p className="text-[10px] text-white/80 mt-0.5 line-clamp-2">{state.description}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export default function BeforeAfterSlider() {
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0].id);
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProject = useMemo(
    () => mockProjects.find(p => p.id === selectedProjectId) || mockProjects[0],
    [selectedProjectId]
  );

  const completedMilestones = useMemo(
    () => selectedProject.milestones.filter(m => m.completed).length,
    [selectedProject]
  );

  const totalMilestones = selectedProject.milestones.length;

  const formatBudget = (val: number) => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    return `${(val / 1e6).toFixed(0)}M`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e);
  }, [sliderPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    updateTouchPosition(e);
  }, [sliderPosition]);

  const updatePosition = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  const updateTouchPosition = useCallback((e: TouchEvent | React.TouchEvent) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) updatePosition(e);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current) updateTouchPosition(e);
    };
    const handleEnd = () => { isDragging.current = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [updatePosition, updateTouchPosition]);

  const statusCfg = STATUS_CONFIG[selectedProject.status];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Project Selector & Meta */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 block">Select Project</label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
              <Construction className="h-4 w-4 mr-2 text-emerald-600" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockProjects.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    <span>{p.name}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] ml-1"
                      style={{ borderColor: STATUS_CONFIG[p.status].color, color: STATUS_CONFIG[p.status].color }}
                    >
                      {STATUS_CONFIG[p.status].label}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick stats row */}
        <div className="flex gap-3 flex-wrap">
          <Card className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <CardContent className="p-2.5 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-stone-400" />
              <div>
                <p className="text-[10px] text-stone-500">County</p>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{selectedProject.county}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <CardContent className="p-2.5 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-stone-500">Budget</p>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">KES {formatBudget(selectedProject.budgetTotal)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <CardContent className="p-2.5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-stone-500">Utilization</p>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{selectedProject.budgetUtilization}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <CardContent className="p-2.5 flex items-center gap-2">
              <Flag className="h-4 w-4" style={{ color: statusCfg.color }} />
              <div>
                <p className="text-[10px] text-stone-500">Status</p>
                <p className="text-xs font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Before/After Comparison Slider */}
      <Card className="overflow-hidden bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative select-none"
            style={{ height: 380, cursor: isDragging.current ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Before layer (full width) */}
            <div className="absolute inset-0">
              <ProjectVisualization
                state={selectedProject.beforeVisualization}
                side="before"
                projectName={selectedProject.name}
              />
            </div>

            {/* After layer (clipped to slider position) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <ProjectVisualization
                state={selectedProject.afterVisualization}
                side="after"
                projectName={selectedProject.name}
              />
            </div>

            {/* Slider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20"
              style={{ left: `${sliderPosition}%` }}
            />

            {/* Slider handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl border-2 border-stone-300 flex items-center justify-center hover:scale-110 transition-transform"
              style={{ left: `${sliderPosition}%`, transform: `translate(-50%, -50%)` }}
            >
              <ArrowLeftRight className="h-4 w-4 text-stone-600" />
            </div>

            {/* Date labels on slider */}
            <div className="absolute bottom-3 right-3 z-10">
              <div className="bg-stone-800/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-md px-2 py-1">
                <p className="text-[10px] text-stone-400">Before</p>
                <p className="text-[11px] font-semibold text-white">{formatDate(selectedProject.beforeDate)}</p>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 z-10">
              <div className="bg-emerald-800/80 backdrop-blur-sm rounded-md px-2 py-1">
                <p className="text-[10px] text-emerald-300">After</p>
                <p className="text-[11px] font-semibold text-white">{formatDate(selectedProject.afterDate)}</p>
              </div>
            </div>

            {/* Directional hints at edges */}
            <div className="absolute top-3 right-3 z-10 opacity-50">
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
            <div className="absolute top-3 left-3 z-10 opacity-50">
              <ChevronLeft className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Slider instruction */}
          <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">
            <p className="text-[10px] text-stone-500 dark:text-stone-400 text-center">
              <ArrowLeftRight className="h-3 w-3 inline mr-1" />
              Drag the slider left and right to compare before and after states
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section: Project Meta + Milestones */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Project Metadata Card */}
        <Card className="w-[320px] shrink-0 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-stone-800 dark:text-stone-200">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-2 text-xs">
              <MetaRow icon={<MapPin className="h-3.5 w-3.5 text-stone-400" />} label="County" value={selectedProject.county} />
              <MetaRow icon={<Calendar className="h-3.5 w-3.5 text-stone-400" />} label="Start Date" value={formatDate(selectedProject.startDate)} />
              <MetaRow icon={<Flag className="h-3.5 w-3.5" style={{ color: statusCfg.color }} />} label="Status" value={statusCfg.label} valueColor={statusCfg.color} />
              <MetaRow icon={<Clock className="h-3.5 w-3.5 text-stone-400" />} label="Expected Completion" value={formatDate(selectedProject.expectedCompletion)} />
              <Separator className="bg-stone-200 dark:bg-stone-700" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-stone-500">Budget Utilization</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedProject.budgetUtilization}%</span>
                </div>
                <Progress value={selectedProject.budgetUtilization} className="h-2 bg-stone-200 dark:bg-stone-700" />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-stone-400">KES {formatBudget(selectedProject.budgetTotal * selectedProject.budgetUtilization / 100)} spent</span>
                  <span className="text-[10px] text-stone-400">of KES {formatBudget(selectedProject.budgetTotal)}</span>
                </div>
              </div>
              <Separator className="bg-stone-200 dark:bg-stone-700" />
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-stone-500">Milestones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{
                      width: `${(completedMilestones / totalMilestones) * 100}%`,
                    }} />
                  </div>
                  <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-400 whitespace-nowrap">
                    {completedMilestones}/{totalMilestones}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Timeline */}
        <Card className="flex-1 overflow-hidden bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-stone-800 dark:text-stone-200">Progress Timeline</CardTitle>
            <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
              {completedMilestones} of {totalMilestones} milestones completed
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-stone-200 dark:bg-stone-700" />

              <div className="space-y-4">
                {selectedProject.milestones.map((milestone, i) => {
                  const isLast = i === totalMilestones - 1;
                  return (
                    <div key={i} className="flex gap-3 relative">
                      {/* Dot */}
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 ${
                        milestone.completed
                          ? 'bg-emerald-500 border-emerald-400'
                          : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600'
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : (
                          <CircleDot className={`h-3 w-3 ${isLast ? 'text-amber-500' : 'text-stone-400'}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-xs font-medium ${
                              milestone.completed
                                ? 'text-stone-800 dark:text-stone-200'
                                : 'text-stone-500 dark:text-stone-400'
                            }`}>
                              {milestone.label}
                            </p>
                            <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                              <CalendarDays className="h-2.5 w-2.5" />
                              {formatDate(milestone.date)}
                            </p>
                          </div>
                          {milestone.completed ? (
                            <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[9px] px-1.5 py-0 h-4">
                              Done
                            </Badge>
                          ) : isLast && selectedProject.status === 'stalled' ? (
                            <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 text-[9px] px-1.5 py-0 h-4">
                              Blocked
                            </Badge>
                          ) : (
                            <Badge className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[9px] px-1.5 py-0 h-4">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Helper Component ─────────────────────────────────────────────

function MetaRow({ icon, label, value, valueColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-stone-500">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium text-stone-800 dark:text-stone-200" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
    </div>
  );
}
