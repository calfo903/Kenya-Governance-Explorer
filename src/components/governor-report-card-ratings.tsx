'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Star, TrendingUp, TrendingDown, Users, MessageSquare, BarChart3,
  ArrowUpDown, ThumbsUp, ChevronUp, ChevronDown, Award, MapPin, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell
} from 'recharts';

const RATING_CATEGORIES = [
  'Service Delivery', 'Infrastructure', 'Health', 'Education',
  'Agriculture', 'Youth Employment', 'Transparency', 'Corruption Fight',
  'Citizen Engagement', 'Overall Performance'
] as const;

const ALL_GOVERNORS = [
  { name: 'Johnson Sakaja', county: 'Nairobi', ratings: { 'Service Delivery': 3.8, 'Infrastructure': 3.5, 'Health': 3.2, 'Education': 3.6, 'Agriculture': 2.8, 'Youth Employment': 3.9, 'Transparency': 3.4, 'Corruption Fight': 2.9, 'Citizen Engagement': 4.1, 'Overall Performance': 3.5 }, officialScore: 3.7, totalRatings: 4823, quarters: [3.2, 3.4, 3.5, 3.5] },
  { name: 'Abdullswamad Shariff Nassir', county: 'Mombasa', ratings: { 'Service Delivery': 3.5, 'Infrastructure': 3.7, 'Health': 3.3, 'Education': 3.4, 'Agriculture': 2.5, 'Youth Employment': 3.2, 'Transparency': 3.6, 'Corruption Fight': 3.1, 'Citizen Engagement': 3.8, 'Overall Performance': 3.4 }, officialScore: 3.5, totalRatings: 3201, quarters: [3.0, 3.1, 3.3, 3.4] },
  { name: 'Prof. Anyang Nyongo', county: 'Kisumu', ratings: { 'Service Delivery': 3.9, 'Infrastructure': 3.6, 'Health': 4.0, 'Education': 3.7, 'Agriculture': 3.2, 'Youth Employment': 3.5, 'Transparency': 3.8, 'Corruption Fight': 3.6, 'Citizen Engagement': 4.0, 'Overall Performance': 3.7 }, officialScore: 3.6, totalRatings: 2876, quarters: [3.3, 3.4, 3.5, 3.7] },
  { name: 'Susan Kihika', county: 'Nakuru', ratings: { 'Service Delivery': 3.4, 'Infrastructure': 3.8, 'Health': 3.1, 'Education': 3.3, 'Agriculture': 3.5, 'Youth Employment': 3.0, 'Transparency': 3.2, 'Corruption Fight': 2.8, 'Citizen Engagement': 3.5, 'Overall Performance': 3.3 }, officialScore: 3.5, totalRatings: 3102, quarters: [3.5, 3.4, 3.3, 3.3] },
  { name: 'Jonathan Bii', county: 'Uasin Gishu', ratings: { 'Service Delivery': 3.7, 'Infrastructure': 3.9, 'Health': 3.5, 'Education': 3.8, 'Agriculture': 4.1, 'Youth Employment': 3.6, 'Transparency': 3.5, 'Corruption Fight': 3.3, 'Citizen Engagement': 3.7, 'Overall Performance': 3.7 }, officialScore: 3.8, totalRatings: 2456, quarters: [3.4, 3.5, 3.6, 3.7] },
  { name: 'Kimani Wamatangi', county: 'Kiambu', ratings: { 'Service Delivery': 3.3, 'Infrastructure': 3.4, 'Health': 3.0, 'Education': 3.5, 'Agriculture': 3.1, 'Youth Employment': 3.2, 'Transparency': 3.0, 'Corruption Fight': 2.6, 'Citizen Engagement': 3.3, 'Overall Performance': 3.1 }, officialScore: 3.4, totalRatings: 2987, quarters: [3.3, 3.2, 3.1, 3.1] },
  { name: 'Wavinya Ndeti', county: 'Machakos', ratings: { 'Service Delivery': 3.1, 'Infrastructure': 3.3, 'Health': 2.9, 'Education': 3.2, 'Agriculture': 3.0, 'Youth Employment': 2.8, 'Transparency': 2.9, 'Corruption Fight': 2.4, 'Citizen Engagement': 3.2, 'Overall Performance': 3.0 }, officialScore: 3.2, totalRatings: 2156, quarters: [3.1, 3.0, 3.0, 3.0] },
  { name: 'Jeremiah Lomorukai', county: 'Turkana', ratings: { 'Service Delivery': 2.8, 'Infrastructure': 2.5, 'Health': 2.7, 'Education': 2.9, 'Agriculture': 2.6, 'Youth Employment': 2.4, 'Transparency': 3.0, 'Corruption Fight': 2.8, 'Citizen Engagement': 3.3, 'Overall Performance': 2.8 }, officialScore: 3.0, totalRatings: 1245, quarters: [2.5, 2.6, 2.7, 2.8] },
  { name: 'Nathif Jama Adan', county: 'Garissa', ratings: { 'Service Delivery': 2.9, 'Infrastructure': 2.7, 'Health': 2.6, 'Education': 3.0, 'Agriculture': 2.8, 'Youth Employment': 2.5, 'Transparency': 2.8, 'Corruption Fight': 2.7, 'Citizen Engagement': 3.1, 'Overall Performance': 2.8 }, officialScore: 2.9, totalRatings: 1098, quarters: [2.6, 2.7, 2.7, 2.8] },
  { name: 'Fernandes Barasa', county: 'Kakamega', ratings: { 'Service Delivery': 3.4, 'Infrastructure': 3.2, 'Health': 3.3, 'Education': 3.5, 'Agriculture': 3.3, 'Youth Employment': 3.1, 'Transparency': 3.3, 'Corruption Fight': 3.0, 'Citizen Engagement': 3.6, 'Overall Performance': 3.3 }, officialScore: 3.4, totalRatings: 1876, quarters: [3.1, 3.2, 3.2, 3.3] },
  { name: 'Gideon Mungaro', county: 'Kilifi', ratings: { 'Service Delivery': 3.2, 'Infrastructure': 3.0, 'Health': 3.1, 'Education': 3.3, 'Agriculture': 2.9, 'Youth Employment': 3.0, 'Transparency': 3.1, 'Corruption Fight': 2.9, 'Citizen Engagement': 3.4, 'Overall Performance': 3.1 }, officialScore: 3.2, totalRatings: 1543, quarters: [2.9, 3.0, 3.0, 3.1] },
  { name: 'Benjamin Cheboi', county: 'Baringo', ratings: { 'Service Delivery': 3.0, 'Infrastructure': 3.1, 'Health': 2.8, 'Education': 3.2, 'Agriculture': 3.4, 'Youth Employment': 2.7, 'Transparency': 2.9, 'Corruption Fight': 2.6, 'Citizen Engagement': 3.0, 'Overall Performance': 3.0 }, officialScore: 3.1, totalRatings: 1123, quarters: [2.8, 2.9, 2.9, 3.0] },
  { name: 'Ahmed Abdullahi', county: 'Wajir', ratings: { 'Service Delivery': 2.7, 'Infrastructure': 2.4, 'Health': 2.5, 'Education': 2.8, 'Agriculture': 2.3, 'Youth Employment': 2.3, 'Transparency': 2.7, 'Corruption Fight': 2.5, 'Citizen Engagement': 2.9, 'Overall Performance': 2.6 }, officialScore: 2.8, totalRatings: 876, quarters: [2.3, 2.4, 2.5, 2.6] },
  { name: 'Julius Malombe', county: 'Kitui', ratings: { 'Service Delivery': 3.1, 'Infrastructure': 3.3, 'Health': 2.9, 'Education': 3.2, 'Agriculture': 3.0, 'Youth Employment': 2.9, 'Transparency': 3.0, 'Corruption Fight': 2.7, 'Citizen Engagement': 3.2, 'Overall Performance': 3.0 }, officialScore: 3.1, totalRatings: 1345, quarters: [2.8, 2.9, 3.0, 3.0] },
  { name: 'Dr. James Nyoro', county: 'Muranga', ratings: { 'Service Delivery': 3.5, 'Infrastructure': 3.6, 'Health': 3.4, 'Education': 3.6, 'Agriculture': 3.7, 'Youth Employment': 3.3, 'Transparency': 3.4, 'Corruption Fight': 3.1, 'Citizen Engagement': 3.5, 'Overall Performance': 3.4 }, officialScore: 3.5, totalRatings: 1987, quarters: [3.2, 3.3, 3.3, 3.4] }
];

const REVIEWS = [
  { id: 1, governor: 'Johnson Sakaja', county: 'Nairobi', author: 'Peter Mwangi', rating: 4, text: 'The governor has made significant improvements in waste management and street lighting in the CBD. However, traffic congestion remains a major challenge that needs urgent attention.', date: '2024-12-01' },
  { id: 2, governor: 'Johnson Sakaja', county: 'Nairobi', author: 'Wanjiru Njenga', rating: 3, text: 'Health services in county facilities have slightly improved but still below expectations. The maternity wards are overcrowded.', date: '2024-11-28' },
  { id: 3, governor: 'Prof. Anyang Nyongo', county: 'Kisumu', author: 'Otieno Odhiambo', rating: 5, text: 'Excellent leadership in health sector. The referral hospital upgrades and community health volunteer program are commendable.', date: '2024-12-02' },
  { id: 4, governor: 'Susan Kihika', county: 'Nakuru', author: 'John Ndegwa', rating: 3, text: 'Road infrastructure has improved in Nakuru town but rural areas are still neglected. The water supply situation in Subukia is dire.', date: '2024-11-25' },
  { id: 5, governor: 'Jonathan Bii', county: 'Uasin Gishu', author: 'Chebet Kipruto', rating: 4, text: 'Strong focus on agriculture has benefited farmers in the county. The potato and milk processing plants are game changers for the local economy.', date: '2024-12-03' },
  { id: 6, governor: 'Kimani Wamatangi', county: 'Kiambu', author: 'Mary Wanjiku', rating: 2, text: 'Corruption allegations in the procurement department are concerning. The governor needs to take decisive action to restore public confidence.', date: '2024-11-30' },
  { id: 7, governor: 'Wavinya Ndeti', county: 'Machakos', author: 'Mutua Kivuva', rating: 3, text: 'The Machakos Level 5 Hospital is a good project but completion delays are frustrating. Citizens deserve better timeline management.', date: '2024-11-22' },
  { id: 8, governor: 'Jeremiah Lomorukai', county: 'Turkana', author: 'Joseph Ekai', rating: 3, text: 'Despite challenges, the governor has tried to improve water access in rural areas. More needs to be done on health and education.', date: '2024-12-04' },
  { id: 9, governor: 'Fernandes Barasa', county: 'Kakamega', author: 'Lusava Wekesa', rating: 4, text: 'The bursary program has helped many students stay in school. Public participation forums are well organized and accessible.', date: '2024-11-27' },
  { id: 10, governor: 'Dr. James Nyoro', county: 'Muranga', author: 'Grace Muthoni', rating: 4, text: 'Agricultural subsidies and the mango processing plant have directly improved livelihoods. Transparent budget processes are appreciated.', date: '2024-12-05' }
];

const QUARTER_LABELS = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getRatingColor(score: number): string {
  if (score >= 4) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 3) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getRatingBg(score: number): string {
  if (score >= 4) return 'bg-emerald-500';
  if (score >= 3) return 'bg-amber-500';
  return 'bg-red-500';
}

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`h-4 w-4 ${interactive ? 'cursor-pointer' : ''} ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'text-stone-300 dark:text-stone-600'
          }`}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  );
}

export default function GovernorReportCardRatings() {
  const [selectedGovernor, setSelectedGovernor] = useState(ALL_GOVERNORS[0].county);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitCounty, setSubmitCounty] = useState('');
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [userComment, setUserComment] = useState('');
  const [sortField, setSortField] = useState<'citizenScore' | 'officialScore' | 'totalRatings'>('citizenScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const governor = useMemo(() =>
    ALL_GOVERNORS.find(g => g.county === selectedGovernor) || ALL_GOVERNORS[0],
    [selectedGovernor]
  );

  const citizenScore = useMemo(() => {
    const vals = Object.values(governor.ratings).filter((_, i) => i < 9);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [governor]);

  const distributionData = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    const allRatings = Object.values(governor.ratings).filter((_, i) => i < 9);
    allRatings.forEach(r => {
      const bucket = Math.min(4, Math.max(0, Math.round(r) - 1));
      dist[bucket]++;
    });
    const total = dist.reduce((a, b) => a + b, 0);
    return [
      { star: '5 Stars', count: dist[4], pct: Math.round((dist[4] / total) * 100) },
      { star: '4 Stars', count: dist[3], pct: Math.round((dist[3] / total) * 100) },
      { star: '3 Stars', count: dist[2], pct: Math.round((dist[2] / total) * 100) },
      { star: '2 Stars', count: dist[1], pct: Math.round((dist[1] / total) * 100) },
      { star: '1 Star', count: dist[0], pct: Math.round((dist[0] / total) * 100) }
    ];
  }, [governor]);

  const trendData = governor.quarters.map((q, i) => ({ quarter: QUARTER_LABELS[i], rating: q }));

  const comparisonData = RATING_CATEGORIES.filter(c => c !== 'Overall Performance').map(cat => ({
    category: cat.split(' ')[0],
    Citizen: governor.ratings[cat as keyof typeof governor.ratings],
    Official: +(governor.officialScore * (0.85 + Math.random() * 0.3)).toFixed(1)
  }));

  const sortedGovernors = useMemo(() => {
    return [...ALL_GOVERNORS].sort((a, b) => {
      const aScore = sortField === 'citizenScore'
        ? Object.values(a.ratings).filter((_, i) => i < 9).reduce((s, v) => s + v, 0) / 9
        : sortField === 'officialScore' ? a.officialScore : a.totalRatings;
      const bScore = sortField === 'citizenScore'
        ? Object.values(b.ratings).filter((_, i) => i < 9).reduce((s, v) => s + v, 0) / 9
        : sortField === 'officialScore' ? b.officialScore : b.totalRatings;
      return sortDir === 'desc' ? bScore - aScore : aScore - bScore;
    });
  }, [sortField, sortDir]);

  const governorReviews = REVIEWS.filter(r => r.governor === governor.name);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-stone-400" />;
    return sortDir === 'desc'
      ? <ChevronDown className="h-3 w-3 text-emerald-600" />
      : <ChevronUp className="h-3 w-3 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Governor Selector */}
      <Card className="border-stone-200 dark:border-stone-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200">Governor Report Card</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">Quarterly citizen ratings for county governors across Kenya</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedGovernor} onValueChange={setSelectedGovernor}>
                <SelectTrigger className="w-[220px] border-stone-200 dark:border-stone-700">
                  <SelectValue placeholder="Select governor" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_GOVERNORS.map(g => (
                    <SelectItem key={g.county} value={g.county}>{g.name} - {g.county}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowSubmitForm(!showSubmitForm)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0">
                <ThumbsUp className="h-4 w-4" /> Rate Governor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Rating Form */}
      {showSubmitForm && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-stone-800 dark:text-stone-200">Submit Your Rating</CardTitle>
            <CardDescription>Select your county and rate each category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={submitCounty} onValueChange={setSubmitCounty}>
              <SelectTrigger className="border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Select your county" />
              </SelectTrigger>
              <SelectContent>
                {ALL_GOVERNORS.map(g => (
                  <SelectItem key={g.county} value={g.county}>{g.county} - {g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {submitCounty && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {RATING_CATEGORIES.filter(c => c !== 'Overall Performance').map(cat => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                    <span className="text-sm text-stone-700 dark:text-stone-300">{cat}</span>
                    <StarRating
                      rating={userRatings[cat] || 0}
                      interactive
                      onChange={(v) => setUserRatings({ ...userRatings, [cat]: v })}
                    />
                  </div>
                ))}
              </div>
            )}
            <Textarea
              placeholder="Additional comments (optional)"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="min-h-[60px] border-stone-200 dark:border-stone-700"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSubmitForm(false)} className="border-stone-300 dark:border-stone-600">Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Rating</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ratings">
        <TabsList className="bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="ratings" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Category Ratings</TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Crowd vs Official</TabsTrigger>
          <TabsTrigger value="trend" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Quarterly Trend</TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Recent Reviews</TabsTrigger>
          <TabsTrigger value="rankings" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">All Rankings</TabsTrigger>
        </TabsList>

        {/* Category Ratings */}
        <TabsContent value="ratings" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Score Overview */}
            <Card className="border-stone-200 dark:border-stone-700">
              <CardHeader className="pb-2">
                <CardDescription className="text-stone-500">Selected Governor</CardDescription>
                <CardTitle className="text-stone-800 dark:text-stone-200">{governor.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className={`text-5xl font-bold ${getRatingColor(citizenScore)}`}>{citizenScore.toFixed(1)}</p>
                  <p className="text-sm text-stone-500 mt-1">Citizen Score (out of 5.0)</p>
                  <StarRating rating={citizenScore} />
                  <p className="text-xs text-stone-400 mt-2">Based on {governor.totalRatings.toLocaleString()} ratings</p>
                </div>
                <Separator className="bg-stone-200 dark:bg-stone-700" />
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-2">Rating Distribution</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={distributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="star" width={60} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Distribution']} />
                      <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index >= 3 ? '#10b981' : index >= 1 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="lg:col-span-2 border-stone-200 dark:border-stone-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-stone-800 dark:text-stone-200">Rating by Category</CardTitle>
                <CardDescription>{governor.county} County - Q4 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[440px]">
                  <div className="space-y-3">
                    {RATING_CATEGORIES.map(cat => {
                      const score = governor.ratings[cat as keyof typeof governor.ratings];
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{cat}</span>
                            <div className="flex items-center gap-2">
                              <StarRating rating={score} />
                              <span className={`text-sm font-bold ${getRatingColor(score)}`}>{score.toFixed(1)}</span>
                            </div>
                          </div>
                          <Progress value={score * 20} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crowd vs Official */}
        <TabsContent value="comparison" className="mt-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 dark:text-stone-200">
                Citizen Score vs Official Score - {governor.name} ({governor.county})
              </CardTitle>
              <CardDescription>Comparing crowd-sourced ratings with official government performance assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Citizen" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Official" fill="#78716c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quarterly Trend */}
        <TabsContent value="trend" className="mt-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 dark:text-stone-200">
                Rating Trend - {governor.name} ({governor.county})
              </CardTitle>
              <CardDescription>How the governor's citizen rating changed over the past 4 quarters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className={`text-sm font-medium ${
                    governor.quarters[3] > governor.quarters[0] ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {governor.quarters[3] > governor.quarters[0] ? 'Improving' : 'Declining'}
                  </span>
                </div>
                <span className="text-sm text-stone-500">
                  Change: {governor.quarters[3] > governor.quarters[0] ? '+' : ''}
                  {(governor.quarters[3] - governor.quarters[0]).toFixed(1)} points
                </span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews" className="mt-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                Recent Reviews for {governor.name} ({governor.county})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {governorReviews.length > 0 ? governorReviews.map(review => (
                    <div key={review.id} className="p-4 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs">
                            {getInitials(review.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{review.author}</span>
                              <Badge variant="secondary" className="text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                                <MapPin className="h-3 w-3 mr-1" />{review.county}
                              </Badge>
                            </div>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />{review.date}
                            </span>
                          </div>
                          <StarRating rating={review.rating} />
                          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">{review.text}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                      No reviews yet for this governor. Be the first to rate!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Rankings */}
        <TabsContent value="rankings" className="mt-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Governor Rankings - All Counties
              </CardTitle>
              <CardDescription>Click column headers to sort</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-1.5">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Governor</div>
                    <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-emerald-600" onClick={() => toggleSort('citizenScore')}>
                      Citizen Score <SortIcon field="citizenScore" />
                    </div>
                    <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-emerald-600" onClick={() => toggleSort('officialScore')}>
                      Official Score <SortIcon field="officialScore" />
                    </div>
                    <div className="col-span-1">Gap</div>
                    <div className="col-span-2 cursor-pointer flex items-center gap-1 hover:text-emerald-600" onClick={() => toggleSort('totalRatings')}>
                      Ratings <SortIcon field="totalRatings" />
                    </div>
                  </div>
                  <Separator className="bg-stone-200 dark:bg-stone-700" />
                  {sortedGovernors.map((g, idx) => {
                    const cScore = Object.values(g.ratings).filter((_, i) => i < 9).reduce((s, v) => s + v, 0) / 9;
                    const gap = cScore - g.officialScore;
                    return (
                      <div
                        key={g.county}
                        className={`grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg items-center text-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${
                          g.county === selectedGovernor ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : ''
                        }`}
                        onClick={() => setSelectedGovernor(g.county)}
                      >
                        <div className="col-span-1">
                          <span className={`font-bold ${idx < 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}>{idx + 1}</span>
                        </div>
                        <div className="col-span-4 min-w-0">
                          <p className="font-medium text-stone-800 dark:text-stone-200 truncate">{g.name}</p>
                          <p className="text-xs text-stone-400">{g.county}</p>
                        </div>
                        <div className="col-span-2">
                          <span className={`font-bold ${getRatingColor(cScore)}`}>{cScore.toFixed(1)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-stone-600 dark:text-stone-400">{g.officialScore.toFixed(1)}</span>
                        </div>
                        <div className="col-span-1">
                          <span className={`text-xs font-medium flex items-center gap-0.5 ${gap >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {gap >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(gap).toFixed(1)}
                          </span>
                        </div>
                        <div className="col-span-2 text-stone-500 dark:text-stone-400">{g.totalRatings.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}