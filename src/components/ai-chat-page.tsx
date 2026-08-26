'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Bot, User, Sparkles, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// ─── Suggested Questions ──────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  'How does county budget allocation work?',
  'What is the role of a Governor?',
  'How can citizens track public funds?',
  'What powers does the County Assembly have?',
  'How does devolution work in Kenya?',
  'What is the Commission on Revenue Allocation?',
];

// ─── Simple Markdown Renderer ──────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;

  const flushList = (endIdx: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${endIdx}`} className="list-disc list-inside space-y-1 mb-2 text-stone-700 dark:text-stone-300">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, i) => {
    // Headers
    if (/^### (.+)/.test(line)) {
      flushList(i);
      elements.push(<h3 key={`h3-${i}`} className="text-base font-semibold text-stone-800 dark:text-stone-200 mt-4 mb-1">{line.replace(/^### /, '')}</h3>);
      return;
    }
    if (/^## (.+)/.test(line)) {
      flushList(i);
      elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-4 mb-1">{line.replace(/^## /, '')}</h2>);
      return;
    }

    // Bullet points
    if (/^\s*[-*]\s(.+)/.test(line)) {
      inList = true;
      const content = line.replace(/^\s*[-*]\s/, '');
      listItems.push(<li key={`li-${i}`}>{renderInline(content)}</li>);
      return;
    }

    // If we were in a list and this line isn't a list item, flush the list
    if (inList) flushList(i);

    // Numbered items
    if (/^\d+\.\s(.+)/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(<div key={`ol-${i}`} className="flex gap-2 ml-2 mb-1"><span className="font-medium text-emerald-600 min-w-[1.2rem]">{line.match(/^\d+/)?.[0]}.</span><span>{renderInline(content)}</span></div>);
      return;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(<p key={`p-${i}`} className="text-stone-700 dark:text-stone-300 leading-relaxed">{renderInline(line)}</p>);
  });

  // Flush any remaining list
  flushList(lines.length);
  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(<strong key={`b-${key++}`} className="font-semibold text-stone-900 dark:text-stone-100">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`t-${key++}`}>{text.slice(lastIndex)}</span>);
  }
  return parts;
}

// ─── Loading Dots Animation ────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data: ChatResponse = await res.json();

      if (data.success && data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response! }]);
      } else {
        setError(data.error || 'Failed to get a response.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-100">AI Governance Assistant</h1>
            <p className="text-xs text-stone-500">Ask about Kenya&apos;s county governance</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-stone-500 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Chat
          </Button>
        )}
      </header>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Suggested questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:border-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-200px)]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-1">Ask me anything about governance</h2>
            <p className="text-sm text-stone-500 max-w-md">I can help you understand Kenya&apos;s county governments, budgets, devolution, audits, and citizen rights.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <Card className={`max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'}`}>
              <CardContent className="p-3 text-sm">
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                )}
              </CardContent>
            </Card>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-stone-700 flex-shrink-0 flex items-center justify-center mt-0.5">
                <User className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex-shrink-0 flex items-center justify-center mt-0.5">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <Card className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
              <CardContent className="p-3"><LoadingDots /></CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Badge variant="destructive" className="text-xs">{error}</Badge>
            <Button variant="outline" size="sm" onClick={() => {
              const lastMsg = messages.findLast(m => m.role === 'user');
              if (lastMsg) sendMessage(lastMsg.content);
            }}>
              <RotateCcw className="w-3 h-3 mr-1" /> Retry
            </Button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about county governance..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[38px] max-h-24"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 h-[38px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
