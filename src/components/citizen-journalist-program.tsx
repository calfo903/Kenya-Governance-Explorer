'use client';

import { useState } from 'react';
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
  Eye, PenTool, Mic, Award, Users, FileText, MapPin, TrendingUp,
  CheckCircle2, BookOpen, Target, Shield, Star, ArrowRight, BarChart3
} from 'lucide-react';

const VERIFICATION_LEVELS = [
  {
    name: 'Observer',
    icon: Eye,
    color: 'text-stone-600 dark:text-stone-400',
    bg: 'bg-stone-100 dark:bg-stone-800',
    border: 'border-stone-300 dark:border-stone-600',
    badgeClass: 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300',
    requirements: ['Complete basic registration', 'Submit first 5 reports', 'Pass introductory quiz'],
    benefits: ['Access to reporting tools', 'Community forum access', 'Basic verification badge'],
    activeCount: 1247,
    reportsNeeded: 0
  },
  {
    name: 'Reporter',
    icon: PenTool,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-300 dark:border-emerald-700',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    requirements: ['50+ verified reports submitted', 'Consistent accuracy above 85%', 'Active for at least 3 months'],
    benefits: ['Priority assignment access', 'Monthly stipend of KES 5,000', 'Featured on platform homepage'],
    activeCount: 384,
    reportsNeeded: 50
  },
  {
    name: 'Senior Correspondent',
    icon: Mic,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
    badgeClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    requirements: ['200+ verified reports submitted', 'Pass editorial review board assessment', 'Mentor at least 2 junior reporters'],
    benefits: ['Editorial privileges', 'Monthly stipend of KES 15,000', 'Direct line to county officials', 'Byline in partner publications'],
    activeCount: 89,
    reportsNeeded: 200
  },
  {
    name: 'Anchor',
    icon: Award,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-300 dark:border-amber-700',
    badgeClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    requirements: ['500+ verified reports submitted', 'Expert status in governance reporting', 'Minimum 2 years of service', 'Community endorsement from 100+ citizens'],
    benefits: ['Full editorial authority', 'Monthly stipend of KES 30,000', 'Speaking engagements at conferences', 'National media appearances', 'Policy advisory role'],
    activeCount: 12,
    reportsNeeded: 500
  }
];

const JOURNALISTS = [
  { rank: 1, name: 'Grace Wanjiru Kibuchi', county: 'Nairobi', level: 'Anchor', reports: 743, verificationRate: 97.2, trustScore: 98.1 },
  { rank: 2, name: 'Mohamed Abdi Shikh', county: 'Garissa', level: 'Anchor', reports: 612, verificationRate: 95.8, trustScore: 96.4 },
  { rank: 3, name: 'Dennis Ochieng Okoth', county: 'Kisumu', level: 'Senior Correspondent', reports: 387, verificationRate: 94.1, trustScore: 95.2 },
  { rank: 4, name: 'Faith Chepng\'etich', county: 'Uasin Gishu', level: 'Senior Correspondent', reports: 356, verificationRate: 93.5, trustScore: 94.8 },
  { rank: 5, name: 'Samuel Karanja Njoroge', county: 'Nakuru', level: 'Senior Correspondent', reports: 312, verificationRate: 92.7, trustScore: 93.6 },
  { rank: 6, name: 'Amina Dahir Osman', county: 'Mombasa', level: 'Senior Correspondent', reports: 289, verificationRate: 91.9, trustScore: 92.3 },
  { rank: 7, name: 'Brian Mutua Kivuva', county: 'Machakos', level: 'Reporter', reports: 178, verificationRate: 90.4, trustScore: 91.7 },
  { rank: 8, name: 'Linet Moraa Nyamongo', county: 'Kisii', level: 'Reporter', reports: 156, verificationRate: 89.8, trustScore: 90.5 },
  { rank: 9, name: 'Elijah Kipchumba', county: 'Baringo', level: 'Reporter', reports: 134, verificationRate: 88.6, trustScore: 89.2 },
  { rank: 10, name: 'Halima Adan Barre', county: 'Wajir', level: 'Reporter', reports: 127, verificationRate: 88.1, trustScore: 88.7 },
  { rank: 11, name: 'Patrick Mwangi Gikonyo', county: 'Kiambu', level: 'Reporter', reports: 112, verificationRate: 87.3, trustScore: 87.9 },
  { rank: 12, name: 'Phyllis Jebichii', county: 'Bomet', level: 'Reporter', reports: 98, verificationRate: 86.5, trustScore: 87.1 },
  { rank: 13, name: 'Victor Odhiambo Aloo', county: 'Siaya', level: 'Observer', reports: 67, verificationRate: 85.2, trustScore: 84.6 },
  { rank: 14, name: 'Margaret Nyambura', county: 'Murang\'a', level: 'Observer', reports: 45, verificationRate: 83.8, trustScore: 83.4 },
  { rank: 15, name: 'Noah Kiprop', county: 'Nandi', level: 'Observer', reports: 38, verificationRate: 82.1, trustScore: 82.7 }
];

const ASSIGNMENTS = [
  { id: 1, title: 'Cover Nairobi County Budget Validation Forum', county: 'Nairobi', priority: 'High', deadline: '2024-12-15', category: 'Budget', applicants: 8 },
  { id: 2, title: 'Document Water Project Progress in Turkana South', county: 'Turkana', priority: 'Medium', deadline: '2024-12-20', category: 'Infrastructure', applicants: 3 },
  { id: 3, title: 'Investigate School Feeding Program in Kilifi', county: 'Kilifi', priority: 'High', deadline: '2024-12-18', category: 'Education', applicants: 5 },
  { id: 4, title: 'Report on Mombasa County Health Worker Strike', county: 'Mombasa', priority: 'High', deadline: '2024-12-12', category: 'Health', applicants: 12 },
  { id: 5, title: 'Cover Kakamega County Assembly Session on Land Bill', county: 'Kakamega', priority: 'Medium', deadline: '2024-12-22', category: 'Legislation', applicants: 4 },
  { id: 6, title: 'Verify Road Construction Standards in Kitui', county: 'Kitui', priority: 'Low', deadline: '2024-12-28', category: 'Infrastructure', applicants: 2 }
];

const TRAINING_MODULES = [
  { title: 'Introduction to Citizen Journalism', duration: '2 hours', level: 'Beginner', topics: 5 },
  { title: 'Fact-Checking and Source Verification', duration: '3 hours', level: 'Beginner', topics: 7 },
  { title: 'Mobile Photography for Reporters', duration: '1.5 hours', level: 'Beginner', topics: 4 },
  { title: 'Understanding County Budget Documents', duration: '4 hours', level: 'Intermediate', topics: 8 },
  { title: 'Data Journalism Fundamentals', duration: '3 hours', level: 'Intermediate', topics: 6 },
  { title: 'Ethical Reporting and Safety', duration: '2 hours', level: 'All Levels', topics: 5 },
  { title: 'Advanced Investigative Techniques', duration: '5 hours', level: 'Advanced', topics: 10 },
  { title: 'Editing and Story Structure', duration: '3 hours', level: 'Intermediate', topics: 6 }
];

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu', 'Machakos',
  'Turkana', 'Garissa', 'Kakamega', 'Kilifi', 'Baringo', 'Wajir', 'Mandera', 'Marsabit',
  'Kitui', 'Murang\'a', 'Kisii', 'Bomet', 'Siaya', 'Nandi'
];

const IMPACT_METRICS = [
  { label: 'Total Reports Submitted', value: '18,456', icon: FileText, change: '+12.3%' },
  { label: 'Counties Covered', value: '43 / 47', icon: MapPin, change: '+4' },
  { label: 'Stories Published', value: '3,247', icon: BookOpen, change: '+18.7%' },
  { label: 'Government Responses', value: '892', icon: CheckCircle2, change: '+23.1%' }
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getLevelBadge(level: string) {
  const lvl = VERIFICATION_LEVELS.find(l => l.name === level);
  return lvl ? lvl.badgeClass : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300';
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'High': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    case 'Medium': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    default: return 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300';
  }
}

export default function CitizenJournalistProgram() {
  const [showApplication, setShowApplication] = useState(false);
  const [application, setApplication] = useState({ name: '', county: '', motivation: '', experience: '' });

  const totalActive = VERIFICATION_LEVELS.reduce((sum, l) => sum + l.activeCount, 0);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-emerald-200 dark:border-emerald-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900 p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Citizen Journalist Program</h1>
                <p className="text-emerald-100 text-sm">Empowering Kenyans to report on governance at the grassroots level</p>
              </div>
            </div>
            <p className="text-emerald-50 text-sm leading-relaxed max-w-3xl">
              Our Citizen Journalist Program trains and equips ordinary citizens with the skills to document, report, and publish stories about county governance.
              With over {totalActive.toLocaleString()} active journalists across 43 counties, we are building the largest network of grassroots governance reporters in Kenya.
            </p>
            <div className="flex gap-3 mt-5">
              <Button onClick={() => setShowApplication(!showApplication)} className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2">
                <PenTool className="h-4 w-4" /> Apply Now
              </Button>
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 gap-2">
                <BookOpen className="h-4 w-4" /> Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {IMPACT_METRICS.map((m) => (
          <Card key={m.label} className="border-stone-200 dark:border-stone-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <m.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">{m.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-stone-800 dark:text-stone-200">{m.value}</p>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{m.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Form */}
      {showApplication && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-stone-800 dark:text-stone-200">Apply to Join the Program</CardTitle>
            <CardDescription>Fill in your details to start your journey as a citizen journalist</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Full name"
                value={application.name}
                onChange={(e) => setApplication({ ...application, name: e.target.value })}
                className="border-stone-200 dark:border-stone-700"
              />
              <Select value={application.county} onValueChange={(v) => setApplication({ ...application, county: v })}>
                <SelectTrigger className="border-stone-200 dark:border-stone-700">
                  <SelectValue placeholder="Select your county" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="What motivates you to become a citizen journalist?"
              value={application.motivation}
              onChange={(e) => setApplication({ ...application, motivation: e.target.value })}
              className="border-stone-200 dark:border-stone-700"
            />
            <Textarea
              placeholder="Describe any relevant experience (community work, media, activism...)"
              value={application.experience}
              onChange={(e) => setApplication({ ...application, experience: e.target.value })}
              className="min-h-[80px] border-stone-200 dark:border-stone-700"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowApplication(false)} className="border-stone-300 dark:border-stone-600">Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit Application</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="levels">
        <TabsList className="bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="levels" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Verification Levels</TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Leaderboard</TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Assignments</TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Training</TabsTrigger>
        </TabsList>

        {/* Verification Levels */}
        <TabsContent value="levels" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VERIFICATION_LEVELS.map((level, idx) => (
              <Card key={level.name} className={`border ${level.border}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${level.bg}`}>
                        <level.icon className={`h-5 w-5 ${level.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base text-stone-800 dark:text-stone-200">{level.name}</CardTitle>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Level {idx + 1}</p>
                      </div>
                    </div>
                    <Badge className={level.badgeClass}>{level.activeCount} active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Requirements
                    </p>
                    <ul className="space-y-1">
                      {level.requirements.map(r => (
                        <li key={r} className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator className="bg-stone-200 dark:bg-stone-700" />
                  <div>
                    <p className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                      <Star className="h-3 w-3" /> Benefits
                    </p>
                    <ul className="space-y-1">
                      {level.benefits.map(b => (
                        <li key={b} className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5">
                          <ArrowRight className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {level.reportsNeeded > 0 && (
                    <div className="pt-1">
                      <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Progress to next level</p>
                      <Progress value={Math.min(100, (idx + 1) * 25)} className="h-1.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-4">
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" /> Top Citizen Journalists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[560px]">
                <div className="space-y-2">
                  {JOURNALISTS.map(j => (
                    <div key={j.rank} className={`flex items-center gap-3 p-3 rounded-lg ${j.rank <= 3 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'} transition-colors`}>
                      <span className={`text-sm font-bold w-6 text-center ${j.rank === 1 ? 'text-amber-500' : j.rank === 2 ? 'text-stone-400' : j.rank === 3 ? 'text-amber-700' : 'text-stone-400'}`}>
                        {j.rank}
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={`text-xs ${j.rank <= 3 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                          {getInitials(j.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{j.name}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{j.county}</p>
                      </div>
                      <Badge className={`text-[10px] ${getLevelBadge(j.level)}`}>{j.level}</Badge>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{j.reports}</p>
                        <p className="text-[10px] text-stone-400">reports</p>
                      </div>
                      <div className="text-right hidden md:block w-16">
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{j.verificationRate}%</p>
                        <p className="text-[10px] text-stone-400">verified</p>
                      </div>
                      <div className="text-right hidden lg:block w-16">
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{j.trustScore}</p>
                        <p className="text-[10px] text-stone-400">trust</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSIGNMENTS.map(a => (
              <Card key={a.id} className="border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm text-stone-800 dark:text-stone-200 leading-tight">{a.title}</CardTitle>
                    <Badge className={`text-[10px] shrink-0 ${getPriorityColor(a.priority)}`}>{a.priority}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.county}</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{a.category}</span>
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{a.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">{a.applicants} applicants</span>
                    <Button size="sm" variant="outline" className="text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20">Apply</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Training */}
        <TabsContent value="training" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRAINING_MODULES.map(m => (
              <Card key={m.title} className="border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{m.level}</Badge>
                    <span className="text-xs text-stone-400">{m.duration}</span>
                  </div>
                  <CardTitle className="text-sm text-stone-800 dark:text-stone-200 mt-2 leading-tight">{m.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">{m.topics} topics covered</p>
                  <Button size="sm" variant="outline" className="w-full text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
                    Start Module
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}