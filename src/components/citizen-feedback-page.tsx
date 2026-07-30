'use client';

import React, { useState, useMemo } from 'react';
import { all47Governors } from '@/data/governors';
import {
  Star, ThumbsUp, MapPin, BarChart3, Building2,
  Heart, BookOpen, Droplets, Wrench, Shield, Leaf,
  Store, Users, Info, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface ServiceCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'health', label: 'Healthcare', icon: <Heart className="h-4 w-4" /> },
  { id: 'education', label: 'Education', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'roads', label: 'Roads', icon: <Wrench className="h-4 w-4" /> },
  { id: 'water', label: 'Water', icon: <Droplets className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'agriculture', label: 'Agriculture', icon: <Leaf className="h-4 w-4" /> },
  { id: 'markets', label: 'Markets', icon: <Store className="h-4 w-4" /> },
];

interface Rating {
  county: string;
  ratings: Record<string, number>;
  comment: string;
  timestamp: number;
}

const STORAGE_KEY = 'kenya-citizen-ratings';

function loadRatings(): Rating[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRatings(ratings: Rating[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
}

function StarRating({ value, onChange, interactive = false }: { value: number; onChange?: (v: number) => void; interactive?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(star)}
        >
          <Star className={`h-5 w-5 ${star <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} />
        </button>
      ))}
    </div>
  );
}

export default function CitizenFeedbackPage() {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [savedRatings, setSavedRatings] = useState<Rating[]>(() => loadRatings());
  const [submitted, setSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<'rate' | 'view'>('rate');

  const aggregatedRatings = useMemo(() => {
    const agg: Record<string, Record<string, { sum: number; count: number; avg: number }>> = {};
    savedRatings.forEach(r => {
      if (!agg[r.county]) agg[r.county] = {};
      SERVICE_CATEGORIES.forEach(cat => {
        const rating = r.ratings[cat.id];
        if (rating) {
          if (!agg[r.county][cat.id]) agg[r.county][cat.id] = { sum: 0, count: 0, avg: 0 };
          agg[r.county][cat.id].sum += rating;
          agg[r.county][cat.id].count++;
          agg[r.county][cat.id].avg = agg[r.county][cat.id].sum / agg[r.county][cat.id].count;
        }
      });
    });
    return agg;
  }, [savedRatings]);

  const countyCounties = useMemo(() => {
    return [...new Set(savedRatings.map(r => r.county))];
  }, [savedRatings]);

  const handleSubmit = () => {
    const newRating: Rating = {
      county: selectedCounty,
      ratings: { ...ratings },
      comment,
      timestamp: Date.now(),
    };
    const updated = [...savedRatings, newRating];
    setSavedRatings(updated);
    saveRatings(updated);
    setSubmitted(true);
    setTimeout(() => {
      setRatings({});
      setComment('');
      setSubmitted(false);
    }, 2000);
  };

  const ratedCategories = Object.values(ratings).filter(v => v > 0).length;
  const canSubmit = selectedCounty && ratedCategories > 0;

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <ThumbsUp className="h-6 w-6 text-blue-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Citizen Service Delivery Rating</h2>
            <p className="text-sm text-blue-200 mt-1 leading-relaxed">
              Rate your county&apos;s service delivery across key sectors. All ratings are stored locally and aggregated.
              Help other citizens understand service quality in your county.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Star className="h-3 w-3" /> 1-5 Star Rating</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><Users className="h-3 w-3" /> Crowdsourced</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[11px] font-medium text-blue-200 flex items-center gap-1"><BarChart3 className="h-3 w-3" /> 7 Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed">
              <span className="font-bold">Disclaimer:</span> This is a crowdsourced rating system for demonstration purposes. Data is stored in your browser&apos;s localStorage.
              For official county performance data, refer to OAG audit reports (<a href="https://www.oagkenya.go.ke" target="_blank" rel="noopener noreferrer" className="underline">oagkenya.go.ke</a>), CoB implementation reviews (<a href="https://cob.go.ke" target="_blank" rel="noopener noreferrer" className="underline">cob.go.ke</a>), and TI-Kenya CGSR reports (<a href="https://www.tikenya.org" target="_blank" rel="noopener noreferrer" className="underline">tikenya.org</a>).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-1">
        <button onClick={() => setViewMode('rate')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'rate' ? 'bg-blue-700 text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'}`}>
          <Star className="h-3.5 w-3.5" /> Rate Services
        </button>
        <button onClick={() => setViewMode('view')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'view' ? 'bg-blue-700 text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800'}`}>
          <BarChart3 className="h-3.5 w-3.5" /> View Ratings ({savedRatings.length})
        </button>
      </div>

      {viewMode === 'rate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Rating Form */}
          <div className="lg:col-span-2">
            <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-blue-600" />
                  Rate Your County&apos;s Services
                </CardTitle>
                <CardDescription className="text-[10px] text-stone-500 dark:text-stone-400">Select your county, then rate each service category from 1 (poor) to 5 (excellent)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Select County *</label>
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger className="h-9 text-xs border-stone-200 dark:border-stone-700"><SelectValue placeholder="Select your county..." /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {all47Governors.map(g => <SelectItem key={g.county} value={g.county}>{g.county}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_CATEGORIES.map(cat => (
                    <div key={cat.id} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-stone-500 dark:text-stone-400">{cat.icon}</div>
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">{cat.label}</span>
                        </div>
                        {ratings[cat.id] > 0 && (
                          <Badge variant="outline" className="text-[9px] h-5">{ratings[cat.id]}/5</Badge>
                        )}
                      </div>
                      <StarRating
                        value={ratings[cat.id] || 0}
                        onChange={(v) => setRatings(prev => ({ ...prev, [cat.id]: v }))}
                        interactive
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1 block">Comment (optional)</label>
                  <Textarea
                    placeholder="Share your experience with service delivery in your county..."
                    className="text-xs border-stone-200 dark:border-stone-700 min-h-[80px]"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>

                {submitted ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 text-center">
                    <p className="text-xs font-semibold text-emerald-700">Rating submitted successfully!</p>
                  </div>
                ) : (
                  <Button className="w-full gap-2" onClick={handleSubmit} disabled={!canSubmit}>
                    <ThumbsUp className="h-4 w-4" />
                    Submit Rating ({ratedCategories}/7 categories)
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rating Guide */}
          <div className="space-y-4">
            <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
              <CardContent className="py-3 px-4 space-y-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Rating Guide</p>
                {[
                  { stars: 5, label: 'Excellent', desc: 'Service is reliable, accessible, and of high quality' },
                  { stars: 4, label: 'Good', desc: 'Service is generally adequate with minor issues' },
                  { stars: 3, label: 'Average', desc: 'Service is inconsistent or below expectations' },
                  { stars: 2, label: 'Poor', desc: 'Service is frequently unavailable or inadequate' },
                  { stars: 1, label: 'Very Poor', desc: 'Service is essentially non-existent or severely lacking' },
                ].map(r => (
                  <div key={r.stars} className="flex items-start gap-2">
                    <StarRating value={r.stars} />
                    <div>
                      <p className="text-[10px] font-bold text-stone-800 dark:text-stone-100">{r.stars} — {r.label}</p>
                      <p className="text-[9px] text-stone-500 dark:text-stone-400">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed">
                    Your ratings help build a community view of service delivery quality across Kenya&apos;s 47 counties.
                    Rate honestly based on your personal experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* View Ratings */
        <div className="space-y-4">
          {countyCounties.length === 0 ? (
            <Card className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-500 dark:text-stone-400">No ratings submitted yet</p>
                <p className="text-[10px] text-stone-400 mt-1">Rate your county&apos;s services to see aggregated results here</p>
              </CardContent>
            </Card>
          ) : (
            countyCounties.map(county => (
              <Card key={county} className="border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-semibold flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      {county}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {savedRatings.filter(r => r.county === county).length} ratings
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {SERVICE_CATEGORIES.map(cat => {
                      const data = aggregatedRatings[county]?.[cat.id];
                      if (!data) return null;
                      return (
                        <div key={cat.id} className="flex items-center gap-3">
                          <div className="w-24 flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300 shrink-0">
                            <span className="text-stone-400">{cat.icon}</span>
                            <span className="font-medium truncate">{cat.label}</span>
                          </div>
                          <div className="flex-1">
                            <Progress value={data.avg * 20} className="h-2" />
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-100">{data.avg.toFixed(1)}</span>
                            <span className="text-[9px] text-stone-400">/5</span>
                            <span className="text-[9px] text-stone-400">({data.count})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
