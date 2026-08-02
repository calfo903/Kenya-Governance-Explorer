'use client';

import React, { useState } from 'react';
import { all47Governors } from '@/data/governors';
import {
  FileText, Users, PenLine, CheckCircle2, Clock,
  ChevronDown, ChevronRight, Target, MapPin,
  TrendingUp, Landmark, UserPlus, BarChart3,
  XCircle, AlertCircle, ThumbsUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const TARGETS = ['Governor', 'County Assembly', 'Senate', 'National Assembly'];
const PETITION_CATEGORIES = [
  'Infrastructure', 'Healthcare', 'Education', 'Environment',
  'Governance', 'Service Delivery', 'Corruption', 'Land Rights',
];

interface Petition {
  id: string;
  title: string;
  target: string;
  county: string;
  category: string;
  description: string;
  signatures: number;
  goal: number;
  createdAt: string;
  deadline: string;
  status: 'Active' | 'Successful' | 'Closed';
}

const MOCK_PETITIONS: Petition[] = [
  {
    id: 'PET-2024-001',
    title: 'Complete the Kapsabet-Kabarnet Road (PRJ-034-001)',
    target: 'Governor',
    county: 'Baringo',
    category: 'Infrastructure',
    description: 'The Kapsabet-Kabarnet road project was allocated KES 340M in FY 2023/24 but remains incomplete after 18 months. Residents of Baringo and Nandi counties rely on this road for trade, healthcare access, and school transportation. The petition demands an audit of the project, a completion timeline, and accountability for the KES 120M already disbursed with minimal visible progress.',
    signatures: 4523,
    goal: 5000,
    createdAt: '2024-09-15',
    deadline: '2025-03-15',
    status: 'Active',
  },
  {
    id: 'PET-2024-002',
    title: 'Restore Water Supply in Wajir Town',
    target: 'County Assembly',
    county: 'Wajir',
    category: 'Service Delivery',
    description: 'Wajir Town has experienced chronic water shortages for over 6 months despite KES 85M allocation for water infrastructure. Boreholes drilled in 2022 remain non-functional. Residents are forced to buy water at KES 20 per litre from private vendors, creating an unsustainable burden. This petition demands an emergency water plan and audit of the water department expenditure.',
    signatures: 3841,
    goal: 5000,
    createdAt: '2024-10-01',
    deadline: '2025-04-01',
    status: 'Active',
  },
  {
    id: 'PET-2024-003',
    title: 'Investigate Missing County Funds - Kakamega',
    target: 'Senate',
    county: 'Kakamega',
    category: 'Corruption',
    description: 'The Controller of Budget report flagged KES 210M in unaccounted expenditures in the Kakamega County Health Department for FY 2023/24. Despite this, no investigation has been initiated. This petition calls upon the Senate County Public Accounts Committee to investigate the missing funds and recommend action under Article 226 of the Constitution.',
    signatures: 6720,
    goal: 5000,
    createdAt: '2024-08-20',
    deadline: '2025-02-20',
    status: 'Successful',
  },
  {
    id: 'PET-2024-004',
    title: 'Stop Illegal Sand Harvesting in Machakos',
    target: 'Governor',
    county: 'Machakos',
    category: 'Environment',
    description: 'Illegal sand harvesting along Athi River in Machakos County has caused significant environmental degradation, destruction of farmland, and loss of community water sources. Despite several reports to the county government, no enforcement action has been taken. This petition demands an immediate ban, restoration of damaged areas, and prosecution of offenders.',
    signatures: 2156,
    goal: 10000,
    createdAt: '2024-11-01',
    deadline: '2025-05-01',
    status: 'Active',
  },
  {
    id: 'PET-2024-005',
    title: 'Staff Kilifi County Hospital - Emergency Hiring',
    target: 'Governor',
    county: 'Kilifi',
    category: 'Healthcare',
    description: 'Kilifi County Referral Hospital is operating at 40% staffing capacity. The paediatric ward has only 3 nurses for 60 beds. Maternal mortality rates have increased by 23% in the last year. The county has 120 approved but unfilled health worker positions. This petition demands immediate recruitment to fill critical gaps in healthcare delivery.',
    signatures: 5890,
    goal: 7500,
    createdAt: '2024-09-10',
    deadline: '2025-03-10',
    status: 'Active',
  },
  {
    id: 'PET-2024-006',
    title: 'Reopen Closed ECDE Centres in Garissa',
    target: 'County Assembly',
    county: 'Garissa',
    category: 'Education',
    description: 'Twelve Early Childhood Development Education (ECDE) centres in Garissa County have been closed since January 2024 due to non-payment of volunteer teachers. Over 2,400 children aged 3-6 have been left without access to early education. Article 53(1)(b) of the Constitution guarantees every child the right to free and compulsory basic education. This petition demands the immediate reopening of these centres.',
    signatures: 1890,
    goal: 3000,
    createdAt: '2024-10-20',
    deadline: '2025-04-20',
    status: 'Active',
  },
  {
    id: 'PET-2024-007',
    title: 'Audit Nairobi Market Construction Overruns',
    target: 'National Assembly',
    county: 'Nairobi City',
    category: 'Governance',
    description: 'The construction of three modern markets in Nairobi (Marikiti, Muthurwa, and Kangemi) has exceeded budgets by a combined KES 1.2 billion without corresponding scope changes. Original cost estimates totalled KES 2.8B but current projections stand at KES 4.0B. This petition requests the Public Investments Committee to investigate the cost overruns and recommend corrective measures.',
    signatures: 12450,
    goal: 15000,
    createdAt: '2024-07-15',
    deadline: '2025-01-15',
    status: 'Successful',
  },
  {
    id: 'PET-2024-008',
    title: 'Resolve Land Dispute - Kisumu Kanyakwar',
    target: 'County Assembly',
    county: 'Kisumu',
    category: 'Land Rights',
    description: 'Over 500 families in Kanyakwar, Kisumu East Sub-county, face eviction from land they have occupied for over 30 years. A private developer claims title to the land, but residents hold ancestral claims predating independence. The county government has failed to mediate. This petition demands the county assembly to investigate the land records and protect the residents rights under Article 40 of the Constitution.',
    signatures: 2340,
    goal: 5000,
    createdAt: '2024-11-15',
    deadline: '2025-05-15',
    status: 'Active',
  },
  {
    id: 'PET-2024-009',
    title: 'Fix Street Lighting in Nakuru CBD',
    target: 'Governor',
    county: 'Nakuru',
    category: 'Infrastructure',
    description: 'Over 70% of street lights in Nakuru CBD and surrounding estates have been non-functional for more than a year. This has led to increased insecurity, with muggings and carjackings rising by 45% in affected areas. The county budget allocated KES 45M for street lighting maintenance in FY 2023/24. This petition demands immediate repair and a maintenance schedule.',
    signatures: 8900,
    goal: 10000,
    createdAt: '2024-08-01',
    deadline: '2025-02-01',
    status: 'Active',
  },
  {
    id: 'PET-2024-010',
    title: 'Publish Nakuru County Procurement Plans',
    target: 'Governor',
    county: 'Nakuru',
    category: 'Governance',
    description: 'Nakuru County Government has not published its annual procurement plan for FY 2024/25 as required under the Public Procurement and Asset Disposal Act, 2015. The county also failed to publish FY 2023/24 procurement completion reports. Transparency in procurement is essential for accountability and public trust. This petition demands immediate publication of all procurement plans and reports.',
    signatures: 3100,
    goal: 5000,
    createdAt: '2024-10-10',
    deadline: '2025-04-10',
    status: 'Active',
  },
];

export default function PetitionBuilder() {
  const [petitions, setPetitions] = useState<Petition[]>(MOCK_PETITIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [county, setCounty] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');

  const stats = {
    total: petitions.length,
    signatures: petitions.reduce((a, p) => a + p.signatures, 0),
    successful: petitions.filter(p => p.status === 'Successful').length,
    active: petitions.filter(p => p.status === 'Active').length,
  };

  const daysRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSign = (id: string) => {
    setPetitions(prev => prev.map(p => {
      if (p.id === id && p.status === 'Active') {
        const updated = { ...p, signatures: p.signatures + 1 };
        if (updated.signatures >= updated.goal) updated.status = 'Successful';
        return updated;
      }
      return p;
    }));
    const petition = petitions.find(p => p.id === id);
    toast.success(`You signed: ${petition?.title}`);
  };

  const handleCreate = () => {
    if (!title || !target || !county || !category || !description || !goal) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const goalNum = parseInt(goal, 10);
    if (isNaN(goalNum) || goalNum < 10) {
      toast.error('Signature goal must be at least 10.');
      return;
    }
    const newPetition: Petition = {
      id: `PET-2024-${String(11 + petitions.length).padStart(3, '0')}`,
      title,
      target,
      county,
      category,
      description,
      signatures: 1,
      goal: goalNum,
      createdAt: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
    };
    setPetitions([newPetition, ...petitions]);
    setShowForm(false);
    setTitle(''); setTarget(''); setCounty(''); setCategory('');
    setDescription(''); setGoal('');
    toast.success('Petition created successfully. Share it to gather signatures.');
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <PenLine className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Community Petition Builder</h2>
            <p className="text-sm text-emerald-200 mt-1 leading-relaxed">
              Create, sign, and track petitions on governance issues. Exercise your constitutional right
              under Article 119 to petition Parliament and County Assemblies.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1">
                <Landmark className="h-3 w-3" /> Art. 119 Constitution
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1">
                <Users className="h-3 w-3" /> Public Participation
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1">
                <Target className="h-3 w-3" /> Standing Orders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Petitions</p>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Signatures</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.signatures.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Successful</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{stats.successful}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Active</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{stats.active}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <Button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
      >
        <PenLine className="h-3.5 w-3.5 mr-2" />
        {showForm ? 'Cancel' : 'Create New Petition'}
      </Button>

      {/* Create Form */}
      {showForm && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <PenLine className="h-3.5 w-3.5 text-emerald-600" />
              New Petition Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Petition Title *</label>
              <Input placeholder="e.g. Complete the Kapsabet-Kabarnet Road" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Target Body *</label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select target..." /></SelectTrigger>
                  <SelectContent>
                    {TARGETS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">County *</label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select county..." /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {all47Governors.map(g => <SelectItem key={g.county} value={g.county}>{g.county}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent>
                    {PETITION_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Signature Goal *</label>
                <Input type="number" placeholder="e.g. 5000" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={goal} onChange={e => setGoal(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Description *</label>
              <Textarea
                placeholder="Describe the issue, the change you are requesting, and the legal basis for your petition..."
                className="text-xs border-stone-200 dark:border-stone-700 min-h-[100px]"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Create Petition
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Petitions List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {petitions.map(petition => {
            const pct = Math.min(100, Math.round((petition.signatures / petition.goal) * 100));
            const days = daysRemaining(petition.deadline);
            const isExpanded = expandedId === petition.id;

            return (
              <Card key={petition.id} className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : petition.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-stone-400" /> : <ChevronRight className="h-3.5 w-3.5 text-stone-400" />}
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">{petition.title}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 ml-5.5">
                        <Badge variant="outline" className="text-[9px] h-5"><Target className="h-2.5 w-2.5 mr-1" />{petition.target}</Badge>
                        <Badge variant="outline" className="text-[9px] h-5"><MapPin className="h-2.5 w-2.5 mr-1" />{petition.county}</Badge>
                        <Badge variant="outline" className="text-[9px] h-5">{petition.category}</Badge>
                        {petition.status === 'Successful' && (
                          <Badge className="text-[9px] h-5 bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Successful
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{petition.signatures.toLocaleString()}</p>
                      <p className="text-[10px] text-stone-400">of {petition.goal.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 ml-5.5">
                    <div className="flex items-center justify-between mb-1">
                      <Progress value={pct} className="h-2 flex-1 mr-3" />
                      <span className="text-[10px] font-bold text-emerald-600">{pct}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {days > 0 ? `${days} days remaining` : 'Deadline passed'}
                      </span>
                      <span className="text-[10px] text-stone-400">ID: {petition.id}</span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed mb-3">{petition.description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-2 text-center">
                          <p className="text-[9px] text-stone-400 uppercase">Created</p>
                          <p className="text-[10px] font-semibold text-stone-700 dark:text-stone-200">{petition.createdAt}</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-2 text-center">
                          <p className="text-[9px] text-stone-400 uppercase">Deadline</p>
                          <p className="text-[10px] font-semibold text-stone-700 dark:text-stone-200">{petition.deadline}</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-2 text-center">
                          <p className="text-[9px] text-stone-400 uppercase">Progress</p>
                          <p className="text-[10px] font-semibold text-emerald-600">{petition.signatures.toLocaleString()} / {petition.goal.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {petition.status === 'Active' && (
                          <Button onClick={() => handleSign(petition.id)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-7">
                            <ThumbsUp className="h-3 w-3 mr-1" /> Sign This Petition
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-[10px] h-7 border-stone-200 dark:border-stone-700">
                          <FileText className="h-3 w-3 mr-1" /> Copy Petition Text
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
