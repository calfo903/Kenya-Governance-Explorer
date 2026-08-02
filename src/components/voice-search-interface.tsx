'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic, MicOff, Volume2, Search, Clock, Globe,
  MapPin, Building2, FileText, Users, ArrowRight, Trash2,
  ChevronDown, ChevronRight, X, AlertCircle, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VoiceSearchResult {
  title: string;
  type: string;
  county: string;
  snippet: string;
}

interface VoiceSearchHistory {
  id: string;
  transcription: string;
  timestamp: string;
  results: VoiceSearchResult[];
  language: 'en' | 'sw';
}

interface CommandCategory {
  name: string;
  commands: string[];
}

const commandCategories: CommandCategory[] = [
  {
    name: 'County Information',
    commands: [
      'Show me projects in Kajiado',
      'What is the population of Mombasa?',
      'Tell me about Nairobi County budget',
      'Who is the governor of Kisumu?',
      'Show audit report for Nakuru',
    ],
  },
  {
    name: 'Comparisons',
    commands: [
      'Compare Nairobi and Mombasa budgets',
      'Which county has the highest absorption rate?',
      'Compare health scores between counties',
      'Top 5 counties by development projects',
    ],
  },
  {
    name: 'Budget & Finance',
    commands: [
      'How much did Kisumu spend on education?',
      'Show budget allocation for Kakamega',
      'What is the absorption rate for Uasin Gishu?',
      'Compare county revenue collection',
    ],
  },
  {
    name: 'Representatives',
    commands: [
      'Who represents Kileleshwa ward?',
      'List all senators from the lakeside region',
      'Show me the MCA for Langata',
      'Which MCAs are in the Public Accounts Committee?',
    ],
  },
  {
    name: 'Projects',
    commands: [
      'Show stalled projects in Mombasa',
      'What projects are underway in Machakos?',
      'List completed projects in Kiambu',
      'Show expensive projects in Nairobi',
    ],
  },
];

const mockSearchHistory: VoiceSearchHistory[] = [
  {
    id: '1',
    transcription: 'Show me projects in Kajiado County',
    timestamp: '2025-01-15 09:30',
    language: 'en',
    results: [
      { title: 'Kajiado Water Supply Project', type: 'Project', county: 'Kajiado', snippet: 'KES 245M water infrastructure upgrade for Kajiado Town' },
      { title: 'Kajiado Level 4 Hospital Expansion', type: 'Project', county: 'Kajiado', snippet: 'KES 180M expansion of the county referral hospital' },
      { title: 'Kajiado-Isinya Road Tarmacking', type: 'Project', county: 'Kajiado', snippet: 'KES 320M road project connecting Kajiado to Isinya' },
    ],
  },
  {
    id: '2',
    transcription: 'Peesa ya Nairobi ni kiasi gani?',
    timestamp: '2025-01-15 09:15',
    language: 'sw',
    results: [
      { title: 'Nairobi FY 2024/25 Budget', type: 'Budget', county: 'Nairobi', snippet: 'Total allocation of KES 43.5 Billion for FY 2024/25' },
    ],
  },
  {
    id: '3',
    transcription: 'Compare Nairobi and Mombasa budgets',
    timestamp: '2025-01-15 08:45',
    language: 'en',
    results: [
      { title: 'Nairobi vs Mombasa Budget Comparison', type: 'Comparison', county: 'Multi', snippet: 'Nairobi: KES 43.5B vs Mombasa: KES 18.7B' },
    ],
  },
  {
    id: '4',
    transcription: 'Who is the governor of Kisumu?',
    timestamp: '2025-01-14 16:20',
    language: 'en',
    results: [
      { title: 'Prof. Peter Anyang Nyongo', type: 'Representative', county: 'Kisumu', snippet: 'Governor of Kisumu County, ODM party, term since 2017' },
    ],
  },
  {
    id: '5',
    transcription: 'Show stalled projects in Mombasa',
    timestamp: '2025-01-14 14:10',
    language: 'en',
    results: [
      { title: 'Mombasa BRT System', type: 'Project', county: 'Mombasa', snippet: 'Stalled due to contractor disputes, KES 4.2B allocated' },
      { title: 'Moi International Airport Expansion', type: 'Project', county: 'Mombasa', snippet: 'Delayed pending national government funding, KES 890M' },
    ],
  },
  {
    id: '6',
    transcription: 'Ni nani MCA wa Langata?',
    timestamp: '2025-01-14 11:30',
    language: 'sw',
    results: [
      { title: 'Langata Ward MCA', type: 'Representative', county: 'Nairobi', snippet: 'The elected MCA represents the Langata ward in Nairobi' },
    ],
  },
  {
    id: '7',
    transcription: 'What is the absorption rate for Nakuru County?',
    timestamp: '2025-01-13 17:00',
    language: 'en',
    results: [
      { title: 'Nakuru Budget Absorption Rate', type: 'Budget', county: 'Nakuru', snippet: '67.3% absorption rate as of Q2 FY 2024/25' },
    ],
  },
  {
    id: '8',
    transcription: 'Show audit report for Kiambu County',
    timestamp: '2025-01-13 10:45',
    language: 'en',
    results: [
      { title: 'Kiambu FY 2022/23 Audit', type: 'Audit', county: 'Kiambu', snippet: 'Qualified opinion on KES 12.3B county expenditure' },
      { title: 'Kiambu Special Audit 2024', type: 'Audit', county: 'Kiambu', snippet: 'Investigation into health sector procurement irregularities' },
    ],
  },
];

const mockResultsForTranscription: Record<string, VoiceSearchResult[]> = {
  default: [
    { title: 'Sample County Result', type: 'County', county: 'Nairobi', snippet: 'Matching result from the Kenya Governance Explorer database' },
  ],
};

const typeIcons: Record<string, React.ReactNode> = {
  Project: <Building2 className="h-3.5 w-3.5 text-emerald-600" />,
  Budget: <FileText className="h-3.5 w-3.5 text-blue-600" />,
  Audit: <AlertCircle className="h-3.5 w-3.5 text-amber-600" />,
  Representative: <Users className="h-3.5 w-3.5 text-purple-600" />,
  Comparison: <Search className="h-3.5 w-3.5 text-emerald-600" />,
  County: <MapPin className="h-3.5 w-3.5 text-emerald-600" />,
};

export default function VoiceSearchInterface() {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [searchResults, setSearchResults] = useState<VoiceSearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<VoiceSearchHistory[]>(mockSearchHistory);
  const [hasSupport, setHasSupport] = useState<boolean | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setHasSupport(!!SpeechRecognition);
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'en' ? 'en-KE' : 'sw-KE';

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) { final += t; } else { interim += t; }
          }
          if (final) setTranscription(final);
          setInterimTranscription(interim);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscription('');
        };

        recognition.onerror = () => {
          setIsListening(false);
          setInterimTranscription('');
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscription('');
      setSearchResults([]);
      recognitionRef.current.lang = language === 'en' ? 'en-KE' : 'sw-KE';
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, language]);

  useEffect(() => {
    if (transcription && !isListening) {
      const matchedHistory = mockSearchHistory.find(
        h => h.transcription.toLowerCase().includes(transcription.toLowerCase().trim())
      );
      if (matchedHistory) {
        setSearchResults(matchedHistory.results);
      } else {
        setSearchResults(mockResultsForTranscription.default);
      }
    }
  }, [transcription, isListening]);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const clearHistory = () => setSearchHistory([]);

  const replaySearch = (history: VoiceSearchHistory) => {
    setTranscription(history.transcription);
    setSearchResults(history.results);
  };

  const commandExamples = language === 'en'
    ? ['Show me projects in Kajiado', 'Compare Nairobi and Mombasa budgets', 'Who is the governor of Kisumu?']
    : ['Nionyeshe miradi Kajiado', 'Linganisha bajeti Nairobi na Mombasa', 'Ni nani gavana wa Kisumu?'];

  return (
    <div className="space-y-6">
      {/* No support banner */}
      {hasSupport === false && (
        <Card className="border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Speech Recognition Not Supported</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Your browser does not support the Web Speech API. Try Chrome or Edge for full voice search functionality.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Voice Input */}
      <Card className="border-emerald-200 dark:border-emerald-900">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6">
            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              >
                <Globe className="h-3.5 w-3.5 mr-1" /> English
              </Button>
              <Button
                size="sm"
                variant={language === 'sw' ? 'default' : 'outline'}
                onClick={() => setLanguage('sw')}
                className={language === 'sw' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              >
                <Globe className="h-3.5 w-3.5 mr-1" /> Kiswahili
              </Button>
            </div>

            {/* Mic Button */}
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" style={{ margin: '-12px' }} />
              )}
              <button
                onClick={toggleListening}
                disabled={hasSupport === false}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? 'bg-emerald-600 shadow-lg shadow-emerald-300/50 dark:shadow-emerald-900/50 scale-110'
                    : 'bg-stone-100 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                {isListening ? (
                  <Mic className="h-10 w-10 text-white" />
                ) : (
                  <MicOff className="h-10 w-10 text-stone-500" />
                )}
              </button>
            </div>
            <p className="text-sm text-stone-500">
              {isListening
                ? (language === 'en' ? 'Listening... speak now' : 'Inasikiliza... ongea sasa')
                : (language === 'en' ? 'Tap the microphone to start' : 'Bofya mikrofoni kuanza')
              }
            </p>

            {/* Transcription Area */}
            {(transcription || interimTranscription) && (
              <div className="w-full max-w-lg p-4 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                <p className="text-sm text-stone-500 mb-1">{language === 'en' ? 'You said:' : 'Ulisema:'}</p>
                <p className="text-base font-medium text-stone-800 dark:text-stone-200">
                  {transcription}
                  {interimTranscription && (
                    <span className="text-stone-400 italic"> {interimTranscription}</span>
                  )}
                </p>
              </div>
            )}

            {/* Command Examples */}
            {!transcription && !isListening && (
              <div className="w-full max-w-lg">
                <p className="text-xs text-stone-500 text-center mb-2">
                  {language === 'en' ? 'Try saying:' : 'Jaribu kusema:'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {commandExamples.map((cmd, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-1.5 px-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300">
                      <Volume2 className="h-3 w-3 mr-1.5 text-emerald-600" />
                      {cmd}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-5 w-5 text-emerald-600" />
              {language === 'en' ? 'Search Results' : 'Matokeo'}
              <Badge variant="secondary" className="ml-auto text-xs">{searchResults.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer"
              >
                <div className="mt-0.5">{typeIcons[result.type] || <Search className="h-3.5 w-3.5" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-stone-800 dark:text-stone-200">{result.title}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{result.type}</Badge>
                  </div>
                  <p className="text-xs text-stone-500">{result.snippet}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400 shrink-0 mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="commands">
        <TabsList className="bg-stone-100 dark:bg-stone-800">
          <TabsTrigger value="commands">Supported Commands</TabsTrigger>
          <TabsTrigger value="history">
            Recent Searches
            {searchHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">{searchHistory.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Commands by Category</CardTitle>
              <CardDescription>Explore what you can ask the voice assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {commandCategories.map(cat => {
                  const expanded = expandedCategories.has(cat.name);
                  return (
                    <div key={cat.name} className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(cat.name)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                      >
                        <span className="font-medium text-sm text-stone-800 dark:text-stone-200">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">{cat.commands.length}</Badge>
                          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                      </button>
                      {expanded && (
                        <div className="px-3 pb-3 space-y-1.5">
                          {cat.commands.map((cmd, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-md text-sm text-stone-600 dark:text-stone-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
                            >
                              <Volume2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              {cmd}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Voice Searches</CardTitle>
                  <CardDescription>Your last {searchHistory.length} voice searches</CardDescription>
                </div>
                {searchHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="text-stone-500 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-8">No recent voice searches</p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {searchHistory.map(h => (
                      <button
                        key={h.id}
                        onClick={() => replaySearch(h)}
                        className="w-full text-left p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
                          <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{h.transcription}</p>
                          <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                            {h.language === 'en' ? 'EN' : 'SW'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-500">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {h.timestamp}</span>
                          <span>{h.results.length} {h.results.length === 1 ? 'result' : 'results'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}