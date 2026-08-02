'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, MessageSquare, RotateCcw, Sparkles } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
export interface RepContext {
  name: string;
  title: string;          // e.g. "Governor", "Senator", "MP"
  county?: string;
  party?: string;
  coalition?: string;
  bio?: string;
  extra?: Record<string, string>;  // arbitrary extra key-value context
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

interface RepChatWidgetProps {
  rep: RepContext;
}

// ─── Markdown (compact) ────────────────────────────────────────
function renderMd(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const els: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  let inList = false;
  const flush = (idx: number) => {
    if (list.length) {
      els.push(<ul key={`l-${idx}`} className="list-disc list-inside space-y-0.5 mb-1.5 text-stone-600 dark:text-stone-300">{list}</ul>);
      list = []; inList = false;
    }
  };
  lines.forEach((line, i) => {
    if (/^### (.+)/.test(line)) { flush(i); els.push(<h3 key={`h3-${i}`} className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-2 mb-0.5">{line.replace(/^### /, '')}</h3>); return; }
    if (/^## (.+)/.test(line)) { flush(i); els.push(<h2 key={`h2-${i}`} className="text-base font-bold text-stone-900 dark:text-stone-100 mt-2 mb-0.5">{line.replace(/^## /, '')}</h2>); return; }
    if (/^\s*[-*]\s(.+)/.test(line)) { inList = true; list.push(<li key={`li-${i}`}>{line.replace(/^\s*[-*]\s/, '')}</li>); return; }
    if (inList) flush(i);
    if (/^\d+\.\s(.+)/.test(line)) { els.push(<div key={`ol-${i}`} className="flex gap-1.5 ml-1 mb-0.5"><span className="font-medium text-emerald-600 min-w-[1rem]">{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s/, '')}</span></div>); return; }
    if (!line.trim()) { els.push(<div key={`br-${i}`} className="h-1.5" />); return; }
    // Bold inline
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let last = 0, m, k = 0;
    while ((m = regex.exec(line)) !== null) {
      if (m.index > last) parts.push(<span key={`t-${k++}`}>{line.slice(last, m.index)}</span>);
      parts.push(<strong key={`b-${k++}`} className="font-semibold text-stone-900 dark:text-stone-100">{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(<span key={`t-${k++}`}>{line.slice(last)}</span>);
    els.push(<p key={`p-${i}`} className="text-stone-600 dark:text-stone-300 leading-relaxed text-[13px]">{parts.length ? parts : line}</p>);
  });
  flush(lines.length);
  return els;
}

// ─── Component ────────────────────────────────────────────────────
export default function RepChatWidget({ rep }: RepChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Build the system context string from the rep data
  const systemContext = React.useMemo(() => {
    const parts = [
      `You are an AI assistant specializing in Kenyan county governance.`,
      `The user is asking about a specific official. Here is what we know about them:`,
      `Name: ${rep.name}`,
      `Title/Role: ${rep.title}`,
    ];
    if (rep.county) parts.push(`County: ${rep.county}`);
    if (rep.party) parts.push(`Political Party: ${rep.party}`);
    if (rep.coalition) parts.push(`Coalition: ${rep.coalition}`);
    if (rep.bio) parts.push(`Biography: ${rep.bio}`);
    if (rep.extra) {
      for (const [key, val] of Object.entries(rep.extra)) {
        if (val) parts.push(`${key}: ${val}`);
      }
    }
    parts.push(``);
    parts.push(`Answer questions about this official based on your knowledge of Kenyan governance, their role, constitutional duties, county performance data, and public accountability metrics. If you don't know something specific, say so honestly. Keep answers concise and helpful.`);
    return parts.join('\n');
  }, [rep]);

  // Suggested questions based on role
  const suggestedQuestions = React.useMemo(() => {
    const name = rep.name;
    const role = rep.title.toLowerCase();
    const county = rep.county;
    const q: string[] = [];

    q.push(`What are the main responsibilities of a ${role} in Kenya?`);
    if (county) q.push(`How has ${name} performed as ${role} of ${county}?`);
    q.push(`What constitutional powers does the ${role} have?`);
    if (role.includes('governor')) {
      q.push(`How is the ${county || 'county'} budget allocated under ${name}?`);
      q.push(`What is ${name}'s audit track record?`);
    } else if (role.includes('senator')) {
      q.push(`What oversight role does ${name} play over ${county || 'the county'}?`);
    } else if (role.includes('mp') || role.includes('member')) {
      q.push(`What bills has ${name} sponsored or supported?`);
    } else if (role.includes('woman rep')) {
      q.push(`What is the role of the County Woman Representative?`);
    }
    q.push(`How can citizens hold ${name} accountable?`);

    return q.slice(0, 4);
  }, [rep]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history, systemContext }),
      });
      const data: ChatResponse = await res.json();

      if (data.success && data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response! }]);
      } else {
        setError(data.error || 'Failed to get a response.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [messages, loading, systemContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessages([]);
    setError(null);
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-emerald-600/30 z-20"
          title={`Ask AI about ${rep.name}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800 text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask AI
          </span>
        </button>
      )}

      {/* ── Chat Panel ── */}
      {open && (
        <div className="absolute bottom-12 right-0 z-30 w-80 sm:w-96 max-h-[480px] rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200">
          {/* Header */}
          <div className="shrink-0 px-3 py-2.5 border-b border-stone-200 dark:border-stone-700 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">Ask about {rep.name}</p>
                <p className="text-[10px] text-emerald-100 truncate">{rep.title}{rep.county ? `, ${rep.county}` : ''}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2.5 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-2">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-0.5">Ask about {rep.name}</p>
                <p className="text-[10px] text-stone-400 max-w-[200px]">AI-powered questions about this {rep.title.toLowerCase()}</p>
              </div>
            )}

            {/* Suggested Questions (show only when no messages) */}
            {messages.length === 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">Suggested questions</span>
                </div>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:border-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-md bg-emerald-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-2.5 py-1.5 text-[13px] ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-0">{renderMd(msg.content)}</div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-700 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-[9px] font-bold text-stone-500 dark:text-stone-400">You</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-1.5 justify-start">
                <div className="w-5 h-5 rounded-md bg-emerald-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-1.5 py-2">
                <span className="text-[10px] text-red-500 font-medium">{error}</span>
                <button
                  onClick={() => {
                    const lastMsg = messages.findLast(m => m.role === 'user');
                    if (lastMsg) sendMessage(lastMsg.content);
                  }}
                  className="text-[10px] flex items-center gap-1 text-stone-500 hover:text-emerald-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-stone-200 dark:border-stone-700 px-2.5 py-2">
            <form onSubmit={handleSubmit} className="flex gap-1.5 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${rep.name}...`}
                rows={1}
                className="flex-1 resize-none rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-2.5 py-1.5 text-[13px] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[32px] max-h-16"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
