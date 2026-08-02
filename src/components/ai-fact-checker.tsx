'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle,
  XCircle, CheckCircle, Clock, Filter, BarChart3, FileText,
  ExternalLink, ChevronRight, ChevronDown, TrendingUp, Loader2,
  History, BookOpen, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ─────────────────────────────────────────────────────────
type Verdict = 'TRUE' | 'MOSTLY TRUE' | 'PARTLY TRUE' | 'MISLEADING' | 'FALSE' | 'UNSUPPORTED';

interface FactCheckResult {
  claim: string;
  verdict: Verdict;
  confidence: number;
  sources: { title: string; institution: string; year: string; relevance: string }[];
  dataPoints: { label: string; value: string; source: string }[];
  explanation: string;
  timestamp: string;
  category: string;
}

interface RecentCheck {
  id: number;
  claim: string;
  verdict: Verdict;
  confidence: number;
  category: string;
  timestamp: string;
}

// ─── Verdict config ────────────────────────────────────────────────
const VERDICT_CONFIG: Record<Verdict, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'TRUE': {
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    border: 'border-emerald-300 dark:border-emerald-700',
    icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
  },
  'MOSTLY TRUE': {
    color: 'text-lime-700 dark:text-lime-300',
    bg: 'bg-lime-100 dark:bg-lime-900/40',
    border: 'border-lime-300 dark:border-lime-700',
    icon: <CheckCircle className="h-5 w-5 text-lime-600" />,
  },
  'PARTLY TRUE': {
    color: 'text-yellow-700 dark:text-yellow-300',
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    border: 'border-yellow-300 dark:border-yellow-700',
    icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  },
  'MISLEADING': {
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    border: 'border-orange-300 dark:border-orange-700',
    icon: <ShieldAlert className="h-5 w-5 text-orange-600" />,
  },
  'FALSE': {
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-900/40',
    border: 'border-red-300 dark:border-red-700',
    icon: <XCircle className="h-5 w-5 text-red-600" />,
  },
  'UNSUPPORTED': {
    color: 'text-stone-500 dark:text-stone-400',
    bg: 'bg-stone-100 dark:bg-stone-800/40',
    border: 'border-stone-300 dark:border-stone-600',
    icon: <HelpCircle className="h-5 w-5 text-stone-500" />,
  },
};

const CATEGORIES = [
  'All Categories',
  'Budget Claims',
  'Project Claims',
  'Service Delivery',
  'Employment',
  'Education',
  'Health',
];

// ─── Mock Results Generator ──────────────────────────────────────
function generateMockResult(claim: string, category: string): FactCheckResult {
  const verdicts: Verdict[] = ['TRUE', 'MOSTLY TRUE', 'PARTLY TRUE', 'MISLEADING', 'FALSE', 'UNSUPPORTED'];
  const weights = [0.1, 0.15, 0.25, 0.3, 0.15, 0.05];
  let rand = Math.random();
  let verdict: Verdict = 'PARTLY TRUE';
  for (let i = 0; i < verdicts.length; i++) {
    rand -= weights[i];
    if (rand <= 0) { verdict = verdicts[i]; break; }
  }

  const lowerClaim = claim.toLowerCase();
  if (lowerClaim.includes('100%') || lowerClaim.includes('all schools') || lowerClaim.includes('every county')) {
    verdict = 'FALSE';
  } else if (lowerClaim.includes('completed') && lowerClaim.includes('projects')) {
    verdict = 'MISLEADING';
  }

  const confidence = verdict === 'UNSUPPORTED' ? 35 + Math.floor(Math.random() * 25) : 60 + Math.floor(Math.random() * 35);

  const explanations: Record<Verdict, string> = {
    'TRUE': `Our analysis confirms this claim based on available government data. The figures cited are consistent with official reports from the Controller of Budget and the Office of the Auditor General. The data has been cross-referenced across multiple independent sources including county budget implementation review reports and IEBC records where applicable.`,
    'MOSTLY TRUE': `The core claim is largely supported by available data, though there are minor discrepancies in the exact figures quoted. The Office of the Auditor General reports and county fiscal data support the general assertion. However, some contextual factors may affect the precise interpretation of the numbers presented.`,
    'PARTLY TRUE': `This claim contains elements of truth but is presented in a way that may create a misleading impression. While some aspects are supported by government records, others are overstated or lack verifiable evidence. The OAG special audit reports and county budget reviews provide partial corroboration for certain elements of the claim.`,
    'MISLEADING': `This claim uses accurate data selectively to create a misleading narrative. While individual figures may be technically correct, the context and comparison presented distorts the actual situation. County budget implementation reviews from the Controller of Budget show a different picture when viewed in full context.`,
    'FALSE': `This claim is not supported by available evidence. Official records from the Office of the Auditor General, county budget reports, and IEBC data contradict the assertion. The figures quoted appear to be fabricated or significantly exaggerated. Multiple government sources confirm these numbers are inaccurate.`,
    'UNSUPPORTED': `We could not find sufficient verifiable data to confirm or refute this claim. The specific assertion does not appear in OAG audit reports, county budget documents, or IEBC records. Additional documentation or official sources would be needed to perform a thorough fact-check.`,
  };

  return {
    claim,
    verdict,
    confidence,
    sources: [
      {
        title: 'Special Audit Report on County Government Expenditure',
        institution: 'Office of the Auditor General (OAG)',
        year: 'FY 2023/24',
        relevance: 'Directly addresses budget allocation figures cited',
      },
      {
        title: 'County Budget Implementation Review Report',
        institution: 'Controller of Budget (CoB)',
        year: 'Q3 FY 2024/25',
        relevance: 'Contains verified expenditure and absorption data',
      },
      {
        title: 'General Election Results and Voter Registration Statistics',
        institution: 'Independent Electoral and Boundaries Commission (IEBC)',
        year: '2022',
        relevance: 'Provides demographic and administrative data referenced',
      },
    ],
    dataPoints: [
      { label: 'County Budget Allocation (FY 2024/25)', value: 'KES 14.2 Billion', source: 'CoB Report' },
      { label: 'Development Budget Absorption Rate', value: '47.3%', source: 'OAG Audit' },
      { label: 'Pending Bills as of June 2024', value: 'KES 2.8 Billion', source: 'CoB Report' },
      { label: 'Conditional Grants Utilized', value: '62.1%', source: 'Treasury' },
    ],
    explanation: explanations[verdict],
    timestamp: new Date().toISOString(),
    category: category || 'Budget Claims',
  };
}

// ─── Mock Recent Checks ────────────────────────────────────────────
const MOCK_RECENT_CHECKS: RecentCheck[] = [
  {
    id: 1,
    claim: 'Nakuru County has achieved 100% absorption of its development budget for FY 2024/25',
    verdict: 'FALSE',
    confidence: 92,
    category: 'Budget Claims',
    timestamp: '2025-01-15T10:30:00Z',
  },
  {
    id: 2,
    claim: 'Mombasa County has completed all 47 health centre upgrades promised in the 2022 manifesto',
    verdict: 'MISLEADING',
    confidence: 87,
    category: 'Health',
    timestamp: '2025-01-14T14:15:00Z',
  },
  {
    id: 3,
    claim: 'Kisumu County has employed over 5,000 new teachers in primary schools since 2022',
    verdict: 'FALSE',
    confidence: 95,
    category: 'Education',
    timestamp: '2025-01-13T09:00:00Z',
  },
  {
    id: 4,
    claim: 'Turkana County allocated 45% of its budget to development projects this financial year',
    verdict: 'PARTLY TRUE',
    confidence: 72,
    category: 'Budget Claims',
    timestamp: '2025-01-12T16:45:00Z',
  },
  {
    id: 5,
    claim: 'Machakos County roads department has paved 200km of new roads in the last two years',
    verdict: 'MOSTLY TRUE',
    confidence: 78,
    category: 'Project Claims',
    timestamp: '2025-01-11T11:20:00Z',
  },
  {
    id: 6,
    claim: 'Uasin Gishu County provides free water to all residents in Eldoret town',
    verdict: 'FALSE',
    confidence: 88,
    category: 'Service Delivery',
    timestamp: '2025-01-10T08:30:00Z',
  },
  {
    id: 7,
    claim: 'Kakamega County has created 10,000 youth employment opportunities through county programs',
    verdict: 'UNSUPPORTED',
    confidence: 42,
    category: 'Employment',
    timestamp: '2025-01-09T13:10:00Z',
  },
  {
    id: 8,
    claim: 'Garissa County hospital now has 500 beds as promised by the governor',
    verdict: 'MISLEADING',
    confidence: 81,
    category: 'Health',
    timestamp: '2025-01-08T15:55:00Z',
  },
];

// ─── Component ────────────────────────────────────────────────────
export default function AIFactChecker() {
  const [claimInput, setClaimInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [selectedCategory, setSelectedCategory] = useState('Budget Claims');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<FactCheckResult | null>(null);
  const [recentChecks, setRecentChecks] = useState<RecentCheck[]>(MOCK_RECENT_CHECKS);
  const [expandedCheckId, setExpandedCheckId] = useState<number | null>(null);

  const filteredChecks = useMemo(() => {
    if (categoryFilter === 'All Categories') return recentChecks;
    return recentChecks.filter(c => c.category === categoryFilter);
  }, [recentChecks, categoryFilter]);

  const stats = useMemo(() => {
    const total = recentChecks.length;
    const falseCount = recentChecks.filter(c => c.verdict === 'FALSE').length;
    const trueCount = recentChecks.filter(c => c.verdict === 'TRUE' || c.verdict === 'MOSTLY TRUE').length;
    const pendingCount = recentChecks.filter(c => c.verdict === 'UNSUPPORTED').length;
    return { total, falseCount, trueCount, pendingCount };
  }, [recentChecks]);

  const handleFactCheck = async () => {
    if (!claimInput.trim()) return;
    setLoading(true);
    setCurrentResult(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = generateMockResult(claimInput.trim(), selectedCategory);
    setCurrentResult(result);
    setRecentChecks(prev => [
      {
        id: Date.now(),
        claim: claimInput.trim(),
        verdict: result.verdict,
        confidence: result.confidence,
        category: result.category,
        timestamp: result.timestamp,
      },
      ...prev,
    ]);
    setLoading(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">AI Fact-Checker</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Verify politician claims against official government data sources</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
              <BarChart3 className="h-4 w-4 text-stone-600 dark:text-stone-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stats.total}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Total Checks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.falseCount}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">False Claims</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.trueCount}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Verified True</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-stone-200 dark:border-stone-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800">
              <HelpCircle className="h-4 w-4 text-stone-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-600 dark:text-stone-400">{stats.pendingCount}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Pending Review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Input and History */}
        <div className="lg:col-span-1 space-y-4">
          {/* Input Card */}
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-stone-800 dark:text-stone-200">Submit a Claim</CardTitle>
              <CardDescription>Paste or type a politician's statement to verify</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="e.g., 'Nakuru County has achieved 100% absorption of its development budget for FY 2024/25'"
                className="min-h-[120px] border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm resize-none"
                value={claimInput}
                onChange={e => setClaimInput(e.target.value)}
              />
              <div>
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleFactCheck}
                disabled={loading || !claimInput.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing claim...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Fact Check
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Category Filter for History */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-stone-400" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="flex-1 h-8 text-xs border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recent Checks History */}
          <Card className="border-stone-200 dark:border-stone-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-stone-800 dark:text-stone-200">
                <History className="h-4 w-4" />
                Recent Fact-Checks
              </CardTitle>
              <CardDescription>{filteredChecks.length} checks in history</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredChecks.slice(0, 8).map(check => {
                  const config = VERDICT_CONFIG[check.verdict];
                  const isExpanded = expandedCheckId === check.id;
                  return (
                    <div key={check.id} className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 shrink-0 ${config.color}`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-800 dark:text-stone-200 line-clamp-2 mb-1">
                            {check.claim}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-[10px] px-1.5 py-0 ${config.bg} ${config.color} border ${config.border}`}>
                              {check.verdict}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {check.category}
                            </Badge>
                            <span className="text-[10px] text-stone-400">{formatDate(check.timestamp)}</span>
                          </div>
                          <button
                            onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline mt-1 flex items-center gap-0.5"
                          >
                            {isExpanded ? (
                              <><ChevronDown className="h-3 w-3" /> Less</>
                            ) : (
                              <><ChevronRight className="h-3 w-3" /> More details</>
                            )}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500">Confidence:</span>
                                <Progress value={check.confidence} className="h-1.5 flex-1 max-w-[100px]" />
                                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{check.confidence}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card className="border-stone-200 dark:border-stone-700">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                  <div>
                    <p className="font-medium text-stone-800 dark:text-stone-200">Analyzing Claim</p>
                    <p className="text-sm text-stone-500">Cross-referencing with OAG, CoB, and IEBC databases...</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse" />
                  <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full w-3/4 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full w-2/3 animate-pulse" style={{ animationDelay: '0.6s' }} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : currentResult ? (
            <div className="space-y-4">
              {/* Verdict Card */}
              <Card className={`border ${VERDICT_CONFIG[currentResult.verdict].border}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${VERDICT_CONFIG[currentResult.verdict].bg}`}>
                      {VERDICT_CONFIG[currentResult.verdict].icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`text-sm px-3 py-1 font-bold ${VERDICT_CONFIG[currentResult.verdict].bg} ${VERDICT_CONFIG[currentResult.verdict].color} border ${VERDICT_CONFIG[currentResult.verdict].border}`}>
                          {currentResult.verdict}
                        </Badge>
                        <Badge variant="outline">{currentResult.category}</Badge>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 italic mb-3">&quot;{currentResult.claim}&quot;</p>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Confidence Score</span>
                        <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{currentResult.confidence}%</span>
                      </div>
                      <div className="w-full max-w-md">
                        <Progress value={currentResult.confidence} className="h-2.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card className="border-stone-200 dark:border-stone-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-stone-800 dark:text-stone-200">
                    <Eye className="h-4 w-4" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {currentResult.explanation}
                  </p>
                </CardContent>
              </Card>

              {/* Data Points */}
              <Card className="border-stone-200 dark:border-stone-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-stone-800 dark:text-stone-200">
                    <BarChart3 className="h-4 w-4" />
                    Related Data Points
                  </CardTitle>
                  <CardDescription>Key figures found during cross-referencing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentResult.dataPoints.map((dp, i) => (
                      <div key={i} className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                        <p className="text-xs text-stone-500 dark:text-stone-400 mb-0.5">{dp.label}</p>
                        <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{dp.value}</p>
                        <p className="text-[10px] text-stone-400 mt-1">Source: {dp.source}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Source Citations */}
              <Card className="border-stone-200 dark:border-stone-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-stone-800 dark:text-stone-200">
                    <BookOpen className="h-4 w-4" />
                    Source Citations
                  </CardTitle>
                  <CardDescription>{currentResult.sources.length} sources matched during verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentResult.sources.map((src, i) => (
                    <div key={i} className="p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-1.5 rounded bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                            <FileText className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{src.title}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{src.institution} -- {src.year}</p>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{src.relevance}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0 h-7 text-xs text-emerald-600">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-stone-200 dark:border-stone-700">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
                  <Search className="h-8 w-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-1">No Claim Analyzed</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm">
                  Enter a politician&apos;s claim or statement in the input panel to start fact-checking against official government data sources.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
