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
import {
  MessageSquare, Eye, Flame, Pin, Plus, Users, TrendingUp, Clock,
  ChevronRight, ChevronDown, Send, Award, MessageCircle, Search
} from 'lucide-react';

const CATEGORIES = [
  'General', 'Budget & Finance', 'Projects & Infrastructure', 'Health & Education',
  'County Assembly', 'Whistleblower Tips', 'Success Stories'
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  'General': 'GN', 'Budget & Finance': 'BF', 'Projects & Infrastructure': 'PI',
  'Health & Education': 'HE', 'County Assembly': 'CA', 'Whistleblower Tips': 'WT', 'Success Stories': 'SS'
};

const THREADS = [
  { id: 1, title: 'Nairobi County Budget Allocation 2024/2025 - Where Is the Money Going?', category: 'Budget & Finance', author: 'James Mwangi', county: 'Nairobi', replies: 47, views: 1823, lastActivity: '2 hours ago', pinned: true, hot: true, important: false,
    content: 'The recently published budget for Nairobi County shows KES 38 billion allocated to various departments. However, the breakdown reveals significant spending on administrative costs rather than service delivery. Let us discuss where the priorities should be.',
    repliesList: [
      { author: 'Wanjiku Kamau', text: 'I agree, the roads in Westlands are still in terrible condition despite the allocation.', time: '1 hour ago' },
      { author: 'Otieno Odhiambo', text: 'The audit report last month showed only 62% disbursement rate. Where is the remaining 38%?', time: '45 min ago' },
      { author: 'Fatuma Hassan', text: 'We need more transparency on procurement processes. The county assembly must step up.', time: '30 min ago' }
    ]
  },
  { id: 2, title: 'Mombasa Port Expansion: Impact on Local Communities', category: 'Projects & Infrastructure', author: 'Aisha Bakari', county: 'Mombasa', replies: 32, views: 1456, lastActivity: '5 hours ago', pinned: false, hot: true, important: true,
    content: 'The proposed port expansion will displace over 2,000 families in Changamwe. What compensation plans are in place and how can affected residents engage with the county government?',
    repliesList: [
      { author: 'David Kariuki', text: 'The county promised resettlement but we have seen no concrete plans yet.', time: '4 hours ago' },
      { author: 'Salma Ali', text: 'Community forums should be held before any construction begins.', time: '3 hours ago' }
    ]
  },
  { id: 3, title: 'Kisumu Level 5 Hospital Renovation Delays', category: 'Health & Education', author: 'Dr. Peter Ochieng', county: 'Kisumu', replies: 28, views: 987, lastActivity: '8 hours ago', pinned: false, hot: false, important: true,
    content: 'The renovation of Kisumu Level 5 Hospital was scheduled for completion in March 2024. We are now in the third quarter and only 40% of the work is done. Patients continue to suffer in overcrowded wards.',
    repliesList: [{ author: 'Mary Atieno', text: 'My mother waited 14 hours in the emergency ward last week. This is unacceptable.', time: '7 hours ago' }]
  },
  { id: 4, title: 'Kiambu County Assembly Passes Historic Public Participation Bill', category: 'County Assembly', author: 'Njeri Wanjiru', county: 'Kiambu', replies: 19, views: 756, lastActivity: '1 day ago', pinned: false, hot: false, important: true,
    content: 'Kiambu County Assembly has passed a bill mandating public participation in all major budgetary decisions. This is a first for the county and sets a precedent for others.',
    repliesList: []
  },
  { id: 5, title: 'Suspicious Land Deals in Nakuru County Government', category: 'Whistleblower Tips', author: 'Anonymous Citizen', county: 'Nakuru', replies: 56, views: 2341, lastActivity: '30 min ago', pinned: true, hot: true, important: true,
    content: 'There are credible reports of irregular land allocations in Nakuru municipality involving senior county officials. Public land designated for a school has been transferred to private developers.',
    repliesList: [
      { author: 'John Ndegwa', text: 'I can confirm this. The land in question is along Kenyatta Avenue.', time: '20 min ago' },
      { author: 'Grace Muthoni', text: 'The EACC should investigate this immediately.', time: '15 min ago' },
      { author: 'Samuel Karanja', text: 'We have filed a petition with the county assembly. 500 signatures collected.', time: '10 min ago' }
    ]
  },
  { id: 6, title: 'Uasin Gishu Success: Solar-Powered Water Project in Eldoret', category: 'Success Stories', author: 'Hassan Wario', county: 'Uasin Gishu', replies: 23, views: 1123, lastActivity: '12 hours ago', pinned: false, hot: false, important: false,
    content: 'The solar-powered water project in Eldoret has provided clean water to over 15,000 residents. This is a model that other counties should adopt.',
    repliesList: [{ author: 'Lucy Chebet', text: 'My family has benefited directly. We no longer walk 3km for water.', time: '11 hours ago' }]
  },
  { id: 7, title: 'Turkana County: Is the Devolution Promise Being Fulfilled?', category: 'General', author: 'Joseph Ekai', county: 'Turkana', replies: 41, views: 1567, lastActivity: '3 hours ago', pinned: false, hot: true, important: false,
    content: 'Ten years after devolution, Turkana County still faces significant challenges in service delivery. What has changed and what remains the same?',
    repliesList: [
      { author: 'Achol Deng', text: 'Health services have improved slightly but roads remain a major challenge.', time: '2 hours ago' },
      { author: 'Michael Lotodo', text: 'The county government has employed more teachers but the student-teacher ratio is still high.', time: '1 hour ago' }
    ]
  },
  { id: 8, title: 'Machakos County Bursary Fund: Who Really Benefits?', category: 'Budget & Finance', author: 'Rose Nduku', county: 'Machakos', replies: 15, views: 678, lastActivity: '1 day ago', pinned: false, hot: false, important: false,
    content: 'The Machakos County bursary fund of KES 200 million was meant to support needy students. However, reports indicate that children of county officials received disproportionate allocations.',
    repliesList: []
  },
  { id: 9, title: 'Garissa County: New Roads Connecting Rural Areas', category: 'Projects & Infrastructure', author: 'Abdi Mohamed', county: 'Garissa', replies: 18, views: 890, lastActivity: '6 hours ago', pinned: false, hot: false, important: false,
    content: 'Garissa County has completed 45km of new road connecting three rural sub-counties to the main highway. This is expected to improve market access for farmers.',
    repliesList: []
  },
  { id: 10, title: 'Kakamega Forest Conservation: County vs National Government', category: 'General', author: 'Bramwel Luvembe', county: 'Kakamega', replies: 34, views: 1234, lastActivity: '4 hours ago', pinned: false, hot: true, important: false,
    content: 'There is an ongoing jurisdictional dispute between Kakamega County and the national government over the management of Kakamega Forest. Who should take the lead on conservation efforts?',
    repliesList: [
      { author: 'Phyllis Wekesa', text: 'The forest is a national resource but the county bears the impact of deforestation.', time: '3 hours ago' }
    ]
  },
  { id: 11, title: 'Meru County Health Centers: Staff Shortage Crisis', category: 'Health & Education', author: 'Dr. Eunice Karambu', county: 'Meru', replies: 22, views: 945, lastActivity: '9 hours ago', pinned: false, hot: false, important: true,
    content: 'Meru County has 47 health centers but only 12 have a full complement of medical staff. The county government needs to address this urgently.',
    repliesList: []
  },
  { id: 12, title: 'Laikipia County: Community Land Registration Progress', category: 'Success Stories', author: 'Sironka Ole Kenta', county: 'Laikipia', replies: 11, views: 567, lastActivity: '2 days ago', pinned: false, hot: false, important: false,
    content: 'Laikipia has registered 78% of community land, the highest rate in the country. This has resolved numerous land disputes and improved pastoralist livelihoods.',
    repliesList: []
  },
  { id: 13, title: 'Missing County Funds in Taita Taveta: A Deep Dive', category: 'Whistleblower Tips', author: 'Concerned Resident', county: 'Taita Taveta', replies: 38, views: 1890, lastActivity: '1 hour ago', pinned: false, hot: true, important: true,
    content: 'An analysis of Taita Taveta County financial reports reveals a discrepancy of KES 120 million between budgeted and actual expenditure on health programs.',
    repliesList: [
      { author: 'Rachel Mghendi', text: 'The county auditor general flagged this in the last financial year.', time: '45 min ago' }
    ]
  },
  { id: 14, title: 'Nyamira County Assembly Impeachment Motion: Analysis', category: 'County Assembly', author: 'Prof. Zachary Mogaka', county: 'Nyamira', replies: 26, views: 1089, lastActivity: '7 hours ago', pinned: false, hot: false, important: true,
    content: 'The impeachment motion against the Nyamira County Speaker raises constitutional questions about the separation of powers at the county level.',
    repliesList: []
  },
  { id: 15, title: 'Kwale County: Youth Employment Through County Internship Program', category: 'Success Stories', author: 'Mwanasha Juma', county: 'Kwale', replies: 17, views: 723, lastActivity: '15 hours ago', pinned: false, hot: false, important: false,
    content: 'Over 300 youth in Kwale County have gained employment through the county internship program in the last fiscal year. Many have transitioned to permanent positions.',
    repliesList: []
  }
];

const CONTRIBUTORS = [
  { name: 'James Mwangi', posts: 156, reputation: 4870, county: 'Nairobi' },
  { name: 'Wanjiku Kamau', posts: 134, reputation: 4230, county: 'Nairobi' },
  { name: 'Otieno Odhiambo', posts: 128, reputation: 3980, county: 'Kisumu' },
  { name: 'Fatuma Hassan', posts: 119, reputation: 3750, county: 'Mombasa' },
  { name: 'Aisha Bakari', posts: 112, reputation: 3540, county: 'Mombasa' },
  { name: 'Joseph Ekai', posts: 98, reputation: 3210, county: 'Turkana' },
  { name: 'Rose Nduku', posts: 94, reputation: 3050, county: 'Machakos' },
  { name: 'Bramwel Luvembe', posts: 87, reputation: 2890, county: 'Kakamega' },
  { name: 'Dr. Peter Ochieng', posts: 82, reputation: 2760, county: 'Kisumu' },
  { name: 'Hassan Wario', posts: 76, reputation: 2540, county: 'Uasin Gishu' }
];

const TRENDING = [
  'Nairobi Budget 2024/2025', 'Nakuru Land Deals', 'Devolution 10-Year Review',
  'County Health Crisis', 'Youth Employment Programs', 'Public Participation Bills',
  'Anti-Corruption Efforts', 'Infrastructure Progress'
];

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu', 'Machakos',
  'Turkana', 'Garissa', 'Kakamega', 'Meru', 'Laikipia', 'Taita Taveta', 'Nyamira', 'Kwale'
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function CommunityForums() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newThread, setNewThread] = useState({ title: '', category: '', content: '', county: '' });
  const [replyText, setReplyText] = useState('');

  const filtered = THREADS.filter(t => {
    const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalReplies = THREADS.reduce((sum, t) => sum + t.replies, 0);
  const activeUsers = CONTRIBUTORS.length;

  return (
    <div className="space-y-6">
      {/* Forum Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Threads', value: THREADS.length.toString(), icon: MessageSquare },
          { label: 'Total Replies', value: totalReplies.toLocaleString(), icon: MessageCircle },
          { label: 'Active Users', value: activeUsers.toString(), icon: Users },
          { label: 'Most Discussed County', value: 'Nairobi', icon: TrendingUp }
        ].map((stat) => (
          <Card key={stat.label} className="border-stone-200 dark:border-stone-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <stat.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400">{stat.label}</p>
                <p className="text-lg font-semibold text-stone-800 dark:text-stone-200">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Forum Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-stone-200 dark:border-stone-700"
              />
            </div>
            <Button onClick={() => setShowNewThread(!showNewThread)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Thread
            </Button>
          </div>

          {/* New Thread Form */}
          {showNewThread && (
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-stone-800 dark:text-stone-200">Create New Thread</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Thread title"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  className="border-stone-200 dark:border-stone-700"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newThread.category} onValueChange={(v) => setNewThread({ ...newThread, category: v })}>
                    <SelectTrigger className="border-stone-200 dark:border-stone-700">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newThread.county} onValueChange={(v) => setNewThread({ ...newThread, county: v })}>
                    <SelectTrigger className="border-stone-200 dark:border-stone-700">
                      <SelectValue placeholder="County tag (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Write your thread content..."
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  className="min-h-[100px] border-stone-200 dark:border-stone-700"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewThread(false)} className="border-stone-300 dark:border-stone-600">Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Post Thread</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex-wrap h-auto gap-1 bg-stone-100 dark:bg-stone-800 p-1">
              <TabsTrigger value="All" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">All</TabsTrigger>
              {CATEGORIES.map(c => (
                <TabsTrigger key={c} value={c} className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">{c}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4 space-y-3">
              {filtered.map(thread => (
                <Card key={thread.id} className="border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}>
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm">
                          {getInitials(thread.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-stone-800 dark:text-stone-200 text-sm leading-tight">{thread.title}</h3>
                          {thread.pinned && <Badge variant="outline" className="border-amber-400 text-amber-600 text-[10px] gap-1"><Pin className="h-3 w-3" />Pinned</Badge>}
                          {thread.hot && <Badge variant="outline" className="border-red-400 text-red-600 text-[10px] gap-1"><Flame className="h-3 w-3" />Hot</Badge>}
                          {thread.important && <Badge variant="outline" className="border-blue-400 text-blue-600 text-[10px]">Important</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                          <span className="font-medium text-stone-700 dark:text-stone-300">{thread.author}</span>
                          {thread.county && <Badge variant="secondary" className="text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">{thread.county}</Badge>}
                          <Badge variant="secondary" className="text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">{thread.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400 dark:text-stone-500">
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{thread.replies} replies</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{thread.views.toLocaleString()} views</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{thread.lastActivity}</span>
                        </div>
                      </div>
                      <div className="shrink-0 mt-1">
                        {expandedThread === thread.id ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
                      </div>
                    </div>

                    {/* Thread Detail */}
                    {expandedThread === thread.id && (
                      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                        <p className="text-sm text-stone-700 dark:text-stone-300 mb-4 leading-relaxed">{thread.content}</p>

                        {/* Replies */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-stone-700 dark:text-stone-300 text-sm">{thread.repliesList.length} Replies</h4>
                          {thread.repliesList.map((reply, idx) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs">
                                  {getInitials(reply.author)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{reply.author}</span>
                                  <span className="text-xs text-stone-400">{reply.time}</span>
                                </div>
                                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{reply.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply Form */}
                        <div className="mt-4 flex gap-2">
                          <Input
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 border-stone-200 dark:border-stone-700"
                          />
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                            <Send className="h-3 w-3" /> Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <Card className="border-stone-200 dark:border-stone-700">
                  <CardContent className="p-8 text-center text-stone-500 dark:text-stone-400">
                    No threads found in this category.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending Topics */}
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-stone-800 dark:text-stone-200">
                <TrendingUp className="h-4 w-4 text-emerald-600" /> Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TRENDING.map((topic, i) => (
                <div key={topic} className="flex items-center gap-2 text-sm cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <span className="text-xs font-mono text-stone-400 w-4">{i + 1}</span>
                  <span className="text-stone-700 dark:text-stone-300 truncate">{topic}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Contributors */}
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-stone-800 dark:text-stone-200">
                <Award className="h-4 w-4 text-emerald-600" /> Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px]">
                <div className="space-y-3">
                  {CONTRIBUTORS.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold w-5 text-center ${i < 3 ? 'text-emerald-600' : 'text-stone-400'}`}>{i + 1}</span>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className={`text-[10px] ${i < 3 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                          {getInitials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">{c.name}</p>
                        <p className="text-[10px] text-stone-400">{c.county} - {c.posts} posts</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {c.reputation.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
