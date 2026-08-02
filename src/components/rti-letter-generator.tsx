'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import {
  FileText, Copy, CheckCircle2, Download, BookOpen,
  Building2, Clock, Send, Mail, Phone, User,
  Scale, History, ArrowRight, RefreshCw,
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

const PUBLIC_BODIES = [
  { value: 'county_gov', label: 'County Government', description: 'County executive, departments, and agencies' },
  { value: 'county_assembly', label: 'County Assembly', description: 'County legislative body and committees' },
  { value: 'national_gov', label: 'National Government', description: 'National ministries and state departments' },
  { value: 'oag', label: 'Office of the Auditor-General', description: 'Audit reports and financial oversight' },
  { value: 'iebc', label: 'IEBC', description: 'Electoral commission records and data' },
];

const FORMAT_OPTIONS = ['Digital', 'Physical', 'Both'];
const DELIVERY_METHODS = ['Email', 'Post', 'In Person'];

interface GeneratedLetter {
  id: string;
  date: string;
  publicBody: string;
  county: string;
  information: string;
  status: 'Delivered' | 'Pending' | 'Response Received';
}

const MOCK_HISTORY: GeneratedLetter[] = [
  { id: 'RTI/NRB/2024/1847', date: '2024-12-10', publicBody: 'County Government', county: 'Nairobi City', information: 'Procurement records for market construction projects FY 2023/24', status: 'Response Received' },
  { id: 'RTI/KSM/2024/1602', date: '2024-11-28', publicBody: 'County Assembly', county: 'Kisumu', information: 'Minutes of Budget and Appropriation Committee meetings Q2 2024', status: 'Pending' },
  { id: 'RTI/ELD/2024/1534', date: '2024-11-15', publicBody: 'County Government', county: 'Uasin Gishu', information: 'Staff establishment and payroll records for the Health Department', status: 'Delivered' },
  { id: 'RTI/NRB/2024/1488', date: '2024-11-02', publicBody: 'OAG', county: 'Nairobi City', information: 'Special audit report on Kakamega County Health Department FY 2023/24', status: 'Response Received' },
  { id: 'RTI/MBS/2024/1399', date: '2024-10-20', publicBody: 'County Government', county: 'Mombasa', information: 'Environmental impact assessment for Dongo Kundu project', status: 'Delivered' },
];

export default function RTILetterGenerator() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [letters, setLetters] = useState<GeneratedLetter[]>(MOCK_HISTORY);

  const [yourName, setYourName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [publicBody, setPublicBody] = useState('');
  const [information, setInformation] = useState('');
  const [preferredFormat, setPreferredFormat] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [copied, setCopied] = useState(false);

  const governor = useMemo(() => all47Governors.find(g => g.county === county), [county]);
  const body = useMemo(() => PUBLIC_BODIES.find(b => b.value === publicBody), [publicBody]);

  const generatedLetter = useMemo(() => {
    if (!county || !publicBody || !information.trim() || !yourName.trim()) return '';

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const refNumber = `RTI/${county.replace(/\s+/g, '').toUpperCase().slice(0, 3)}/${today.getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const bodyAddress = publicBody === 'county_gov'
      ? `The County Secretary\nCounty Government of ${county}\n${governor?.capital || ''}\n${county}`
      : publicBody === 'county_assembly'
      ? `The Clerk\nCounty Assembly of ${county}\n${governor?.capital || ''}\n${county}`
      : publicBody === 'oag'
      ? `The Auditor-General\nOffice of the Auditor-General\nKenyatta Avenue, Integrity Centre\nP.O. Box 30084-00100\nNairobi`
      : publicBody === 'iebc'
      ? `The Commission Secretary\nIndependent Electoral and Boundaries Commission\nAnniversary Towers, University Way\nP.O. Box 45355-00100\nNairobi`
      : `The Principal Secretary\nThe National Treasury\nP.O. Box 30007-00100\nNairobi`;

    const salutation = publicBody === 'county_gov' || publicBody === 'county_assembly'
      ? 'Dear Sir/Madam,'
      : 'Dear Sir/Madam,';

    return `                           REPUBLIC OF KENYA
                     ACCESS TO INFORMATION REQUEST

${dateStr}

${refNumber}

${yourName}
${email ? `Email: ${email}` : '[Your Email Address]'}
${phone ? `Phone: ${phone}` : '[Your Phone Number]'}
${county ? `County: ${county}` : ''}

${bodyAddress}

${salutation}

RE: REQUEST FOR ACCESS TO INFORMATION
      UNDER THE ACCESS TO INFORMATION ACT, 2016

I, ${yourName}, a citizen of the Republic of Kenya, hereby make this request for information in accordance with the Access to Information Act, 2016, and Article 35 of the Constitution of Kenya (2010).

INFORMATION REQUESTED:

I request access to the following information held by ${body?.label || '[Public Body]'}:

${information}

PREFERRED FORMAT:
I would like to receive this information in ${preferredFormat || '[Digital/Physical/Both]'} format.

DELIVERY METHOD:
Please deliver the information via ${deliveryMethod || '[Email/Post/In Person]'}.
${deliveryMethod === 'Email' && email ? `My email address is: ${email}` : ''}
${deliveryMethod === 'Post' ? 'My postal address is: [Your Postal Address]' : ''}

LEGAL BASIS:
This request is made under:
  - Article 35(1)(a) of the Constitution of Kenya, 2010
  - The Access to Information Act, 2016 (Section 8)
  - Article 10 (National Values and Principles of Governance)
  - Article 174(c) (Objects of Devolution)
  - Article 201 (Principles of Public Finance)

RESPONSE TIMEFRAME:
Under Section 8 of the Access to Information Act, 2016, you are required to respond to this request within twenty-one (21) days. If you are unable to provide the information within this period, please notify me in writing of the reasons for the delay and the expected timeline for compliance.

If this request is denied, I request a written explanation citing the specific provision of law under which access is denied, as required by Section 6 of the Access to Information Act, 2016.

APPEAL:
Should I be dissatisfied with your response or the failure to respond, I reserve the right to appeal to the Commission on Administrative Justice (Ombudsman) under Section 24 of the Access to Information Act, 2016.

I am available for any clarification. Please confirm receipt of this request within seven (7) days.

Yours faithfully,



${yourName}
${phone ? `Phone: ${phone}` : ''}
${email ? `Email: ${email}` : ''}
Date: ${dateStr}

---

                    "ACCESS TO INFORMATION ACT, 2016"
                 Section 8: Time for Compliance

"A public entity shall, within twenty-one days after receiving a request in terms of this Act, take a decision on the request and notify the requester of the decision."

       Commission on Administrative Justice (Ombudsman)
              Toll-Free: 0800-720-222
                  www.caj.go.ke`;
  }, [county, publicBody, information, yourName, email, phone, preferredFormat, deliveryMethod, governor, body]);

  const isFormComplete = county && publicBody && information.trim() && yourName.trim() && preferredFormat && deliveryMethod;

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    toast.success('Letter copied to clipboard.');
  };

  const handleDownload = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RTI_Request_${county?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Letter downloaded as text file.');
  };

  const handleSave = () => {
    if (!isFormComplete) {
      toast.error('Please fill in all required fields before saving.');
      return;
    }
    const today = new Date();
    const refNum = `RTI/${county.replace(/\s+/g, '').toUpperCase().slice(0, 3)}/${today.getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const newLetter: GeneratedLetter = {
      id: refNum,
      date: today.toISOString().split('T')[0],
      publicBody: body?.label || publicBody,
      county,
      information: information.slice(0, 80) + (information.length > 80 ? '...' : ''),
      status: 'Pending',
    };
    setLetters([newLetter, ...letters]);
    toast.success('Letter saved to history. Reference: ' + refNum);
  };

  const statusColor = (status: string) => {
    if (status === 'Response Received') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
    if (status === 'Delivered') return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">RTI Letter Generator</h2>
            <p className="text-sm text-blue-200 mt-1 leading-relaxed">
              Generate formal Access to Information request letters citing the Access to Information Act, 2016
              and Article 35 of the Constitution. Submit to any public body in Kenya.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1">
                <Scale className="h-3 w-3" /> Art. 35 Constitution
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> ATI Act, 2016
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1">
                <Clock className="h-3 w-3" /> 21-Day Response
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-1">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'create' ? 'bg-stone-800 text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Generate Letter
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'history' ? 'bg-stone-800 text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <History className="h-3.5 w-3.5" /> History
          <Badge variant="secondary" className="text-[10px] h-5">{letters.length}</Badge>
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Form */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-blue-600" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Your Name *</label>
                  <Input placeholder="Full legal name" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={yourName} onChange={e => setYourName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Email *</label>
                  <Input type="email" placeholder="email@example.com" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Phone</label>
                  <Input placeholder="+254 7XX XXX XXX" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={phone} onChange={e => setPhone(e.target.value)} />
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
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Public Body *</label>
                <Select value={publicBody} onValueChange={setPublicBody}>
                  <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select public body..." /></SelectTrigger>
                  <SelectContent>
                    {PUBLIC_BODIES.map(b => (
                      <SelectItem key={b.value} value={b.value}>
                        <div className="flex flex-col">
                          <span>{b.label}</span>
                          <span className="text-[9px] text-stone-400">{b.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Information Requested *</label>
                <Textarea
                  placeholder="Describe the specific information you are requesting. Include financial years, project names, dates, or reference numbers where applicable..."
                  className="text-xs border-stone-200 dark:border-stone-700 min-h-[100px]"
                  value={information}
                  onChange={e => setInformation(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Preferred Format *</label>
                  <Select value={preferredFormat} onValueChange={setPreferredFormat}>
                    <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select format..." /></SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Delivery Method *</label>
                  <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select method..." /></SelectTrigger>
                    <SelectContent>
                      {DELIVERY_METHODS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                <Send className="h-3.5 w-3.5 mr-2" /> Save to History
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  Letter Preview
                </CardTitle>
                {generatedLetter && (
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 text-[10px] gap-1" onClick={handleCopy}>
                      {copied ? <><CheckCircle2 className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-stone-200 dark:border-stone-700" onClick={handleDownload}>
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedLetter ? (
                <ScrollArea className="h-[550px]">
                  <div className="p-5 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-200 leading-relaxed font-mono whitespace-pre-wrap">
                    {generatedLetter}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-sm text-stone-500 dark:text-stone-400">Fill in the form to generate your RTI letter</p>
                  <p className="text-[10px] text-stone-400 mt-1">Required: Name, County, Public Body, and Information Requested</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {letters.map(letter => (
                <Card key={letter.id} className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200">{letter.id}</span>
                          <span className="text-[10px] text-stone-400">{letter.date}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">{letter.information}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[9px] h-5"><Building2 className="h-2.5 w-2.5 mr-1" />{letter.publicBody}</Badge>
                          <Badge variant="outline" className="text-[9px] h-5">{letter.county}</Badge>
                        </div>
                      </div>
                      <Badge className={`text-[9px] h-5 ${statusColor(letter.status)}`}>{letter.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
