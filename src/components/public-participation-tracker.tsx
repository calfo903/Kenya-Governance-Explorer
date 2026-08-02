'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar, MapPin, Users, Megaphone, BookOpen, CheckCircle2,
  Clock, Map, Hand, TrendingUp, ArrowRight, ChevronRight,
  Building2, FileText, Video, Circle, BarChart3, UserCheck, Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { toast } from 'sonner';

// --- Types ---

type EventType = 'Budget Forum' | 'Assembly Hearing' | 'Town Hall' | 'Citizen Engagement';

interface UpcomingEvent {
  id: number;
  title: string;
  county: string;
  venue: string;
  date: string;
  time: string;
  type: EventType;
  rsvpCount: number;
  capacity: number;
  description: string;
}

interface PastEvent {
  id: number;
  title: string;
  county: string;
  date: string;
  type: EventType;
  attendance: number;
  expected: number;
  outcome: string;
}

interface ParticipationScore {
  county: string;
  score: number;
  events: number;
  avgAttendance: number;
}

// --- Mock Data ---

const UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 1, title: 'FY 2025/26 Budget Validation Forum', county: 'Nairobi City', venue: 'KICC Tsavo Ballroom', date: '2025-08-15', time: '09:00 AM', type: 'Budget Forum', rsvpCount: 342, capacity: 500, description: 'Public review and validation of the proposed county budget for the 2025/26 financial year.' },
  { id: 2, title: 'County Assembly Committee Hearing on Health', county: 'Kisumu', venue: 'Kisumu County Assembly Hall', date: '2025-08-18', time: '10:00 AM', type: 'Assembly Hearing', rsvpCount: 128, capacity: 200, description: 'Public hearing on the county health sector budget allocation and service delivery performance.' },
  { id: 3, title: 'Mombasa Town Hall on Infrastructure', county: 'Mombasa', venue: 'Mombasa Town Hall', date: '2025-08-20', time: '02:00 PM', type: 'Town Hall', rsvpCount: 215, capacity: 350, description: 'Open forum to discuss ongoing and planned infrastructure projects in Mombasa County.' },
  { id: 4, title: 'Citizen Engagement on Education Policy', county: 'Nakuru', venue: 'Nakuru Players Theatre', date: '2025-08-22', time: '09:30 AM', type: 'Citizen Engagement', rsvpCount: 89, capacity: 150, description: 'Community dialogue on proposed changes to early childhood education programming.' },
  { id: 5, title: 'Budget Forum for Devolution Projects', county: 'Machakos', venue: 'Machakos People\'s Park', date: '2025-08-25', time: '08:00 AM', type: 'Budget Forum', rsvpCount: 176, capacity: 300, description: 'Public forum reviewing devolution-funded project implementation and future planning.' },
  { id: 6, title: 'Assembly Hearing on Agriculture Sector', county: 'Uasin Gishu', venue: 'Eldoret Municipal Hall', date: '2025-08-28', time: '10:00 AM', type: 'Assembly Hearing', rsvpCount: 64, capacity: 120, description: 'Committee hearing on agricultural subsidies, extension services, and market access programmes.' },
  { id: 7, title: 'Town Hall on Water and Sanitation', county: 'Kilifi', venue: 'Kilifi County Hall', date: '2025-09-02', time: '01:00 PM', type: 'Town Hall', rsvpCount: 93, capacity: 180, description: 'Discussion on water project completion rates and sanitation access expansion plans.' },
  { id: 8, title: 'Citizen Budget Literacy Workshop', county: 'Kiambu', venue: 'Kiambu Cultural Centre', date: '2025-09-05', time: '09:00 AM', type: 'Citizen Engagement', rsvpCount: 55, capacity: 100, description: 'Training citizens on how to read and engage with county budget documents.' },
];

const PAST_EVENTS: PastEvent[] = [
  { id: 101, title: 'FY 2024/25 Mid-Year Budget Review', county: 'Nairobi City', date: '2025-02-12', type: 'Budget Forum', attendance: 412, expected: 500, outcome: '12 budget amendment proposals submitted by citizens; 8 incorporated into supplementary budget.' },
  { id: 102, title: 'Health Service Delivery Hearing', county: 'Kisumu', date: '2025-03-05', type: 'Assembly Hearing', attendance: 167, expected: 200, outcome: 'Resolution passed to increase community health volunteer stipend by 30%.' },
  { id: 103, title: 'Coast Region Development Forum', county: 'Mombasa', date: '2025-01-20', type: 'Town Hall', attendance: 289, expected: 350, outcome: 'Citizens identified 5 priority projects for accelerated implementation.' },
  { id: 104, title: 'Youth Participation in Governance', county: 'Nakuru', date: '2025-04-10', type: 'Citizen Engagement', attendance: 78, expected: 150, outcome: 'Youth advisory council established with 15 members.' },
  { id: 105, title: 'Agriculture Budget Allocation Review', county: 'Uasin Gishu', date: '2025-03-22', type: 'Budget Forum', attendance: 234, expected: 300, outcome: 'Farmers\' cooperative fund increased by KSh 50M after public petition.' },
  { id: 106, title: 'Education Infrastructure Hearing', county: 'Kiambu', date: '2025-05-14', type: 'Assembly Hearing', attendance: 145, expected: 180, outcome: 'Approved construction of 4 new classrooms in underserved wards.' },
];

const COUNTY_SCORES: ParticipationScore[] = [
  { county: 'Nairobi City', score: 88, events: 24, avgAttendance: 380 },
  { county: 'Kisumu', score: 76, events: 18, avgAttendance: 165 },
  { county: 'Mombasa', score: 72, events: 16, avgAttendance: 245 },
  { county: 'Uasin Gishu', score: 68, events: 14, avgAttendance: 198 },
  { county: 'Nakuru', score: 65, events: 15, avgAttendance: 132 },
  { county: 'Machakos', score: 62, events: 12, avgAttendance: 156 },
  { county: 'Kiambu', score: 58, events: 11, avgAttendance: 110 },
  { county: 'Kilifi', score: 52, events: 10, avgAttendance: 95 },
  { county: 'Kakamega', score: 48, events: 9, avgAttendance: 88 },
  { county: 'Mandera', score: 35, events: 5, avgAttendance: 62 },
];

const PARTICIPATION_TRENDS = [
  { month: 'Jan', rsvps: 420, attendance: 380, events: 8 },
  { month: 'Feb', rsvps: 510, attendance: 465, events: 10 },
  { month: 'Mar', rsvps: 680, attendance: 590, events: 14 },
  { month: 'Apr', rsvps: 540, attendance: 480, events: 11 },
  { month: 'May', rsvps: 720, attendance: 640, events: 16 },
  { month: 'Jun', rsvps: 810, attendance: 710, events: 18 },
  { month: 'Jul', rsvps: 460, attendance: 395, events: 9 },
  { month: 'Aug', rsvps: 890, attendance: 0, events: 20 },
];

const RESOURCE_CARDS = [
  { title: 'How to Participate in County Budget Process', description: 'A step-by-step guide to engaging with your county budget from proposal to approval.', icon: BookOpen, color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { title: 'Understanding County Assembly Proceedings', description: 'Learn how the county assembly works and how citizens can contribute to legislation.', icon: Building2, color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
  { title: 'Filing a Petition to Your County Assembly', description: 'Guide on drafting, submitting, and following up on public petitions under Article 119.', icon: FileText, color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  { title: 'Attending Public Hearings: What to Expect', description: 'Practical tips for citizens attending assembly committee hearings and town halls.', icon: Megaphone, color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' },
];

// --- Helpers ---

function typeColor(type: EventType): string {
  switch (type) {
    case 'Budget Forum': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    case 'Assembly Hearing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    case 'Town Hall': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    case 'Citizen Engagement': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
  }
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBarColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// --- Component ---

export default function PublicParticipationTracker() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'scores' | 'resources'>('upcoming');
  const [rsvpedEvents, setRsvpedEvents] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredUpcoming = useMemo(() => {
    let result = [...UPCOMING_EVENTS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.county.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((e) => e.type === typeFilter);
    }
    return result;
  }, [searchQuery, typeFilter]);

  const stats = {
    upcoming: UPCOMING_EVENTS.length,
    counties: new Set(UPCOMING_EVENTS.map((e) => e.county)).size,
    rsvps: UPCOMING_EVENTS.reduce((s, e) => s + e.rsvpCount, 0),
    avgAttendance: Math.round(PAST_EVENTS.reduce((s, e) => s + (e.attendance / e.expected) * 100, 0) / PAST_EVENTS.length),
  };

  const handleRsvp = (eventId: number, eventName: string) => {
    setRsvpedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        toast.info(`RSVP cancelled for ${eventName}`);
      } else {
        next.add(eventId);
        toast.success(`RSVP confirmed for ${eventName}`);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Hand className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
              Public Participation Tracker
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 ml-13">
            Monitor and engage with county governance public forums, hearings, and citizen events
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Upcoming</p>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-50 mt-1">{stats.upcoming}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">events scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-500" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Counties</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.counties}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">active counties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Citizen RSVPs</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.rsvps.toLocaleString()}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">total registrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider">Avg Attendance</p>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.avgAttendance}%</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">of expected turnout</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-stone-200 dark:border-stone-700 pb-px">
          {(['upcoming', 'past', 'scores', 'resources'] as const).map((t) => (
            <Button
              key={t}
              variant={activeTab === t ? 'default' : 'ghost'}
              size="sm"
              className="rounded-b-none h-9 text-xs capitalize"
              onClick={() => setActiveTab(t)}
            >
              {t === 'upcoming' && <Calendar className="w-3.5 h-3.5 mr-1.5" />}
              {t === 'past' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
              {t === 'scores' && <BarChart3 className="w-3.5 h-3.5 mr-1.5" />}
              {t === 'resources' && <BookOpen className="w-3.5 h-3.5 mr-1.5" />}
              {t === 'resources' ? 'How to Participate' : t === 'scores' ? 'Participation Scores' : `${t} Events`}
            </Button>
          ))}
        </div>

        {/* Upcoming Events Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Search events by title, county, or venue..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Budget Forum">Budget Forum</SelectItem>
                  <SelectItem value="Assembly Hearing">Assembly Hearing</SelectItem>
                  <SelectItem value="Town Hall">Town Hall</SelectItem>
                  <SelectItem value="Citizen Engagement">Citizen Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {filteredUpcoming.length === 0 && (
                  <div className="text-center py-12 text-stone-500 dark:text-stone-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming events match your search.</p>
                  </div>
                )}
                {filteredUpcoming.map((event) => {
                  const isRsvped = rsvpedEvents.has(event.id);
                  const fillPct = Math.round((event.rsvpCount / event.capacity) * 100);
                  return (
                    <Card key={event.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 text-center">
                            <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
                              {new Date(event.date).getDate()}
                            </span>
                            <span className="text-[10px] uppercase text-stone-500 dark:text-stone-400">
                              {new Date(event.date).toLocaleString('en-KE', { month: 'short' })}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{event.title}</h3>
                              <Badge className={`shrink-0 text-[10px] ${typeColor(event.type)}`}>{event.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap text-xs text-stone-500 dark:text-stone-400">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.county}</span>
                              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{event.venue}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400">{event.description}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 max-w-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-stone-500 dark:text-stone-400">RSVPs: {event.rsvpCount}/{event.capacity}</span>
                                  <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300">{fillPct}%</span>
                                </div>
                                <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${fillPct}%` }} />
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={isRsvped ? 'secondary' : 'default'}
                                className="h-7 text-xs"
                                onClick={() => handleRsvp(event.id, event.title)}
                              >
                                {isRsvped ? 'Cancel RSVP' : 'RSVP Now'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Past Events Tab */}
        {activeTab === 'past' && (
          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {PAST_EVENTS.map((event) => {
                const attendancePct = Math.round((event.attendance / event.expected) * 100);
                return (
                  <Card key={event.id}>
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{event.title}</h3>
                        <Badge className={`shrink-0 text-[10px] ${typeColor(event.type)}`}>{event.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.county}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-stone-600 dark:text-stone-400">
                          Attendance: <span className="font-semibold text-stone-900 dark:text-stone-50">{event.attendance}</span> / {event.expected} ({attendancePct}%)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          Outcome: {event.outcome}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Participation Scores Tab */}
        {activeTab === 'scores' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  County Participation Scores
                </CardTitle>
                <CardDescription>How actively engaged each county's citizens are (0-100 scale)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {COUNTY_SCORES.sort((a, b) => b.score - a.score).map((c) => (
                  <div key={c.county} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-50 w-32 shrink-0 truncate">{c.county}</span>
                    <div className="flex-1">
                      <div className="h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBarColor(c.score)}`} style={{ width: `${c.score}%` }} />
                      </div>
                    </div>
                    <span className={`text-sm font-semibold w-10 text-right ${scoreColor(c.score)}`}>{c.score}</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 w-20 text-right">{c.events} events</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participation Trends</CardTitle>
                <CardDescription>Monthly RSVPs and attendance figures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PARTICIPATION_TRENDS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="rsvps" name="RSVPs" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="attendance" name="Attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RESOURCE_CARDS.map((r, i) => {
              const Icon = r.icon;
              return (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${r.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-1">{r.title}</h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400">{r.description}</p>
                        <Button variant="link" size="sm" className="h-6 text-xs text-emerald-600 dark:text-emerald-400 p-0 mt-2">
                          Read Guide <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
