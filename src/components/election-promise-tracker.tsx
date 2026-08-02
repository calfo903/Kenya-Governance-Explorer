'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, TrendingUp,
  Target, BarChart3, ArrowUpDown, ExternalLink, Filter,
  GitCompare, Search, Building2, Heart, BookOpen, Briefcase,
  Droplets, Zap, Shield, Truck, Users, MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type PromiseStatus = 'completed' | 'in_progress' | 'stalled' | 'not_started';

interface Promise {
  id: string;
  text: string;
  category: string;
  status: PromiseStatus;
  progress: number;
  evidence: string;
  source: string;
  dateMade: string;
  lastUpdated: string;
}

interface GovernorData {
  name: string;
  county: string;
  party: string;
  promises: Promise[];
}

const STATUS_CONFIG: Record<PromiseStatus, { label: string; bg: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400', icon: <Clock className="h-3.5 w-3.5" /> },
  stalled: { label: 'Stalled', bg: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  not_started: { label: 'Not Started', bg: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Infrastructure: <Building2 className="h-3.5 w-3.5" />,
  Health: <Heart className="h-3.5 w-3.5" />,
  Education: <BookOpen className="h-3.5 w-3.5" />,
  Agriculture: <Truck className="h-3.5 w-3.5" />,
  Water: <Droplets className="h-3.5 w-3.5" />,
  Youth: <Users className="h-3.5 w-3.5" />,
  Economy: <TrendingUp className="h-3.5 w-3.5" />,
  Governance: <Shield className="h-3.5 w-3.5" />,
  Energy: <Zap className="h-3.5 w-3.5" />,
  ICT: <Zap className="h-3.5 w-3.5" />,
  Trade: <Briefcase className="h-3.5 w-3.5" />,
};

const governorData: GovernorData[] = [
  {
    name: 'H.E. Joseph Ole Lenku',
    county: 'Kajiado',
    party: 'ODM',
    promises: [
      { id: 'k1', text: 'Construct 200km of tarmac roads across all sub-counties', category: 'Infrastructure', status: 'in_progress', progress: 58, evidence: '78km completed as of December 2024', source: 'Kajiado County Roads Department Report Q2 2024/25', dateMade: '2022-08-15', lastUpdated: '2024-12-20' },
      { id: 'k2', text: 'Upgrade Kajiado County Referral Hospital to Level 5', category: 'Health', status: 'in_progress', progress: 72, evidence: 'New wing under construction, ICU operational', source: 'Kajiado County Health Strategic Plan 2023-2027', dateMade: '2022-08-20', lastUpdated: '2024-11-15' },
      { id: 'k3', text: 'Establish a county polytechnic in each of the 5 sub-counties', category: 'Education', status: 'completed', progress: 100, evidence: 'All 5 polytechnics operational with 2,300 enrolled students', source: 'Kajiado County Education Report 2024', dateMade: '2022-09-01', lastUpdated: '2024-08-30' },
      { id: 'k4', text: 'Provide clean piped water to 80% of households', category: 'Water', status: 'in_progress', progress: 45, evidence: 'Boreholes drilled in 47 locations, piped network expanding', source: 'Kajiado Water & Sewerage Company Report', dateMade: '2022-08-25', lastUpdated: '2024-10-10' },
      { id: 'k5', text: 'Establish livestock auction markets in all sub-counties', category: 'Agriculture', status: 'completed', progress: 100, evidence: '5 operational auction yards with digital weighing systems', source: 'Kajiado County Agriculture Annual Report', dateMade: '2022-09-10', lastUpdated: '2024-06-15' },
      { id: 'k6', text: 'Create 10,000 youth jobs through county empowerment fund', category: 'Youth', status: 'in_progress', progress: 62, evidence: '6,200 youths benefitting from various programs', source: 'Kajiado Youth Affairs Report Q3 2024', dateMade: '2022-08-18', lastUpdated: '2024-09-30' },
      { id: 'k7', text: 'Install solar street lighting in all major towns', category: 'Energy', status: 'in_progress', progress: 55, evidence: 'Solar lights installed in Kajiado, Ngong, and Isinya towns', source: 'Kajiado Energy Department Progress Report', dateMade: '2022-10-05', lastUpdated: '2024-11-20' },
      { id: 'k8', text: 'Digitize all county revenue collection systems', category: 'Governance', status: 'completed', progress: 100, evidence: 'E-Citizen integration live, mobile payments operational', source: 'Kajiado County Treasury Circular', dateMade: '2022-09-15', lastUpdated: '2024-03-10' },
      { id: 'k9', text: 'Build a modern abattoir in Kajiado Town', category: 'Agriculture', status: 'stalled', progress: 30, evidence: 'Land acquired but construction halted due to procurement disputes', source: 'Kajiado County Assembly proceedings', dateMade: '2022-11-01', lastUpdated: '2024-07-22' },
      { id: 'k10', text: 'Establish a county fire and rescue service', category: 'Governance', status: 'completed', progress: 100, evidence: 'Fire station operational with 2 fire engines and 24 personnel', source: 'Kajiado County Disaster Management Report', dateMade: '2022-10-20', lastUpdated: '2024-04-15' },
      { id: 'k11', text: 'Provide free sanitary pads to all schoolgirls', category: 'Education', status: 'in_progress', progress: 70, evidence: 'Programme active in 120 of 180 schools', source: 'Kajiado County Education Report', dateMade: '2022-09-05', lastUpdated: '2024-08-15' },
      { id: 'k12', text: 'Construct 5 new health centres in underserved areas', category: 'Health', status: 'in_progress', progress: 40, evidence: '2 completed, 2 under construction, 1 in planning', source: 'Kajiado County Health Development Plan', dateMade: '2022-08-22', lastUpdated: '2024-12-05' },
      { id: 'k13', text: 'Establish a county ICT hub in Kajiado Town', category: 'ICT', status: 'not_started', progress: 0, evidence: 'Feasibility study pending', source: 'Kajiado County Budget FY 2024/25', dateMade: '2023-01-15', lastUpdated: '2024-06-01' },
      { id: 'k14', text: 'Dual the Kajiado-Namanga highway within the county', category: 'Infrastructure', status: 'not_started', progress: 0, evidence: 'Awaiting national government partnership', source: 'Kajiado County Assembly Hansard', dateMade: '2022-10-10', lastUpdated: '2024-05-20' },
      { id: 'k15', text: 'Increase county revenue collection by 100%', category: 'Economy', status: 'in_progress', progress: 65, evidence: 'Revenue grew from KES 450M to KES 742M annually', source: 'Kajiado County Budget Review', dateMade: '2022-08-30', lastUpdated: '2024-12-01' },
    ],
  },
  {
    name: 'H.E. Johnson Sakaja',
    county: 'Nairobi',
    party: 'UDA',
    promises: [
      { id: 'n1', text: 'Establish 5 new maternal and child health hospitals', category: 'Health', status: 'in_progress', progress: 60, evidence: '3 hospitals operational, 2 under construction in Dagoretti and Ruaraka', source: 'Nairobi County Health Annual Report 2024', dateMade: '2022-08-22', lastUpdated: '2024-11-30' },
      { id: 'n2', text: 'Create 200,000 jobs for Nairobi youth', category: 'Youth', status: 'in_progress', progress: 35, evidence: '70,000 jobs created through NYS partnership and county programs', source: 'Nairobi County Youth Employment Report', dateMade: '2022-08-10', lastUpdated: '2024-12-15' },
      { id: 'n3', text: 'Complete Dandora dumpsite rehabilitation and conversion', category: 'Infrastructure', status: 'stalled', progress: 20, evidence: 'Environmental assessment complete, private partner negotiations ongoing', source: 'Nairobi County Environment Report', dateMade: '2022-09-01', lastUpdated: '2024-08-20' },
      { id: 'n4', text: 'Free Wi-Fi in all CBD areas and major estates', category: 'ICT', status: 'completed', progress: 100, evidence: 'Wi-Fi operational in CBD, Westlands, Kilimani, and 12 estates', source: 'Nairobi County ICT Department Report', dateMade: '2022-09-15', lastUpdated: '2024-05-10' },
      { id: 'n5', text: 'Pave all access roads in informal settlements', category: 'Infrastructure', status: 'in_progress', progress: 42, evidence: '120km of roads completed in Kibera, Mathare, and Mukuru', source: 'Nairobi County Roads Works Report', dateMade: '2022-08-25', lastUpdated: '2024-12-10' },
      { id: 'n6', text: 'Establish 500 early childhood development centres', category: 'Education', status: 'in_progress', progress: 55, evidence: '275 ECD centres operational across 17 sub-counties', source: 'Nairobi County Education Report', dateMade: '2022-10-05', lastUpdated: '2024-09-25' },
      { id: 'n7', text: 'Reduce solid waste collection turnaround to 24 hours', category: 'Governance', status: 'in_progress', progress: 50, evidence: 'Current average: 48 hours, new contracts signed for 24-hour target', source: 'Nairobi County Environment Report', dateMade: '2022-09-20', lastUpdated: '2024-11-05' },
      { id: 'n8', text: 'Install 50,000 LED street lights across the county', category: 'Energy', status: 'completed', progress: 100, evidence: '52,300 LED lights installed, covering 85% of major roads', source: 'Nairobi County Energy Report', dateMade: '2022-10-15', lastUpdated: '2024-06-30' },
      { id: 'n9', text: 'Build a modern public transport terminus at Fig Tree', category: 'Infrastructure', status: 'not_started', progress: 5, evidence: 'Design plans approved, land acquisition in progress', source: 'Nairobi County Transport Plan', dateMade: '2023-02-10', lastUpdated: '2024-10-15' },
      { id: 'n10', text: 'Establish a county-owned insurance cover for boda boda riders', category: 'Economy', status: 'completed', progress: 100, evidence: '15,000 riders enrolled in the Boda Boda Safety Programme', source: 'Nairobi County Transport & Safety Report', dateMade: '2022-11-20', lastUpdated: '2024-04-20' },
      { id: 'n11', text: 'Digitize all county services with a one-stop portal', category: 'Governance', status: 'completed', progress: 100, evidence: 'Nairobi County Services Portal live with 47 digital services', source: 'Nairobi County ICT Report', dateMade: '2022-09-10', lastUpdated: '2024-07-15' },
      { id: 'n12', text: 'Create a Nairobi talent and innovation fund of KES 500M', category: 'Youth', status: 'in_progress', progress: 70, evidence: 'KES 350M disbursed to 1,200 innovators and creatives', source: 'Nairobi County Trade Report', dateMade: '2022-10-30', lastUpdated: '2024-11-20' },
      { id: 'n13', text: 'Upgrade all 17 sub-county hospitals with modern equipment', category: 'Health', status: 'in_progress', progress: 48, evidence: '8 hospitals fully equipped, 4 in procurement', source: 'Nairobi County Health Equipment Report', dateMade: '2022-08-28', lastUpdated: '2024-10-30' },
      { id: 'n14', text: 'Implement a county-wide smart parking system', category: 'ICT', status: 'in_progress', progress: 65, evidence: 'System live in CBD with 3,500 parking slots managed', source: 'Nairobi County Parking Services Report', dateMade: '2023-01-20', lastUpdated: '2024-12-05' },
      { id: 'n15', text: 'Construct a modern fresh produce market in each sub-county', category: 'Trade', status: 'stalled', progress: 25, evidence: '3 markets completed, others delayed by land disputes', source: 'Nairobi County Markets Report', dateMade: '2022-11-05', lastUpdated: '2024-09-10' },
    ],
  },
  {
    name: 'H.E. Abdullswamad Shariff Nassir',
    county: 'Mombasa',
    party: 'ODM',
    promises: [
      { id: 'm1', text: 'Implement the Mombasa Bus Rapid Transit (BRT) system', category: 'Infrastructure', status: 'stalled', progress: 15, evidence: 'Route mapping complete but contractor disputes and funding gaps', source: 'Mombasa County Transport Report', dateMade: '2022-08-20', lastUpdated: '2024-11-10' },
      { id: 'm2', text: 'Renovate all 6 major health facilities to Level 5', category: 'Health', status: 'in_progress', progress: 45, evidence: 'Coast General upgraded, 2 others under renovation', source: 'Mombasa County Health Strategic Plan', dateMade: '2022-08-25', lastUpdated: '2024-10-20' },
      { id: 'm3', text: 'Establish a maritime training academy', category: 'Education', status: 'in_progress', progress: 55, evidence: 'Partnership with KMA signed, curriculum developed, premises secured', source: 'Mombasa County Education Report', dateMade: '2022-09-05', lastUpdated: '2024-09-15' },
      { id: 'm4', text: 'Provide 100% clean water coverage to Mombasa residents', category: 'Water', status: 'in_progress', progress: 62, evidence: 'Coverage increased from 55% to 62% with new desalination plant', source: 'Mombasa Water & Sewerage Company Report', dateMade: '2022-08-15', lastUpdated: '2024-12-01' },
      { id: 'm5', text: 'Construct 50 new modern markets for traders', category: 'Trade', status: 'in_progress', progress: 38, evidence: '19 markets completed, 12 under construction', source: 'Mombasa County Trade Report', dateMade: '2022-09-15', lastUpdated: '2024-11-25' },
      { id: 'm6', text: 'Create a Mombasa tourism promotion fund of KES 200M', category: 'Economy', status: 'completed', progress: 100, evidence: 'KES 200M annual allocation, 3 international campaigns launched', source: 'Mombasa County Tourism Report', dateMade: '2022-10-10', lastUpdated: '2024-08-30' },
      { id: 'm7', text: 'Establish a county emergency response centre', category: 'Governance', status: 'completed', progress: 100, evidence: 'Emergency call centre operational with 112 hotline', source: 'Mombasa County Disaster Management Report', dateMade: '2022-09-25', lastUpdated: '2024-03-20' },
      { id: 'm8', text: 'Solar power for all 30 county government buildings', category: 'Energy', status: 'completed', progress: 100, evidence: '28 buildings converted, 2 connected to grid-tied solar', source: 'Mombasa County Energy Report', dateMade: '2022-11-01', lastUpdated: '2024-07-10' },
      { id: 'm9', text: 'Reclaim and develop public beach access points', category: 'Tourism', status: 'in_progress', progress: 40, evidence: '4 of 10 planned beach access points completed', source: 'Mombasa County Physical Planning Report', dateMade: '2022-10-20', lastUpdated: '2024-10-05' },
      { id: 'm10', text: 'Digitize land records and establish an e-land registry', category: 'Governance', status: 'stalled', progress: 20, evidence: 'Scanning complete but system integration delayed', source: 'Mombasa County Lands Report', dateMade: '2022-11-15', lastUpdated: '2024-06-20' },
      { id: 'm11', text: 'Establish youth empowerment centres in all 6 sub-counties', category: 'Youth', status: 'completed', progress: 100, evidence: '6 centres operational with vocational training and mentorship', source: 'Mombasa County Youth Report', dateMade: '2022-09-10', lastUpdated: '2024-05-15' },
      { id: 'm12', text: 'Construct a modern fish processing plant at Liwatoni', category: 'Agriculture', status: 'not_started', progress: 5, evidence: 'Feasibility study completed, funding pending', source: 'Mombasa County Agriculture Report', dateMade: '2023-01-10', lastUpdated: '2024-07-05' },
      { id: 'm13', text: 'Upgrade Mombasa port access roads', category: 'Infrastructure', status: 'in_progress', progress: 52, evidence: 'Dongo Kundu bypass 70% complete, Makupa causeway repairs done', source: 'Mombasa County Works Report', dateMade: '2022-08-18', lastUpdated: '2024-12-20' },
      { id: 'm14', text: 'Launch a county-wide bursary fund of KES 300M annually', category: 'Education', status: 'completed', progress: 100, evidence: 'KES 300M disbursed annually, 15,000 students supported in 2024', source: 'Mombasa County Education Bursary Report', dateMade: '2022-09-20', lastUpdated: '2024-08-20' },
      { id: 'm15', text: 'Establish a solid waste recycling plant', category: 'Governance', status: 'stalled', progress: 18, evidence: 'EIA completed, private sector partnership negotiations ongoing', source: 'Mombasa County Environment Report', dateMade: '2022-11-10', lastUpdated: '2024-09-30' },
    ],
  },
];

export default function ElectionPromiseTracker() {
  const [selectedGovernor, setSelectedGovernor] = useState('kajiado');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareGovernor, setCompareGovernor] = useState<string>('none');
  const [activeTab, setActiveTab] = useState('promises');

  const governor = governorData.find(g => g.county.toLowerCase() === selectedGovernor)!;

  const categories = useMemo(() => {
    const cats = new Set(governor.promises.map(p => p.category));
    return Array.from(cats).sort();
  }, [governor]);

  const filteredPromises = useMemo(() => {
    return governor.promises.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (searchQuery && !p.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [governor, statusFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = governor.promises.length;
    const completed = governor.promises.filter(p => p.status === 'completed').length;
    const inProgress = governor.promises.filter(p => p.status === 'in_progress').length;
    const stalled = governor.promises.filter(p => p.status === 'stalled').length;
    const notStarted = governor.promises.filter(p => p.status === 'not_started').length;
    const deliveryScore = Math.round((completed / total) * 100);
    return { total, completed, inProgress, stalled, notStarted, deliveryScore };
  }, [governor]);

  const categoryBreakdown = useMemo(() => {
    return categories.map(cat => {
      const catPromises = governor.promises.filter(p => p.category === cat);
      const completed = catPromises.filter(p => p.status === 'completed').length;
      const avgProgress = Math.round(catPromises.reduce((a, p) => a + p.progress, 0) / catPromises.length);
      return { category: cat, total: catPromises.length, completed, avgProgress };
    });
  }, [governor, categories]);

  const compareData = useMemo(() => {
    if (compareGovernor === 'none') return null;
    const compGov = governorData.find(g => g.county.toLowerCase() === compareGovernor);
    if (!compGov || compGov.county === governor.county) return null;
    const compStats = {
      name: compGov.name,
      county: compGov.county,
      total: compGov.promises.length,
      completed: compGov.promises.filter(p => p.status === 'completed').length,
      inProgress: compGov.promises.filter(p => p.status === 'in_progress').length,
      stalled: compGov.promises.filter(p => p.status === 'stalled').length,
      notStarted: compGov.promises.filter(p => p.status === 'not_started').length,
      deliveryScore: Math.round((compGov.promises.filter(p => p.status === 'completed').length / compGov.promises.length) * 100),
    };
    return { main: stats, compare: compStats };
  }, [compareGovernor, governor, stats]);

  return (
    <div className="space-y-6">
      {/* Governor Selector & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1 border-emerald-200 dark:border-emerald-900">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-lg font-semibold">
                  {governor.name.split(' ').slice(-1)[0][0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-stone-800 dark:text-stone-200 leading-tight">{governor.name}</p>
                <p className="text-xs text-stone-500">{governor.county} County - {governor.party}</p>
              </div>
            </div>
            <Select value={selectedGovernor} onValueChange={v => { setSelectedGovernor(v); setCompareGovernor('none'); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {governorData.map(g => (
                  <SelectItem key={g.county} value={g.county.toLowerCase()}>{g.county} - {g.name.split(' ').slice(-1)[0]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
              <p className="text-3xl font-bold text-emerald-600">{stats.deliveryScore}%</p>
              <p className="text-xs text-stone-500">Overall Delivery Score</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Promise Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">{stats.total}</p>
                <p className="text-xs text-stone-500">Total</p>
              </div>
              {([['completed', stats.completed, 'text-emerald-600'], ['in_progress', stats.inProgress, 'text-blue-600'], ['stalled', stats.stalled, 'text-amber-600'], ['not_started', stats.notStarted, 'text-stone-500']] as const).map(([s, c, col]) => (
                <div key={s} className="text-center p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                  <p className={`text-2xl font-bold ${col}`}>{c}</p>
                  <p className="text-xs text-stone-500">{STATUS_CONFIG[s as PromiseStatus].label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="promises">Promises</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="compare">Comparison</TabsTrigger>
        </TabsList>

        {/* Promises List */}
        <TabsContent value="promises" className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="py-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Search promises..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="text-xs">{filteredPromises.length} results</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Promise Cards */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {filteredPromises.map(promise => (
                <Card key={promise.id} className="hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant="outline" className={`text-xs gap-1 ${STATUS_CONFIG[promise.status].bg} border`}>
                            {STATUS_CONFIG[promise.status].icon}
                            {STATUS_CONFIG[promise.status].label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs gap-1">
                            {CATEGORY_ICONS[promise.category]}
                            {promise.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 mb-2">{promise.text}</p>
                        <Progress value={promise.progress} className="h-1.5 mb-2" />
                        <p className="text-xs text-stone-500 mb-1"><span className="font-medium">{promise.progress}%</span> - {promise.evidence}</p>
                        <p className="text-[10px] text-stone-400">Source: {promise.source}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-lg font-bold ${promise.status === 'completed' ? 'text-emerald-600' : promise.status === 'in_progress' ? 'text-blue-600' : 'text-stone-500'}`}>{promise.progress}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredPromises.length === 0 && (
                <p className="text-sm text-stone-500 text-center py-8">No promises match your filters</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Category Breakdown */}
        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sector-by-Sector Delivery</CardTitle>
              <CardDescription>{governor.county} County promise breakdown by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryBreakdown.map(cb => (
                <div key={cb.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="text-stone-500">{CATEGORY_ICONS[cb.category]}</div>
                      <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{cb.category}</span>
                      <Badge variant="secondary" className="text-[10px]">{cb.total} promises</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-medium">{cb.completed}/{cb.total} done</span>
                      <span className="text-xs text-stone-500">{cb.avgProgress}% avg</span>
                    </div>
                  </div>
                  <Progress value={cb.avgProgress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Promise Timeline</CardTitle>
              <CardDescription>Chronological view of when promises were made</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-700" />
                  {[...governor.promises].sort((a, b) => new Date(a.dateMade).getTime() - new Date(b.dateMade).getTime()).map(promise => (
                    <div key={promise.id} className="relative">
                      <div className={`absolute -left-[17px] w-3 h-3 rounded-full border-2 border-white dark:border-stone-950 ${
                        promise.status === 'completed' ? 'bg-emerald-500' : promise.status === 'in_progress' ? 'bg-blue-500' : promise.status === 'stalled' ? 'bg-amber-500' : 'bg-stone-400'
                      }`} />
                      <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-stone-500">{promise.dateMade}</span>
                          <Badge variant="outline" className={`text-[10px] gap-1 ${STATUS_CONFIG[promise.status].bg} border`}>
                            {STATUS_CONFIG[promise.status].label}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">{promise.category}</Badge>
                        </div>
                        <p className="text-sm text-stone-800 dark:text-stone-200">{promise.text}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={promise.progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-stone-500">{promise.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="compare" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitCompare className="h-5 w-5 text-emerald-600" />
                Compare Delivery Records
              </CardTitle>
              <CardDescription>Compare {governor.county} delivery score with another county</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={compareGovernor} onValueChange={setCompareGovernor}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select county to compare" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select --</SelectItem>
                  {governorData.filter(g => g.county !== governor.county).map(g => (
                    <SelectItem key={g.county} value={g.county.toLowerCase()}>{g.county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {compareData && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="text-center p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/10">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{governor.county} County</p>
                      <p className="text-3xl font-bold text-emerald-600 mt-1">{compareData.main.deliveryScore}%</p>
                      <p className="text-xs text-stone-500">Delivery Score</p>
                    </div>
                    {([['Completed', compareData.main.completed, 'emerald'], ['In Progress', compareData.main.inProgress, 'blue'], ['Stalled', compareData.main.stalled, 'amber'], ['Not Started', compareData.main.notStarted, 'stone']] as const).map(([label, count, color]) => (
                      <div key={label} className="flex justify-between text-sm p-2 rounded bg-stone-50 dark:bg-stone-900">
                        <span className="text-stone-600 dark:text-stone-400">{label}</span>
                        <span className={`font-medium text-${color}-600`}>{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="text-center p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{compareData.compare.county} County</p>
                      <p className="text-3xl font-bold text-stone-700 dark:text-stone-300 mt-1">{compareData.compare.deliveryScore}%</p>
                      <p className="text-xs text-stone-500">Delivery Score</p>
                    </div>
                    {([['Completed', compareData.compare.completed, 'emerald'], ['In Progress', compareData.compare.inProgress, 'blue'], ['Stalled', compareData.compare.stalled, 'amber'], ['Not Started', compareData.compare.notStarted, 'stone']] as const).map(([label, count, color]) => (
                      <div key={label} className="flex justify-between text-sm p-2 rounded bg-stone-50 dark:bg-stone-900">
                        <span className="text-stone-600 dark:text-stone-400">{label}</span>
                        <span className={`font-medium text-${color}-600`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!compareData && (
                <p className="text-sm text-stone-500 text-center py-8">Select a county above to compare delivery records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}