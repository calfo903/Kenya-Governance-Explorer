"use client";

import { useState, useCallback, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { useTheme } from "next-themes";
import { MapPin, Users, FileWarning, Wallet, TrendingUp, Landmark, Info, ZoomIn, ZoomOut, Maximize2, Award } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { all47Governors } from "@/data/governors";
import { countyAuditData, getCountyAuditRecords } from "@/data/county-audit-data";
import { countyBudgetData, getCountyBudget } from "@/data/county-budget-data";
import { REGIONS } from "@/data/types";
import { COALITIONS, AUDIT_OPINIONS } from "@/data/types";
import { getCECMPerformanceScores, getCECMScoreColor } from "@/data/cecm-performance";

// ─── SVG Path Data ──────────────────────────────────────────────────

export interface CountyShape {
  name: string;
  code: string;
  path: string;
  cx: number;
  cy: number;
}

export const kenyaCountyPaths: CountyShape[] = [
  // COAST REGION
  { name: "Mombasa", code: "001", path: "M 520 720 L 535 718 L 542 725 L 540 735 L 530 738 L 522 732 L 518 725 Z", cx: 530, cy: 728 },
  { name: "Kwale", code: "002", path: "M 520 720 L 518 725 L 522 732 L 530 738 L 528 755 L 535 770 L 545 760 L 548 745 L 542 725 L 535 718 Z", cx: 532, cy: 742 },
  { name: "Kilifi", code: "003", path: "M 535 718 L 542 725 L 548 745 L 545 760 L 535 770 L 520 778 L 500 772 L 488 758 L 492 740 L 505 728 L 518 725 L 520 720 Z", cx: 518, cy: 745 },
  { name: "Tana River", code: "004", path: "M 535 770 L 528 755 L 530 738 L 545 760 L 560 770 L 590 782 L 610 800 L 598 815 L 570 808 L 545 798 L 520 788 L 505 778 L 500 772 L 520 778 Z", cx: 558, cy: 786 },
  { name: "Lamu", code: "005", path: "M 610 800 L 590 782 L 605 775 L 628 782 L 642 798 L 635 815 L 618 820 L 610 810 Z", cx: 620, cy: 800 },
  { name: "Taita Taveta", code: "006", path: "M 505 778 L 520 788 L 518 810 L 495 825 L 468 820 L 455 800 L 462 785 L 478 775 L 488 758 L 500 772 Z", cx: 490, cy: 795 },

  // NORTH EASTERN
  { name: "Garissa", code: "007", path: "M 560 770 L 590 782 L 610 800 L 618 820 L 660 830 L 710 822 L 738 805 L 742 780 L 725 760 L 700 748 L 668 742 L 640 745 L 610 755 L 590 762 L 570 768 Z", cx: 668, cy: 782 },
  { name: "Wajir", code: "008", path: "M 725 760 L 742 780 L 780 772 L 818 768 L 838 785 L 828 810 L 795 822 L 760 825 L 738 815 L 710 822 L 660 830 L 618 820 L 610 800 L 635 815 L 642 798 L 628 782 L 640 745 L 668 742 L 700 748 Z", cx: 770, cy: 798 },
  { name: "Mandera", code: "009", path: "M 818 768 L 838 785 L 865 768 L 892 752 L 918 745 L 935 760 L 928 790 L 905 810 L 878 818 L 850 815 L 828 810 L 838 785 Z", cx: 878, cy: 790 },
  { name: "Marsabit", code: "010", path: "M 640 688 L 678 695 L 712 685 L 735 698 L 742 720 L 738 745 L 725 760 L 700 748 L 668 742 L 640 745 L 622 735 L 615 712 Z", cx: 678, cy: 718 },
  { name: "Isiolo", code: "011", path: "M 578 678 L 615 682 L 640 688 L 622 735 L 605 728 L 588 718 L 570 705 L 562 688 Z", cx: 600, cy: 702 },

  // EASTERN
  { name: "Meru", code: "012", path: "M 600 628 L 638 622 L 668 628 L 678 660 L 672 690 L 640 688 L 615 682 L 590 672 L 575 655 Z", cx: 632, cy: 660 },
  { name: "Tharaka Nithi", code: "013", path: "M 575 655 L 590 672 L 570 705 L 562 688 L 555 672 L 558 650 L 568 638 Z", cx: 567, cy: 662 },
  { name: "Embu", code: "014", path: "M 555 672 L 562 688 L 548 698 L 535 692 L 525 678 L 530 662 L 540 650 L 555 648 Z", cx: 543, cy: 672 },
  { name: "Kitui", code: "015", path: "M 535 692 L 548 698 L 562 688 L 570 705 L 588 718 L 605 728 L 615 745 L 605 760 L 588 755 L 570 748 L 555 770 L 535 765 L 510 755 L 488 742 L 468 820 L 455 800 L 462 785 L 478 775 L 495 760 L 510 740 L 520 718 L 530 705 L 540 698 L 535 692 Z", cx: 538, cy: 728 },
  { name: "Machakos", code: "016", path: "M 488 742 L 510 755 L 520 728 L 530 705 L 535 692 L 525 678 L 510 665 L 492 672 L 478 688 L 468 705 L 462 725 L 470 740 Z", cx: 502, cy: 702 },
  { name: "Makueni", code: "017", path: "M 468 725 L 462 705 L 478 688 L 492 672 L 510 665 L 520 718 L 510 740 L 495 760 L 468 820 L 455 840 L 438 828 L 432 805 L 440 780 L 448 758 L 458 740 Z", cx: 472, cy: 762 },

  // CENTRAL
  { name: "Nyandarua", code: "018", path: "M 468 578 L 498 572 L 522 578 L 530 602 L 518 622 L 498 630 L 478 625 L 462 610 L 458 592 Z", cx: 495, cy: 600 },
  { name: "Nyeri", code: "019", path: "M 498 572 L 528 565 L 552 572 L 560 598 L 555 622 L 540 635 L 525 628 L 518 622 L 530 602 L 522 578 Z", cx: 532, cy: 600 },
  { name: "Kirinyaga", code: "020", path: "M 525 628 L 540 635 L 555 640 L 558 660 L 548 672 L 535 668 L 525 655 L 520 638 Z", cx: 540, cy: 652 },
  { name: "Murang'a", code: "021", path: "M 498 630 L 518 622 L 525 628 L 535 668 L 525 655 L 520 638 L 510 632 Z", cx: 515, cy: 642 },
  { name: "Kiambu", code: "022", path: "M 448 608 L 468 618 L 468 578 L 478 625 L 498 630 L 510 632 L 505 648 L 492 655 L 478 648 L 468 638 L 458 625 L 448 618 Z", cx: 478, cy: 628 },

  // RIFT VALLEY
  { name: "Turkana", code: "023", path: "M 388 438 L 448 425 L 520 432 L 578 452 L 605 478 L 598 512 L 568 535 L 530 545 L 488 552 L 448 558 L 418 562 L 388 555 L 362 532 L 348 498 L 355 468 Z", cx: 478, cy: 492 },
  { name: "West Pokot", code: "024", path: "M 388 555 L 418 562 L 428 582 L 418 602 L 398 612 L 378 598 L 362 578 L 352 558 L 358 545 Z", cx: 388, cy: 578 },
  { name: "Samburu", code: "025", path: "M 530 545 L 568 535 L 598 512 L 612 538 L 618 565 L 605 585 L 582 595 L 560 585 L 545 572 L 530 562 Z", cx: 568, cy: 562 },
  { name: "Trans Nzoia", code: "026", path: "M 418 562 L 448 558 L 472 568 L 488 585 L 478 602 L 458 612 L 438 608 L 428 592 Z", cx: 455, cy: 588 },
  { name: "Uasin Gishu", code: "027", path: "M 458 612 L 478 602 L 488 585 L 505 585 L 522 598 L 518 618 L 498 628 L 478 630 L 468 618 L 458 612 Z", cx: 492, cy: 612 },
  { name: "Elgeyo Marakwet", code: "028", path: "M 488 558 L 510 565 L 505 585 L 488 585 L 478 575 Z", cx: 495, cy: 572 },
  { name: "Nandi", code: "029", path: "M 468 618 L 478 630 L 498 630 L 510 648 L 498 660 L 478 655 L 462 648 L 452 635 Z", cx: 482, cy: 640 },
  { name: "Baringo", code: "030", path: "M 530 545 L 560 585 L 582 595 L 605 585 L 618 605 L 618 628 L 605 645 L 582 650 L 560 642 L 545 655 L 530 648 L 522 635 L 530 612 L 540 595 L 545 572 L 560 585 Z", cx: 572, cy: 612 },
  { name: "Laikipia", code: "031", path: "M 530 545 L 530 562 L 545 572 L 560 585 L 540 595 L 530 612 L 522 635 L 510 632 L 505 615 L 498 598 L 510 585 L 505 585 L 522 598 L 530 578 L 530 562 Z", cx: 528, cy: 592 },
  { name: "Nakuru", code: "032", path: "M 452 635 L 462 648 L 478 655 L 498 660 L 510 648 L 525 655 L 535 672 L 525 692 L 510 695 L 492 688 L 478 678 L 462 668 L 452 652 Z", cx: 498, cy: 668 },
  { name: "Narok", code: "033", path: "M 488 742 L 492 688 L 510 695 L 525 692 L 535 692 L 540 698 L 548 698 L 562 688 L 570 705 L 605 728 L 588 755 L 570 748 L 555 770 L 535 765 L 510 755 L 495 760 L 488 755 Z", cx: 538, cy: 728 },
  { name: "Kajiado", code: "034", path: "M 432 805 L 455 840 L 468 820 L 488 842 L 495 860 L 488 878 L 468 882 L 448 875 L 432 858 L 420 838 L 418 818 Z", cx: 455, cy: 852 },
  { name: "Kericho", code: "035", path: "M 452 652 L 462 668 L 478 678 L 478 698 L 468 710 L 452 705 L 438 695 L 432 678 L 442 662 Z", cx: 458, cy: 682 },
  { name: "Bomet", code: "036", path: "M 438 695 L 452 705 L 468 710 L 488 742 L 468 748 L 452 745 L 438 735 L 428 718 L 432 702 Z", cx: 450, cy: 722 },

  // WESTERN
  { name: "Kakamega", code: "037", path: "M 338 558 L 368 552 L 398 565 L 428 578 L 418 602 L 398 612 L 378 622 L 358 628 L 338 618 L 322 600 L 320 578 Z", cx: 365, cy: 592 },
  { name: "Vihiga", code: "038", path: "M 338 618 L 358 628 L 372 638 L 370 652 L 355 658 L 340 652 L 328 640 L 322 628 L 325 618 Z", cx: 348, cy: 638 },
  { name: "Bungoma", code: "039", path: "M 288 548 L 318 545 L 338 555 L 338 578 L 332 600 L 328 618 L 325 618 L 322 628 L 310 635 L 298 625 L 282 608 L 275 588 L 278 568 Z", cx: 308, cy: 588 },
  { name: "Busia", code: "040", path: "M 325 618 L 322 628 L 328 640 L 340 652 L 355 658 L 362 672 L 348 682 L 332 678 L 318 668 L 305 652 L 298 638 L 302 622 L 310 635 Z", cx: 325, cy: 650 },

  // NYANZA
  { name: "Siaya", code: "041", path: "M 355 658 L 370 652 L 378 668 L 372 682 L 358 688 L 345 682 L 348 672 Z", cx: 362, cy: 672 },
  { name: "Kisumu", code: "042", path: "M 355 658 L 348 672 L 345 682 L 340 692 L 332 698 L 338 712 L 355 718 L 368 712 L 378 698 L 372 682 L 378 668 L 362 672 Z", cx: 355, cy: 692 },
  { name: "Homa Bay", code: "043", path: "M 378 668 L 372 652 L 388 642 L 402 658 L 402 678 L 392 692 L 378 698 L 368 712 L 355 718 L 348 688 L 358 688 L 372 682 Z", cx: 378, cy: 682 },
  { name: "Migori", code: "044", path: "M 355 718 L 368 712 L 378 698 L 392 692 L 402 705 L 412 722 L 398 738 L 378 742 L 358 735 L 348 722 L 345 715 Z", cx: 378, cy: 722 },
  { name: "Kisii", code: "045", path: "M 402 658 L 412 648 L 422 655 L 432 672 L 425 688 L 412 698 L 402 705 L 392 692 L 402 678 Z", cx: 415, cy: 678 },
  { name: "Nyamira", code: "046", path: "M 392 648 L 412 648 L 402 658 L 388 655 L 388 642 L 395 638 Z", cx: 400, cy: 648 },

  // NAIROBI
  { name: "Nairobi City", code: "047", path: "M 462 668 L 478 678 L 478 655 L 492 655 L 505 648 L 510 665 L 498 672 L 488 678 L 468 672 Z", cx: 488, cy: 665 },
];

// ─── Types ──────────────────────────────────────────────────────────

type ColorMode = "coalition" | "region" | "audit" | "budget" | "population" | "cecm-performance";

type MiniColorMode = "coalition" | "region" | "audit";

export interface KenyaCountyMapHandle {
  zoomToCounty: (code: string) => void;
}

interface KenyaCountyMapProps {
  colorMode?: ColorMode;
  onCountyClick?: (countyCode: string, countyName: string) => void;
  onCountyHover?: (countyCode: string | null) => void;
  highlightedCounties?: string[];
  selectedCounties?: string[];
  financialYear?: string;
  className?: string;
  showLabels?: boolean;
  animated?: boolean;
}

interface KenyaMiniMapProps {
  colorMode?: MiniColorMode;
  onCountyClick?: (countyCode: string) => void;
  highlightedCounties?: string[];
  className?: string;
}

// ─── Color Schemes ──────────────────────────────────────────────────

const COALITION_COLORS: Record<string, string> = {
  [COALITIONS.KENYA_KWANZA]: "#1e40af",
  [COALITIONS.AZIMIO]: "#15803d",
  [COALITIONS.INDEPENDENT]: "#78716c",
};

const REGION_COLORS: Record<string, string> = {
  Coast: "#0d9488",
  "North Eastern": "#d97706",
  Eastern: "#7c3aed",
  Central: "#2563eb",
  "Rift Valley": "#16a34a",
  Western: "#db2777",
  Nyanza: "#ea580c",
  Nairobi: "#dc2626",
};

const AUDIT_COLORS: Record<string, string> = {
  [AUDIT_OPINIONS.UNMODIFIED]: "#16a34a",
  [AUDIT_OPINIONS.QUALIFIED]: "#eab308",
  [AUDIT_OPINIONS.ADVERSE]: "#ea580c",
  [AUDIT_OPINIONS.DISCLAIMER]: "#dc2626",
};

const DEFAULT_FILL = "#94a3b8";

// ─── Helper: interpolate color from red to green ────────────────────

function lerpColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(220 * (1 - clamped) + 22 * clamped);
  const g = Math.round(38 * (1 - clamped) + 163 * clamped);
  const b = Math.round(38 * (1 - clamped) + 74 * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

// ─── Helper: population density color ───────────────────────────────

function densityColor(pop: number, area: number): string {
  const density = pop / area;
  if (density > 2000) return "#7f1d1d";
  if (density > 1000) return "#991b1b";
  if (density > 500) return "#b91c1c";
  if (density > 200) return "#c2410c";
  if (density > 100) return "#ea580c";
  if (density > 50) return "#f59e0b";
  if (density > 20) return "#fbbf24";
  return "#fef08a";
}

// ─── Lookup maps built once via useMemo ─────────────────────────────

function buildGovernorMap() {
  const m: Record<string, (typeof all47Governors)[number]> = {};
  for (const g of all47Governors) m[g.code] = g;
  return m;
}

function buildAuditMap(fy?: string) {
  const m: Record<string, (typeof countyAuditData)[number]> = {};
  for (const r of countyAuditData) {
    if (fy) {
      // Filter to specific financial year
      if (r.financialYear === fy) {
        m[r.countyCode] = r;
      }
    } else {
      // Pick latest
      if (!m[r.countyCode] || r.financialYear > m[r.countyCode].financialYear) {
        m[r.countyCode] = r;
      }
    }
  }
  return m;
}

function buildBudgetAbsorptionMap(fy?: string) {
  const m: Record<string, number> = {};
  if (fy) {
    // Filter to specific financial year, prefer full year records
    for (const r of countyBudgetData) {
      if (r.financialYear === fy && r.period === "Full Year") {
        m[r.countyCode] = r.devAbsorptionRate;
      }
    }
    // Fall back to any record in that FY if no full year record
    for (const r of countyBudgetData) {
      if (r.financialYear === fy && !m[r.countyCode]) {
        m[r.countyCode] = r.devAbsorptionRate;
      }
    }
  } else {
    // Default: pick FY 2024/25 full year records
    for (const r of countyBudgetData) {
      if (!m[r.countyCode] || r.financialYear > "FY 2024/24") {
        m[r.countyCode] = r.devAbsorptionRate;
      }
    }
    // Ensure we pick the FY 2024/25 full year records
    for (const r of countyBudgetData) {
      if (r.financialYear === "FY 2024/25" && r.period === "Full Year") {
        m[r.countyCode] = r.devAbsorptionRate;
      }
    }
  }
  return m;
}

// ─── Kenya country outline path ─────────────────────────────────────

const KENYA_OUTLINE =
  "M 275 588 L 278 568 L 288 548 L 318 545 L 338 555 L 358 545 L 362 532 L 348 498 " +
  "L 355 468 L 388 438 L 448 425 L 520 432 L 578 452 L 605 478 L 598 512 " +
  "L 612 538 L 618 565 L 618 628 L 640 688 L 678 695 L 712 685 L 735 698 " +
  "L 742 720 L 742 780 L 780 772 L 818 768 L 865 768 L 892 752 L 918 745 " +
  "L 935 760 L 928 790 L 905 810 L 878 818 L 850 815 L 828 810 L 795 822 " +
  "L 760 825 L 738 815 L 660 830 L 618 820 L 598 815 L 570 808 L 545 798 " +
  "L 520 788 L 518 810 L 495 825 L 468 820 L 455 800 L 462 785 L 448 758 " +
  "L 440 780 L 432 805 L 418 818 L 420 838 L 432 858 L 448 875 L 468 882 " +
  "L 488 878 Z";

// ─── Legend Config ───────────────────────────────────────────────────

interface LegendItem {
  color: string;
  label: string;
}

function getLegendItems(mode: ColorMode): LegendItem[] {
  switch (mode) {
    case "coalition":
      return [
        { color: COALITION_COLORS[COALITIONS.KENYA_KWANZA], label: "Kenya Kwanza" },
        { color: COALITION_COLORS[COALITIONS.AZIMIO], label: "Azimio" },
        { color: COALITION_COLORS[COALITIONS.INDEPENDENT], label: "Independent" },
      ];
    case "region":
      return REGIONS.map((r) => ({ color: REGION_COLORS[r], label: r }));
    case "audit":
      return [
        { color: AUDIT_COLORS[AUDIT_OPINIONS.UNMODIFIED], label: "Unmodified" },
        { color: AUDIT_COLORS[AUDIT_OPINIONS.QUALIFIED], label: "Qualified" },
        { color: AUDIT_COLORS[AUDIT_OPINIONS.ADVERSE], label: "Adverse" },
        { color: AUDIT_COLORS[AUDIT_OPINIONS.DISCLAIMER], label: "Disclaimer" },
      ];
    case "budget":
      return [
        { color: lerpColor(0), label: "Low (<30%)" },
        { color: lerpColor(0.33), label: "Medium (30-60%)" },
        { color: lerpColor(0.66), label: "Good (60-80%)" },
        { color: lerpColor(1), label: "High (>80%)" },
      ];
    case "cecm-performance":
      return [
        { color: "#047857", label: "High (80-100)" },
        { color: "#059669", label: "Good (60-79)" },
        { color: "#d97706", label: "Average (40-59)" },
        { color: "#ea580c", label: "Below Avg (20-39)" },
        { color: "#dc2626", label: "Poor (0-19)" },
      ];
    case "population":
      return [
        { color: "#fef08a", label: "<20/km²" },
        { color: "#fbbf24", label: "20-100/km²" },
        { color: "#ea580c", label: "100-500/km²" },
        { color: "#b91c1c", label: "500-1000/km²" },
        { color: "#7f1d1d", label: ">1000/km²" },
      ];
  }
}

// ─── Counties with area too small for labels ────────────────────────

const SMALL_COUNTY_CODES = new Set([
  "001", "005", "028", "041", "046", "047",
]);

// ─── Tooltip Component ──────────────────────────────────────────────

interface TooltipData {
  countyName: string;
  countyCode: string;
  governor: string;
  party: string;
  coalition: string;
  region: string;
  population: number;
  auditOpinion: string | null;
  budgetAbsorption: number | null;
  totalBudget: number | null;
  cecmScore: number | null;
  cecmLabel: string | null;
}

function getAuditBadgeColor(opinion: string | null): string {
  switch (opinion) {
    case AUDIT_OPINIONS.UNMODIFIED: return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
    case AUDIT_OPINIONS.QUALIFIED: return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
    case AUDIT_OPINIONS.ADVERSE: return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700";
    case AUDIT_OPINIONS.DISCLAIMER: return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600";
  }
}

function getBudgetBarColor(rate: number | null): string {
  if (rate == null) return "bg-gray-300";
  if (rate >= 70) return "bg-green-500";
  if (rate >= 50) return "bg-yellow-500";
  if (rate >= 30) return "bg-orange-500";
  return "bg-red-500";
}

function MapTooltip({ data, x, y }: { data: TooltipData; x: number; y: number }) {
  const popFormatted = data.population.toLocaleString();
  const auditBadgeClass = getAuditBadgeColor(data.auditOpinion);
  const barColor = getBudgetBarColor(data.budgetAbsorption);
  const cecmScoreColor = data.cecmScore != null ? getCECMScoreColor(data.cecmScore) : null;

  return (
    <div
      className="pointer-events-none absolute z-50 w-72 rounded-lg border border-border bg-background p-3 shadow-xl"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{data.countyName}</span>
        </div>
        <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none">
          {data.region}
        </span>
      </div>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Landmark className="h-3 w-3 shrink-0" />
          <span className="truncate">
            <span className="font-medium text-foreground">{data.governor}</span>
            <span className="ml-1 text-muted-foreground">({data.party})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 shrink-0" />
          <span>Pop: {popFormatted}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileWarning className="h-3 w-3 shrink-0" />
          <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none ${auditBadgeClass}`}>
            {data.auditOpinion ?? "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-3 w-3 shrink-0" />
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span>Absorption: {data.budgetAbsorption != null ? `${data.budgetAbsorption}%` : "N/A"}</span>
              {data.totalBudget != null && (
                <span className="text-muted-foreground">
                  Budget: KSh {data.totalBudget.toFixed(1)}B
                </span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${data.budgetAbsorption ?? 0}%` }}
              />
            </div>
          </div>
        </div>
        {data.cecmScore != null && (
          <div className="flex items-center gap-2">
            <Award className="h-3 w-3 shrink-0" />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span>CECM Score: {data.cecmScore}/100</span>
                {data.cecmLabel && (
                  <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none`} style={{ borderColor: cecmScoreColor, color: cecmScoreColor, backgroundColor: cecmScoreColor ? `${cecmScoreColor}18` : undefined }}>
                    {data.cecmLabel}
                  </span>
                )}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${data.cecmScore}%`, backgroundColor: cecmScoreColor ?? '#9ca3af' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── County color resolver ──────────────────────────────────────────

function resolveCountyFill(
  code: string,
  mode: ColorMode,
  govMap: Record<string, (typeof all47Governors)[number]>,
  auditMap: Record<string, (typeof countyAuditData)[number]>,
  budgetMap: Record<string, number>,
  cecmScoreMap: Map<string, { overallScore: number }>,
): string {
  switch (mode) {
    case "coalition": {
      const gov = govMap[code];
      return gov ? (COALITION_COLORS[gov.coalition] ?? DEFAULT_FILL) : DEFAULT_FILL;
    }
    case "region": {
      const gov = govMap[code];
      return gov ? (REGION_COLORS[gov.region] ?? DEFAULT_FILL) : DEFAULT_FILL;
    }
    case "audit": {
      const audit = auditMap[code];
      if (!audit || !audit.executiveOpinion) return DEFAULT_FILL;
      return AUDIT_COLORS[audit.executiveOpinion] ?? DEFAULT_FILL;
    }
    case "budget": {
      const rate = budgetMap[code];
      if (rate == null) return DEFAULT_FILL;
      return lerpColor(rate / 100);
    }
    case "cecm-performance": {
      const scoreEntry = cecmScoreMap.get(code);
      if (!scoreEntry) return DEFAULT_FILL;
      return getCECMScoreColor(scoreEntry.overallScore);
    }
    case "population": {
      const gov = govMap[code];
      if (!gov) return DEFAULT_FILL;
      return densityColor(gov.population, gov.areaSqKm);
    }
    default:
      return DEFAULT_FILL;
  }
}

// ─── Main Map Component ─────────────────────────────────────────────

const KenyaCountyMapInner = forwardRef<KenyaCountyMapHandle, KenyaCountyMapProps>(
  function KenyaCountyMapInner(
    {
      colorMode = "region",
      onCountyClick,
      onCountyHover,
      highlightedCounties = [],
      selectedCounties = [],
      financialYear = "FY 2024/25",
      className = "",
      showLabels = true,
      animated = true,
    },
    ref,
  ) {
    const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
    const transformRef = useRef<React.ComponentRef<typeof TransformWrapper>>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    // Dark-aware SVG style strings
    const svgStyle = useMemo(() => {
      const countyStroke = isDark ? "#292524" : "#ffffff";
      const hoverStroke = isDark ? "#e7e5e4" : "#0f172a";
      const labelFill = isDark ? "#e7e5e4" : "#0f172a";
      const labelSmallFill = isDark ? "#a8a29e" : "#334155";
      return `
        .county-path {
          stroke: ${countyStroke};
          stroke-width: 1.2;
          cursor: pointer;
          transition: fill 0.6s ease, stroke-width 0.2s ease, filter 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
          transform-origin: center;
        }
        .county-path:hover {
          stroke-width: 2.5;
          stroke: ${hoverStroke};
          filter: url(#county-shadow);
          transform: scale(1.02);
        }
        .county-path:focus-visible {
          stroke-width: 2.5;
          stroke: #059669;
          outline: 2px solid #059669;
          outline-offset: 1px;
        }
        .county-path.highlighted {
          stroke-width: 2.5;
          stroke: ${hoverStroke};
        }
        .county-path.selected {
          stroke-width: 3;
          stroke: ${isDark ? "#d6d3d1" : "#1e293b"};
          filter: url(#selected-glow);
        }
        .county-label {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 9px;
          fill: ${labelFill};
          pointer-events: none;
          text-anchor: middle;
          dominant-baseline: central;
          font-weight: 500;
        }
        .county-label-small {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 7px;
          fill: ${labelSmallFill};
          pointer-events: none;
          text-anchor: middle;
          dominant-baseline: central;
          font-weight: 400;
        }
        @keyframes pulse-county {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .county-animated {
          animation: pulse-county 2s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(${isDark ? "214, 211, 209" : "30, 41, 59"}, 0.4)); }
          50% { filter: drop-shadow(0 0 6px rgba(${isDark ? "214, 211, 209" : "30, 41, 59"}, 0.7)); }
        }
        .county-selected-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `;
    }, [isDark]);

    const govMap = useMemo(() => buildGovernorMap(), []);
    const auditMap = useMemo(() => buildAuditMap(financialYear), [financialYear]);
    const budgetMap = useMemo(() => buildBudgetAbsorptionMap(financialYear), [financialYear]);
    const cecmScoreMap = useMemo(() => getCECMPerformanceScores(financialYear), [financialYear]);

    const legendItems = useMemo(() => getLegendItems(colorMode), [colorMode]);

    const zoomToCounty = useCallback(
      (code: string) => {
        const county = kenyaCountyPaths.find((c) => c.code === code);
        if (!county || !transformRef.current) return;
        const instance = transformRef.current;
        // We use zoomToElement or manual centering
        // Center on county cx, cy in the viewBox coordinate system
        const svgEl = containerRef.current?.querySelector("svg") as SVGSVGElement | null;
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect();
          // Map viewBox coordinates to pixel coordinates
          const scaleRatio = rect.width / 1000;
          const px = county.cx * scaleRatio;
          const py = county.cy * scaleRatio;
          // centerViewOnPoint expects container-relative pixel position
          instance.centerView(px, py, 3);
        }
      },
      [],
    );

    useImperativeHandle(ref, () => ({ zoomToCounty }), [zoomToCounty]);

    const handleMouseEnter = useCallback(
      (county: CountyShape, e: React.MouseEvent<SVGPathElement>) => {
        setHoveredCounty(county.code);
        onCountyHover?.(county.code);

        const gov = govMap[county.code];
        const audit = auditMap[county.code];
        const budget = getCountyBudget(county.code, financialYear);
        const cecmEntry = cecmScoreMap.get(county.code);

        // Position tooltip relative to the outermost container (not affected by zoom)
        const outerContainer = containerRef.current?.getBoundingClientRect();
        if (outerContainer) {
          setTooltipPos({
            x: e.clientX - outerContainer.left + 15,
            y: e.clientY - outerContainer.top - 10,
          });
        }

        setTooltipData({
          countyName: county.name,
          countyCode: county.code,
          governor: gov?.name ?? "N/A",
          party: gov?.party ?? "",
          coalition: gov?.coalition ?? "",
          region: gov?.region ?? "",
          population: gov?.population ?? 0,
          auditOpinion: audit?.executiveOpinion ?? null,
          budgetAbsorption: budget?.devAbsorptionRate ?? null,
          totalBudget: budget?.totalBudget ?? null,
          cecmScore: cecmEntry?.overallScore ?? null,
          cecmLabel: cecmEntry
            ? cecmEntry.overallScore >= 80
              ? 'High Performing'
              : cecmEntry.overallScore >= 60
                ? 'Good'
                : cecmEntry.overallScore >= 40
                  ? 'Average'
                  : cecmEntry.overallScore >= 20
                    ? 'Below Average'
                    : 'Poor'
            : null,
        });
      },
      [govMap, auditMap, financialYear, onCountyHover, cecmScoreMap],
    );

    const handleMouseLeave = useCallback(() => {
      setHoveredCounty(null);
      setTooltipData(null);
      onCountyHover?.(null);
    }, [onCountyHover]);

    const handleClick = useCallback(
      (county: CountyShape) => {
        onCountyClick?.(county.code, county.name);
      },
      [onCountyClick],
    );

    const handleKeyDown = useCallback(
      (county: CountyShape, e: React.KeyboardEvent<SVGPathElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(county);
        }
      },
      [handleClick],
    );

    const handleMiniKeyDown = useCallback(
      (county: CountyShape) => {
        onCountyClick?.(county.code);
      },
      [onCountyClick],
    );

    return (
      <div ref={containerRef} className={`relative w-full ${className}`}>
        {/* Tooltip — positioned absolutely within outermost container (not affected by zoom) */}
        {tooltipData && hoveredCounty && (
          <MapTooltip data={tooltipData} x={tooltipPos.x} y={tooltipPos.y} />
        )}

        {/* Zoom/pan wrapper */}
        <TransformWrapper
          ref={transformRef}
          initialScale={0.7}
          minScale={0.5}
          maxScale={5}
          centerOnInit={true}
        >
          {({ zoomIn, zoomOut, resetView }) => (
            <>
              <TransformComponent
                wrapperClass="!w-full !overflow-hidden"
                contentClass="!w-full"
              >
                {/* SVG Map */}
                <svg
                  viewBox="0 0 1000 1200"
                  className="w-full h-auto select-none"
                  style={{ maxHeight: '600px' }}
                  role="img"
                  aria-label="Interactive map of Kenya showing 47 counties. Use arrow keys to navigate, Enter or Space to select a county."
                >
                  <defs>
                    <filter id="county-shadow" x="-5%" y="-5%" width="110%" height="110%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.15" />
                    </filter>
                    <filter id="selected-glow" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <style>{svgStyle}</style>
                  </defs>

                  {/* Kenya outline border */}
                  <path
                    d={KENYA_OUTLINE}
                    fill="none"
                    stroke={isDark ? "#57534e" : "#1e293b"}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  {/* County shapes */}
                  {kenyaCountyPaths.map((county) => {
                    const fill = resolveCountyFill(
                      county.code,
                      colorMode,
                      govMap,
                      auditMap,
                      budgetMap,
                      cecmScoreMap,
                    );
                    const isHovered = hoveredCounty === county.code;
                    const isHighlighted = highlightedCounties.includes(county.code);
                    const isSelected = selectedCounties.includes(county.code);
                    const isSmall = SMALL_COUNTY_CODES.has(county.code);

                    return (
                      <g key={county.code}>
                        <path
                          d={county.path}
                          fill={fill}
                          className={[
                            "county-path",
                            isHighlighted ? "highlighted" : "",
                            isSelected ? "selected county-selected-glow" : "",
                            animated && isHighlighted ? "county-animated" : "",
                          ].join(" ")}
                          style={{
                            opacity: isHovered ? 0.85 : 1,
                          }}
                          onMouseEnter={(e) => handleMouseEnter(county, e)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleClick(county)}
                          onKeyDown={(e) => handleKeyDown(county, e)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${county.name} County`}
                        />
                        {showLabels && !isSmall && (
                          <text
                            x={county.cx}
                            y={county.cy}
                            className={isSmall ? "county-label-small" : "county-label"}
                          >
                            {county.name.length > 10
                              ? county.name.split(" ").map((w, i) => (
                                  <tspan
                                    key={i}
                                    x={county.cx}
                                    dy={i === 0 ? "-0.4em" : "1.1em"}
                                  >
                                    {w}
                                  </tspan>
                                ))
                              : county.name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </TransformComponent>

              {/* Zoom controls overlay — bottom-right */}
              <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors hover:bg-accent"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors hover:bg-accent"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => resetView()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors hover:bg-accent"
                  aria-label="Reset zoom"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </TransformWrapper>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span className="font-medium capitalize">
              {colorMode === "coalition"
                ? "Coalition"
                : colorMode === "region"
                  ? "Region"
                  : colorMode === "audit"
                    ? "Audit Opinion"
                    : colorMode === "budget"
                      ? "Budget Absorption"
                      : colorMode === "cecm-performance"
                        ? "CECM Performance"
                        : "Population Density"}
            </span>
          </div>
          {legendItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block h-3 w-3 rounded-sm border border-white/30 dark:border-stone-600 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

export { KenyaCountyMapInner as KenyaCountyMap };

// ─── Mini Map Component ─────────────────────────────────────────────

export function KenyaMiniMap({
  colorMode = "region",
  onCountyClick,
  highlightedCounties = [],
  className = "",
}: KenyaMiniMapProps) {
  const govMap = useMemo(() => buildGovernorMap(), []);
  const auditMap = useMemo(() => buildAuditMap(), []);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const miniSvgStyle = useMemo(() => {
    const countyStroke = isDark ? "#292524" : "#ffffff";
    const hoverStroke = isDark ? "#e7e5e4" : "#0f172a";
    return `
      .mini-county {
        stroke: ${countyStroke};
        stroke-width: 2;
        cursor: pointer;
        transition: opacity 0.15s ease, stroke-width 0.15s ease;
      }
      .mini-county:hover {
        opacity: 0.8;
        stroke-width: 3.5;
        stroke: ${hoverStroke};
      }
      .mini-county:focus-visible {
        stroke-width: 3.5;
        stroke: #059669;
        outline: 2px solid #059669;
        outline-offset: 1px;
      }
      .mini-county.highlighted {
        stroke-width: 3.5;
        stroke: ${hoverStroke};
      }
    `;
  }, [isDark]);

  const handleClick = useCallback(
    (county: CountyShape) => {
      onCountyClick?.(county.code);
    },
    [onCountyClick],
  );

  return (
    <div className={`relative ${className}`} style={{ width: 200, height: 240 }}>
      <svg
        viewBox="0 0 1000 1200"
        width="200"
        height="240"
        role="img"
        aria-label="Mini map of Kenya counties"
      >
        <defs>
          <style>{miniSvgStyle}</style>
        </defs>

        {/* Kenya outline */}
        <path
          d={KENYA_OUTLINE}
          fill="none"
          stroke={isDark ? "#57534e" : "#334155"}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {kenyaCountyPaths.map((county) => {
          const fill = resolveCountyFill(
            county.code,
            colorMode as ColorMode,
            govMap,
            auditMap,
            {},
            new Map(),
          );
          const isHighlighted = highlightedCounties.includes(county.code);

          return (
            <path
              key={county.code}
              d={county.path}
              fill={fill}
              className={["mini-county", isHighlighted ? "highlighted" : ""].join(" ")}
              onClick={() => handleClick(county)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(county);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${county.name} County`}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── Re-export types for convenience ────────────────────────────────

export type { KenyaCountyMapProps, KenyaMiniMapProps, ColorMode, MiniColorMode, KenyaCountyMapHandle };
