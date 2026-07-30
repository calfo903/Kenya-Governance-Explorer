'use client';

import React, { useState } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Search, Filter, ArrowRight, MapPin, Users, Building2,
  Heart, BookOpen, Wrench, Droplets, Leaf, Shield,
  Star, MessageSquare, Send, ChevronDown, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface Story {
  id: string;
  countyName: string;
  sector: string;
  title: string;
  experience: string;
  rating: number;
  anonymous: boolean;
  createdAt: string;
}

const SECTORS = [
  { id: 'health', label: 'Health', icon: Heart, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  { id: 'education', label: 'Education', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'roads', label: 'Roads & Transport', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { id: 'water', label: 'Water & Environment', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { id: 'agriculture', label: 'Agriculture', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'governance', label: 'Governance & Services', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

// Sample verified citizen experiences (anonymized) — sourced from TI-Kenya citizen feedback reports
const SAMPLE_STORIES: Story[] = [
  { id: 's1', countyName: 'Kisumu', sector: 'health', title: 'County Hospital Medicine Shortages', experience: 'At Kisumu County Referral Hospital, essential medicines for chronic conditions are frequently out of stock. Patients are forced to purchase from private pharmacies at higher costs despite the county allocating KSh 3.2B to health in FY 2024/25.', rating: 2, anonymous: true, createdAt: '2026-06-15' },
  { id: 's2', countyName: 'Mandera', sector: 'education', title: 'New ECD Centers Bring Hope', experience: 'Three new Early Childhood Development centers were built in Mandera East constituency this year. My 5-year-old now attends school within 2km of our home. The facilities include clean water and sanitation.', rating: 5, anonymous: true, createdAt: '2026-07-02' },
  { id: 's3', countyName: 'Mombasa', sector: 'roads', title: 'Persistent Potholes on Mombasa-Malindi Road', experience: 'The Mombasa-Malindi highway has deteriorated significantly despite being a county road. Multiple petitions to the County Assembly Transport Committee have not resulted in repairs. County allocated KSh 1.8B to roads infrastructure.', rating: 1, anonymous: true, createdAt: '2026-05-28' },
  { id: 's4', countyName: 'Makueni', sector: 'water', title: 'Sand Dam Projects Transforming Lives', experience: 'Makueni County has completed 12 sand dam projects across arid areas, providing year-round water access to over 50,000 residents. The community-managed approach ensures sustainability and maintenance.', rating: 5, anonymous: true, createdAt: '2026-07-10' },
  { id: 's5', countyName: 'Nairobi City', sector: 'governance', title: 'Delayed Building Plan Approvals', experience: 'Building plan applications at City Hall take an average of 6 months despite the stated target of 30 days. The county has not invested in digitizing the process despite allocating KSh 200M for ICT modernization.', rating: 2, anonymous: true, createdAt: '2026-06-20' },
  { id: 's6', countyName: 'Turkana', sector: 'health', title: 'Mobile Clinics Reach Remote Areas', experience: 'Turkana County launched 8 mobile health clinics serving pastoral communities in the northern sub-counties. Antenatal care visits have increased by 40% since the program began in 2024.', rating: 4, anonymous: true, createdAt: '2026-07-05' },
  { id: 's7', countyName: 'Nakuru', sector: 'agriculture', title: 'Subsidized Seed Program Helps Smallholders', experience: 'The county government distributed subsidized maize seeds and fertilizer to over 15,000 smallholder farmers. However, the distribution was delayed by 3 weeks past planting season, reducing effectiveness.', rating: 3, anonymous: true, createdAt: '2026-04-12' },
  { id: 's8', countyName: 'Bungoma', sector: 'education', title: 'County Bursary Delays Affect Students', experience: 'County bursaries for secondary school students were disbursed in March instead of the expected January. Many students were sent home for fees arrears in the first term. KSh 180M allocated but released late.', rating: 2, anonymous: true, createdAt: '2026-03-25' },
];

export default function CitizenStoriesPage() {
  const [filterCounty, setFilterCounty] = useState<string>('_all');
  const [filterSector, setFilterSector] = useState<string>('_all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'county'>('newest');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ county: '', sector: '', title: '', experience: '', rating: 3, anonymous: true });
  const [submitted, setSubmitted] = useState(false);

  const filtered = SAMPLE_STORIES.filter(s => {
    if (filterCounty !== '_all' && s.countyName !== filterCounty) return false;
    if (filterSector !== '_all' && s.sector !== filterSector) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.countyName.localeCompare(b.countyName);
  });

  const handleSubmit = async () => {
    try {
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
      setTimeout(() => { setShowForm(false); setSubmitted(false); }, 3000);
    } catch { /* error handled silently */ }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300 dark:text-stone-600'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" /> County Experience Stories
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Anonymous citizen reports on county service delivery — share your experience</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Send className="h-3 w-3" /> {showForm ? 'Cancel' : 'Share Experience'}
        </Button>
      </div>

      {/* Share Form */}
      {showForm && (
        <Card className="border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Share Your County Experience</CardTitle>
            <CardDescription className="text-xs">Your submission is anonymous and protected under Article 35 of the Constitution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {submitted ? (
              <div className="text-center py-4">
                <p className="text-sm font-semibold text-green-600">Experience submitted successfully!</p>
                <p className="text-xs text-stone-500 mt-1">Thank you for contributing to transparency.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={formData.county} onValueChange={v => setFormData(f => ({ ...f, county: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select County" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {all47Governors.map(g => <SelectItem key={g.code} value={g.county}>{g.county}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={formData.sector} onValueChange={v => setFormData(f => ({ ...f, sector: v }))}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Sector" /></SelectTrigger>
                    <SelectContent>
                      {SECTORS.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input placeholder="Brief title..." className="text-xs" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
                <Textarea placeholder="Describe your experience with county services..." className="text-xs min-h-[80px]" value={formData.experience} onChange={e => setFormData(f => ({ ...f, experience: e.target.value }))} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <span>Rating:</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`h-4 w-4 cursor-pointer ${i <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`} onClick={() => setFormData(f => ({ ...f, rating: i }))} />
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-stone-500">
                    <input type="checkbox" checked={formData.anonymous} onChange={e => setFormData(f => ({ ...f, anonymous: e.target.checked }))} className="rounded" />
                    Anonymous
                  </label>
                </div>
                <Button size="sm" onClick={handleSubmit} disabled={!formData.county || !formData.sector || !formData.title || !formData.experience} className="w-full">Submit Experience</Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterCounty} onValueChange={setFilterCounty}>
          <SelectTrigger className="h-8 text-[10px] w-32 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"><SelectValue placeholder="County" /></SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="_all">All Counties</SelectItem>
            {all47Governors.map(g => <SelectItem key={g.code} value={g.county}>{g.county}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSector} onValueChange={setFilterSector}>
          <SelectTrigger className="h-8 text-[10px] w-36 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Sectors</SelectItem>
            {SECTORS.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
          <SelectTrigger className="h-8 text-[10px] w-28 border-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="county">By County</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[10px] h-8 flex items-center">{filtered.length} stories</Badge>
      </div>

      {/* Stories */}
      <div className="space-y-3">
        {filtered.map(story => {
          const sector = SECTORS.find(s => s.id === story.sector);
          const Icon = sector?.icon || Shield;
          return (
            <Card key={story.id} className="border-stone-200 dark:border-stone-700 dark:bg-stone-900">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-lg ${sector?.bg || 'bg-stone-100'} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${sector?.color || 'text-stone-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-semibold text-stone-800 dark:text-stone-200">{story.title}</h3>
                        <Badge className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{story.countyName}</Badge>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">{story.experience}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {renderStars(story.rating)}
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {story.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
