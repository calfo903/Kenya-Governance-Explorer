'use client';

import React, { useState } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Code2, Copy, Check, ExternalLink, Shield,
  MapPin, Star, BarChart3, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function EmbedWidgetPage() {
  const [selectedCounty, setSelectedCounty] = useState<string>('034');
  const [widgetType, setWidgetType] = useState<'scorecard' | 'budget' | 'audit'>('scorecard');
  const [copied, setCopied] = useState(false);

  const governor = all47Governors.find(g => g.code === selectedCounty);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://preview-chatglm.space-z.ai';

  const embedCode = `<iframe
  src="${siteUrl}/embed?county=${selectedCounty}&type=${widgetType}"
  width="320"
  height="480"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 12px;"
  title="${governor?.county || 'County'} Governance Widget"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-indigo-600" /> Embeddable County Widgets
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Generate embed code for your website, blog, or CSO platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Configure Widget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">County</label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {all47Governors.map(g => <SelectItem key={g.code} value={g.code}>{g.county}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Widget Type</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['scorecard', 'budget', 'audit'] as const).map(type => (
                    <Button key={type} size="sm" variant={widgetType === type ? 'default' : 'outline'}
                      onClick={() => setWidgetType(type)} className="text-[10px] h-8 capitalize">
                      {type === 'scorecard' ? 'Scorecard' : type === 'budget' ? 'Budget' : 'Audit'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Embed Code</CardTitle>
                <Button size="sm" onClick={handleCopy} className="h-7 text-[10px] gap-1">
                  {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-stone-900 dark:bg-stone-950 rounded-lg p-3 overflow-x-auto">
                <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap">{embedCode}</pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preview</CardTitle>
            <CardDescription className="text-xs">Widget appearance on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-stone-900 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 dark:border-stone-600 rounded-xl p-4 mx-auto max-w-[320px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100">{governor?.name || 'Governor'}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{governor?.county} County</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center mb-3">
                <div className="bg-stone-50 dark:bg-stone-800 dark:bg-stone-700 rounded-lg p-2">
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Population</p>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100 dark:text-stone-200">{governor?.population.toLocaleString()}</p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 dark:bg-stone-700 rounded-lg p-2">
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">Wards</p>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100 dark:text-stone-200">{governor?.wardsCount}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase">{widgetType === 'scorecard' ? 'Governance Score' : widgetType === 'budget' ? 'Budget Absorption' : 'Audit Opinion'}</p>
                <div className="h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${widgetType === 'scorecard' ? 65 : widgetType === 'budget' ? 48 : 72}%` }} />
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-[8px] text-stone-400 dark:text-stone-500">Kenya Governance Explorer · 2022–2027</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs">
            <Info className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500 mt-0.5 shrink-0" />
            <p className="text-stone-500 dark:text-stone-400">
              These embed widgets are free to use for journalists, CSOs, bloggers, and civic organizations. The widget pulls live data from the Kenya Governance Explorer API.
              Attribution is appreciated but not required. Contact us for custom widget configurations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
