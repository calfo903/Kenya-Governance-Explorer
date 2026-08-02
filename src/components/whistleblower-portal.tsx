'use client';

import React, { useState } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Shield, Lock, Upload, Eye, Clock, AlertTriangle,
  FileWarning, CheckCircle2, Search, Filter, Plus,
  ChevronDown, ChevronRight, Send, User, Phone,
  XCircle, ArrowUpDown, MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const CATEGORIES = [
  'Fraud/Corruption',
  'Mismanagement',
  'Safety Concern',
  'Human Rights',
  'Environmental',
];

const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
type Severity = typeof SEVERITY_LEVELS[number];

const STATUS_OPTIONS = ['Pending', 'Under Review', 'Escalated'] as const;
type ReportStatus = typeof STATUS_OPTIONS[number];

interface Report {
  id: string;
  date: string;
  category: string;
  county: string;
  status: ReportStatus;
  severity: Severity;
  description: string;
  contactPreference: string;
}

const MOCK_REPORTS: Report[] = [
  { id: 'WB-2024-0847', date: '2024-12-15', category: 'Fraud/Corruption', county: 'Nairobi City', status: 'Escalated', severity: 'Critical', description: 'Irregular procurement of medical supplies worth KES 45M at County Health Department. Three suppliers linked to county officials.', contactPreference: 'Anonymous' },
  { id: 'WB-2024-0846', date: '2024-12-14', category: 'Environmental', county: 'Mombasa', status: 'Under Review', severity: 'High', description: 'Illegal sand harvesting along the coastline near Nyali causing significant ecological damage and property risk.', contactPreference: 'Anonymous' },
  { id: 'WB-2024-0845', date: '2024-12-13', category: 'Safety Concern', county: 'Nakuru', status: 'Under Review', severity: 'Medium', description: 'Faulty electrical wiring in newly constructed county market stalls posing fire risk to traders and customers.', contactPreference: 'Optional contact' },
  { id: 'WB-2024-0844', date: '2024-12-12', category: 'Human Rights', county: 'Kisumu', status: 'Pending', severity: 'High', description: 'Forced evictions of street vendors without prior notice or alternative relocation by county enforcement officers.', contactPreference: 'Anonymous' },
  { id: 'WB-2024-0843', date: '2024-12-10', category: 'Mismanagement', county: 'Uasin Gishu', status: 'Under Review', severity: 'Medium', description: 'Abandoned county road project PRJ-034-001 in Turbo constituency despite full disbursement of KES 120M.', contactPreference: 'Anonymous' },
  { id: 'WB-2024-0842', date: '2024-12-08', category: 'Fraud/Corruption', county: 'Kiambu', status: 'Escalated', severity: 'Critical', description: 'Ghost workers on county payroll estimated at 200 positions, resulting in monthly losses of KES 12M.', contactPreference: 'Anonymous' },
  { id: 'WB-2024-0841', date: '2024-12-06', category: 'Safety Concern', county: 'Kakamega', status: 'Pending', severity: 'Low', description: 'Broken street lights along the Mumias-Kakamega road creating unsafe conditions for pedestrians at night.', contactPreference: 'Optional contact' },
  { id: 'WB-2024-0840', date: '2024-12-04', category: 'Environmental', county: 'Narok', status: 'Pending', severity: 'High', description: 'Unauthorized dumping of construction waste into the Mara River tributary near Talek trading centre.', contactPreference: 'Anonymous' },
];

const severityColor: Record<Severity, string> = {
  Low: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  High: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  Critical: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

const statusColor: Record<ReportStatus, string> = {
  Pending: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
  'Under Review': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  Escalated: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

export default function WhistleblowerPortal() {
  const [activeTab, setActiveTab] = useState<'submit' | 'reports'>('submit');
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [category, setCategory] = useState('');
  const [county, setCounty] = useState('');
  const [description, setDescription] = useState('');
  const [contactPreference, setContactPreference] = useState('Anonymous');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  const filteredReports = reports.filter(r => {
    const matchCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch = !searchQuery || r.county.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  const stats = {
    total: reports.length,
    underReview: reports.filter(r => r.status === 'Under Review').length,
    escalated: reports.filter(r => r.status === 'Escalated').length,
    avgResponseTime: '4.2 days',
  };

  const handleSubmit = () => {
    if (!category || !county || !description.trim()) {
      toast.error('Please fill in all required fields (Category, County, Description).');
      return;
    }
    const newReport: Report = {
      id: `WB-2024-${String(848 + reports.length).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      category,
      county,
      status: 'Pending',
      severity,
      description,
      contactPreference,
    };
    setReports([newReport, ...reports]);
    setCategory('');
    setCounty('');
    setDescription('');
    setContactPreference('Anonymous');
    setReporterName('');
    setReporterContact('');
    setSeverity('Medium');
    setFileName('');
    toast.success('Report submitted securely. Your identity remains protected under Section 25 of the Protection Against Harassment Act.', {
      duration: 6000,
    });
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const blurId = (id: string) => id.slice(0, 7) + '****';

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Anonymous Whistleblower Portal</h2>
            <p className="text-sm text-stone-300 mt-1 leading-relaxed">
              Securely report corruption, mismanagement, and governance concerns. All reports are encrypted
              and your identity is protected under Kenyan law.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-emerald-500/20 rounded-lg text-[11px] font-medium text-emerald-300 flex items-center gap-1">
                <Lock className="h-3 w-3" /> End-to-End Encrypted
              </span>
              <span className="px-2.5 py-1 bg-blue-500/20 rounded-lg text-[11px] font-medium text-blue-300 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Identity Protected
              </span>
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[11px] font-medium text-amber-300 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Protected by Law
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100 mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Under Review</p>
            <p className="text-xl font-bold text-yellow-600 mt-1">{stats.underReview}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Escalated</p>
            <p className="text-xl font-bold text-red-600 mt-1">{stats.escalated}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardContent className="py-3 px-4">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Avg Response Time</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.avgResponseTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-1">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'submit' ? 'bg-stone-800 text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Send className="h-3.5 w-3.5" /> Submit Report
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'reports' ? 'bg-stone-800 text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <FileWarning className="h-3.5 w-3.5" /> Submitted Reports
          <Badge variant="secondary" className="text-[10px] h-5">{reports.length}</Badge>
        </button>
      </div>

      {/* Submit Form */}
      {activeTab === 'submit' && (
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              Submit an Anonymous Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">County *</label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700">
                    <SelectValue placeholder="Select county..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {all47Governors.map(g => (
                      <SelectItem key={g.county} value={g.county}>{g.county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Severity *</label>
              <div className="flex gap-2">
                {SEVERITY_LEVELS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      severity === s
                        ? severityColor[s]
                        : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-300'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Description *</label>
              <Textarea
                placeholder="Describe the incident in detail. Include names, dates, locations, and any evidence references..."
                className="text-xs border-stone-200 dark:border-stone-700 min-h-[100px]"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Evidence Upload Area */}
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Evidence (optional)</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                    : 'border-stone-300 dark:border-stone-600 hover:border-stone-400'
                }`}
              >
                {fileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-stone-700 dark:text-stone-200 font-medium">{fileName}</span>
                    <button onClick={() => setFileName('')} className="text-stone-400 hover:text-red-500">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">Drag and drop files here, or click to browse</p>
                    <p className="text-[10px] text-stone-400 mt-1">PDF, Images, Documents (max 25MB)</p>
                    <Input
                      type="file"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && setFileName(e.target.files[0].name)}
                      id="evidence-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-[10px] h-7"
                      onClick={() => document.getElementById('evidence-upload')?.click()}
                    >
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Contact Preference */}
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Contact Preference</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setContactPreference('Anonymous')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    contactPreference === 'Anonymous'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" /> Anonymous
                </button>
                <button
                  onClick={() => setContactPreference('Optional contact')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    contactPreference === 'Optional contact'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  <User className="h-3.5 w-3.5" /> Optional Contact
                </button>
              </div>
            </div>

            {contactPreference === 'Optional contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Your Name (optional)</label>
                  <Input placeholder="Full name" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={reporterName} onChange={e => setReporterName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Your Contact (optional)</label>
                  <Input placeholder="Phone or email" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={reporterContact} onChange={e => setReporterContact(e.target.value)} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                <Send className="h-3.5 w-3.5 mr-2" /> Submit Report Securely
              </Button>
            </div>

            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-100">
              <CardContent className="py-3 px-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
                    <span className="font-bold">Protection notice:</span> Whistleblowers in Kenya are protected under the Constitution (Article 33, 34),
                    the Protection Against Harassment Act (Section 25), and the EACC Act. Retaliation against
                    whistleblowers is a criminal offence.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Reports Table */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {/* Filters */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardContent className="py-3 px-4">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Search by county or report ID..."
                    className="h-9 pl-10 text-xs border-stone-200 dark:border-stone-700"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700 w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700 w-full md:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[480px]">
            <div className="space-y-2">
              {filteredReports.map(report => (
                <Card key={report.id} className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200" style={{ filter: 'blur(0.5px)' }}>{blurId(report.id)}</span>
                          <span className="text-[10px] text-stone-400">{report.date}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">{report.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-[9px] h-5 ${severityColor[report.severity]}`}>{report.severity}</Badge>
                          <Badge className={`text-[9px] h-5 ${statusColor[report.status]}`}>{report.status}</Badge>
                          <Badge variant="outline" className="text-[9px] h-5">{report.county}</Badge>
                        </div>
                      </div>
                      <Badge className="text-[9px] h-5 bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 shrink-0">
                        {report.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-400">No reports match your filters.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
