'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Bell, Mail, Phone, MapPin, CheckCircle2, Info,
  Shield, Users, Building2, BookOpen, ShieldCheck,
  ChevronRight, X, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const ALERT_TYPES = [
  { id: 'audit', label: 'New Audit Report', description: 'OAG audit reports and opinions for counties', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: 'budget', label: 'Budget Review', description: 'CoB budget implementation reviews', icon: <Building2 className="h-3.5 w-3.5" /> },
  { id: 'eacc', label: 'EACC Investigation', description: 'EACC investigations and charges', icon: <Shield className="h-3.5 w-3.5" /> },
  { id: 'assembly', label: 'County Assembly Session', description: 'County assembly sitting notices and hansard', icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'legislation', label: 'County Legislation', description: 'County bills, acts, and policy changes', icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: 'procurement', label: 'Procurement Notices', description: 'County tender notices and contract awards', icon: <Building2 className="h-3.5 w-3.5" /> },
];

const FREQUENCIES = [
  { value: 'immediate', label: 'Immediate', description: 'Alert sent as soon as new data is available' },
  { value: 'daily', label: 'Daily Digest', description: 'Summary of alerts sent once per day' },
  { value: 'weekly', label: 'Weekly Digest', description: 'Weekly summary every Monday' },
];

const REGIONS = [
  'Coast', 'North Eastern', 'Eastern', 'Central',
  'Rift Valley', 'Western', 'Nyanza', 'Nairobi',
];

export default function AlertsSubscriptionPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set());
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [frequency, setFrequency] = useState('daily');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [subscribed, setSubscribed] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const filteredCounties = useMemo(() => {
    if (regionFilter === 'all') return all47Governors;
    return all47Governors.filter(g => g.region === regionFilter);
  }, [regionFilter]);

  const toggleCounty = (county: string) => {
    const next = new Set(selectedCounties);
    if (next.has(county)) next.delete(county);
    else next.add(county);
    setSelectedCounties(next);
  };

  const toggleAlert = (id: string) => {
    const next = new Set(selectedAlerts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedAlerts(next);
  };

  const selectAllInRegion = () => {
    const regionCounties = filteredCounties.map(g => g.county);
    const allSelected = regionCounties.every(c => selectedCounties.has(c));
    if (allSelected) {
      const next = new Set(selectedCounties);
      regionCounties.forEach(c => next.delete(c));
      setSelectedCounties(next);
    } else {
      setSelectedCounties(new Set([...selectedCounties, ...regionCounties]));
    }
  };

  const handleSubscribe = () => {
    setSubscribed(true);
  };

  const canSubscribe = (email || phone) && selectedCounties.size > 0 && selectedAlerts.size > 0 && agreeTerms;

  if (subscribed) {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Bell className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Alert Subscription</h2>
              <p className="text-sm text-emerald-200 mt-1">Stay informed about governance developments in your counties</p>
            </div>
          </div>
        </div>

        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="py-8 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-emerald-800">Subscription Confirmed!</h3>
            <p className="text-sm text-emerald-700 mt-2 max-w-md mx-auto">
              Your alert preferences have been saved. In a production environment, you would receive
              {frequency === 'immediate' ? ' real-time' : frequency === 'daily' ? ' daily' : ' weekly'} notifications
              for {selectedCounties.size} {selectedCounties.size === 1 ? 'county' : 'counties'}
              across {selectedAlerts.size} alert {selectedAlerts.size === 1 ? 'type' : 'types'}.
            </p>
            <div className="mt-4 p-3 bg-white dark:bg-stone-900 rounded-lg border border-emerald-100 inline-block">
              <p className="text-xs text-stone-600 dark:text-stone-300">
                <span className="font-bold">{email || phone}</span> — {selectedCounties.size} counties — {selectedAlerts.size} alert types
              </p>
            </div>
            <Button className="mt-6" variant="outline" onClick={() => setSubscribed(false)}>Modify Subscription</Button>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
          <CardContent className="py-3 px-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed">
                <span className="font-bold">Demo mode:</span> This is a UI-only subscription form. Actual alert delivery requires backend integration with email/SMS services, a data monitoring pipeline, and a notification system connected to OAG, CoB, EACC, and county assembly data feeds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Bell className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Governance Alert Subscription</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Subscribe to alerts for audit reports, budget reviews, EACC investigations, and county assembly sessions.
              Get notified when new governance data is published for your counties of interest.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-blue-500/20 rounded-lg text-[11px] font-medium text-blue-300 flex items-center gap-1"><Bell className="h-3 w-3" /> Real-Time Alerts</span>
              <span className="px-2.5 py-1 bg-emerald-500/20 rounded-lg text-[11px] font-medium text-emerald-300 flex items-center gap-1"><Mail className="h-3 w-3" /> Email / SMS</span>
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-lg text-[11px] font-medium text-amber-300 flex items-center gap-1"><MapPin className="h-3 w-3" /> 47 Counties</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact & Counties */}
        <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold">Contact & County Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Email Address</label>
              <Input type="email" placeholder="your@email.com" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Phone (for SMS alerts)</label>
              <Input type="tel" placeholder="+254 7XX XXX XXX" className="h-9 text-xs border-stone-200 dark:border-stone-700" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">Counties ({selectedCounties.size} selected)</label>
                <div className="flex gap-2 items-center">
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="h-7 text-[10px] border-stone-200 dark:border-stone-700 w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={selectAllInRegion}>
                    {filteredCounties.every(c => selectedCounties.has(c.county)) ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>
              <ScrollArea className="max-h-64">
                <div className="grid grid-cols-2 gap-1">
                  {filteredCounties.map(g => (
                    <label key={g.county} className={`flex items-center gap-1.5 p-1.5 rounded border cursor-pointer transition-colors text-[10px] ${selectedCounties.has(g.county) ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'}`}>
                      <Checkbox checked={selectedCounties.has(g.county)} onCheckedChange={() => toggleCounty(g.county)} className="h-3.5 w-3.5" />
                      <span className="text-stone-700 dark:text-stone-200 font-medium truncate">{g.county}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Alert Types & Frequency */}
        <div className="space-y-4">
          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Alert Types ({selectedAlerts.size} selected)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ALERT_TYPES.map(alert => (
                <label key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedAlerts.has(alert.id) ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'}`}>
                  <Checkbox checked={selectedAlerts.has(alert.id)} onCheckedChange={() => toggleAlert(alert.id)} />
                  <div className="flex items-center gap-2 flex-1">
                    <div className="text-stone-500 dark:text-stone-400">{alert.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{alert.label}</p>
                      <p className="text-[9px] text-stone-500 dark:text-stone-400">{alert.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold">Delivery Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-2">
                {FREQUENCIES.map(f => (
                  <label key={f.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${frequency === f.value ? 'bg-blue-50 dark:bg-blue-950 border-blue-200' : 'bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'}`}>
                    <RadioGroupItem value={f.value} />
                    <div>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{f.label}</p>
                      <p className="text-[9px] text-stone-500 dark:text-stone-400">{f.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} />
                  <span className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed">
                    <span className="font-bold">Privacy notice:</span> I agree that my contact information will be used to send governance alerts. I understand this is a demo service
                    and no data is transmitted externally. In production, data would be handled per the Kenya Data Protection Act, 2019.
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full gap-2" onClick={handleSubscribe} disabled={!canSubscribe}>
            <Bell className="h-4 w-4" />
            Subscribe to Alerts
          </Button>
        </div>
      </div>
    </div>
  );
}
