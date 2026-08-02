'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wifi, WifiOff, RefreshCw, HardDrive, Database, Cloud,
  MapPin, Building2, FileText, Users, ShieldCheck, Download,
  Clock, AlertTriangle, CheckCircle2, XCircle, Settings,
  ChevronDown, ChevronRight, Trash2, ArrowDownToLine, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CachedModule {
  id: string;
  name: string;
  icon: React.ReactNode;
  size: string;
  lastUpdated: string;
  entries: number;
  synced: boolean;
}

interface SyncConflict {
  id: string;
  module: string;
  item: string;
  localVersion: string;
  remoteVersion: string;
  timestamp: string;
}

const cachedModules: CachedModule[] = [
  { id: 'counties', name: 'County Profiles', icon: <MapPin className="h-4 w-4 text-emerald-600" />, size: '4.2 MB', lastUpdated: '2025-01-15 08:30', entries: 47, synced: true },
  { id: 'projects', name: 'Development Projects', icon: <Building2 className="h-4 w-4 text-emerald-600" />, size: '12.8 MB', lastUpdated: '2025-01-15 07:45', entries: 1847, synced: true },
  { id: 'budget', name: 'Budget Data', icon: <FileText className="h-4 w-4 text-emerald-600" />, size: '8.1 MB', lastUpdated: '2025-01-14 22:15', entries: 523, synced: false },
  { id: 'audits', name: 'Audit Reports', icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />, size: '3.5 MB', lastUpdated: '2025-01-14 18:00', entries: 89, synced: true },
  { id: 'representatives', name: 'County Representatives', icon: <Users className="h-4 w-4 text-emerald-600" />, size: '2.3 MB', lastUpdated: '2025-01-15 06:00', entries: 2145, synced: true },
];

const syncConflicts: SyncConflict[] = [
  { id: '1', module: 'Budget Data', item: 'Nairobi FY 2024/25 Allocation', localVersion: 'KES 42.1 Billion', remoteVersion: 'KES 43.5 Billion', timestamp: '2025-01-15 09:12' },
  { id: '2', module: 'Projects', item: 'Kisumu Water Tower Renovation', localVersion: 'Status: In Progress (65%)', remoteVersion: 'Status: Completed', timestamp: '2025-01-15 08:55' },
  { id: '3', module: 'Audit Reports', item: 'Mombasa FY 2023/24 Audit', localVersion: 'Qualified Opinion', remoteVersion: 'Disclaimer of Opinion', timestamp: '2025-01-14 23:30' },
];

const availableCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu',
  'Kiambu', 'Machakos', 'Kajiado', 'Meru', 'Kakamega',
  'Bungoma', 'Embu', 'Laikipia', 'Narok', 'Kilifi',
  'Migori', 'Turkana', 'Garissa', 'Wajir', 'Mandera',
  'Kwale', 'Taita Taveta', 'Lamu', 'Tana River', 'Isiolo',
  'Marsabit', 'Samburu', 'West Pokot', 'Trans Nzoia', 'Elgeyo Marakwet',
  'Nandi', 'Bomet', 'Kericho', 'Baringo', 'Homa Bay',
  'Siaya', 'Kisii', 'Nyamira', 'Migori', 'Vihiga',
  'Busia', 'Muranga', 'Kirinyaga', 'Nyandarua', 'Nyeri',
];

const offlineFeatures = [
  { title: 'County Profiles', description: 'View all 47 county profiles with demographic and economic data', available: true },
  { title: 'Project Tracker', description: 'Track development projects status and budget utilization', available: true },
  { title: 'Budget Explorer', description: 'Access county budget allocations and expenditure data', available: true },
  { title: 'Audit Reports', description: 'Read controller audit opinions and findings', available: true },
  { title: 'Representative Directory', description: 'Browse MCAs, Senators, and Governors information', available: true },
  { title: 'AI Search', description: 'AI-powered search requires online connectivity', available: false },
  { title: 'Live Alerts', description: 'Real-time push notifications unavailable offline', available: false },
  { title: 'Community Forum', description: 'Discussion forums require internet connection', available: false },
];

export default function OfflineModeDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState('2025-01-15 08:30:42');
  const [syncInterval, setSyncInterval] = useState('6hr');
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set());
  const [selectedCounties, setSelectedCounties] = useState<string[]>(['Nairobi', 'Mombasa', 'Kisumu']);
  const [countySearch, setCountySearch] = useState('');
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, 'local' | 'remote'>>({});
  const [activeTab, setActiveTab] = useState('overview');

  const totalStorage = 100;
  const usedStorage = 30.9;
  const storagePercent = Math.round((usedStorage / totalStorage) * 100);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = useCallback(() => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setLastSyncTime(new Date().toISOString().replace('T', ' ').slice(0, 19));
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);
  }, [isSyncing]);

  const toggleConflict = (id: string) => {
    setExpandedConflicts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const resolveConflict = (id: string, resolution: 'local' | 'remote') => {
    setConflictResolutions(prev => ({ ...prev, [id]: resolution }));
  };

  const toggleCounty = (county: string) => {
    setSelectedCounties(prev =>
      prev.includes(county) ? prev.filter(c => c !== county) : [...prev, county]
    );
  };

  const filteredCounties = availableCounties.filter(c =>
    c.toLowerCase().includes(countySearch.toLowerCase())
  );

  const resolvedCount = Object.keys(conflictResolutions).length;

  return (
    <div className="space-y-6">
      {/* Connection Status Header */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-8 w-8 text-emerald-600" />
              ) : (
                <WifiOff className="h-8 w-8 text-amber-600" />
              )}
              <div>
                <CardTitle className="text-lg">
                  {isOnline ? 'Online - Connected' : 'Offline Mode Active'}
                </CardTitle>
                <CardDescription>Last sync: {lastSyncTime}</CardDescription>
              </div>
            </div>
            <Button
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </CardHeader>
        {isSyncing && (
          <CardContent>
            <Progress value={Math.min(syncProgress, 100)} className="h-2" />
            <p className="text-xs text-stone-500 mt-2">
              Syncing data... {Math.round(Math.min(syncProgress, 100))}%
            </p>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cached Data</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-5 w-5 text-emerald-600" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {usedStorage} MB used of {totalStorage} MB
                </span>
                <span className="text-sm text-stone-500">{storagePercent}%</span>
              </div>
              <Progress value={storagePercent} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {cachedModules.map(mod => (
                  <div key={mod.id} className="flex items-center gap-2 text-xs">
                    {mod.icon}
                    <span className="text-stone-600 dark:text-stone-400 truncate">{mod.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                      {mod.size}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What's Available Offline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cloud className="h-5 w-5 text-emerald-600" />
                What is Available Offline
              </CardTitle>
              <CardDescription>Features accessible without internet connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {offlineFeatures.map(feat => (
                  <div
                    key={feat.title}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      feat.available
                        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/20 opacity-60'
                    }`}
                  >
                    {feat.available ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-stone-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-stone-800 dark:text-stone-200">{feat.title}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cached Data Tab */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-5 w-5 text-emerald-600" />
                Cached Data Modules
              </CardTitle>
              <CardDescription>Manage locally stored data for offline use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cachedModules.map(mod => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {mod.icon}
                      <div>
                        <p className="font-medium text-sm text-stone-800 dark:text-stone-200">{mod.name}</p>
                        <p className="text-xs text-stone-500">
                          {mod.entries} entries - Updated {mod.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{mod.size}</Badge>
                      {mod.synced ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Synced</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Sync Conflicts
                  </CardTitle>
                  <CardDescription>
                    {syncConflicts.length - resolvedCount} of {syncConflicts.length} conflicts remaining
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  {resolvedCount}/{syncConflicts.length} Resolved
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncConflicts.map(conflict => {
                  const resolved = conflictResolutions[conflict.id];
                  const expanded = expandedConflicts.has(conflict.id);
                  return (
                    <div
                      key={conflict.id}
                      className={`rounded-lg border ${
                        resolved
                          ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10'
                          : 'border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/10'
                      }`}
                    >
                      <button
                        onClick={() => toggleConflict(conflict.id)}
                        className="w-full flex items-center justify-between p-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          {resolved ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm text-stone-800 dark:text-stone-200">{conflict.item}</p>
                            <p className="text-xs text-stone-500">{conflict.module} - {conflict.timestamp}</p>
                          </div>
                        </div>
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {expanded && (
                        <div className="px-3 pb-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-md border border-stone-200 dark:border-stone-700">
                              <p className="text-xs font-medium text-stone-500 mb-1">Local Version</p>
                              <p className="text-sm text-stone-800 dark:text-stone-200">{conflict.localVersion}</p>
                            </div>
                            <div className="p-3 rounded-md border border-stone-200 dark:border-stone-700">
                              <p className="text-xs font-medium text-stone-500 mb-1">Remote Version</p>
                              <p className="text-sm text-stone-800 dark:text-stone-200">{conflict.remoteVersion}</p>
                            </div>
                          </div>
                          {!resolved && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resolveConflict(conflict.id, 'local')}
                                className="flex-1 text-xs"
                              >
                                Keep Local
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => resolveConflict(conflict.id, 'remote')}
                              >
                                Use Remote
                              </Button>
                            </div>
                          )}
                          {resolved && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Resolved: Using {resolved === 'local' ? 'local' : 'remote'} version
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Download Tab */}
        <TabsContent value="download" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
                Download Counties for Offline Use
              </CardTitle>
              <CardDescription>
                {selectedCounties.length} counties selected for offline caching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search counties..."
                value={countySearch}
                onChange={e => setCountySearch(e.target.value)}
                className="max-w-sm"
              />
              <ScrollArea className="h-64 rounded-md border border-stone-200 dark:border-stone-700 p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredCounties.map(county => (
                    <button
                      key={county}
                      onClick={() => toggleCounty(county)}
                      className={`text-left text-sm p-2 rounded-md border transition-colors ${
                        selectedCounties.includes(county)
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedCounties.includes(county) ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        )}
                        {county}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  Estimated download: ~{(selectedCounties.length * 0.65).toFixed(1)} MB
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-5 w-5 text-emerald-600" />
                Auto-Sync Settings
              </CardTitle>
              <CardDescription>Configure automatic data synchronization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Sync Interval</p>
                  <p className="text-xs text-stone-500">How often to check for data updates</p>
                </div>
                <Select value={syncInterval} onValueChange={setSyncInterval}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hr">Every 1 Hour</SelectItem>
                    <SelectItem value="6hr">Every 6 Hours</SelectItem>
                    <SelectItem value="24hr">Every 24 Hours</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Sync on Wi-Fi Only</p>
                  <p className="text-xs text-stone-500">Prevent sync over mobile data</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Enabled</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Background Sync</p>
                  <p className="text-xs text-stone-500">Sync data while app is minimized</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Enabled</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Storage Limit</p>
                  <p className="text-xs text-stone-500">Maximum offline data storage</p>
                </div>
                <Select defaultValue="100mb">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50mb">50 MB</SelectItem>
                    <SelectItem value="100mb">100 MB</SelectItem>
                    <SelectItem value="200mb">200 MB</SelectItem>
                    <SelectItem value="500mb">500 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trash2 className="h-5 w-5 text-red-500" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Clear All Cached Data</p>
                  <p className="text-xs text-stone-500">Remove all offline data ({usedStorage} MB)</p>
                </div>
                <Button variant="destructive" size="sm">Clear Cache</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Reset Sync History</p>
                  <p className="text-xs text-stone-500">Clear conflict resolution history</p>
                </div>
                <Button variant="destructive" size="sm">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
