"use client";

import { useState, useMemo, useCallback, Fragment } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
  Landmark,
  AlertTriangle,
  BarChart3,
  Filter,
  Download,
  Info,
} from "lucide-react";
import { countyBudgetData, type CountyBudgetRecord, getNationalBudgetAverages } from "@/data/county-budget-data";
import { all47Governors } from "@/data/governors";
import { REGIONS } from "@/data/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField =
  | "countyName"
  | "totalBudget"
  | "developmentBudget"
  | "recurrentBudget"
  | "devAbsorptionRate"
  | "recurrentAbsorptionRate"
  | "ownSourceRevenue"
  | "pendingBills"
  | "budgetChange";

type SortDir = "asc" | "desc";

interface CountyRow {
  countyCode: string;
  countyName: string;
  region: string;
  governor: string;
  current: CountyBudgetRecord;
  previous: CountyBudgetRecord | undefined;
  budgetChange: number; // % change in total budget
}

const ALL_YEARS = ["FY 2025/26", "FY 2024/25"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtB(n: number): string {
  if (n >= 1) return `${n.toFixed(1)}B`;
  return `${(n * 1000).toFixed(0)}M`;
}

function fmtM(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}B`;
  return `${n.toFixed(0)}M`;
}

function absorptionColor(rate: number): string {
  if (rate >= 60) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function absorptionBg(rate: number): string {
  if (rate >= 60) return "bg-emerald-500";
  if (rate >= 40) return "bg-amber-500";
  if (rate >= 20) return "bg-orange-500";
  return "bg-red-500";
}

function changeIcon(change: number) {
  if (change > 1) return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  if (change < -1) return <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-stone-400" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BudgetAllocationPage() {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("totalBudget");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(true);

  // Build the merged county rows with FY data
  const rows = useMemo<CountyRow[]>(() => {
    const govMap = new Map(all47Governors.map((g) => [g.code, g]));

    return countyBudgetData
      .filter((r) => r.financialYear === "FY 2025/26" || r.financialYear === "FY 2024/25")
      .reduce<Map<string, CountyBudgetRecord[]>>((acc, r) => {
        const existing = acc.get(r.countyCode) || [];
        existing.push(r);
        acc.set(r.countyCode, existing);
        return acc;
      }, new Map())
      .entries()
      .map(([code, records]) => {
        const current = records.find((r) => r.financialYear === "FY 2025/26") || records[0];
        const previous = records.find((r) => r.financialYear === "FY 2024/25");
        const gov = govMap.get(code);
        const budgetChange = previous
          ? ((current.totalBudget - previous.totalBudget) / previous.totalBudget) * 100
          : 0;

        return {
          countyCode: code,
          countyName: current.countyName,
          region: gov?.region ?? "",
          governor: gov?.name ?? "N/A",
          current,
          previous,
          budgetChange,
        };
      });
  }, []);

  // National averages for FY 2024/25 (Full Year) and FY 2025/26 (H1)
  const avgFY2425 = useMemo(() => getNationalBudgetAverages("FY 2024/25"), []);
  const avgFY2526 = useMemo(() => getNationalBudgetAverages("FY 2025/26"), []);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...rows];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.countyName.toLowerCase().includes(q) ||
          r.governor.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q),
      );
    }

    if (selectedRegion !== "All") {
      list = list.filter((r) => r.region === selectedRegion);
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortField) {
        case "countyName":
          return dir * a.countyName.localeCompare(b.countyName);
        case "totalBudget":
          return dir * (a.current.totalBudget - b.current.totalBudget);
        case "developmentBudget":
          return dir * (a.current.developmentBudget - b.current.developmentBudget);
        case "recurrentBudget":
          return dir * (a.current.recurrentBudget - b.current.recurrentBudget);
        case "devAbsorptionRate":
          return dir * (a.current.devAbsorptionRate - b.current.devAbsorptionRate);
        case "recurrentAbsorptionRate":
          return dir * (a.current.recurrentAbsorptionRate - b.current.recurrentAbsorptionRate);
        case "ownSourceRevenue":
          return dir * (a.current.ownSourceRevenue - b.current.ownSourceRevenue);
        case "pendingBills":
          return dir * (a.current.pendingBills - b.current.pendingBills);
        case "budgetChange":
          return dir * (a.budgetChange - b.budgetChange);
        default:
          return 0;
      }
    });

    return list;
  }, [rows, search, selectedRegion, sortField, sortDir]);

  // Summary stats
  const totalBudgetAll = useMemo(
    () => rows.reduce((s, r) => s + r.current.totalBudget, 0),
    [rows],
  );
  const totalDevAll = useMemo(
    () => rows.reduce((s, r) => s + r.current.developmentBudget, 0),
    [rows],
  );
  const totalRecAll = useMemo(
    () => rows.reduce((s, r) => s + r.current.recurrentBudget, 0),
    [rows],
  );
  const totalPendingAll = useMemo(
    () => rows.reduce((s, r) => s + r.current.pendingBills, 0),
    [rows],
  );
  const totalOwnRevAll = useMemo(
    () => rows.reduce((s, r) => s + r.current.ownSourceRevenue, 0),
    [rows],
  );

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField],
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-emerald-500" />
    ) : (
      <ChevronDown className="h-3 w-3 text-emerald-500" />
    );
  };

  return (
    <div className="space-y-5">
      {/* ═══════════ HEADER ═══════════ */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              County Budget Allocations
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Money allocated from current &amp; previous financial years — Source: Controller of Budget (CoB)
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════ NATIONAL OVERVIEW CARDS ═══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Total Budget (FY 25/26)"
          value={`KSh ${totalBudgetAll.toFixed(1)}B`}
          sub={`${rows.length} counties`}
          color="emerald"
        />
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Development Budget"
          value={`KSh ${totalDevAll.toFixed(1)}B`}
          sub={`${((totalDevAll / totalBudgetAll) * 100).toFixed(0)}% of total`}
          color="blue"
        />
        <StatCard
          icon={<Landmark className="h-4 w-4" />}
          label="Recurrent Budget"
          value={`KSh ${totalRecAll.toFixed(1)}B`}
          sub={`${((totalRecAll / totalBudgetAll) * 100).toFixed(0)}% of total`}
          color="amber"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Own-Source Revenue"
          value={`KSh ${fmtM(totalOwnRevAll)}`}
          sub="County-generated"
          color="teal"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Pending Bills"
          value={`KSh ${fmtM(totalPendingAll)}`}
          sub="Outstanding"
          color="red"
        />
      </div>

      {/* ═══════════ FY COMPARISON PANEL ═══════════ */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            Year-over-Year Comparison
          </h3>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs text-stone-500 hover:text-emerald-600 transition-colors"
          >
            {showComparison ? "Hide" : "Show"} Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FY 2024/25 Card */}
          <div className="rounded-lg border border-stone-200 dark:border-stone-600 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                FY 2024/25
              </span>
              <span className="text-[10px] text-stone-400">Full Year</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-stone-500">Avg Dev Absorption</p>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {avgFY2425.avgDev}%
                </p>
              </div>
              <div>
                <p className="text-stone-500">Avg Recurrent Absorption</p>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {avgFY2425.avgRec}%
                </p>
              </div>
              <div>
                <p className="text-stone-500">Total Budget</p>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  KSh {avgFY2425.totalBudget.toFixed(1)}B
                </p>
              </div>
              <div>
                <p className="text-stone-500">Pending Bills</p>
                <p className="text-base font-bold text-red-600">
                  KSh {fmtM(avgFY2425.totalPendingBills)}
                </p>
              </div>
            </div>
          </div>

          {/* FY 2025/26 Card */}
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                FY 2025/26
              </span>
              <span className="text-[10px] text-stone-400">Half Year (H1)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-stone-500">Avg Dev Absorption (H1)</p>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {avgFY2526.avgDev}%
                </p>
              </div>
              <div>
                <p className="text-stone-500">Avg Recurrent Absorption (H1)</p>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {avgFY2526.avgRec}%
                </p>
              </div>
              <div>
                <p className="text-stone-500">Total Budget</p>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  KSh {avgFY2526.totalBudget.toFixed(1)}B
                </p>
              </div>
              <div>
                <p className="text-stone-500">Pending Bills</p>
                <p className="text-base font-bold text-red-600">
                  KSh {fmtM(avgFY2526.totalPendingBills)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showComparison && (
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <ComparisonMetric
                label="Budget Change"
                current={avgFY2526.totalBudget}
                previous={avgFY2425.totalBudget}
                fmt={(v) => `KSh ${v.toFixed(1)}B`}
              />
              <ComparisonMetric
                label="Dev Absorption Trend"
                current={avgFY2526.avgDev}
                previous={avgFY2425.avgDev}
                fmt={(v) => `${v}%`}
                note="H1 vs Full Year"
              />
              <ComparisonMetric
                label="Own-Source Revenue"
                current={avgFY2526.totalOwnRevenue}
                previous={avgFY2425.totalOwnRevenue}
                fmt={(v) => `KSh ${fmtM(v)}`}
              />
              <ComparisonMetric
                label="Pending Bills Change"
                current={avgFY2526.totalPendingBills}
                previous={avgFY2425.totalPendingBills}
                fmt={(v) => `KSh ${fmtM(v)}`}
                invertTrend
              />
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ SEARCH & FILTER ═══════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search county, governor, or region..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="h-9 pl-9 pr-8 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="All">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* ═══════════ TABLE ═══════════ */}
      <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50">
                <th className="text-left py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 sticky left-0 bg-stone-50 dark:bg-stone-900/50 z-10 min-w-[140px]">
                  <button onClick={() => handleSort("countyName")} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                    County <SortIcon field="countyName" />
                  </button>
                </th>
                <th className="text-left py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 hidden md:table-cell">
                  Governor
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300">
                  <button onClick={() => handleSort("totalBudget")} className="flex items-center gap-1 ml-auto hover:text-emerald-600 transition-colors">
                    Total Budget <SortIcon field="totalBudget" />
                  </button>
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 hidden lg:table-cell">
                  <button onClick={() => handleSort("developmentBudget")} className="flex items-center gap-1 ml-auto hover:text-emerald-600 transition-colors">
                    Dev Budget <SortIcon field="developmentBudget" />
                  </button>
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 hidden lg:table-cell">
                  <button onClick={() => handleSort("recurrentBudget")} className="flex items-center gap-1 ml-auto hover:text-emerald-600 transition-colors">
                    Recurrent <SortIcon field="recurrentBudget" />
                  </button>
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300">
                  <button onClick={() => handleSort("devAbsorptionRate")} className="flex items-center gap-1 mx-auto hover:text-emerald-600 transition-colors">
                    Dev Absorption <SortIcon field="devAbsorptionRate" />
                  </button>
                </th>
                <th className="text-center py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 hidden md:table-cell">
                  <button onClick={() => handleSort("recurrentAbsorptionRate")} className="flex items-center gap-1 mx-auto hover:text-emerald-600 transition-colors">
                    Rec Absorption <SortIcon field="recurrentAbsorptionRate" />
                  </button>
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 hidden xl:table-cell">
                  <button onClick={() => handleSort("ownSourceRevenue")} className="flex items-center gap-1 ml-auto hover:text-emerald-600 transition-colors">
                    Own Revenue <SortIcon field="ownSourceRevenue" />
                  </button>
                </th>
                <th className="text-right py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 hidden xl:table-cell">
                  <button onClick={() => handleSort("pendingBills")} className="flex items-center gap-1 ml-auto hover:text-emerald-600 transition-colors">
                    Pending Bills <SortIcon field="pendingBills" />
                  </button>
                </th>
                {showComparison && (
                  <th className="text-center py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 hidden md:table-cell">
                    <button onClick={() => handleSort("budgetChange")} className="flex items-center gap-1 mx-auto hover:text-emerald-600 transition-colors">
                      YoY Change <SortIcon field="budgetChange" />
                    </button>
                  </th>
                )}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isExpanded = expandedCounty === row.countyCode;
                const cur = row.current;
                const prev = row.previous;
                const isH1 = cur.period === "Half Year";

                return (
                  <Fragment key={row.countyCode}>
                    <tr
                      className={`border-b border-stone-100 dark:border-stone-700/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 cursor-pointer transition-colors ${
                        isExpanded ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""
                      }`}
                      onClick={() => setExpandedCounty(isExpanded ? null : row.countyCode)}
                    >
                      <td className="py-2.5 px-3 sticky left-0 bg-white dark:bg-stone-800 z-10">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {row.countyName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hidden sm:inline">
                            {row.countyCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400">{row.region}</span>
                      </td>
                      <td className="py-2.5 px-3 hidden md:table-cell text-stone-600 dark:text-stone-400">
                        {row.governor}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-stone-900 dark:text-stone-100">
                        KSh {fmtB(cur.totalBudget)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-700 dark:text-stone-300 hidden lg:table-cell">
                        KSh {fmtB(cur.developmentBudget)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-700 dark:text-stone-300 hidden lg:table-cell">
                        KSh {fmtB(cur.recurrentBudget)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <AbsorptionBadge rate={cur.devAbsorptionRate} isH1={isH1} />
                      </td>
                      <td className="py-2.5 px-3 text-center hidden md:table-cell">
                        <AbsorptionBadge rate={cur.recurrentAbsorptionRate} isH1={isH1} />
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-700 dark:text-stone-300 hidden xl:table-cell">
                        KSh {fmtM(cur.ownSourceRevenue)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-red-600 dark:text-red-400 font-medium hidden xl:table-cell">
                        KSh {fmtM(cur.pendingBills)}
                      </td>
                      {showComparison && (
                        <td className="py-2.5 px-3 text-center hidden md:table-cell">
                          {prev ? (
                            <span className="inline-flex items-center gap-1 text-xs">
                              {changeIcon(row.budgetChange)}
                              <span
                                className={
                                  row.budgetChange > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : row.budgetChange < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-stone-400"
                                }
                              >
                                {Math.abs(row.budgetChange).toFixed(1)}%
                              </span>
                            </span>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>
                      )}
                      <td className="py-2.5 px-1">
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-stone-400" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
                        )}
                      </td>
                    </tr>

                    {/* ═══════════ EXPANDED ROW ═══════════ */}
                    {isExpanded && (
                      <tr className="bg-stone-50 dark:bg-stone-900/30">
                        <td colSpan={showComparison ? 10 : 9} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current FY Details */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                                  {cur.financialYear}
                                </span>
                                <span className="text-[10px] text-stone-400">{cur.period}</span>
                              </div>

                              {/* Budget Breakdown Bar */}
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                                    <span>Development ({fmtB(cur.developmentBudget)})</span>
                                    <span>{((cur.developmentBudget / cur.totalBudget) * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-blue-500 transition-all"
                                      style={{ width: `${(cur.developmentBudget / cur.totalBudget) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                                    <span>Recurrent ({fmtB(cur.recurrentBudget)})</span>
                                    <span>{((cur.recurrentBudget / cur.totalBudget) * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-amber-500 transition-all"
                                      style={{ width: `${(cur.recurrentBudget / cur.totalBudget) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Absorption Gauges */}
                              <div className="grid grid-cols-2 gap-3">
                                <GaugeCircle label="Dev Absorption" rate={cur.devAbsorptionRate} isH1={isH1} />
                                <GaugeCircle label="Rec Absorption" rate={cur.recurrentAbsorptionRate} isH1={isH1} />
                              </div>

                              {/* Revenue & Bills */}
                              <div className="grid grid-cols-2 gap-3 rounded-lg border border-stone-200 dark:border-stone-700 p-3">
                                <div>
                                  <p className="text-[10px] text-stone-500">Own-Source Revenue</p>
                                  <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                    KSh {fmtM(cur.ownSourceRevenue)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-stone-500">Pending Bills</p>
                                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                    KSh {fmtM(cur.pendingBills)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Previous FY Details */}
                            {prev && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                                    {prev.financialYear}
                                  </span>
                                  <span className="text-[10px] text-stone-400">{prev.period}</span>
                                </div>

                                {/* Budget Breakdown Bar */}
                                <div className="space-y-2">
                                  <div>
                                    <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                                      <span>Development ({fmtB(prev.developmentBudget)})</span>
                                      <span>{((prev.developmentBudget / prev.totalBudget) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-blue-400 transition-all"
                                        style={{ width: `${(prev.developmentBudget / prev.totalBudget) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                                      <span>Recurrent ({fmtB(prev.recurrentBudget)})</span>
                                      <span>{((prev.recurrentBudget / prev.totalBudget) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-amber-400 transition-all"
                                        style={{ width: `${(prev.recurrentBudget / prev.totalBudget) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Absorption Gauges */}
                                <div className="grid grid-cols-2 gap-3">
                                  <GaugeCircle label="Dev Absorption" rate={prev.devAbsorptionRate} />
                                  <GaugeCircle label="Rec Absorption" rate={prev.recurrentAbsorptionRate} />
                                </div>

                                {/* Revenue & Bills */}
                                <div className="grid grid-cols-2 gap-3 rounded-lg border border-stone-200 dark:border-stone-700 p-3">
                                  <div>
                                    <p className="text-[10px] text-stone-500">Own-Source Revenue</p>
                                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                      KSh {fmtM(prev.ownSourceRevenue)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-stone-500">Pending Bills</p>
                                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                      KSh {fmtM(prev.pendingBills)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Source citation */}
                          <div className="mt-3 flex items-start gap-1.5 text-[10px] text-stone-400">
                            <Info className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>
                              Source: {cur.source.source} — {cur.source.reportTitle}. Accessed {cur.source.accessedDate}.
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 dark:border-stone-700 px-4 py-2.5 flex items-center justify-between text-[10px] text-stone-400">
          <span>{filtered.length} of {rows.length} counties</span>
          <span>Data: CoB County Budget Implementation Review Reports</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    teal: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400",
    red: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-3">
      <div className={`inline-flex items-center justify-center h-7 w-7 rounded-lg mb-2 ${colorMap[color] ?? colorMap.emerald}`}>
        {icon}
      </div>
      <p className="text-[10px] text-stone-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-[10px] text-stone-400">{sub}</p>
    </div>
  );
}

function AbsorptionBadge({ rate, isH1 }: { rate: number; isH1?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-1.5 w-6 rounded-full ${absorptionBg(rate)}`}
        style={{ width: `${Math.max(rate, 4)}px`, minWidth: "4px", maxWidth: "40px" }}
      />
      <span className={`text-xs font-medium ${absorptionColor(rate)}`}>
        {rate}%
        {isH1 && <span className="text-[9px] text-stone-400 ml-0.5">H1</span>}
      </span>
    </span>
  );
}

function GaugeCircle({ label, rate, isH1 }: { label: string; rate: number; isH1?: boolean }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-stone-200 dark:text-stone-700" />
        <circle
          cx="26"
          cy="26"
          r="18"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 26 26)"
          className={absorptionColor(rate).replace("text-", "stroke-").replace("dark:", "dark:")}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="26" y="28" textAnchor="middle" className="fill-stone-900 dark:fill-stone-100" fontSize="11" fontWeight="bold">
          {rate}
        </text>
        <text x="26" y="35" textAnchor="middle" className="fill-stone-400" fontSize="6">
          %
        </text>
      </svg>
      <span className="text-[10px] text-stone-500">
        {label}
        {isH1 && <span className="text-stone-400"> (H1)</span>}
      </span>
    </div>
  );
}

function ComparisonMetric({
  label,
  current,
  previous,
  fmt,
  note,
  invertTrend,
}: {
  label: string;
  current: number;
  previous: number;
  fmt: (v: number) => string;
  note?: string;
  invertTrend?: boolean;
}) {
  const change = previous ? ((current - previous) / previous) * 100 : 0;
  const isPositive = invertTrend ? change < 0 : change > 0;
  const isNegative = invertTrend ? change > 0 : change < 0;

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700 p-2.5">
      <p className="text-[10px] text-stone-500 mb-1">{label}</p>
      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
        {fmt(current)}
      </p>
      <div className="flex items-center gap-1 mt-1">
        {change > 0 ? (
          <TrendingUp className="h-3 w-3 text-emerald-500" />
        ) : change < 0 ? (
          <TrendingDown className="h-3 w-3 text-red-500" />
        ) : (
          <Minus className="h-3 w-3 text-stone-400" />
        )}
        <span
          className={`text-[10px] font-medium ${
            isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : isNegative
                ? "text-red-600 dark:text-red-400"
                : "text-stone-400"
          }`}
        >
          {Math.abs(change).toFixed(1)}% vs prev
        </span>
      </div>
      {note && <p className="text-[9px] text-stone-400 mt-0.5">{note}</p>}
    </div>
  );
}
