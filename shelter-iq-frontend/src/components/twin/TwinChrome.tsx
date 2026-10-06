import { Link } from "react-router-dom";
import {
  BarChart3,
  Cloud,
  FileText,
  Gauge,
  LayoutDashboard,
  Leaf,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Box,
  ArrowLeft,
} from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/format";

export type TwinSection = "dashboard" | "design" | "optimization" | "analytics";

const NAV_ITEMS: Array<{ id: TwinSection | "soon"; label: string; icon: typeof LayoutDashboard; section?: TwinSection }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
  { id: "design", label: "Shelter Design", icon: Box, section: "design" },
  { id: "design", label: "3D Model", icon: Sparkles, section: "design" },
  { id: "optimization", label: "Optimization", icon: SlidersHorizontal, section: "optimization" },
  { id: "soon", label: "Energy", icon: Gauge },
  { id: "soon", label: "Environment", icon: Cloud },
  { id: "analytics", label: "Analytics", icon: BarChart3, section: "analytics" },
  { id: "soon", label: "Reports", icon: FileText },
  { id: "soon", label: "Settings", icon: Settings },
];

type SidebarProps = {
  section: TwinSection;
  onSelect: (section: TwinSection) => void;
  collapsed: boolean;
  onToggle: () => void;
};

export function TwinSidebar({ section, onSelect, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`hidden shrink-0 flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/60 p-3 backdrop-blur-xl transition-all duration-300 lg:flex ${
        collapsed ? "w-[68px]" : "w-56"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="mb-2 flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-cyan-300"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      {NAV_ITEMS.map((item, i) => {
        const isActive = item.section === section;
        const disabled = !item.section;
        return (
          <button
            key={`${item.label}-${i}`}
            type="button"
            disabled={disabled}
            title={disabled ? `${item.label} — coming soon` : item.label}
            onClick={() => item.section && onSelect(item.section)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-cyan-500/15 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]"
                : disabled
                  ? "cursor-not-allowed text-slate-600"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && disabled && (
              <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-slate-500">
                Soon
              </span>
            )}
          </button>
        );
      })}

      <div className="mt-auto" />
      {!collapsed && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-300">
          <Leaf className="h-3.5 w-3.5" /> AI status: optimal
        </div>
      )}
    </aside>
  );
}

export function TwinTopBar({ section }: { section: TwinSection }) {
  const { user } = useAuth();
  const sectionLabel: Record<TwinSection, string> = {
    dashboard: "Digital Twin Overview",
    design: "3D Shelter Design",
    optimization: "AI Optimization",
    analytics: "Analytics",
  };

  return (
    <header className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200" aria-label="Back to app">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="hidden h-6 w-px bg-white/10 sm:block" />
        <div className="hidden items-center gap-2 sm:flex">
          <Logo size={26} showWordmark={false} />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Shelter IQ</p>
            <p className="text-[11px] text-slate-400">{sectionLabel[section]}</p>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300 md:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
        System nominal
        <span className="mx-1 h-3 w-px bg-white/10" />
        <Sparkles className="h-3 w-3 text-cyan-300" />
        AI active
      </div>

      <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/80 text-[11px] font-semibold text-white">
          {initials(user?.name, user?.email ?? "")}
        </span>
        <span className="hidden max-w-[110px] truncate text-xs font-medium text-slate-200 sm:inline">
          {user?.name || user?.email}
        </span>
      </div>
    </header>
  );
}

type TwinMobileTabsProps = Pick<SidebarProps, "section" | "onSelect">;

export function TwinMobileTabs({ section, onSelect }: TwinMobileTabsProps) {
  const items: Array<{ id: TwinSection; label: string; icon: typeof LayoutDashboard }> = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "design", label: "3D Model", icon: Box },
    { id: "optimization", label: "Optimize", icon: SlidersHorizontal },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];
  return (
    <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 p-1.5 backdrop-blur-xl lg:hidden">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
            section === item.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400"
          }`}
        >
          <item.icon className="h-3.5 w-3.5" /> {item.label}
        </button>
      ))}
    </div>
  );
}
