'use client';

import React, { useState } from 'react';
import {
  Download, Bell, BellOff, Smartphone, Info, Trash2,
  HardDrive, RefreshCw, Share2, QrCode, Clock, Zap,
  Shield, CheckCircle2, AlertTriangle, Settings, ExternalLink,
  BarChart3, Wifi, WifiOff, Globe, Monitor, Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}

interface PerformanceMetric {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'poor';
  progress: number;
}

const notificationCategories: NotificationCategory[] = [
  { id: 'projects', name: 'Project Updates', description: 'New project launches, status changes, completions', enabled: true, icon: <Package className="h-4 w-4 text-emerald-600" /> },
  { id: 'budget', name: 'Budget Alerts', description: 'Budget allocations, expenditures, quarterly reports', enabled: true, icon: <BarChart3 className="h-4 w-4 text-emerald-600" /> },
  { id: 'audits', name: 'Audit Reports', description: 'New audit opinions, special audits, findings', enabled: false, icon: <Shield className="h-4 w-4 text-emerald-600" /> },
  { id: 'forum', name: 'Forum Replies', description: 'Replies to your comments and discussions', enabled: true, icon: <Globe className="h-4 w-4 text-emerald-600" /> },
  { id: 'petitions', name: 'Petition Milestones', description: 'Signature thresholds reached, petition responses', enabled: false, icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
];

const performanceMetrics: PerformanceMetric[] = [
  { label: 'Initial Load Time', value: '1.2s', status: 'good', progress: 88 },
  { label: 'Cache Hit Rate', value: '94.2%', status: 'good', progress: 94 },
  { label: 'Offline Readiness', value: '87%', status: 'good', progress: 87 },
  { label: 'Time to Interactive', value: '2.1s', status: 'warning', progress: 72 },
  { label: 'First Contentful Paint', value: '0.8s', status: 'good', progress: 92 },
  { label: 'Background Sync Success', value: '91%', status: 'good', progress: 91 },
];

const statusColor = (s: string) => s === 'good' ? 'text-emerald-600' : s === 'warning' ? 'text-amber-600' : 'text-red-600';
const statusBg = (s: string) => s === 'good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : s === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';

export default function PWAEnhancementPanel() {
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationCategories.map(c => [c.id, c.enabled]))
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [digestFrequency, setDigestFrequency] = useState('daily');
  const [shareLink] = useState('https://governance.ke/share?ref=user_kenya_2025');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isInstalled] = useState(false);

  const toggleNotification = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const enabledCount = Object.values(notifications).filter(Boolean).length;

  const copyShareLink = () => {
    navigator.clipboard?.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const avgPerformance = Math.round(performanceMetrics.reduce((a, m) => a + m.progress, 0) / performanceMetrics.length);

  return (
    <div className="space-y-6">
      {/* Update Available Banner */}
      <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Update Available - v2.4.1</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">New features: Enhanced offline mode, improved search, bug fixes</p>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Update Now
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="install">
        <TabsList className="bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        {/* Install Tab */}
        <TabsContent value="install" className="mt-4 space-y-4">
          {isInstalled ? (
            <Card>
              <CardContent className="flex flex-col items-center py-10 gap-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
                <p className="text-lg font-medium text-stone-800 dark:text-stone-200">App Installed</p>
                <p className="text-sm text-stone-500">Kenya Governance Explorer is installed on your device</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                    <Smartphone className="h-10 w-10 text-emerald-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">Install Kenya Governance Explorer</CardTitle>
                <CardDescription>
                  Get the full app experience with offline access, push notifications, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base">
                  <Download className="h-5 w-5 mr-2" />
                  Install App
                </Button>
                <div className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
                  <p className="font-medium text-stone-800 dark:text-stone-200">Installation Instructions:</p>
                  <div className="space-y-1.5 pl-1">
                    <p><span className="font-medium text-stone-700 dark:text-stone-300">Android (Chrome):</span> Tap the menu (three dots), then "Add to Home Screen"</p>
                    <p><span className="font-medium text-stone-700 dark:text-stone-300">iOS (Safari):</span> Tap the share icon, then "Add to Home Screen"</p>
                    <p><span className="font-medium text-stone-700 dark:text-stone-300">Desktop (Chrome/Edge):</span> Click the install icon in the address bar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5 text-emerald-600" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Version</p>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">2.4.0</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Last Updated</p>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Jan 12, 2025</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Cache Status</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">Fresh</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Platform</p>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Web App (PWA)</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Service Worker</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">Active</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-900">
                  <p className="text-xs text-stone-500">Manifest</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">Valid</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wifi className="h-5 w-5 text-emerald-600" />
                Background Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-stone-800 dark:text-stone-200">Data sync</span>
                </div>
                <Badge className={`text-xs ${statusBg('good')}`}>Active</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-stone-800 dark:text-stone-200">Push notification sync</span>
                </div>
                <Badge className={`text-xs ${statusBg('good')}`}>Active</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-stone-800 dark:text-stone-200">Last background sync</span>
                </div>
                <span className="text-sm text-stone-500">14 min ago</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-stone-800 dark:text-stone-200">Pending sync queue</span>
                </div>
                <Badge variant="secondary" className="text-xs">3 items</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Notification Categories</CardTitle>
                  <CardDescription>{enabledCount} of {notificationCategories.length} categories enabled</CardDescription>
                </div>
                <Bell className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificationCategories.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-700"
                >
                  <div className="flex items-center gap-3">
                    {cat.icon}
                    <div>
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{cat.name}</p>
                      <p className="text-xs text-stone-500">{cat.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNotification(cat.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      notifications[cat.id]
                        ? 'bg-emerald-600'
                        : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
                      notifications[cat.id] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-emerald-600" />
                Notification Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Quiet Hours</p>
                  <p className="text-xs text-stone-500">Mute notifications during set hours</p>
                </div>
                <button
                  onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    quietHoursEnabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${
                    quietHoursEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {quietHoursEnabled && (
                <div className="flex items-center gap-3 pl-1">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">From</p>
                    <Input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="w-32" />
                  </div>
                  <span className="text-stone-400 mt-5">to</span>
                  <div>
                    <p className="text-xs text-stone-500 mb-1">To</p>
                    <Input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="w-32" />
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Digest Frequency</p>
                  <p className="text-xs text-stone-500">How often to bundle non-urgent notifications</p>
                </div>
                <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-5 w-5 text-emerald-600" />
                Storage Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-stone-600 dark:text-stone-400">Used: 30.9 MB</span>
                  <span className="text-sm text-stone-600 dark:text-stone-400">Limit: 100 MB</span>
                </div>
                <Progress value={31} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md bg-stone-50 dark:bg-stone-900">
                  <span className="text-sm text-stone-800 dark:text-stone-200">Cached County Data</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">4.2 MB</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-stone-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-stone-50 dark:bg-stone-900">
                  <span className="text-sm text-stone-800 dark:text-stone-200">Project Records</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">12.8 MB</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-stone-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-stone-50 dark:bg-stone-900">
                  <span className="text-sm text-stone-800 dark:text-stone-200">Budget Data</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">8.1 MB</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-stone-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-stone-50 dark:bg-stone-900">
                  <span className="text-sm text-stone-800 dark:text-stone-200">Audit Reports</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">3.5 MB</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-stone-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-stone-50 dark:bg-stone-900">
                  <span className="text-sm text-stone-800 dark:text-stone-200">Representative Profiles</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">2.3 MB</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-stone-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Cached Data (30.9 MB)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-emerald-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Current app performance based on Lighthouse analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map(metric => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-stone-700 dark:text-stone-300">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${statusColor(metric.status)}`}>{metric.value}</span>
                        <Badge variant="outline" className={`text-[10px] ${statusBg(metric.status)}`}>
                          {metric.status === 'good' ? 'Good' : metric.status === 'warning' ? 'Fair' : 'Poor'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Score */}
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600">{avgPerformance}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-stone-800 dark:text-stone-200">Overall Performance Score</p>
                  <p className="text-sm text-stone-500">Based on {performanceMetrics.length} metrics</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-emerald-600">PWA installable and offline-ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Share2 className="h-5 w-5 text-emerald-600" />
                Share the App
              </CardTitle>
              <CardDescription>Help others discover Kenya Governance Explorer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Share Link</p>
                <div className="flex items-center gap-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button onClick={copyShareLink} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {linkCopied ? <CheckCircle2 className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">QR Code</p>
                <div className="w-48 h-48 rounded-lg border-2 border-dashed border-stone-300 dark:border-stone-600 flex flex-col items-center justify-center gap-2">
                  <QrCode className="h-16 w-16 text-stone-400" />
                  <p className="text-xs text-stone-500">QR Code Placeholder</p>
                  <p className="text-[10px] text-stone-400">Scan to open app</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" /> WhatsApp
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" /> Twitter / X
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" /> Facebook
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" /> Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}