'use client';

import React from 'react';
import { allSources } from '@/data/sources';
import { Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ══════════════════════════════════════════════════════════════════
// JSON SCHEMA VIEW
// ══════════════════════════════════════════════════════════════════
export default function JsonSchemaView() {
  const jsonSchema = { "$schema": "https://json-schema.org/draft/2020-12/schema", title: "Kenya County Governance Data Schema", version: "1.0.0", lastUpdated: "2026-07-25", sourceCount: allSources.length, types: { SourceCitation: { type: "object", properties: { source: { type: "string" }, reportTitle: { type: "string" }, financialYear: { type: "string", pattern: "^FY \\d{4}/\\d{2}$" }, url: { type: "string", format: "uri" }, section: { type: "string" }, accessedDate: { type: "string", format: "date" } }, required: ["source", "reportTitle", "financialYear", "accessedDate"] }, ScorecardMetrics: { type: "object", properties: { overallAccountabilityScore: { type: ["number", "null"], min: 0, max: 100 }, transparencyAssetDeclaration: { type: ["number", "null"], min: 0, max: 100 }, projectDeliveryAbsorptionRate: { type: ["number", "null"], min: 0, max: 100 }, manifestoPromiseFulfillment: { type: ["number", "null"], min: 0, max: 100 }, legislativeOversightPerformance: { type: ["number", "null"], min: 0, max: 100 }, ethicsIntegrity: { type: ["number", "null"], min: 0, max: 100 }, publicSentimentCitizenAwareness: { type: ["number", "null"], min: 0, max: 100 } } }, Representative: { type: "object", properties: { id: { type: "string" }, fullName: { type: "string" }, officialTitle: { type: "string" }, politicalParty: { type: "string" }, coalition: { type: "string" }, termStart: { type: "string" }, termEnd: { type: "string" }, jurisdiction: { type: "string" }, level: { type: "string", enum: ["national", "county", "constituency", "ward"] }, biography: { type: "string" }, scorecard: { "$ref": "#/types/ScorecardMetrics" } }, required: ["id", "fullName", "officialTitle", "politicalParty", "termStart", "termEnd", "jurisdiction", "level"] } }, liveFeedEndpoints: { oag: "https://oagkenya.go.ke/", cob: "https://cob.go.ke/", tikenya: "https://tikenya.org/", eacc: "https://eacc.go.ke/", iebc: "https://www.iebc.or.ke/", ppra: "https://ppra.go.ke/", nlc: "https://nlc.go.ke/", wasreb: "https://wasreb.go.ke/", knbs: "https://www.knbs.or.ke/" } };

  return (
    <div className="space-y-5">
      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Database className="h-4 w-4 text-emerald-600" /> Reusable JSON Schema</CardTitle><CardDescription className="text-xs">Downloadable schema with source citation fields and live feed endpoints for {allSources.length} data sources.</CardDescription></CardHeader>
        <CardContent>
          <div className="bg-stone-900 rounded-lg p-4 overflow-auto max-h-[500px]"><pre className="text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap break-words">{JSON.stringify(jsonSchema, null, 2)}</pre></div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonSchema, null, 2))}>Copy JSON</Button>
            <Button variant="outline" size="sm" className="text-xs" asChild><a href="data:application/json;charset=utf-8," download="kenya-governance-schema.json" onClick={(e) => { (e.currentTarget as HTMLAnchorElement).href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonSchema, null, 2))}`; }}>Download</a></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Expanding Any County — Step-by-Step</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs">
          {[{ title: '1. Pull Election Data', desc: 'IEBC official results for Governor, Deputy, Senator, Woman Rep, MPs, MCAs. Verify against official gazette.', url: 'https://www.iebc.or.ke/' },
            { title: '2. Pull Audit Data', desc: 'Download county-specific audit reports from OAG. Extract audit opinion for Executive and Assembly.', url: 'https://oagkenya.go.ke/reports/county-government-audit-reports/' },
            { title: '3. Pull Budget Data', desc: 'Download CBIRR from CoB. Extract development absorption rate, recurrent absorption, pending bills.', url: 'https://cob.go.ke/county-budget-implementation-review-reports/' },
            { title: '4. Pull Procurement Data', desc: 'Search PPIP for county tender awards, contract values, and supplier patterns.', url: 'https://ppip.go.ke/' },
            { title: '5. Pull Governance Indices', desc: 'Check TI-Kenya CGSR, PesaCheck fact-checks, and EACC public reports.', url: 'https://tikenya.org/' },
            { title: '6. Check Natural Resources', desc: 'NLC for land, WASREB for water, KFS for forests, Mining for minerals.', url: 'https://nlc.go.ke/' },
            { title: '7. Verify Contacts', desc: 'Only include publicly available contacts from official county websites.', url: 'https://opendata.go.ke/' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
              <span className="font-bold text-emerald-700 shrink-0">{step.title}</span>
              <p className="text-stone-600 dark:text-stone-300">{step.desc} <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline ml-1">→</a></p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}