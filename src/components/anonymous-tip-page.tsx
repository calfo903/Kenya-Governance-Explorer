'use client';

import React, { useState } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Shield, Lock, AlertTriangle, Phone, Mail, ExternalLink,
  CheckCircle2, Scale, Eye, FileText, Building2, Info,
  Send, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const CATEGORIES = [
  { value: 'corruption', label: 'Corruption / Bribery', description: 'Offering or accepting bribes, abuse of office for personal gain' },
  { value: 'fraud', label: 'Financial Fraud', description: 'Falsification of records, forgery, financial misrepresentation' },
  { value: 'procurement', label: 'Procurement Irregularity', description: 'Single sourcing, inflated costs, bid rigging, unauthorized contracts' },
  { value: 'misuse', label: 'Misuse of Public Funds', description: 'Unauthorized expenditure, diversion of funds, unexplained expenses' },
  { value: 'nepotism', label: 'Nepotism / Tribalism', description: 'Unfair hiring, promotion based on kinship or ethnicity' },
  { value: 'embezzlement', label: 'Embezzlement', description: 'Theft or misappropriation of public funds by officials' },
  { value: 'land', label: 'Land Grabbing / Irregular Allocation', description: 'Illegal acquisition or allocation of public land' },
  { value: 'cartel', label: 'Cartel / Collusion', description: 'Price fixing, market manipulation, anti-competitive practices' },
  { value: 'other', label: 'Other Governance Issue', description: 'Any other maladministration or governance concern' },
];

export default function AnonymousTipPage() {
  const [category, setCategory] = useState('');
  const [county, setCounty] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-red-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Anonymous Tip Submission</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Safely report corruption, fraud, procurement irregularities, and governance concerns.
              Your identity is protected by Kenyan law — submit tips securely and anonymously.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-red-500/20 rounded-lg text-[11px] font-medium text-red-300 flex items-center gap-1"><Lock className="h-3 w-3" /> Anonymous by Default</span>
              <span className="px-2.5 py-1 bg-green-500/20 rounded-lg text-[11px] font-medium text-green-300 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Legal Protection</span>
              <span className="px-2.5 py-1 bg-blue-500/20 rounded-lg text-[11px] font-medium text-blue-300 flex items-center gap-1"><Eye className="h-3 w-3" /> Encrypted Channel</span>
            </div>
          </div>
        </div>
      </div>

      {!submitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-stone-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold">Report Details</CardTitle>
                <CardDescription className="text-[10px] text-stone-500">All fields marked with * are required. The more detail you provide, the better EACC can investigate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1 block">Category *</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-xs border-stone-200"><SelectValue placeholder="Select category..." /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex flex-col">
                            <span>{c.label}</span>
                            <span className="text-[9px] text-stone-400">{c.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1 block">County *</label>
                    <Select value={county} onValueChange={setCounty}>
                      <SelectTrigger className="h-9 text-xs border-stone-200"><SelectValue placeholder="Select county..." /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {all47Governors.map(g => <SelectItem key={g.county} value={g.county}>{g.county}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1 block">Department / Institution *</label>
                    <Input placeholder="e.g. County Treasury, Health..." className="h-9 text-xs border-stone-200" value={department} onChange={e => setDepartment(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1 block">Description of Incident *</label>
                  <Textarea
                    placeholder="Describe what happened in detail — who was involved, when, where, amounts, how you know about it..."
                    className="text-xs border-stone-200 min-h-[120px]"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Be as specific as possible. Include names, dates, amounts, and locations.</p>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-1 block">Evidence Description</label>
                  <Textarea
                    placeholder="Describe any evidence you have — documents, receipts, recordings, emails, photographs, etc. (Note: actual file upload requires backend integration)"
                    className="text-xs border-stone-200 min-h-[80px]"
                    value={evidence}
                    onChange={e => setEvidence(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                  <Checkbox id="anonymous" checked={anonymous} onCheckedChange={(v) => setAnonymous(v === true)} />
                  <div>
                    <label htmlFor="anonymous" className="text-xs font-semibold text-stone-800 cursor-pointer">Submit Anonymously</label>
                    <p className="text-[10px] text-stone-500">Your identity will not be revealed. Protected under the Constitution and EACC Act.</p>
                  </div>
                </div>

                <Button className="w-full gap-2" onClick={handleSubmit} disabled={!category || !county || !department || !description.trim()}>
                  <Send className="h-4 w-4" />
                  Submit Tip Safely
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-3 px-4">
                <p className="text-xs font-bold text-red-800 flex items-center gap-1.5 mb-2"><Phone className="h-3.5 w-3.5" /> Emergency Hotline</p>
                <p className="text-sm font-bold text-red-700">EACC: 1512 (Toll-Free)</p>
                <p className="text-[10px] text-red-600 mt-1">Available 24/7. Call directly for urgent corruption reporting.</p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white">
              <CardContent className="py-3 px-4 space-y-3">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Scale className="h-3.5 w-3.5" /> Legal Protection</p>
                <div className="space-y-1.5 text-[10px] text-stone-600">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span><span className="font-semibold">EACC Act Sec 20-24:</span> Protection of whistleblowers — confidentiality, anti-victimization</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span><span className="font-semibold">PPAD Act Sec 172:</span> Protection for procurement-related whistleblowing</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Art. 33(1)(d):</span> Freedom of expression includes freedom to criticize the government</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span><span className="font-semibold">Art. 35:</span> Right to information held by the State</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white">
              <CardContent className="py-3 px-4 space-y-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Other Reporting Channels</p>
                <div className="space-y-1.5 text-[10px] text-stone-600">
                  <div className="flex items-start gap-1.5">
                    <Mail className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                    <span>Email: <span className="text-blue-600">complaints@eacc.go.ke</span></span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ExternalLink className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                    <a href="https://www.eacc.go.ke/report-corruption" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Online portal: eacc.go.ke/report-corruption</a>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Phone className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                    <span>SMS: 1522 (EACC SMS reporting)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-stone-50">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-stone-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-600 leading-relaxed">
                    <span className="font-bold">Privacy notice:</span> Tips submitted through this form are for demonstration purposes. For official EACC reporting, use the channels listed above or visit <a href="https://www.eacc.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">eacc.go.ke</a>. All data is processed locally in your browser.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Confirmation */
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-8 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-emerald-800">Tip Submitted Successfully</h3>
            <p className="text-sm text-emerald-700 mt-2 max-w-md mx-auto">
              Your tip has been recorded locally. For official EACC investigation, please also report through the official channels:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 max-w-lg mx-auto">
              <div className="p-3 bg-white rounded-lg border border-emerald-100">
                <Phone className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-stone-800">Call 1512</p>
                <p className="text-[10px] text-stone-500">Toll-free, 24/7</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-100">
                <Mail className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-stone-800">Email</p>
                <p className="text-[10px] text-stone-500">complaints@eacc.go.ke</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-100">
                <ExternalLink className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-stone-800">Online</p>
                <p className="text-[10px] text-stone-500">eacc.go.ke/report</p>
              </div>
            </div>
            <Button className="mt-6" onClick={() => setSubmitted(false)}>Submit Another Tip</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
