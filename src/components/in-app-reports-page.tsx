'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Building2, ExternalLink, Loader2, Search } from 'lucide-react';
import type { InAppReport } from '@/data/oag-reports';
import { PRIMARY_OVERSIGHT, NATIONAL_OVERSIGHT_SNAPSHOT } from '@/data/oversight-sources';

/**
 * In-app OAG/CoB report feed — content rendered inside the app.
 * External PDF links are citations only.
 */
export default function InAppReportsPage() {
  const [reports, setReports] = useState<InAppReport[]>([]);
  const [active, setActive] = useState<InAppReport | null>(null);
  const [countyCode, setCountyCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reports');
        if (!res.ok) throw new Error('Failed to load report feed');
        const data = await res.json();
        if (!cancelled) {
          setReports(data.reports ?? []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Load error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadCounty = async (code: string) => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?county=${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error('No county card');
      const data = await res.json();
      setActive(data.report);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'County load error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.abstract.toLowerCase().includes(q) ||
        r.financialYear.toLowerCase().includes(q),
    );
  }, [reports, query]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="shrink-0 border-b border-stone-200 dark:border-stone-700 px-6 py-5 bg-white dark:bg-stone-900">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
              In-app Audit & Oversight Reports
            </h1>
            <p className="text-sm text-stone-500">
              OAG / CoB structured feed — PDFs are citations only
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs text-stone-600 dark:text-stone-400">
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 p-3">
            <div className="font-medium text-stone-800 dark:text-stone-200">OAG FY 24/25</div>
            <div>1 unmodified · 2 adverse (Kericho, Tana River)</div>
          </div>
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 p-3">
            <div className="font-medium text-stone-800 dark:text-stone-200">CoB absorption</div>
            <div>Dev ~57% · Overall ~78%</div>
          </div>
          <div className="rounded-lg border border-stone-200 dark:border-stone-700 p-3">
            <div className="font-medium text-stone-800 dark:text-stone-200">Primary sources</div>
            <div className="truncate">OAG · CoB · CRA · EACC</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <aside className="md:w-96 border-r border-stone-200 dark:border-stone-700 overflow-y-auto p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm"
              placeholder="Filter reports…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm"
              placeholder="County code e.g. 017"
              value={countyCode}
              onChange={(e) => setCountyCode(e.target.value)}
            />
            <button
              type="button"
              onClick={() => loadCounty(countyCode)}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            >
              Card
            </button>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setActive(r)}
              className={`w-full text-left rounded-xl border p-3 transition ${
                active?.id === r.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300'
              }`}
            >
              <div className="text-sm font-medium text-stone-900 dark:text-stone-100">{r.title}</div>
              <div className="text-xs text-stone-500 mt-1">{r.financialYear} · {r.kind}</div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">{r.abstract}</p>
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {!active && (
            <div className="text-stone-500 text-sm flex flex-col items-center justify-center h-full gap-2">
              <Building2 className="w-10 h-10 opacity-40" />
              Select a national report or load a county card
            </div>
          )}
          {active && (
            <article className="max-w-3xl space-y-6">
              <header>
                <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{active.title}</h2>
                <p className="text-sm text-stone-500 mt-1">
                  {active.publishedLabel} · {active.financialYear}
                </p>
                <p className="mt-3 text-stone-700 dark:text-stone-300">{active.abstract}</p>
                {active.source?.url && (
                  <a
                    href={active.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-400 mt-2"
                  >
                    Citation source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </header>
              {active.opinionSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm">
                  {(
                    [
                      ['Unmod.', active.opinionSummary.unqualified],
                      ['Qualified', active.opinionSummary.qualified],
                      ['Adverse', active.opinionSummary.adverse],
                      ['Other', active.opinionSummary.disclaimer + active.opinionSummary.unknown],
                    ] as const
                  ).map(([label, n]) => (
                    <div key={label} className="rounded-lg border border-stone-200 dark:border-stone-700 p-3">
                      <div className="text-lg font-semibold">{n}</div>
                      <div className="text-xs text-stone-500">{label}</div>
                    </div>
                  ))}
                </div>
              )}
              {active.sections.map((s) => (
                <section key={s.id} className="space-y-2">
                  <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{s.title}</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">{s.body}</p>
                  {s.bullets && s.bullets.length > 0 && (
                    <ul className="list-disc pl-5 text-sm text-stone-700 dark:text-stone-300 space-y-1">
                      {s.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
