'use client';

import React, { useState } from 'react';
import {
  Smartphone, MessageSquare, Radio, ArrowRight, ChevronDown,
  ChevronRight, CheckCircle2, Clock, MapPin, Users, BarChart3,
  Wifi, WifiOff, Phone, HelpCircle, Command, Inbox,
  Signal, Zap, Settings, Eye, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// USSD Menu Tree
interface USSDNode {
  id: string;
  label: string;
  code?: string;
  children?: USSDNode[];
  description?: string;
}

const USSD_MENU: USSDNode[] = [
  {
    id: 'root',
    label: '*483# - Kenya Governance Explorer',
    description: 'Main USSD menu for the Kenya Governance Explorer platform',
    children: [
      {
        id: '1',
        label: 'Report an Issue',
        code: '1',
        description: 'Submit a report on governance issues, corruption, or service delivery failures in your county',
        children: [
          { id: '1-1', label: 'Corruption / Fraud', code: '1', description: 'Report suspected corruption, fraud, or misuse of public funds' },
          { id: '1-2', label: 'Service Delivery', code: '2', description: 'Report failures in public service delivery (health, water, roads, education)' },
          { id: '1-3', label: 'Infrastructure', code: '3', description: 'Report stalled, abandoned, or substandard infrastructure projects' },
          { id: '1-4', label: 'Safety Concern', code: '4', description: 'Report safety hazards, environmental risks, or public health threats' },
        ],
      },
      {
        id: '2',
        label: 'Check Project Status',
        code: '2',
        description: 'Check the status of a county development project by its project ID',
        children: [
          { id: '2-1', label: 'Enter Project ID', code: '*', description: 'Enter a project ID (e.g. PRJ-034-001) to get status, budget, and timeline' },
          { id: '2-2', label: 'My Tracked Projects', code: '#', description: 'View projects you have previously tracked or subscribed to' },
        ],
      },
      {
        id: '3',
        label: 'Sign a Petition',
        code: '3',
        description: 'Sign an active community petition using the petition ID',
        children: [
          { id: '3-1', label: 'Enter Petition ID', code: '*', description: 'Enter a petition ID (e.g. PET-2024-001) to sign it' },
          { id: '3-2', label: 'Browse Active Petitions', code: '#', description: 'View a list of active petitions in your county' },
        ],
      },
      {
        id: '4',
        label: 'County Information',
        code: '4',
        description: 'Access budget, project, and performance data for your county',
        children: [
          { id: '4-1', label: 'Budget Summary', code: '1', description: 'View budget allocation and expenditure for current fiscal year' },
          { id: '4-2', label: 'Project Updates', code: '2', description: 'Latest updates on development projects in your county' },
          { id: '4-3', label: 'Governor Scorecard', code: '3', description: 'View the latest governor performance scorecard' },
        ],
      },
      {
        id: '5',
        label: 'Help & Support',
        code: '5',
        description: 'Get help using the platform, report technical issues, or contact support',
      },
    ],
  },
];

// SMS Commands
const SMS_COMMANDS = [
  { command: 'REPORT [county] [issue]', example: 'REPORT Nairobi Pothole on Kenyatta Ave', description: 'Submit a governance issue report via SMS. Include the county name and brief description.' },
  { command: 'STATUS [project-id]', example: 'STATUS PRJ-034-001', description: 'Check the status, budget utilization, and timeline of a specific development project.' },
  { command: 'SIGN [petition-id]', example: 'SIGN PET-2024-001', description: 'Sign an active petition. You will receive a confirmation SMS with petition details.' },
  { command: 'HELP', example: 'HELP', description: 'Receive a help message with all available SMS commands and usage instructions.' },
];

// Mock SMS Inbox
interface SMSMessage {
  id: string;
  from: string;
  phone: string;
  county: string;
  message: string;
  timestamp: string;
  type: 'report' | 'status' | 'petition' | 'help' | 'system';
}

const MOCK_SMS_INBOX: SMSMessage[] = [
  {
    id: 'SMS-4821', from: 'James O.', phone: '+254***7823', county: 'Kisumu',
    message: 'REPORT Kisumu Sewage overflow along Jaramogi Oginga Odinga Street near KCA. Residents unable to access shops. Health hazard for school children at St. Marys Primary.',
    timestamp: '2024-12-15 14:32', type: 'report',
  },
  {
    id: 'SMS-4820', from: 'Fatuma H.', phone: '+254***4591', county: 'Garissa',
    message: 'STATUS PRJ-034-001',
    timestamp: '2024-12-15 13:18', type: 'status',
  },
  {
    id: 'SMS-4819', from: 'Peter M.', phone: '+254***2310', county: 'Nakuru',
    message: 'SIGN PET-2024-009. I support the petition to fix street lighting in Nakuru CBD. We have had 3 muggings on our street this month.',
    timestamp: '2024-12-15 12:45', type: 'petition',
  },
  {
    id: 'SMS-4818', from: 'Amina J.', phone: '+254***8876', county: 'Mombasa',
    message: 'REPORT Mombasa County water supply has been off for 5 days in Likoni. KES 5M was allocated for water repairs in Q2 2024. Residents buying water at KES 30 per jerrican.',
    timestamp: '2024-12-15 11:22', type: 'report',
  },
  {
    id: 'SMS-4817', from: 'John K.', phone: '+254***1245', county: 'Uasin Gishu',
    message: 'HELP',
    timestamp: '2024-12-15 10:05', type: 'help',
  },
  {
    id: 'SMS-4816', from: 'Grace W.', phone: '+254***6632', county: 'Kiambu',
    message: 'REPORT Kiambu Uncompleted maternity wing at Kiambu Level 5 Hospital. Construction started 2022, KES 280M allocated but building is just a shell. No equipment installed.',
    timestamp: '2024-12-14 17:38', type: 'report',
  },
  {
    id: 'SMS-4815', from: 'David N.', phone: '+254***5543', county: 'Nairobi City',
    message: 'STATUS PRJ-047-015',
    timestamp: '2024-12-14 16:12', type: 'status',
  },
  {
    id: 'SMS-4814', from: 'Mary A.', phone: '+254***9087', county: 'Kakamega',
    message: 'SIGN PET-2024-003. As a Kakamega resident, I demand the Senate investigate the KES 210M missing from our health department.',
    timestamp: '2024-12-14 14:55', type: 'petition',
  },
  {
    id: 'SMS-4813', from: 'Hassan M.', phone: '+254***3312', county: 'Mandera',
    message: 'REPORT Mandera Food distribution at Elwak centre is irregular. Families registered but not receiving supplies. Suspect diversion of relief food.',
    timestamp: '2024-12-14 11:30', type: 'report',
  },
  {
    id: 'SMS-4812', from: 'Susan N.', phone: '+254***7765', county: 'Machakos',
    message: 'REPORT Machakos ECDE centre in Mavoko closed for 3 months. 80 children affected. Teachers unpaid since September despite county budget allocation of KES 2.5M.',
    timestamp: '2024-12-13 15:20', type: 'report',
  },
];

// County USSD Coverage
const COUNTY_USSD_STATUS = [
  { county: 'Nairobi City', status: 'active', users: 12450, latency: '1.2s' },
  { county: 'Mombasa', status: 'active', users: 5230, latency: '1.4s' },
  { county: 'Kisumu', status: 'active', users: 3890, latency: '1.6s' },
  { county: 'Nakuru', status: 'active', users: 4120, latency: '1.3s' },
  { county: 'Uasin Gishu', status: 'active', users: 2780, latency: '1.5s' },
  { county: 'Kakamega', status: 'active', users: 2340, latency: '1.7s' },
  { county: 'Kiambu', status: 'active', users: 3650, latency: '1.3s' },
  { county: 'Machakos', status: 'active', users: 2890, latency: '1.5s' },
  { county: 'Kilifi', status: 'active', users: 1980, latency: '1.8s' },
  { county: 'Garissa', status: 'active', users: 1240, latency: '2.1s' },
  { county: 'Kajiado', status: 'pilot', users: 890, latency: '2.3s' },
  { county: 'Mandera', status: 'pilot', users: 560, latency: '2.8s' },
  { county: 'Wajir', status: 'pilot', users: 420, latency: '3.0s' },
  { county: 'Baringo', status: 'planned', users: 0, latency: '-' },
  { county: 'Turkana', status: 'planned', users: 0, latency: '-' },
];

export default function SmsUssdHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ussd' | 'sms' | 'coverage'>('overview');
  const [expandedUssd, setExpandedUssd] = useState<string[]>(['root']);
  const [smsSearch, setSmsSearch] = useState('');

  const toggleUssd = (id: string) => {
    setExpandedUssd(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredSms = MOCK_SMS_INBOX.filter(m => {
    if (!smsSearch) return true;
    const q = smsSearch.toLowerCase();
    return m.county.toLowerCase().includes(q) || m.from.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
  });

  const typeColor = (type: string) => {
    switch (type) {
      case 'report': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
      case 'status': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'petition': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
      case 'help': return 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300';
      default: return 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300';
    }
  };

  const totalSms = MOCK_SMS_INBOX.length;
  const countiesCovered = [...new Set(MOCK_SMS_INBOX.map(m => m.county))].length;
  const totalUsers = COUNTY_USSD_STATUS.reduce((a, c) => a + c.users, 0);
  const activeCounties = COUNTY_USSD_STATUS.filter(c => c.status === 'active').length;

  const renderUssdNode = (node: USSDNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedUssd.includes(node.id);

    return (
      <div key={node.id}>
        <button
          onClick={() => hasChildren && toggleUssd(node.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
            depth === 0
              ? 'bg-stone-800 text-white font-bold'
              : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200'
          } ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
          {!hasChildren && node.code && (
            <span className="h-5 w-5 rounded bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
              {node.code}
            </span>
          )}
          {!hasChildren && !node.code && (
            <span className="h-5 w-5 rounded bg-stone-300 dark:bg-stone-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
              {node.code || '*'}
            </span>
          )}
          <span className="flex-1">{node.label}</span>
          {node.code && depth > 0 && !hasChildren && (
            <span className="text-[9px] text-stone-400 font-mono">{node.code}</span>
          )}
        </button>
        {node.description && isExpanded && (
          <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed px-3 pb-2" style={{ paddingLeft: `${12 + depth * 16 + 28}px` }}>
            {node.description}
          </p>
        )}
        {isExpanded && hasChildren && (
          <div className="space-y-0.5 mt-0.5">
            {node.children!.map(child => renderUssdNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Smartphone className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">SMS / USSD Integration Hub</h2>
            <p className="text-sm text-emerald-200 mt-1 leading-relaxed">
              Access governance tools via basic mobile phones. Dial *483# for USSD or send SMS commands
              to report issues, check projects, and sign petitions -- no internet required.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1">
                <Phone className="h-3 w-3" /> *483# USSD
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> SMS Commands
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1">
                <Signal className="h-3 w-3" /> No Internet Needed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">SMS Received</p>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">{totalSms}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Counties Covered</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{countiesCovered}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Avg Response</p>
            <p className="text-xl font-bold text-blue-600 mt-1">2.1s</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">USSD Users</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{totalUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-1">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'ussd', label: 'USSD Menu', icon: Radio },
          { id: 'sms', label: 'SMS Inbox', icon: Inbox },
          { id: 'coverage', label: 'Coverage Map', icon: MapPin },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-stone-800 text-white'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                How SMS/USSD Integration Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-2">
                    <Phone className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">Step 1: Dial *483#</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    Open your phone dialer, dial *483#, and press call. A menu will appear with options to report, check, or sign.
                  </p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">Step 2: Navigate Menu</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    Select an option by entering its number. Navigate sub-menus to find the specific service you need.
                  </p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">Step 3: Get Response</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    Receive instant feedback. Reports get a tracking ID, project queries return live data, and petitions confirm your signature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Commands Reference */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Command className="h-3.5 w-3.5 text-emerald-600" />
                SMS Commands Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {SMS_COMMANDS.map(cmd => (
                  <div key={cmd.command} className="bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        {cmd.command}
                      </code>
                    </div>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">{cmd.description}</p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      <span className="font-semibold">Example:</span> <code className="font-mono">{cmd.example}</code>
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-2">
                <Settings className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                  <span className="font-bold">Integration status:</span> This is a simulated interface demonstrating how SMS/USSD integration works.
                  USSD service (*483#) is available in {activeCounties} counties with {totalUsers.toLocaleString()} active users.
                  SMS commands are processed on short code 21456.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* USSD Menu Tab */}
      {activeTab === 'ussd' && (
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-emerald-600" />
              USSD Menu Tree -- *483#
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-3 space-y-0.5">
              {USSD_MENU.map(node => renderUssdNode(node))}
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Click any menu item with children to expand/collapse. Green numbers indicate selectable options.</p>
          </CardContent>
        </Card>
      )}

      {/* SMS Inbox Tab */}
      {activeTab === 'sms' && (
        <div className="space-y-3">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search SMS by county, sender, or content..."
                  className="h-9 pl-10 text-xs border-stone-200 dark:border-stone-700"
                  value={smsSearch}
                  onChange={e => setSmsSearch(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <ScrollArea className="h-[480px]">
            <div className="space-y-2">
              {filteredSms.map(sms => (
                <Card key={sms.id} className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-100">{sms.from}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{sms.phone}</span>
                          <span className="text-[10px] text-stone-400">{sms.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">{sms.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[9px] h-5"><MapPin className="h-2.5 w-2.5 mr-1" />{sms.county}</Badge>
                          <Badge className={`text-[9px] h-5 ${typeColor(sms.type)}`}>{sms.type}</Badge>
                          <span className="text-[9px] text-stone-400 font-mono">{sms.id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSms.length === 0 && (
                <div className="text-center py-12">
                  <Inbox className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-400">No SMS messages match your search.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Coverage Tab */}
      {activeTab === 'coverage' && (
        <div className="space-y-3">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                USSD Integration Status by County
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-600">{activeCounties}</p>
                  <p className="text-[10px] text-stone-500">Active Counties</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-amber-600">{COUNTY_USSD_STATUS.filter(c => c.status === 'pilot').length}</p>
                  <p className="text-[10px] text-stone-500">Pilot Phase</p>
                </div>
                <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-stone-600">{COUNTY_USSD_STATUS.filter(c => c.status === 'planned').length}</p>
                  <p className="text-[10px] text-stone-500">Planned Rollout</p>
                </div>
              </div>
              <ScrollArea className="h-[380px]">
                <div className="space-y-1.5">
                  {COUNTY_USSD_STATUS.map(entry => (
                    <div key={entry.county} className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800">
                      <div className="flex items-center gap-2">
                        {entry.status === 'active' ? (
                          <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                        ) : entry.status === 'pilot' ? (
                          <Zap className="h-3.5 w-3.5 text-amber-600" />
                        ) : (
                          <WifiOff className="h-3.5 w-3.5 text-stone-400" />
                        )}
                        <span className="text-xs font-medium text-stone-700 dark:text-stone-200">{entry.county}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {entry.users > 0 && (
                          <span className="text-[10px] text-stone-500">{entry.users.toLocaleString()} users</span>
                        )}
                        <Badge className={`text-[9px] h-5 ${
                          entry.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          entry.status === 'pilot' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-stone-100 text-stone-500 border-stone-200'
                        }`}>
                          {entry.status === 'active' ? 'Active' : entry.status === 'pilot' ? 'Pilot' : 'Planned'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
