'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar, Filter, ExternalLink, MapPin, Users, Building2,
  FileText, AlertTriangle, Award, Scale, Clock, BarChart3,
  CheckCircle2, ChevronDown, ChevronRight, Zap, Shield,
  Landmark, Gavel, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

type EventType = 'election' | 'appointment' | 'audit' | 'budget' | 'project' | 'scandal' | 'achievement' | 'legislation' | 'court_case';
type ImpactLevel = 'High' | 'Medium' | 'Low';
type ZoomLevel = 'yearly' | 'quarterly' | 'monthly';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: EventType;
  impact: ImpactLevel;
  source: string;
}

interface YearSummary {
  year: number;
  total: number;
  highlights: string[];
}

const EVENT_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  election: { label: 'Election', color: 'text-purple-700', bg: 'bg-purple-500', icon: <Landmark className="h-3.5 w-3.5" /> },
  appointment: { label: 'Appointment', color: 'text-blue-700', bg: 'bg-blue-500', icon: <Users className="h-3.5 w-3.5" /> },
  audit: { label: 'Audit', color: 'text-amber-700', bg: 'bg-amber-500', icon: <Shield className="h-3.5 w-3.5" /> },
  budget: { label: 'Budget', color: 'text-emerald-700', bg: 'bg-emerald-500', icon: <FileText className="h-3.5 w-3.5" /> },
  project: { label: 'Project', color: 'text-cyan-700', bg: 'bg-cyan-500', icon: <Building2 className="h-3.5 w-3.5" /> },
  scandal: { label: 'Scandal', color: 'text-red-700', bg: 'bg-red-500', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  achievement: { label: 'Achievement', color: 'text-emerald-700', bg: 'bg-emerald-500', icon: <Award className="h-3.5 w-3.5" /> },
  legislation: { label: 'Legislation', color: 'text-indigo-700', bg: 'bg-indigo-500', icon: <Scale className="h-3.5 w-3.5" /> },
  court_case: { label: 'Court Case', color: 'text-orange-700', bg: 'bg-orange-500', icon: <Gavel className="h-3.5 w-3.5" /> },
};

const IMPACT_CONFIG: Record<ImpactLevel, { bg: string }> = {
  High: { bg: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
  Medium: { bg: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400' },
  Low: { bg: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400' },
};

const timelineData: Record<string, TimelineEvent[]> = {
  Nairobi: [
    { id: 'n1', date: '2022-08-09', title: 'County Governor Election', description: 'Johnson Sakaja elected as Governor of Nairobi County with 692,378 votes under UDA ticket, defeating Polycarp Igathe of Azimio.', type: 'election', impact: 'High', source: 'IEBC Official Results Gazette' },
    { id: 'n2', date: '2022-09-13', title: 'County Executive Sworn In', description: 'Governor Sakaja and 10 County Executive Committee Members sworn into office at Charter Hall, Nairobi.', type: 'appointment', impact: 'High', source: 'Nairobi County Gazette Special Issue' },
    { id: 'n3', date: '2022-10-15', title: 'FY 2022/23 County Budget Approved', description: 'County Assembly approved KES 38.2 Billion budget with major allocations to health (28%), roads (22%), and education (15%).', type: 'budget', impact: 'High', source: 'Nairobi County Assembly Hansard' },
    { id: 'n4', date: '2022-12-01', title: 'Dandora Dumpsite Closure Plan Announced', description: 'Governor announced 3-year plan to close and rehabilitate Dandora dumpsite, moving waste to a new engineered landfill in Ruai.', type: 'project', impact: 'High', source: 'Nairobi County Press Briefing' },
    { id: 'n5', date: '2023-02-20', title: 'Free Wi-Fi Rollout Launched', description: 'Free public Wi-Fi launched in CBD, Westlands, and Kilimani as first phase of 50-location programme costing KES 180M.', type: 'achievement', impact: 'Medium', source: 'Nairobi County ICT Department Report' },
    { id: 'n6', date: '2023-03-15', title: 'Maternal Health Initiative', description: 'Launched free maternal healthcare programme across all county health facilities, targeting 40,000 mothers annually.', type: 'project', impact: 'High', source: 'Nairobi County Health Strategic Plan' },
    { id: 'n7', date: '2023-05-10', title: 'FY 2022/23 Audit Report Released', description: 'Controller of Auditor General issued qualified opinion on KES 38.2B county expenditure citing pending bills of KES 12.5B and unsupported expenditures of KES 1.8B.', type: 'audit', impact: 'High', source: 'OAG Kenya County Audit Report FY 2022/23' },
    { id: 'n8', date: '2023-06-30', title: 'County Revenue Digitization Complete', description: 'All county revenue streams migrated to automated e-payment platform. Revenue collection rose 34% to KES 12.4B.', type: 'achievement', impact: 'High', source: 'Nairobi County Treasury Revenue Report' },
    { id: 'n9', date: '2023-08-22', title: 'Nairobi BRT Procurement Investigation', description: 'Ethics and Anti-Corruption Commission opened investigation into alleged irregularities in BRT system procurement worth KES 4.2B.', type: 'scandal', impact: 'High', source: 'EACC Press Release' },
    { id: 'n10', date: '2023-09-15', title: 'FY 2023/24 Budget Passed at KES 41.5B', description: 'Largest county budget in Kenya. Key allocations: Health KES 11.6B, Roads KES 9.1B, Education KES 6.2B, Trade KES 3.8B.', type: 'budget', impact: 'High', source: 'Nairobi County Budget Appropriation Act 2023' },
    { id: 'n11', date: '2023-11-05', title: 'County Public Service Commission Crisis', description: 'Assembly raised concerns over 3,000 ghost workers on county payroll, estimating KES 90M monthly loss.', type: 'scandal', impact: 'High', source: 'Nairobi County Assembly Committee Report' },
    { id: 'n12', date: '2024-01-18', title: 'Smart Parking System Goes Live', description: 'Cashless parking system launched in CBD covering 3,500 slots. Reduced parking fee collection disputes by 60%.', type: 'achievement', impact: 'Medium', source: 'Nairobi County Transport Report' },
    { id: 'n13', date: '2024-03-01', title: 'Informal Settlements Roads Programme', description: 'Launched KES 3.2B programme to pave 120km of access roads in Kibera, Mathare, Mukuru, and Korogocho.', type: 'project', impact: 'High', source: 'Nairobi County Roads Works Programme' },
    { id: 'n14', date: '2024-04-22', title: 'Health Worker Strike Resolution', description: 'Three-week county health workers strike resolved after agreement on salary increment and improved working conditions.', type: 'legislation', impact: 'High', source: 'Nairobi County Return to Work Agreement' },
    { id: 'n15', date: '2024-06-15', title: 'Boda Boda Safety Programme', description: 'Launched KES 250M insurance and safety programme for boda boda riders. 15,000 riders enrolled in first 3 months.', type: 'achievement', impact: 'Medium', source: 'Nairobi County Transport Safety Report' },
    { id: 'n16', date: '2024-07-10', title: 'FY 2024/25 Budget Approved at KES 43.5B', description: 'Record county budget. New allocations for youth employment (KES 2.1B) and climate resilience (KES 1.5B).', type: 'budget', impact: 'High', source: 'Nairobi County Budget Estimates FY 2024/25' },
    { id: 'n17', date: '2024-08-30', title: 'MCAs Impeachment Motion Failed', description: 'Motion to impeach Finance CEC over pending bills failed in County Assembly by 4 votes.', type: 'court_case', impact: 'High', source: 'Nairobi County Assembly Hansard August 2024' },
    { id: 'n18', date: '2024-10-15', title: 'Nairobi County Services Portal', description: 'One-stop digital portal for 47 county services launched, integrating with e-Citizen platform.', type: 'achievement', impact: 'Medium', source: 'Nairobi County ICT Launch Report' },
    { id: 'n19', date: '2024-11-20', title: 'Pending Bills Crisis', description: 'County pending bills hit KES 18.7B, prompting Senate intervention and conditional disbursement of equitable share.', type: 'scandal', impact: 'High', source: 'Senate County Public Accounts Committee Report' },
    { id: 'n20', date: '2025-01-10', title: 'Q1 FY 2024/25 Performance Review', description: 'Overall absorption rate at 78%. Health sector leading at 85%, while infrastructure at 62%. 70,000 youth jobs created cumulatively.', type: 'audit', impact: 'Medium', source: 'Nairobi County Q1 Budget Review Report' },
  ],
  Kajiado: [
    { id: 'k1', date: '2022-08-09', title: 'Governor Re-Elected', description: 'Joseph Ole Lenku re-elected as Kajiado Governor under ODM with 142,589 votes, defeating David Nkedianye.', type: 'election', impact: 'High', source: 'IEBC Official Results' },
    { id: 'k2', date: '2022-09-20', title: 'New County Executive Appointed', description: 'Governor appointed 8 CEC members including new CEC for Water and Irrigation, and CEC for Lands.', type: 'appointment', impact: 'High', source: 'Kajiado County Gazette' },
    { id: 'k3', date: '2022-11-15', title: 'FY 2022/23 Budget Passed at KES 9.8B', description: 'Budget prioritized water (18%), roads (22%), health (16%), and education (14%). Included KES 500M drought response.', type: 'budget', impact: 'High', source: 'Kajiado County Appropriation Act' },
    { id: 'k4', date: '2023-01-10', title: 'Drought Emergency Declared', description: 'Severe drought affecting 180,000 people across 5 sub-counties. County allocated KES 300M emergency fund.', type: 'project', impact: 'High', source: 'Kajiado County Disaster Management Report' },
    { id: 'k5', date: '2023-03-22', title: 'Livestock Auction Markets Launched', description: '5 modern livestock auction yards opened across sub-counties with digital weighing and direct market linkages.', type: 'achievement', impact: 'Medium', source: 'Kajiado County Agriculture Report' },
    { id: 'k6', date: '2023-05-18', title: 'FY 2021/22 Audit: Adverse Opinion', description: 'OAG issued adverse opinion citing KES 340M unsupported expenditures, KES 890M pending bills, and procurement irregularities.', type: 'audit', impact: 'High', source: 'OAG Kenya Kajiado County Audit FY 2021/22' },
    { id: 'k7', date: '2023-07-10', title: 'Kajiado Water Supply Project Groundbreaking', description: 'KES 2.4B water project launched to supply piped water to Kajiado, Ngong, and Isinya towns from Kiserian borefields.', type: 'project', impact: 'High', source: 'Kajiado County Water Department' },
    { id: 'k8', date: '2023-09-05', title: 'Revenue Collection Digitized', description: 'County integrated with e-Citizen for all revenue streams. Collection improved from KES 320M to KES 580M annually.', type: 'achievement', impact: 'Medium', source: 'Kajiado County Treasury Report' },
    { id: 'k9', date: '2023-10-20', title: 'Abattoir Construction Scandal', description: 'EACC investigated irregular award of KES 450M abattoir construction tender. Two county officials suspended.', type: 'scandal', impact: 'High', source: 'EACC Investigation Report' },
    { id: 'k10', date: '2023-12-15', title: 'County Polytechnics Operational', description: 'All 5 sub-county polytechnics fully operational with 2,300 enrolled students in vocational and technical courses.', type: 'achievement', impact: 'Medium', source: 'Kajiado Education Development Report' },
    { id: 'k11', date: '2024-02-28', title: 'FY 2023/24 Budget: KES 10.6B', description: 'Budget increased 8.2%. New drought resilience fund of KES 400M. Roads allocation raised to KES 2.8B.', type: 'budget', impact: 'High', source: 'Kajiado County Budget Estimates FY 2023/24' },
    { id: 'k12', date: '2024-04-15', title: 'Land Adjudication Programme', description: 'Started adjudication of 12,000 title deeds in Kajiado Central and Kajiado North with support from national lands commission.', type: 'legislation', impact: 'High', source: 'Kajiado County Lands Office Report' },
    { id: 'k13', date: '2024-06-01', title: 'Solar Street Lighting Rollout', description: 'Installed 1,200 solar street lights in Kajiado, Ngong, Ongata Rongai, and Kitengela towns.', type: 'project', impact: 'Medium', source: 'Kajiado County Energy Report' },
    { id: 'k14', date: '2024-07-20', title: 'Hospital Referral Upgrade', description: 'Kajiado County Referral Hospital upgraded to Level 4 with new ICU, maternity wing, and surgical theatre.', type: 'achievement', impact: 'High', source: 'Kajiado County Health Report' },
    { id: 'k15', date: '2024-09-10', title: 'FY 2022/23 Audit: Qualified Opinion', description: 'Improved from adverse to qualified opinion. OAG noted improved internal controls but flagged KES 210M pending bills.', type: 'audit', impact: 'Medium', source: 'OAG Kenya Kajiado County Audit FY 2022/23' },
    { id: 'k16', date: '2024-10-05', title: 'Road Construction Dispute', description: 'Contractor disputes halt Kajiado-Isinya road project. KES 320M project at 60% completion when work stopped.', type: 'scandal', impact: 'High', source: 'Kajiado County Works Department Report' },
    { id: 'k17', date: '2024-11-15', title: 'FY 2024/25 Budget at KES 11.2B', description: 'Budget increased 5.7%. Allocated KES 1.8B for water, KES 2.6B for roads, KES 1.9B for health.', type: 'budget', impact: 'High', source: 'Kajiado County Budget Appropriation Act 2024' },
    { id: 'k18', date: '2025-01-05', title: 'Fire Service Established', description: 'County fire and rescue service formally launched with 2 fire engines, 24 personnel, and a control centre.', type: 'achievement', impact: 'Medium', source: 'Kajiado County Disaster Management Report' },
    { id: 'k19', date: '2025-01-12', title: 'Youth Empowerment Fund', description: 'KES 200M youth fund disbursed to 4,500 beneficiaries across 5 sub-counties for business and vocational training.', type: 'project', impact: 'Medium', source: 'Kajiado County Youth Affairs Report' },
    { id: 'k20', date: '2025-01-18', title: 'County Assembly Oversight Report', description: 'Assembly released Q1 review showing 65% absorption rate, improvement from 54% same period previous year.', type: 'audit', impact: 'Medium', source: 'Kajiado County Assembly Budget Committee' },
  ],
  Mombasa: [
    { id: 'm1', date: '2022-08-09', title: 'Governor Election', description: 'Abdullswamad Nassir elected Mombasa Governor under ODM with 196,824 votes, defeating Hassan Joho ally Ali Mbogo.', type: 'election', impact: 'High', source: 'IEBC Official Results' },
    { id: 'm2', date: '2022-09-25', title: 'County Executive Formation', description: 'Governor appointed 8 CEC members. Notable inclusion of youngest CEC for Youth and Sports at 28 years old.', type: 'appointment', impact: 'High', source: 'Mombasa County Gazette' },
    { id: 'm3', date: '2022-11-10', title: 'FY 2022/23 Budget: KES 16.5B', description: 'Budget emphasized tourism revival (KES 1.2B), health (KES 3.8B), and water supply improvement (KES 2.1B).', type: 'budget', impact: 'High', source: 'Mombasa County Appropriation Act' },
    { id: 'm4', date: '2023-01-25', title: 'BRT System Plan Unveiled', description: 'Detailed plan for Mombasa BRT covering 3 corridors (Dongo Kundu, Mombasa-Malindi, Changamwe) at estimated KES 28B cost.', type: 'project', impact: 'High', source: 'Mombasa County Transport Master Plan' },
    { id: 'm5', date: '2023-03-15', title: 'Tourism Recovery Programme', description: 'KES 200M tourism fund launched with 3 international marketing campaigns and cruise ship terminal improvements.', type: 'achievement', impact: 'Medium', source: 'Mombasa County Tourism Report' },
    { id: 'm6', date: '2023-05-22', title: 'FY 2021/22 Audit: Disclaimer of Opinion', description: 'OAG issued disclaimer of opinion citing inability to obtain sufficient audit evidence. KES 2.3B unaccounted for.', type: 'audit', impact: 'High', source: 'OAG Kenya Mombasa County Audit FY 2021/22' },
    { id: 'm7', date: '2023-07-15', title: 'Desalination Plant Commissioned', description: 'Mombasa desalination plant completed at KES 1.8B, producing 100,000 cubic meters daily. Increased water coverage from 55% to 62%.', type: 'achievement', impact: 'High', source: 'Mombasa Water & Sewerage Company' },
    { id: 'm8', date: '2023-09-20', title: 'Market Traders Eviction Controversy', description: 'Eviction of 2,000 traders from Kongowea Market for renovation sparked public outcry and Senate inquiry.', type: 'scandal', impact: 'High', source: 'Senate Standing Committee Report' },
    { id: 'k9', date: '2023-11-10', title: 'Emergency Response Centre Launched', description: 'County emergency call centre with 112 hotline operational 24/7, integrated with Kenya Red Cross.', type: 'achievement', impact: 'Medium', source: 'Mombasa County Disaster Management' },
    { id: 'm10', date: '2024-01-20', title: 'Solar Power Project Completed', description: '28 county government buildings converted to solar power. Project cost KES 180M with 3-year payback period.', type: 'project', impact: 'Medium', source: 'Mombasa County Energy Report' },
    { id: 'm11', date: '2024-03-15', title: 'BRT Contractor Dispute', description: 'Main BRT contractor suspended over alleged financial impropriety. Project stalled indefinitely, KES 4.2B at risk.', type: 'scandal', impact: 'High', source: 'Mombasa County Transport Committee' },
    { id: 'm12', date: '2024-05-10', title: 'FY 2023/24 Budget: KES 17.8B', description: 'Budget increase of 7.9%. New allocations: KES 800M for beach access, KES 600M for solid waste management.', type: 'budget', impact: 'High', source: 'Mombasa County Appropriation Act 2024' },
    { id: 'm13', date: '2024-06-20', title: 'Coast General Hospital Upgrade', description: 'Coast General Teaching and Referral Hospital upgraded to Level 5 with new oncology wing and 200-bed capacity increase.', type: 'project', impact: 'High', source: 'Mombasa County Health Report' },
    { id: 'm14', date: '2024-08-15', title: 'Maritime Academy Partnership', description: 'Partnership with Kenya Maritime Authority established for training academy. First cohort of 200 students enrolled.', type: 'achievement', impact: 'Medium', source: 'Mombasa County Education Report' },
    { id: 'm15', date: '2024-09-05', title: 'FY 2022/23 Audit: Qualified Opinion', description: 'Improved from disclaimer to qualified opinion. Reduced pending bills from KES 3.1B to KES 1.8B.', type: 'audit', impact: 'Medium', source: 'OAG Kenya Mombasa County Audit FY 2022/23' },
    { id: 'm16', date: '2024-10-10', title: 'Land Registry Digitization Halted', description: 'E-land registry project stalled at 20% due to vendor disputes and legacy data quality issues.', type: 'scandal', impact: 'Medium', source: 'Mombasa County Lands Report' },
    { id: 'm17', date: '2024-11-20', title: 'FY 2024/25 Budget: KES 18.7B', description: 'Record budget. Focus on tourism revival (KES 1.5B), health (KES 4.2B), and port access roads (KES 2.3B).', type: 'budget', impact: 'High', source: 'Mombasa County Budget Estimates FY 2024/25' },
    { id: 'm18', date: '2025-01-05', title: 'Beach Access Points Opened', description: '4 public beach access points completed in Nyali, Bamburi, Shanzu, and Diani with facilities and security.', type: 'project', impact: 'Medium', source: 'Mombasa County Physical Planning' },
    { id: 'm19', date: '2025-01-12', title: 'Youth Empowerment Centres', description: 'All 6 sub-county youth empowerment centres fully operational with vocational training, ICT labs, and mentorship programmes.', type: 'achievement', impact: 'Medium', source: 'Mombasa County Youth Affairs Report' },
    { id: 'm20', date: '2025-01-18', title: 'Dongo Kundu Bypass Progress', description: 'Dongo Kundu bypass 70% complete, connecting Mombasa to South Coast. Expected completion by December 2025.', type: 'project', impact: 'High', source: 'Mombasa County Works Report' },
  ],
};

export default function CountyGovernanceTimeline() {
  const [selectedCounty, setSelectedCounty] = useState('Nairobi');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [zoom, setZoom] = useState<ZoomLevel>('yearly');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const events = timelineData[selectedCounty] || [];

  const filteredEvents = useMemo(() => {
    let filtered = typeFilter === 'all' ? [...events] : events.filter(e => e.type === typeFilter);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, typeFilter]);

  const eventTypes = useMemo(() => {
    const types = new Set(events.map(e => e.type));
    return Array.from(types).sort() as EventType[];
  }, [events]);

  const eventsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return counts;
  }, [events]);

  const significantEvents = useMemo(() => events.filter(e => e.impact === 'High').length, [events]);

  const yearSummaries = useMemo(() => {
    const years = new Map<number, TimelineEvent[]>();
    events.forEach(e => {
      const y = new Date(e.date).getFullYear();
      if (!years.has(y)) years.set(y, []);
      years.get(y)!.push(e);
    });
    return Array.from(years.entries()).sort((a, b) => b[0] - a[0]).map(([year, evts]) => {
      const highImpact = evts.filter(e => e.impact === 'High');
      return {
        year,
        total: evts.length,
        highlights: highImpact.slice(0, 3).map(e => e.title),
      };
    });
  }, [events]);

  const getGroupLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (zoom === 'yearly') return d.getFullYear().toString();
    if (zoom === 'quarterly') {
      const q = Math.ceil((d.getMonth() + 1) / 3);
      return `Q${q} ${d.getFullYear()}`;
    }
    return `${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`;
  };

  const groupedEvents = useMemo(() => {
    const groups: { label: string; events: TimelineEvent[] }[] = [];
    let currentLabel = '';
    filteredEvents.forEach(e => {
      const label = getGroupLabel(e.date);
      if (label !== currentLabel) {
        groups.push({ label, events: [e] });
        currentLabel = label;
      } else {
        groups[groups.length - 1].events.push(e);
      }
    });
    return groups;
  }, [filteredEvents, zoom]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(timelineData).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EventType | 'all')}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                {eventTypes.map(t => (
                  <SelectItem key={t} value={t}>{EVENT_CONFIG[t].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
              {(['yearly', 'quarterly', 'monthly'] as ZoomLevel[]).map(z => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    zoom === z ? 'bg-emerald-600 text-white' : 'text-stone-600 dark:text-stone-400 hover:text-stone-800'
                  }`}
                >
                  {z.charAt(0).toUpperCase() + z.slice(1)}
                </button>
              ))}
            </div>
            <Badge variant="secondary" className="ml-auto text-xs">{filteredEvents.length} events</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">{events.length}</p>
            <p className="text-xs text-stone-500">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-red-600">{significantEvents}</p>
            <p className="text-xs text-stone-500">High Impact</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{events.filter(e => e.type === 'achievement').length}</p>
            <p className="text-xs text-stone-500">Achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{events.filter(e => e.type === 'scandal').length}</p>
            <p className="text-xs text-stone-500">Scandals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Main */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-emerald-600" />
              {selectedCounty} Governance Timeline
            </CardTitle>
            <CardDescription>Key governance events from 2022 to 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[700px] pr-4">
              <div className="relative">
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-700" />
                {groupedEvents.map(group => (
                  <div key={group.label} className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-[23px] flex justify-center relative z-10">
                        <div className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">{group.label}</h3>
                      <Badge variant="secondary" className="text-[10px]">{group.events.length}</Badge>
                    </div>
                    <div className="ml-[23px] space-y-3">
                      {group.events.map(event => {
                        const expanded = expandedEvent === event.id;
                        return (
                          <div key={event.id} className="relative">
                            <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full border-2 border-white dark:border-stone-950 {EVENT_CONFIG[event.type].bg}" style={{ backgroundColor: EVENT_CONFIG[event.type].bg.replace('bg-', '#') === EVENT_CONFIG[event.type].bg ? 'var(--color-stone-400)' : undefined }}>
                              <div className={`w-3 h-3 rounded-full ${EVENT_CONFIG[event.type].bg}`} />
                            </div>
                            <div
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                expanded ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10' : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                              }`}
                              onClick={() => setExpandedEvent(expanded ? null : event.id)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge variant="outline" className={`text-[10px] gap-1 ${EVENT_CONFIG[event.type].color}`}>
                                      {EVENT_CONFIG[event.type].icon}
                                      {EVENT_CONFIG[event.type].label}
                                    </Badge>
                                    <Badge variant="outline" className={`text-[10px] ${IMPACT_CONFIG[event.impact].bg} border`}>
                                      {event.impact}
                                    </Badge>
                                    <span className="text-[10px] text-stone-400">{event.date}</span>
                                  </div>
                                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{event.title}</p>
                                </div>
                                {expanded ? <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />}
                              </div>
                              {expanded && (
                                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2">
                                  <p className="text-sm text-stone-600 dark:text-stone-400">{event.description}</p>
                                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="truncate">Source: {event.source}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          {/* Events by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Events by Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {eventTypes.map(type => {
                const count = eventsByType[type] || 0;
                const pct = Math.round((count / events.length) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${EVENT_CONFIG[type].bg}`} />
                        <span className="text-xs text-stone-700 dark:text-stone-300">{EVENT_CONFIG[type].label}</span>
                      </div>
                      <span className="text-xs font-medium text-stone-600 dark:text-stone-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div className={`h-full rounded-full ${EVENT_CONFIG[type].bg}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Year Summaries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Year-by-Year Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {yearSummaries.map(ys => (
                <div key={ys.year} className="p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{ys.year}</span>
                    <Badge variant="secondary" className="text-[10px]">{ys.total} events</Badge>
                  </div>
                  <ul className="space-y-1">
                    {ys.highlights.map((h, i) => (
                      <li key={i} className="text-xs text-stone-500 flex items-start gap-1.5">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}