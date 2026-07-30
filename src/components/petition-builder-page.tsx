'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import {
  FileText, Copy, CheckCircle2, Scale, BookOpen,
  Building2, MapPin, ChevronRight, AlertCircle, Info,
  Users, Landmark, Mail, Gavel, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const TARGETS = [
  { value: 'county_assembly', label: 'County Assembly', description: 'Petition to your County Assembly per Standing Orders' },
  { value: 'senate', label: 'Senate', description: 'Petition to the Senate on county affairs' },
  { value: 'national_assembly', label: 'National Assembly', description: 'Petition to the National Assembly per Standing Order 225' },
];

const TOPICS = [
  {
    value: 'service_delivery',
    label: 'Service Delivery Failure',
    template: 'We, the undersigned residents of [County], draw the attention of the [Assembly] to the persistent failure in delivery of essential public services, including [specify services: water, healthcare, roads, sanitation, etc.]. Despite budgetary allocations, the following issues remain unresolved:\n\n[Describe specific failures with locations and dates]',
  },
  {
    value: 'corruption',
    label: 'Corruption / Misuse of Public Funds',
    template: 'We, the undersigned residents of [County], petition the [Assembly] to investigate allegations of corruption and misuse of public funds in the following areas:\n\n[Describe specific concerns: procurement irregularities, unaccounted funds, inflated project costs, etc.]\n\nWe request the relevant oversight committee to investigate and report its findings.',
  },
  {
    value: 'environment',
    label: 'Environmental Degradation',
    template: 'We, the undersigned residents of [County], bring to the attention of the [Assembly] the ongoing environmental degradation in our area, specifically:\n\n[Describe: illegal dumping, deforestation, water pollution, unregulated quarrying, etc.]\n\nArticle 42 of the Constitution guarantees a clean and healthy environment. Article 69 imposes obligations on the State to maintain the environment.',
  },
  {
    value: 'health',
    label: 'Health Facilities & Services',
    template: 'We, the undersigned residents of [County], petition the [Assembly] regarding the deteriorating state of health facilities and services in [County], specifically:\n\n[Describe: shortage of medicine, absent staff, broken equipment, lack of facilities, etc.]\n\nUnder Article 43(1)(a) of the Constitution, every person has the right to the highest attainable standard of health.',
  },
  {
    value: 'education',
    label: 'Education Quality & Facilities',
    template: 'We, the undersigned residents of [County], petition the [Assembly] on the state of education in [County], specifically:\n\n[Describe: lack of ECDE centres, teacher shortages, poor infrastructure, missing textbooks, etc.]\n\nArticle 53(1)(b) guarantees every child the right to free and compulsory basic education.',
  },
  {
    value: 'infrastructure',
    label: 'Roads & Infrastructure',
    template: 'We, the undersigned residents of [County], petition the [Assembly] regarding the poor state of roads and public infrastructure, specifically:\n\n[Describe: impassable roads, incomplete projects, lack of street lighting, bridges in disrepair, etc.]',
  },
  {
    value: 'employment',
    label: 'Unfair Employment Practices',
    template: 'We, the undersigned residents of [County], petition the [Assembly] regarding concerns about employment practices in the county government, specifically:\n\n[Describe: nepotism, tribalism, unadvertised positions, unpaid interns, contract irregularities, etc.]',
  },
  {
    value: 'custom',
    label: 'Custom Topic',
    template: '',
  },
];

export default function PetitionBuilderPage() {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [petitionBody, setPetitionBody] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantId, setApplicantId] = useState('');
  const [signatures, setSignatures] = useState('');
  const [copied, setCopied] = useState(false);

  const governor = useMemo(() => all47Governors.find(g => g.county === selectedCounty), [selectedCounty]);
  const target = useMemo(() => TARGETS.find(t => t.value === selectedTarget), [selectedTarget]);
  const topic = useMemo(() => TOPICS.find(t => t.value === selectedTopic), [selectedTopic]);

  const wordCount = petitionBody.trim() ? petitionBody.trim().split(/\s+/).length : 0;

  const generatedPetition = useMemo(() => {
    if (!selectedTarget || !selectedCounty || !petitionBody.trim()) return '';

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const targetName = target?.label || '[Target Body]';
    const countyName = selectedCounty;
    const capital = governor?.capital || '';

    const targetAddress = selectedTarget === 'county_assembly'
      ? `The Clerk\nCounty Assembly of ${countyName}\n${capital}\n${countyName} County`
      : selectedTarget === 'senate'
      ? `The Clerk of the Senate\nParliament Buildings\nP.O. Box 41642-00100\nNairobi`
      : `The Clerk of the National Assembly\nParliament Buildings\nP.O. Box 41842-00100\nNairobi`;

    const legalBasis = selectedTarget === 'county_assembly'
      ? `County Assembly Standing Orders (varies by county — check your county's Standing Orders regarding public petitions).\n\nArticle 119(1) of the Constitution: "Every person has a right to petition Parliament."\n\nWhile Article 119 refers to Parliament, the principle of public petitioning extends to County Assemblies under Article 174 (objects of devolution — democratic participation) and Article 196 (public participation and county assembly powers).`
      : `Standing Order 225 of the National Assembly Standing Orders.\n\nArticle 119(1) of the Constitution: "Every person has a right to petition Parliament."\n\nThe Senate also accepts petitions on matters relating to county governments under Article 96(2): "The Senate participates in the law-making function of Parliament by considering, debating and approving Bills concerning counties."`;

    return `PETITION TO THE ${targetName.toUpperCase()}

Date: ${dateStr}

TO:
${targetAddress}

PETITION BY:
${applicantName || '[Petitioner Name]'}
ID No: ${applicantId || '[National ID Number]'}
Address: ${'[Your Address]'}
County: ${countyName}
Phone: ${'[Your Phone Number]'}
Email: ${'[Your Email Address]'}

─────────────────────────────────────────

SUBJECT: PETITION ON ${topic?.label?.toUpperCase() || '[TOPIC]'} IN ${countyName.toUpperCase()} COUNTY

${petitionBody}

─────────────────────────────────────────

PRAYERS (What we are asking for):

1. That the ${targetName} investigates the matters raised in this petition.
2. That the relevant committee summons the concerned county officials to appear before it.
3. That the ${targetName} makes recommendations for corrective action.
4. That the findings and recommendations be communicated to the petitioner within 60 days.

─────────────────────────────────────────

LEGAL BASIS

${legalBasis}

─────────────────────────────────────────

SUPPORTERS

This petition is supported by the following residents of ${countyName} County:

${signatures ? `Number of signatures: ${signatures}` : '[List names, ID numbers, and signatures of supporting residents]'}

1. [Name] — ID: [Number] — Signature: ___________
2. [Name] — ID: [Number] — Signature: ___________
3. [Name] — ID: [Number] — Signature: ___________
[Add more as needed — Standing Orders typically require a minimum number of signatures]

─────────────────────────────────────────

DECLARATION

I declare that the information provided in this petition is true and correct to the best of my knowledge.

Petitioner Signature: _____________
Date: _____________

Submitted by:
${applicantName || '[Petitioner Name]'}
${applicantId ? `ID No: ${applicantId}` : 'ID No: [Number]'}`;
  }, [selectedTarget, selectedCounty, petitionBody, governor, target, topic, applicantName, applicantId, signatures]);

  const handleSelectTopic = (val: string) => {
    setSelectedTopic(val);
    const t = TOPICS.find(tp => tp.value === val);
    if (t && t.template && !petitionBody.trim()) {
      setPetitionBody(t.template);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPetition);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Gavel className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Petition Builder for County Assembly</h2>
            <p className="text-sm text-emerald-200 mt-1 leading-relaxed">
              Generate a formal petition to the County Assembly, Senate, or National Assembly.
              Petitions are a constitutional right under Article 119 — your voice matters.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Gavel className="h-3 w-3" /> Art. 119 Constitution</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Building2 className="h-3 w-3" /> Standing Orders</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-emerald-200 flex items-center gap-1"><Users className="h-3 w-3" /> Public Participation</span>
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
              Petition Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Target Body *</label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select target..." /></SelectTrigger>
                <SelectContent>
                  {TARGETS.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex flex-col">
                        <span>{t.label}</span>
                        <span className="text-[9px] text-stone-400">{t.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">County *</label>
              <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select county..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {all47Governors.map(g => (
                    <SelectItem key={g.county} value={g.county}>{g.county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Topic Template *</label>
              <Select value={selectedTopic} onValueChange={handleSelectTopic}>
                <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select topic..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {TOPICS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">Petition Body *</label>
                <span className={`text-[10px] ${wordCount < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{wordCount} words</span>
              </div>
              <Textarea
                placeholder="Write your petition body here, or select a topic template to auto-fill..."
                className="text-xs border-stone-200 dark:border-stone-700 min-h-[150px]"
                value={petitionBody}
                onChange={e => setPetitionBody(e.target.value)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Your Name</label>
                <Input placeholder="Full name" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={applicantName} onChange={e => setApplicantName(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">ID Number</label>
                <Input placeholder="National ID" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={applicantId} onChange={e => setApplicantId(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Number of Supporters</label>
              <Input placeholder="e.g. 150" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={signatures} onChange={e => setSignatures(e.target.value)} />
            </div>

            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-100">
              <CardContent className="py-3 px-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-amber-700 leading-relaxed">
                    <p className="font-bold">Petition Requirements:</p>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                      <li>Must be signed by the petitioner (and supporters, per Standing Orders)</li>
                      <li>Must relate to a matter of public interest</li>
                      <li>County Assembly petitions — check your county&apos;s specific Standing Orders</li>
                      <li>National Assembly: Standing Order 225 applies</li>
                      <li>The petition must not be sub judice (pending in court)</li>
                    </ul>
                  </div>
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
                  Petition Preview
                </CardTitle>
                <CardDescription className="text-[10px] text-stone-500 dark:text-stone-400">Formatted petition document</CardDescription>
              </div>
              {generatedPetition && (
                <Button size="sm" className="h-7 text-[10px] gap-1.5" onClick={handleCopy}>
                  {copied ? <><CheckCircle2 className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedPetition ? (
              <ScrollArea className="h-[600px]">
                <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {generatedPetition}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-16">
                <Gavel className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-500 dark:text-stone-400">Fill in the form to generate your petition</p>
                <p className="text-[10px] text-stone-400 mt-1">Select a target, county, and topic to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
