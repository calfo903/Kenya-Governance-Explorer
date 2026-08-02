'use client';

import React, { useState, useEffect } from 'react';
import { X, Keyboard, Map, Bot } from 'lucide-react';

const STORAGE_KEY = 'kgov-onboarding-dismissed';

export default function WelcomeOnboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only on first visit
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={dismiss}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={dismiss} className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors">
          <X className="h-4 w-4 text-stone-400" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Map className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Welcome to Kenya Governance Explorer</h3>
            <p className="text-xs text-stone-500">Your guide to county governance data</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          {[
            { icon: Keyboard, title: 'Command Palette', desc: 'Press Ctrl+K to quickly find any page, tool, or county' },
            { icon: Map, title: 'Interactive Map', desc: 'Explore all 47 counties with audit opinions, budgets, and demographics' },
            { icon: Bot, title: 'AI Assistant', desc: 'Ask questions about devolution, budgets, audits, and governance' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{item.title}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={dismiss}
          className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}
