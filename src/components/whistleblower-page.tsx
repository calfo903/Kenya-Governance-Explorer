'use client';

import React, { useState, useMemo } from 'react';
import {
  reportingChannels, legalProtections, faqItems,
} from '@/data/whistleblower';
import {
  Shield, Phone, Mail, ExternalLink, MapPin,
  ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle2, Scale, HelpCircle, Lock,
  Building2, Globe, FileText, Search,
  ArrowRight, Users, Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function WhistleblowerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('channels');

  const filteredChannels = useMemo(() => {
    if (!searchQuery) return reportingChannels;
    const q = searchQuery.toLowerCase();
    return reportingChannels.filter(ch =>
      ch.name.toLowerCase().includes(q) ||
      ch.agency.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'hotline': return <Phone className="h-3.5 w-3.5" />;
      case 'online': return <Globe className="h-3.5 w-3.5" />;
      case 'in_person': return <Building2 className="h-3.5 w-3.5" />;
      case 'email': return <Mail className="h-3.5 w-3.5" />;
      case 'letter': return <FileText className="h-3.5 w-3.5" />;
      default: return <Phone className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Whistleblower Protection & Reporting</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              How to safely report corruption, maladministration, and abuse of office in Kenya.
              Protected under the Constitution, EACC Act, and PPAD Act.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[11px] font-medium text-amber-300 flex items-center gap-1"><Lock className="h-3 w-3" /> Identity Protected</span>
              <span className="px-2.5 py-1 bg-green-500/20 rounded-lg text-[11px] font-medium text-green-300 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Legal Protection</span>
              <span className="px-2.5 py-1 bg-blue-500/20 rounded-lg text-[11px] font-medium text-blue-300 flex items-center gap-1"><Eye className="h-3 w-3" /> Anonymous Allowed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-1 bg-white rounded-xl border border-stone-200 p-1">
        {[
          { id: 'channels', label: 'Reporting Channels', icon: Phone, count: reportingChannels.length },
          { id: 'protections', label: 'Legal Protections', icon: Scale, count: legalProtections.length },
          { id: 'faq', label: 'FAQ', icon: HelpCircle, count: faqItems.length },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-slate-800 text-white'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            <section.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{section.label}</span>
            <Badge variant="secondary" className="text-[10px] h-5">{section.count}</Badge>
          </button>
        ))}
      </div>

      {/* Channels Section */}
      {activeSection === 'channels' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Search reporting channels (e.g. &quot;EACC&quot;, &quot;corruption&quot;, &quot;procurement&quot;)..."
              className="h-10 pl-10 text-sm border-stone-200 bg-white"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Emergency - Always visible */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-800">EACC Corruption Hotline — 1512 (Toll-Free)</p>
                  <p className="text-xs text-red-600 mt-0.5">Available 24/7. Anonymous reporting accepted. Call or visit eacc.go.ke to report online.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredChannels.map(channel => (
              <Card key={channel.id} className="border-stone-200 bg-white hover:border-slate-300 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                        channel.type === 'hotline' ? 'bg-red-500' :
                        channel.type === 'online' ? 'bg-blue-500' :
                        channel.type === 'in_person' ? 'bg-green-500' :
                        channel.type === 'email' ? 'bg-amber-500' : 'bg-purple-500'
                      }`}>
                        {typeIcon(channel.type)}
                      </div>
                      <div>
                        <CardTitle className="text-xs font-semibold">{channel.name}</CardTitle>
                        <p className="text-[10px] text-stone-500">{channel.agency}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {channel.anonymous && <Badge className="text-[9px] h-5 bg-blue-100 text-blue-700 border-blue-200">Anon</Badge>}
                      {channel.protected && <Badge className="text-[9px] h-5 bg-green-100 text-green-700 border-green-200">Protected</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-[11px] text-stone-600 leading-relaxed">{channel.description}</p>
                  <div className="space-y-1">
                    {channel.phone && (
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <Phone className="h-3 w-3" />
                        <span className="font-medium text-red-600">{channel.phone}</span>
                      </div>
                    )}
                    {channel.email && (
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <Mail className="h-3 w-3" />
                        <span className="text-blue-600">{channel.email}</span>
                      </div>
                    )}
                    {channel.website && (
                      <a href={channel.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline">
                        <ExternalLink className="h-3 w-3" /> {channel.website.replace('https://', '').replace('http://', '')}
                      </a>
                    )}
                    {channel.address && (
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <MapPin className="h-3 w-3" />
                        <span>{channel.address}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px]">{channel.jurisdiction}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Legal Protections Section */}
      {activeSection === 'protections' && (
        <div className="space-y-3">
          <Card className="border-stone-200 bg-white">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-slate-700" />
                <p className="text-xs text-stone-600">
                  Kenya&apos;s legal framework provides <span className="font-bold text-slate-800">9 distinct protections</span> for whistleblowers, from constitutional rights to specific statutory provisions.
                </p>
              </div>
            </CardContent>
          </Card>
          <Accordion type="multiple" className="space-y-2">
            {legalProtections.map((protection, i) => (
              <AccordionItem key={i} value={`prot-${i}`} className="border border-stone-200 rounded-xl bg-white overflow-hidden px-1">
                <AccordionTrigger className="py-3 px-3 hover:no-underline">
                  <div className="flex items-start gap-3 text-left">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      <Scale className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">{protection.article}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{protection.title}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">{protection.description}</p>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Key Provisions</p>
                    {protection.keyProvisions.map((prov, j) => (
                      <div key={j} className="flex items-start gap-2 text-[11px] text-stone-600">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{prov}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* FAQ Section */}
      {activeSection === 'faq' && (
        <div className="space-y-3">
          <Card className="border-stone-200 bg-white">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-slate-700" />
                <p className="text-xs text-stone-600">
                  Frequently asked questions about whistleblowing in Kenya. <span className="font-bold">All answers are based on Kenyan law.</span>
                </p>
              </div>
            </CardContent>
          </Card>
          <Accordion type="multiple" className="space-y-2">
            {faqItems.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-stone-200 rounded-xl bg-white overflow-hidden px-1">
                <AccordionTrigger className="py-3 px-3 hover:no-underline text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-bold text-slate-800 shrink-0">{i + 1}</span>
                    <p className="text-xs font-semibold text-stone-700">{faq.question}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <p className="text-xs text-stone-600 leading-relaxed pl-6">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Bottom CTA */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="py-4 px-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-[11px] text-stone-600 leading-relaxed">
              <span className="font-bold">Safety note:</span> If you face any threats, intimidation, or retaliation after reporting, immediately contact EACC (1512), the police, or a lawyer. Your protection is backed by the Constitution.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
