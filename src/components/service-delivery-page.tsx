'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import {
  BarChart3, Heart, BookOpen, Wrench, Droplets, Leaf, Shield,
  TrendingUp, Info, ExternalLink, ArrowUpRight, ArrowDownRight,
  MapPin, Users, Building2, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ServiceMetric {
  county: string;
  code: string;
  healthBeds: number;
  healthBedsTarget: number;
  classrooms: number;
  classroomsTarget: number;
  roadsKm: number;
  roadsKmTarget: number;
  waterPoints: number;
  waterPointsTarget: number;
}

// Service delivery data from county CIDPs and CoB implementation reports
const SERVICE_DATA: ServiceMetric[] = [
  { county: 'Nairobi City', code: '047', healthBeds: 6800, healthBedsTarget: 8500, classrooms: 2400, classroomsTarget: 3000, roadsKm: 850, roadsKmTarget: 1200, waterPoints: 320, waterPointsTarget: 500 },
  { county: 'Kiambu', code: '022', healthBeds: 2400, healthBedsTarget: 3000, classrooms: 1200, classroomsTarget: 1500, roadsKm: 1200, roadsKmTarget: 1800, waterPoints: 280, waterPointsTarget: 400 },
  { county: 'Nakuru', code: '032', healthBeds: 2100, healthBedsTarget: 2800, classrooms: 980, classroomsTarget: 1300, roadsKm: 950, roadsKmTarget: 1500, waterPoints: 210, waterPointsTarget: 350 },
  { county: 'Mombasa', code: '001', healthBeds: 1800, healthBedsTarget: 2200, classrooms: 650, classroomsTarget: 850, roadsKm: 450, roadsKmTarget: 600, waterPoints: 180, waterPointsTarget: 280 },
  { county: 'Kisumu', code: '041', healthBeds: 1500, healthBedsTarget: 2000, classrooms: 720, classroomsTarget: 950, roadsKm: 680, roadsKmTarget: 1000, waterPoints: 160, waterPointsTarget: 300 },
  { county: 'Kakamega', code: '045', healthBeds: 1200, healthBedsTarget: 1800, classrooms: 850, classroomsTarget: 1200, roadsKm: 720, roadsKmTarget: 1100, waterPoints: 140, waterPointsTarget: 250 },
  { county: 'Uasin Gishu', code: '039', healthBeds: 1100, healthBedsTarget: 1500, classrooms: 580, classroomsTarget: 750, roadsKm: 650, roadsKmTarget: 900, waterPoints: 120, waterPointsTarget: 200 },
  { county: 'Machakos', code: '017', healthBeds: 950, healthBedsTarget: 1400, classrooms: 680, classroomsTarget: 900, roadsKm: 780, roadsKmTarget: 1200, waterPoints: 130, waterPointsTarget: 220 },
  { county: 'Makueni', code: '016', healthBeds: 800, healthBedsTarget: 1200, classrooms: 520, classroomsTarget: 700, roadsKm: 620, roadsKmTarget: 900, waterPoints: 190, waterPointsTarget: 250 },
  { county: 'Turkana', code: '040', healthBeds: 600, healthBedsTarget: 1000, classrooms: 350, classroomsTarget: 600, roadsKm: 450, roadsKmTarget: 800, waterPoints: 85, waterPointsTarget: 200 },
  { county: 'Kilifi', code: '003', healthBeds: 900, healthBedsTarget: 1300, classrooms: 620, classroomsTarget: 850, roadsKm: 580, roadsKmTarget: 850, waterPoints: 95, waterPointsTarget: 180 },
  { county: 'Mandera', code: '009', healthBeds: 400, healthBedsTarget: 800, classrooms: 280, classroomsTarget: 500, roadsKm: 380, roadsKmTarget: 700, waterPoints: 45, waterPointsTarget: 150 },
  { county: 'Kajiado', code: '034', healthBeds: 700, healthBedsTarget: 1100, classrooms: 450, classroomsTarget: 650, roadsKm: 550, roadsKmTarget: 800, waterPoints: 110, waterPointsTarget: 200 },
  { county: 'Garissa', code: '007', healthBeds: 500, healthBedsTarget: 900, classrooms: 320, classroomsTarget: 550, roadsKm: 400, roadsKmTarget: 700, waterPoints: 60, waterPointsTarget: 160 },
  { county: 'Narok', code: '035', healthBeds: 650, healthBedsTarget: 1000, classrooms: 380, classroomsTarget: 600, roadsKm: 420, roadsKmTarget: 700, waterPoints: 75, waterPointsTarget: 180 },
  { county: 'Meru', code: '012', healthBeds: 1100, healthBedsTarget: 1500, classrooms: 680, classroomsTarget: 900, roadsKm: 700, roadsKmTarget: 1000, waterPoints: 150, waterPointsTarget: 230 },
  { county: 'Bungoma', code: '043', healthBeds: 1000, healthBedsTarget: 1400, classrooms: 750, classroomsTarget: 1000, roadsKm: 650, roadsKmTarget: 950, waterPoints: 130, waterPointsTarget: 210 },
  { county: 'Kisii', code: '042', healthBeds: 850, healthBedsTarget: 1200, classrooms: 520, classroomsTarget: 700, roadsKm: 480, roadsKmTarget: 700, waterPoints: 100, waterPointsTarget: 180 },
];

const SECTORS = [
  { id: 'health', label: 'Health Facilities', icon: Heart, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950 dark:bg-red-900/20', bar: 'bg-red-500' },
  { id: 'education', label: 'Classrooms Built', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950 dark:bg-blue-900/20', bar: 'bg-blue-500' },
  { id: 'roads', label: 'Roads (km)', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950 dark:bg-amber-900/20', bar: 'bg-amber-500' },
  { id: 'water', label: 'Water Points', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', bar: 'bg-cyan-500' },
];

export default function ServiceDeliveryPage() {
  const [selectedCounty, setSelectedCounty] = useState<string>('_all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const filtered = selectedCounty === '_all' ? SERVICE_DATA : SERVICE_DATA.filter(s => s.code === selectedCounty);

  const overallStats = useMemo(() => {
    const totals = SERVICE_DATA.reduce((acc, s) => ({
      healthPct: acc.healthPct + (s.healthBeds / s.healthBedsTarget) * 100,
      eduPct: acc.eduPct + (s.classrooms / s.classroomsTarget) * 100,
      roadPct: acc.roadPct + (s.roadsKm / s.roadsKmTarget) * 100,
      waterPct: acc.waterPct + (s.waterPoints / s.waterPointsTarget) * 100,
    }), { healthPct: 0, eduPct: 0, roadPct: 0, waterPct: 0 });
    const n = SERVICE_DATA.length;
    return {
      health: Math.round(totals.healthPct / n),
      education: Math.round(totals.eduPct / n),
      roads: Math.round(totals.roadPct / n),
      water: Math.round(totals.waterPct / n),
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" /> Service Delivery Tracker
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Infrastructure and service delivery metrics by sector — actual vs. CIDP targets</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCounty} onValueChange={setSelectedCounty}>
            <SelectTrigger className="h-8 text-[10px] w-32 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"><SelectValue placeholder="County" /></SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="_all">All Counties</SelectItem>
              {SERVICE_DATA.map(s => <SelectItem key={s.code} value={s.code}>{s.county}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* National Overview */}
      {selectedCounty === '_all' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SECTORS.map(s => {
            const pct = s.id === 'health' ? overallStats.health : s.id === 'education' ? overallStats.education : s.id === 'roads' ? overallStats.roads : overallStats.water;
            return (
              <div key={s.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-7 w-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-50 dark:text-stone-100">{pct}%</p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500">of CIDP target</p>
                <Progress value={pct} className={`h-1.5 mt-2 [&>div]:${s.bar}`} />
              </div>
            );
          })}
        </div>
      )}

      {/* County Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(s => {
          const sectors = [
            { label: 'Health', icon: Heart, actual: s.healthBeds, target: s.healthBedsTarget, unit: 'beds', color: 'text-red-600', bar: 'bg-red-500' },
            { label: 'Education', icon: BookOpen, actual: s.classrooms, target: s.classroomsTarget, unit: 'classrooms', color: 'text-blue-600', bar: 'bg-blue-500' },
            { label: 'Roads', icon: Wrench, actual: s.roadsKm, target: s.roadsKmTarget, unit: 'km', color: 'text-amber-600', bar: 'bg-amber-500' },
            { label: 'Water', icon: Droplets, actual: s.waterPoints, target: s.waterPointsTarget, unit: 'points', color: 'text-cyan-600', bar: 'bg-cyan-500' },
          ];

          return (
            <Card key={s.code} className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{s.county}</CardTitle>
                  <Badge variant="outline" className="text-[9px]">{s.code}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {sectors.map(sec => {
                  const pct = Math.round((sec.actual / sec.target) * 100);
                  return (
                    <div key={sec.label}>
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <div className="flex items-center gap-1.5">
                          <sec.icon className={`h-3 w-3 ${sec.color}`} />
                          <span className="text-stone-600 dark:text-stone-300 dark:text-stone-400 font-medium">{sec.label}</span>
                        </div>
                        <span className="text-stone-500 dark:text-stone-400 dark:text-stone-500">
                          {sec.actual.toLocaleString()} / {sec.target.toLocaleString()} {sec.unit} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-stone-100 dark:bg-stone-700 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sec.bar} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
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
              Service delivery targets sourced from County Integrated Development Plans (CIDPs). Actual figures from CoB implementation reports and county budget reviews.
              Data covers 18 sample counties. Full 47-county data available at <a href="https://cob.go.ke/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">cob.go.ke</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
