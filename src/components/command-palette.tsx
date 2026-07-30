"use client"

import * as React from "react"
import { forwardRef, useImperativeHandle, useState, useCallback, useEffect } from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command"
import {
  BarChart3,
  Eye,
  Hand,
  FolderSearch,
  Zap,
  Network,
  LayoutDashboard,
  TreePine,
  Map,
  MapPin,
  GitCompareArrows,
  Flame,
  Database,
  FileJson,
  Clock,
  Calculator,
  ScrollText,
  Megaphone,
  Send,
  BookOpen,
  MessageSquare,
  FileText,
  PenTool,
  Star,
  ShoppingCart,
  Award,
  HelpCircle,
  Users,
  Building2,
  Radio,
  TrendingUp,
  ScatterChart,
  Layers,
  Truck,
  AlertTriangle,
  Code2,
  UserCircle,
  FolderKanban,
  UserCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  onNavigate: (tabId: string) => void
}

interface CommandPaletteHandle {
  open: () => void
  close: () => void
}

// ─── Data ────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

interface NavSection {
  heading: string
  icon: LucideIcon
  items: NavItem[]
}

const SECTIONS: NavSection[] = [
  {
    heading: "Governance",
    icon: BarChart3,
    items: [
      { id: "summary", label: "National Summary", icon: LayoutDashboard },
      { id: "tree", label: "47 Counties", icon: TreePine },
      { id: "countymap", label: "County Map", icon: Map },
      { id: "county", label: "County Deep-Dive", icon: MapPin },
      { id: "compare", label: "Compare", icon: GitCompareArrows },
      { id: "heatmap", label: "Risk Heatmap", icon: Flame },
      { id: "sources", label: "Sources Hub", icon: Database },
      { id: "schema", label: "JSON Schema", icon: FileJson },
      { id: "timeline", label: "Timeline", icon: Clock },
      { id: "budgetsim", label: "Budget Simulator", icon: Calculator },
      { id: "manifesto", label: "Manifesto Tracker", icon: ScrollText },
    ],
  },
  {
    heading: "Civic Tools",
    icon: Eye,
    items: [
      { id: "whistleblower", label: "Whistleblower", icon: Megaphone },
      { id: "tiptsubmit", label: "Submit Tip", icon: Send },
      { id: "constitution", label: "Constitution", icon: BookOpen },
      { id: "xposts", label: "Political X Posts", icon: MessageSquare },
    ],
  },
  {
    heading: "Citizen Action",
    icon: Hand,
    items: [
      { id: "rti", label: "RTI Generator", icon: FileText },
      { id: "petition", label: "Petition Builder", icon: PenTool },
      { id: "feedback", label: "Rate Services", icon: Star },
      { id: "procurement", label: "Procurement Watch", icon: ShoppingCart },
      { id: "reportcard", label: "Report Card", icon: Award },
      { id: "quiz", label: "Devolution Quiz", icon: HelpCircle },
      { id: "stories", label: "Experience Stories", icon: Users },
      { id: "cbef", label: "CBEF Meetings", icon: Building2 },
    ],
  },
  {
    heading: "Data & Alerts",
    icon: FolderSearch,
    items: [
      { id: "datafetcher", label: "Live Data", icon: Radio },
      { id: "alerts", label: "Alerts", icon: AlertTriangle },
    ],
  },
  {
    heading: "Analytics",
    icon: Zap,
    items: [
      { id: "audittrends", label: "Audit Trends", icon: TrendingUp },
      { id: "budgetscatter", label: "Budget Scatter", icon: ScatterChart },
      { id: "coalition", label: "Coalition Compare", icon: Layers },
      { id: "servicedelivery", label: "Service Delivery", icon: Truck },
      { id: "redflags", label: "Red Flags", icon: AlertTriangle },
      { id: "embed", label: "Embed Widgets", icon: Code2 },
    ],
  },
  {
    heading: "Leadership & Projects",
    icon: Network,
    items: [
      { id: "leadership", label: "Leadership Tree", icon: UserCircle },
      { id: "projects", label: "Projects & Audits", icon: FolderKanban },
      { id: "mzalendo", label: "Mzalendo Profiles", icon: UserCheck },
      { id: "securetip", label: "Secure Whistleblower", icon: ShieldCheck },
    ],
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

const CommandPalette = forwardRef<CommandPaletteHandle, CommandPaletteProps>(
  function CommandPalette({ onNavigate }, ref) {
    const [open, setOpen] = useState(false)

    // ── Expose open / close via ref ─────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }))

    // ── Ctrl+K / ⌘K global shortcut ────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault()
          setOpen((prev) => !prev)
        }
        if (e.key === "Escape" && open) {
          setOpen(false)
        }
      },
      [open],
    )

    useEffect(() => {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

    // ── Item click handler ──────────────────────────────────────────────────
    const handleSelect = useCallback(
      (tabId: string) => {
        setOpen(false)
        onNavigate(tabId)
      },
      [onNavigate],
    )

    // ── Render ──────────────────────────────────────────────────────────────
    return (
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Navigate"
        description="Search pages and tools across Kenya Governance Explorer"
        className="sm:max-w-[560px]"
      >
        <CommandInput placeholder="Search pages, tools & analytics…" />
        <CommandList className="max-h-[420px]">
          <CommandEmpty className="py-8">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FolderSearch className="h-8 w-8 opacity-40" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs opacity-70">
                Try a different search term or browse the sections below.
              </p>
            </div>
          </CommandEmpty>

          {SECTIONS.map((section) => (
            <CommandGroup
              key={section.heading}
              heading={
                <span className="flex items-center gap-1.5">
                  <section.icon className="h-3.5 w-3.5" />
                  {section.heading}
                </span>
              }
            >
              {section.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.id} ${section.heading}`}
                  onSelect={() => handleSelect(item.id)}
                  className="gap-3"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <CommandShortcut className="text-[10px] tracking-wider">
                    {item.id}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {/* Footer hint */}
          <div className="border-t px-2 py-1.5">
            <p className="text-[11px] text-muted-foreground text-center">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>{" "}
              to toggle · <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">↑↓</kbd> to navigate · <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">↵</kbd> to select
            </p>
          </div>
        </CommandList>
      </CommandDialog>
    )
  },
)

CommandPalette.displayName = "CommandPalette"

export default CommandPalette
