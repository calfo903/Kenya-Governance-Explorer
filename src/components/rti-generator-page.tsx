'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import {
  FileText, Copy, CheckCircle2, BookOpen, Scale,
  Building2, MapPin, Mail, Phone, ExternalLink,
  ChevronRight, AlertCircle, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

import DownloadLink from '@/components/download-link';
const COUNTY_DEPARTMENTS = [
  'County Finance & Economic Planning',
  'County Health Services',
  'County Education & Vocational Training',
  'County Roads, Transport & Public Works',
  'County Agriculture, Livestock & Fisheries',
  'County Water, Environment & Natural Resources',
  'County Lands, Housing & Urban Development',
  'County Trade, Tourism & Cooperatives',
  'County Public Service & Administration',
  'County Youth, Gender, Sports & Culture',
  'County ICT, e-Government & Communication',
  'County Treasury',
];

const INFO_TYPES = [
  { value: 'budget', label: 'Budget Records & Appropriations', description: 'Detailed budget allocations, expenditures, and financial statements' },
  { value: 'procurement', label: 'Procurement Contracts & Awards', description: 'Tender notices, contract awards, supplier details, and procurement plans' },
  { value: 'staff', label: 'Staff List & Establishment', description: 'County staff establishment, payroll, recruitment records' },
  { value: 'projects', label: 'Project Reports & Status', description: 'Development project status, completion reports, CIDP progress' },
  { value: 'audits', label: 'Audit Reports', description: 'Internal and external audit reports, OAG findings' },
  { value: 'plans', label: 'Strategic & Development Plans', description: 'CIDP, County Annual Development Plans, sector strategies' },
  { value: 'policies', label: 'County Policies & Legislation', description: 'County bills, acts, policies, and regulations' },
  { value: 'performance', label: 'Performance Contracts', description: 'County executive performance reports and contracts' },
];

export default function RTIGeneratorPage() {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedInfoType, setSelectedInfoType] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [specificDetails, setSpecificDetails] = useState('');
  const [copied, setCopied] = useState(false);

  const governor = useMemo(() => {
    return all47Governors.find(g => g.county === selectedCounty);
  }, [selectedCounty]);

  const infoType = useMemo(() => {
    return INFO_TYPES.find(i => i.value === selectedInfoType);
  }, [selectedInfoType]);

  const generatedLetter = useMemo(() => {
    if (!selectedCounty || !selectedDepartment || !selectedInfoType) return '';

    const countyName = selectedCounty;
    const capital = governor?.capital || '';
    const govName = governor?.name || '[County Secretary / Head of Public Service]';
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const referenceNumber = `RTI/${countyName.replace(/\s+/g, '').toUpperCase()}/${today.getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`;

    return `${applicantName ? applicantName : '[Your Full Name]'}
${applicantAddress ? applicantAddress : '[Your Physical / Postal Address]'}
${applicantAddress ? '' : '[P.O. Box XXX - XXXXX]'}

Date: ${dateStr}

${referenceNumber}

The County Secretary
County Government of ${countyName}
${capital}
${countyName} County

Dear Sir/Madam,

RE: REQUEST FOR INFORMATION UNDER ARTICLE 35 OF THE CONSTITUTION OF KENYA (2010)

I, ${applicantName ? applicantName : '[Your Full Name]'}, a citizen of the Republic of Kenya, hereby exercise my constitutional right to information as enshrined under:

  • Article 35(1)(a) of the Constitution of Kenya, 2010 — the right to information held by the State
  • Article 35(1)(b) — the right to information held by another person and required for the exercise or protection of any right or fundamental freedom
  • Article 174(c) — the objects of devolution, including self-governance and democratic participation

I kindly request access to the following information held by the ${selectedDepartment} of the County Government of ${countyName}:

1. ${infoType?.label || '[Information Type]'}

${specificDetails ? 'Specifically, I am seeking:' + '\n' + specificDetails : '[Please specify the particular records, documents, or data you require, including the relevant financial year or time period.]'}

I request this information in ${selectedInfoType === 'budget' || selectedInfoType === 'procurement' || selectedInfoType === 'audits' ? 'machine-readable digital format (PDF, Excel, or CSV)' : 'a legible and complete format'}.

LEGAL BASIS

This request is made pursuant to:
  • The Constitution of Kenya, 2010 — Article 35 (Right to Information)
  • Article 10 — National Values and Principles of Governance (transparency, accountability)
  • Article 174 — Objects of Devolution (democratic participation, accountability)
  • Article 201 — Principles of Public Finance (openness, transparency, accountability)
  • The Access to Information Act, 2016
  • The Commission on Administrative Justice (CAJ) guidelines on RTI requests

TIMEFRAME

Under Section 8 of the Access to Information Act, 2016, a public entity is required to respond to an information request within 21 days. If the information cannot be provided within this period, I request to be notified of the reasons for the delay and the estimated timeline for compliance.

Should this request be denied, I respectfully request a written explanation citing the specific provision of law under which access is denied, as required by Section 6 of the Access to Information Act.

APPEAL

If I am dissatisfied with the response or lack thereof, I reserve the right to appeal to:
  • The Commission on Administrative Justice (Ombudsman)
  • The Commission on Administrative Justice Act, 2011

I am available for any clarification required. Please confirm receipt of this request within 7 days.

Yours faithfully,

${applicantName ? applicantName : '[Your Full Name]'}
${applicantAddress ? '\n' + applicantAddress : ''}
[Phone Number: _____________]
[Email: _____________]

CC:
  • The Commission on Administrative Justice (Ombudsman)
  • The Office of the Auditor-General, Kenya
  • The Controller of Budget`;
  }, [selectedCounty, selectedDepartment, selectedInfoType, governor, infoType, applicantName, applicantAddress, specificDetails]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const isFormComplete = selectedCounty && selectedDepartment && selectedInfoType;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Right to Information (RTI) Letter Generator</h2>
            <p className="text-sm text-blue-200 mt-1 leading-relaxed">
              Generate a formal RTI request letter citing Article 35 of the Constitution of Kenya.
              Your right to access information held by public bodies — county governments, state agencies, and state corporations.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Scale className="h-3 w-3" /> Art. 35 Constitution</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Access to Info Act 2016</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Building2 className="h-3 w-3" /> 47 Counties</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form */}
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
              Request Details
            </CardTitle>
            <CardDescription className="text-[10px] text-stone-500 dark:text-stone-400">Fill in the fields to auto-generate your RTI letter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">County *</label>
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select county..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {all47Governors.map(g => (
                    <SelectItem key={g.county} value={g.county}>{g.county} ({g.region})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Department *</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select department..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTY_DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Information Type *</label>
              <Select value={selectedInfoType} onValueChange={setSelectedInfoType}>
                <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select information type..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {INFO_TYPES.map(i => (
                    <SelectItem key={i.value} value={i.value}>
                      <div className="flex flex-col">
                        <span>{i.label}</span>
                        <span className="text-[9px] text-stone-400">{i.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Your Full Name</label>
              <Input
                placeholder="Enter your full name"
                className="h-9 text-xs border-stone-200 dark:border-stone-700"
                value={applicantName}
                onChange={e => setApplicantName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Your Address</label>
              <Input
                placeholder="P.O. Box XXX - Town, Kenya"
                className="h-9 text-xs border-stone-200 dark:border-stone-700"
                value={applicantAddress}
                onChange={e => setApplicantAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Specific Details (optional)</label>
              <Textarea
                placeholder="Provide specific details about the information you need — financial year, project name, date range, etc."
                className="text-xs border-stone-200 dark:border-stone-700 min-h-[80px]"
                value={specificDetails}
                onChange={e => setSpecificDetails(e.target.value)}
              />
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-100">
              <CardContent className="py-3 px-3">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    <span className="font-bold">21-day response:</span> Under Section 8 of the Access to Information Act, 2016, the county must respond within 21 days.
                    If denied, you can appeal to the Commission on Administrative Justice (Ombudsman).
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
                  Letter Preview
                </CardTitle>
                <CardDescription className="text-[10px] text-stone-500 dark:text-stone-400">Generated RTI request letter</CardDescription>
              </div>
              {isFormComplete && (
                <Button size="sm" className="h-7 text-[10px] gap-1.5" onClick={handleCopy}>
                  {copied ? <><CheckCircle2 className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isFormComplete ? (
              <ScrollArea className="h-[600px]">
                <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {generatedLetter}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-500 dark:text-stone-400">Fill in the form to generate your RTI letter</p>
                <p className="text-[10px] text-stone-400 mt-1">Select a county, department, and information type to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legal references */}
      <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <Scale className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
            <div className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed">
              <span className="font-bold">Legal references:</span> Article 35 (Constitution of Kenya 2010), Access to Information Act 2016, Commission on Administrative Justice Act 2011.
              For help with RTI requests, contact the Ombudsman: <span className="font-medium">0800-720-222 (toll-free)</span> or visit <DownloadLink href="https://www.caj.go.ke" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">caj.go.ke</DownloadLink>.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
