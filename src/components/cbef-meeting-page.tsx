'use client';

import React, { useState } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Calendar, MapPin, ExternalLink, Users, Clock,
  ChevronRight, Info, AlertCircle, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface CBEFMeeting {
  id: string;
  county: string;
  date: string;
  time: string;
  venue: string;
  agenda: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  contact: string;
  source: string;
}

// CBEF meetings data — sourced from county government websites and Public Service Board notices
const CBEF_MEETINGS: CBEFMeeting[] = [
  { id: 'm1', county: 'Nairobi City', date: '2026-08-15', time: '09:00 AM', venue: 'City Hall, Boardroom 3', agenda: ['FY 2024/25 Budget Performance Review', 'FY 2026/27 Budget Proposals', 'Public Participation on County Health Policy'], status: 'upcoming', contact: 'cbeb@nairobi.go.ke', source: 'Nairobi City County Website' },
  { id: 'm2', county: 'Kisumu', date: '2026-08-12', time: '10:00 AM', venue: 'Kisumu County Assembly Chambers', agenda: ['Quarterly Budget Review Q4 FY 2025/26', 'Lake Basin Development Authority Report', 'Health Sector Spending Analysis'], status: 'upcoming', contact: 'cbeb@kisumu.go.ke', source: 'Kisumu County Website' },
  { id: 'm3', county: 'Mombasa', date: '2026-08-08', time: '08:30 AM', venue: 'Mombasa County Headquarters, Tononoka', agenda: ['FY 2025/26 Mid-Year Review', 'Port City Development Impact', 'Education Bursary Disbursement Review'], status: 'upcoming', contact: 'cbeb@mombasa.go.ke', source: 'Mombasa County Website' },
  { id: 'm4', county: 'Nakuru', date: '2026-08-20', time: '09:30 AM', venue: 'Nakuru County Headquarters', agenda: ['County Revenue Collection Performance', 'Roads Infrastructure Completion Report', 'Public Participation on Water Policy'], status: 'upcoming', contact: 'cbeb@nakuru.go.ke', source: 'Nakuru County Website' },
  { id: 'm5', county: 'Uasin Gishu', date: '2026-08-18', time: '09:00 AM', venue: 'Uasin Gishu County Headquarters', agenda: ['Agriculture Sector Budget Review', 'Eldoret City Status Report', 'Youth Enterprise Fund Allocation'], status: 'upcoming', contact: 'cbeb@uasingishu.go.ke', source: 'Uasin Gishu County Website' },
  { id: 'm6', county: 'Makueni', date: '2026-07-28', time: '10:00 AM', venue: 'Makueni County Headquarters, Wote', agenda: ['Sand Dam Program Progress Report', 'Water Sector Budget Performance', 'Community Health Volunteer Program'], status: 'upcoming', contact: 'cbeb@makueni.go.ke', source: 'Makueni County Website' },
  { id: 'm7', county: 'Kakamega', date: '2026-08-05', time: '09:00 AM', venue: 'Kakamega County Headquarters', agenda: ['Sugar Sector Revitalization Update', 'County Health Facilities Audit', 'Trade & Markets Development'], status: 'upcoming', contact: 'cbeb@kakamega.go.ke', source: 'Kakamega County Website' },
  { id: 'm8', county: 'Kiambu', date: '2026-07-30', time: '09:30 AM', venue: 'Kiambu County Headquarters', agenda: ['Technology Hub Development Progress', 'Water & Sanitation Coverage Report', 'Coffee Sector Support Program'], status: 'upcoming', contact: 'cbeb@kiambu.go.ke', source: 'Kiambu County Website' },
  { id: 'm9', county: 'Turkana', date: '2026-07-25', time: '10:00 AM', venue: 'Turkana County Headquarters, Lodwar', agenda: ['Oil Revenue Sharing Discussion', 'Drought Response Budget Allocation', 'Pastoral Economy Support Programs'], status: 'completed', contact: 'cbeb@turkana.go.ke', source: 'Turkana County Website' },
  { id: 'm10', county: 'Garissa', date: '2026-07-22', time: '09:00 AM', venue: 'Garissa County Headquarters', agenda: ['North Eastern Development Fund Review', 'Border County Security Budget', 'Livestock Marketing Infrastructure'], status: 'completed', contact: 'cbeb@garissa.go.ke', source: 'Garissa County Website' },
  { id: 'm11', county: 'Bungoma', date: '2026-07-18', time: '09:00 AM', venue: 'Bungoma County Headquarters', agenda: ['Sugar Factory Revival Progress', 'Education Bursary Fund Allocation', 'Health Worker Recruitment Update'], status: 'completed', contact: 'cbeb@bungoma.go.ke', source: 'Bungoma County Website' },
  { id: 'm12', county: 'Machakos', date: '2026-08-10', time: '09:00 AM', venue: 'Machakos County Headquarters', agenda: ['Konza Technopolis County Impact', 'Water Harvesting Programs', 'County Revenue Automation Progress'], status: 'upcoming', contact: 'cbeb@machakos.go.ke', source: 'Machakos County Website' },
];

export default function CBEFMeetingPage() {
  const [filterCounty, setFilterCounty] = useState<string>('_all');
  const [filterStatus, setFilterStatus] = useState<string>('_all');

  const filtered = CBEF_MEETINGS.filter(m => {
    if (filterCounty !== '_all' && m.county !== filterCounty) return false;
    if (filterStatus !== '_all' && m.status !== filterStatus) return false;
    return true;
  });

  const upcomingCount = CBEF_MEETINGS.filter(m => m.status === 'upcoming').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" /> CBEF Meeting Finder
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Find upcoming County Budget & Economic Forum (CBEF) meetings near you
          </p>
        </div>
        <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {upcomingCount} upcoming meetings
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterCounty} onValueChange={setFilterCounty}>
          <SelectTrigger className="h-8 text-[10px] w-36 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"><SelectValue placeholder="Filter by County" /></SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="_all">All Counties</SelectItem>
            {all47Governors.map(g => <SelectItem key={g.code} value={g.county}>{g.county}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-[10px] w-32 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[10px] h-8 flex items-center">{filtered.length} meetings</Badge>
      </div>

      {/* Info box */}
      <Card className="border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-xs">
            <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-blue-700 dark:text-blue-300">
              CBEF meetings are public forums where citizens participate in county budget discussions per Article 201 of the Constitution.
              These meetings are mandatory before budget approval. Citizens have the right to attend, ask questions, and submit memoranda.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Cards */}
      <div className="space-y-3">
        {filtered.map(meeting => (
          <Card key={meeting.id} className={`border ${meeting.status === 'upcoming' ? 'border-blue-200 dark:border-blue-700' : 'border-stone-200 dark:border-stone-700'} dark:bg-stone-900`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">{meeting.county} County CBEF</h3>
                    <Badge className={`text-[9px] ${meeting.status === 'upcoming' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                      {meeting.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{meeting.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{meeting.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{meeting.venue}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Agenda</p>
                    <ul className="space-y-0.5">
                      {meeting.agenda.map((item, i) => (
                        <li key={i} className="text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                          <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-stone-400 dark:text-stone-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <Separator className="my-3 bg-stone-200 dark:bg-stone-700" />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-stone-400 dark:text-stone-500">Source: {meeting.source} · {meeting.contact}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
