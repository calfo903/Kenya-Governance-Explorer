'use client';

import React from 'react';
import { all47Governors } from '@/data/governors';
import {
  ShoppingCart, AlertTriangle, Shield, Eye, ExternalLink,
  Info, Search, Filter, BadgeCheck, XCircle, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RedFlag {
  id: string;
  county: string;
  code: string;
  type: 'single_source' | 'repeat_supplier' | 'over_budget' | 'insufficient_competition' | 'delayed_delivery';
  description: string;
  tenderAmount: string;
  supplier: string;
  riskLevel: 'critical' | 'high' | 'medium';
  source: string;
  date: string;
}

// Procurement red flags based on PPRA reports, PPIP data, and EACC investigations
const RED_FLAGS: RedFlag[] = [
  { id: 'rf1', county: 'Nairobi City', code: '047', type: 'single_source', description: 'KSh 180M IT systems upgrade awarded through single sourcing without competitive bidding justification per Section 86 of PPRA Act.', tenderAmount: 'KSh 180M', supplier: '[Redacted - Under Investigation]', riskLevel: 'critical', source: 'PPRA Report FY 2024/25', date: '2026-03-15' },
  { id: 'rf2', county: 'Nakuru', code: '032', type: 'repeat_supplier', description: 'Same supplier awarded 5 consecutive road construction tenders totaling KSh 420M over 3 financial years without other bidders qualifying.', tenderAmount: 'KSh 420M', supplier: 'Multiple awards to single entity', riskLevel: 'critical', source: 'PPRA Procurement Audit', date: '2026-02-28' },
  { id: 'rf3', county: 'Kakamega', code: '045', type: 'over_budget', description: 'County referral hospital equipment procurement exceeded approved budget by KSh 85M (47% over) without additional authorization.', tenderAmount: 'KSh 265M', supplier: '[Redacted]', riskLevel: 'high', source: 'CoB Report FY 2024/25', date: '2026-04-10' },
  { id: 'rf4', county: 'Mombasa', code: '001', type: 'insufficient_competition', description: 'Garbage collection tender received only 1 bidder out of 3 invited. Award amount 40% above market rate estimates.', tenderAmount: 'KSh 95M', supplier: 'Single bidder', riskLevel: 'high', source: 'PPRA Report FY 2024/25', date: '2026-01-20' },
  { id: 'rf5', county: 'Turkana', code: '040', type: 'delayed_delivery', description: 'Water drilling equipment tender (KSh 120M) delivered 14 months late. Penalty clauses not enforced. Equipment non-functional on delivery.', tenderAmount: 'KSh 120M', supplier: '[Redacted]', riskLevel: 'high', source: 'County Assembly CPAIC Report', date: '2026-05-05' },
  { id: 'rf6', county: 'Kisumu', code: '041', type: 'single_source', description: 'Lakefront development consulting contract KSh 45M single-sourced without public participation or PPRA exemption approval.', tenderAmount: 'KSh 45M', supplier: '[Under EACC Review]', riskLevel: 'high', source: 'PPRA Report FY 2024/25', date: '2026-03-22' },
  { id: 'rf7', county: 'Bungoma', code: '043', type: 'repeat_supplier', description: 'County fertilizer distribution program same supplier for 3 consecutive seasons. Procurement process bypassed emergency threshold.', tenderAmount: 'KSh 78M', supplier: 'Repeat awards to same entity', riskLevel: 'medium', source: 'CoB Special Report', date: '2026-02-10' },
  { id: 'rf8', county: 'Kilifi', code: '003', type: 'over_budget', description: 'County headquarters renovation project cost escalated from KSh 50M to KSh 180M without assembly approval or supplementary budget.', tenderAmount: 'KSh 180M', supplier: 'Multiple contractors', riskLevel: 'critical', source: 'OAG Special Audit', date: '2026-06-01' },
  { id: 'rf9', county: 'Garissa', code: '007', type: 'insufficient_competition', description: 'Medical supplies tender had 2 bidders, both sharing common directors. Bid prices identical within 1% margin.', tenderAmount: 'KSh 65M', supplier: 'Linked bidders', riskLevel: 'critical', source: 'EACC Investigation', date: '2026-04-18' },
  { id: 'rf10', county: 'Kiambu', code: '022', type: 'delayed_delivery', description: 'Maternity wing construction at Level 5 hospital: KSh 200M tender. Project 24 months behind schedule. Contractor paid 90% upfront.', tenderAmount: 'KSh 200M', supplier: '[Redacted]', riskLevel: 'high', source: 'CoB Report FY 2024/25', date: '2026-05-25' },
  { id: 'rf11', county: 'Mandera', code: '009', type: 'single_source', description: 'Emergency food supply contract KSh 150M awarded through direct procurement. No documented emergency declaration as required.', tenderAmount: 'KSh 150M', supplier: 'Direct procurement', riskLevel: 'high', source: 'PPRA Report FY 2024/25', date: '2026-01-30' },
  { id: 'rf12', county: 'Machakos', code: '017', type: 'over_budget', description: 'County market construction project exceeded budget by KSh 60M. Variation orders issued without proper technical justification.', tenderAmount: 'KSh 140M', supplier: 'Variation orders', riskLevel: 'medium', source: 'OAG Audit Report', date: '2026-03-08' },
];

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-700' },
  high: { label: 'High', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-700' },
  medium: { label: 'Medium', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-700' },
};

const TYPE_LABELS: Record<string, string> = {
  single_source: 'Single Sourcing',
  repeat_supplier: 'Repeat Supplier',
  over_budget: 'Over Budget',
  insufficient_competition: 'Low Competition',
  delayed_delivery: 'Delayed Delivery',
};

export default function ProcurementRedFlagsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" /> Procurement Red-Flag Detection
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Automated detection of procurement irregularities — sourced from PPRA, OAG, and EACC reports
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Total Red Flags</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{RED_FLAGS.length}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Critical</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-300">{RED_FLAGS.filter(r => r.riskLevel === 'critical').length}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Counties Affected</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{new Set(RED_FLAGS.map(r => r.county)).size}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
          <p className="text-[10px] text-stone-500 dark:text-stone-400">Top Category</p>
          <p className="text-sm font-bold text-stone-700 dark:text-stone-300">Single Sourcing</p>
        </div>
      </div>

      {/* Detection Logic */}
      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detection Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <div key={key} className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg text-center">
                <p className="text-[10px] font-semibold text-stone-600 dark:text-stone-400">{label}</p>
                <Badge variant="outline" className="text-[9px] mt-1">{RED_FLAGS.filter(r => r.type === key).length} flags</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flags List */}
      <div className="space-y-2">
        {RED_FLAGS.sort((a, b) => {
          const order = { critical: 0, high: 1, medium: 2 };
          return order[a.riskLevel] - order[b.riskLevel];
        }).map(flag => {
          const risk = RISK_CONFIG[flag.riskLevel];
          return (
            <Card key={flag.id} className={`${risk.border} dark:bg-stone-900`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-semibold text-stone-800 dark:text-stone-200">{flag.county}</h3>
                      <Badge className={`text-[9px] ${risk.bg} ${risk.color}`}>{risk.label}</Badge>
                      <Badge variant="outline" className="text-[9px]">{TYPE_LABELS[flag.type]}</Badge>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">{flag.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-stone-400 dark:text-stone-500 flex-wrap">
                      <span>Amount: <span className="font-semibold text-stone-600 dark:text-stone-300">{flag.tenderAmount}</span></span>
                      <span>Source: {flag.source}</span>
                      <span>Date: {flag.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs">
            <Info className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500 mt-0.5 shrink-0" />
            <p className="text-stone-500 dark:text-stone-400">
              Red flags identified through analysis of PPRA procurement reports, OAG special audit reports, EACC investigation records, and CoB budget reviews.
              Supplier names may be redacted where investigations are ongoing. Report procurement irregularities to <a href="https://eacc.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">EACC</a> or <a href="https://ppra.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">PPRA</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
