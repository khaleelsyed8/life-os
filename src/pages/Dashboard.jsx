import React, { useState, useEffect } from "react";
import {
  BookOpen, Calendar, CheckSquare, Briefcase, Calculator,
  Heart, Brain, Dumbbell, Code, User, DollarSign,
  ArrowUpRight, Activity, Clock, Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

const storage = {
  get: (key) => { try { const i = localStorage.getItem(key); return i ? JSON.parse(i) : null; } catch { return null; } },
};

const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/* ── Tokens resolved from isDark — single source of truth ── */
const t = (isDark) => ({
  bg:        isDark ? "#0a0a0f"  : "#f4f4f8",
  surface:   isDark ? "#18181b"  : "#ffffff",
  surface2:  isDark ? "#1c1c22"  : "#ededf3",
  border:    isDark ? "#27272a"  : "#e4e4e7",
  border2:   isDark ? "#3f3f46"  : "#d4d4d8",
  text:      isDark ? "#f0f0f8"  : "#09090b",
  textSub:   isDark ? "#a1a1aa"  : "#3f3f46",
  textMuted: isDark ? "#71717a"  : "#71717a",
  textFaint: isDark ? "#52525b"  : "#a1a1aa",
  accent:    isDark ? "#f59e0b"  : "#d97706",
});

/* ── Sub-components ── */

const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ color: tk.accent, fontFamily: "'Space Mono', monospace" }}>
      {children}
    </span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

const Ring = ({ pct, size = 84, stroke = 6, color = "#34d399", tk }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} stroke={tk.border} strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
};

const ModuleCard = ({ module, tk }) => {
  const Icon = module.icon;
  return (
    <Link to={module.path}
      className="group relative flex flex-col justify-between rounded-2xl p-5 overflow-hidden transition-all duration-300"
      style={{ minHeight: 160, background: tk.surface, border: `1px solid ${tk.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.border2; e.currentTarget.style.background = tk.surface2; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;  e.currentTarget.style.background = tk.surface; }}
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: module.accent }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${module.accent}22`, border: `1px solid ${module.accent}44` }}>
          <Icon className="w-5 h-5" style={{ color: module.accent }} />
        </div>
        <ArrowUpRight className="w-4 h-4" style={{ color: tk.textFaint }} />
      </div>
      <div>
        <p className="font-semibold text-base mb-1" style={{ color: tk.text }}>{module.name}</p>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: tk.textFaint }}>{module.description}</p>
        <span className="text-xs font-bold tracking-wide" style={{ color: module.accent }}>{module.stat}</span>
      </div>
    </Link>
  );
};

const DomainPill = ({ domain, count, tk }) => {
  const Icon = domain.icon;
  return (
    <Link to={domain.path}
      className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all"
      style={{ background: tk.surface, border: `1px solid ${tk.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.border2; e.currentTarget.style.background = tk.surface2; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;  e.currentTarget.style.background = tk.surface; }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${domain.color}22` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: domain.color }} />
      </div>
      <span className="text-sm font-medium" style={{ color: tk.textSub }}>{domain.name}</span>
      {count > 0 && (
        <span className="ml-auto text-xs" style={{ color: tk.textFaint, fontFamily: "'Space Mono', monospace" }}>{count}</span>
      )}
    </Link>
  );
};

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { isDark, userName } = useTheme();
  const tk = t(isDark);

  const [stats, setStats] = useState({
    totalLinks: 0, diaryEntries: 0, activeHabits: 0, ProjectCount: 0,
    focuses: [], recentDiary: null,
    todayHabits: { completed: 0, total: 0, habits: [] },
    domainStats: {},
  });

  useEffect(() => {
    const links    = storage.get("links")         || [];
    const diary    = storage.get("diary-entries") || [];
    const habits   = storage.get("habits")        || [];
    const projects = storage.get("projects")      || [];
    const focuses  = storage.get("focus-items")   || [];
    const today    = new Date().toISOString().split("T")[0];

    const todayHabitsData = habits.map((h) => ({
      name: h.name, checked: h.checks && h.checks[today],
    }));

    setStats({
      totalLinks:   links.length,
      diaryEntries: diary.length,
      activeHabits: habits.length,
      ProjectCount: projects.filter((p) => ["Active","Paused","Completed"].includes(p.status)).length,
      focuses:      focuses.slice(0, 3),
      recentDiary:  diary[0] || null,
      todayHabits: {
        completed: todayHabitsData.filter((h) => h.checked).length,
        total:     habits.length,
        habits:    todayHabitsData.slice(0, 4),
      },
      domainStats: {
        Physical:  links.filter((l) => l.domain === "Physical").length,
        Spiritual: links.filter((l) => l.domain === "Spiritual").length,
        Mental:    links.filter((l) => l.domain === "Mental").length,
        Technical: links.filter((l) => l.domain === "Technical").length + projects.filter((p) => p.status === "Active").length,
        Self:      focuses.length,
        Financial: (storage.get("budget-items") || []).filter((i) => i.month === new Date().toISOString().slice(0, 7)).length,
      },
    });
  }, []);

  const pct = stats.todayHabits.total > 0
    ? Math.round((stats.todayHabits.completed / stats.todayHabits.total) * 100)
    : 0;

  const modules = [
    { name: "Dictionary",   icon: BookOpen,    path: "/dictionary", accent: "#60a5fa", description: "Central hub for all links and resources",  stat: `${stats.totalLinks} links saved` },
    { name: "Diary",        icon: Calendar,    path: "/diary",      accent: "#c084fc", description: "Reflect and journal your thoughts",         stat: `${stats.diaryEntries} entries` },
    { name: "Habits",       icon: CheckSquare, path: "/habits",     accent: "#34d399", description: "Track your daily habits and routines",      stat: `${stats.todayHabits.completed}/${stats.todayHabits.total} done today` },
    { name: "Projects",     icon: Briefcase,   path: "/projects",   accent: "#fb923c", description: "Manage your ongoing work",                  stat: `${stats.ProjectCount} total projects` },
    { name: "Track Spends", icon: Calculator,  path: "/tools",      accent: "#2dd4bf", description: "Budget calculator and financial tools",     stat: "Financial tools" },
  ];

  const domainData = [
    { name: "Physical",  icon: Dumbbell,   color: "#34d399", path: "/habits"     },
    { name: "Spiritual", icon: Heart,      color: "#c084fc", path: "/diary"      },
    { name: "Mental",    icon: Brain,      color: "#60a5fa", path: "/diary"      },
    { name: "Technical", icon: Code,       color: "#fb923c", path: "/projects"   },
    { name: "Self",      icon: User,       color: "#f472b6", path: "/dictionary" },
    { name: "Financial", icon: DollarSign, color: "#2dd4bf", path: "/tools"      },
  ];

  const overviewItems = [
    { label: "Links",          value: stats.totalLinks,   color: "#60a5fa" },
    { label: "Diary entries",  value: stats.diaryEntries, color: "#c084fc" },
    { label: "Total projects", value: stats.ProjectCount, color: "#fb923c" },
    { label: "Active habits",  value: stats.activeHabits, color: "#34d399" },
  ];

  return (
    <div className="min-h-screen px-0 py-8" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* Hero */}
      <div className="mb-10 relative">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: tk.accent, opacity: 0.04 }} />
        <p className="text-xs tracking-[0.25em] uppercase font-bold mb-2"
          style={{ color: tk.accent, fontFamily: "'Space Mono', monospace" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-none tracking-tight mb-1"
          style={{ color: tk.text }}>
          {getGreeting()}{userName ? `, ${userName}` : ""}.
        </h1>
        <p className="text-sm mt-3" style={{ color: tk.textMuted }}>
          Here's your Life OS overview for today.
        </p>
      </div>

      {/* Overview numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {overviewItems.map((item) => (
          <div key={item.label} className="rounded-xl px-4 py-4"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <p className="text-3xl font-extrabold mb-1"
              style={{ color: item.color, fontFamily: "'Space Mono', monospace" }}>
              {item.value}
            </p>
            <p className="text-xs uppercase tracking-wider" style={{ color: tk.textFaint }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* 3-column info row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

        {/* Habits today */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest"
              style={{ color: tk.textFaint, fontFamily: "'Space Mono', monospace" }}>Habits today</span>
            <Activity className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <Ring pct={pct} color="#34d399" tk={tk} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold"
                  style={{ color: tk.text, fontFamily: "'Space Mono', monospace" }}>{pct}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {stats.todayHabits.habits.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: h.checked ? "#34d399" : tk.border }}>
                    {h.checked && (
                      <svg viewBox="0 0 12 12" className="w-2 h-2" style={{ color: "#0a0a0f" }}>
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate"
                    style={{ color: h.checked ? tk.textFaint : tk.textSub, textDecoration: h.checked ? "line-through" : "none" }}>
                    {h.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link to="/habits" className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: "#34d399" }}>
            Open habits <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Recent diary */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest"
              style={{ color: tk.textFaint, fontFamily: "'Space Mono', monospace" }}>Latest entry</span>
            <Calendar className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          {stats.recentDiary ? (
            <>
              <p className="text-xs mb-2"
                style={{ color: tk.accent, fontFamily: "'Space Mono', monospace" }}>
                {new Date(stats.recentDiary.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-sm leading-relaxed line-clamp-5" style={{ color: tk.textSub }}>
                {stats.recentDiary.content}
              </p>
            </>
          ) : (
            <p className="text-sm italic" style={{ color: tk.textFaint }}>No entries yet. Start journaling.</p>
          )}
          <Link to="/diary" className="flex items-center gap-1.5 text-xs font-semibold mt-4"
            style={{ color: "#c084fc" }}>
            Open diary <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Current focus */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest"
              style={{ color: tk.textFaint, fontFamily: "'Space Mono', monospace" }}>Current focus</span>
            <Target className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          {stats.focuses.length > 0 ? (
            <div className="space-y-3">
              {stats.focuses.map((focus) => {
                const days = getDaysRemaining(focus.deadline);
                return (
                  <div key={focus.id} className="pl-3" style={{ borderLeft: `2px solid ${tk.accent}` }}>
                    <p className="text-sm font-semibold truncate" style={{ color: tk.text }}>{focus.title}</p>
                    {focus.deadline && (
                      <p className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ fontFamily: "'Space Mono', monospace", color: days < 0 ? "#f87171" : days === 0 ? tk.accent : tk.textFaint }}>
                        <Clock className="w-3 h-3" />
                        {days > 0 ? `${days}d left` : days === 0 ? "Due today" : `${Math.abs(days)}d overdue`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm italic" style={{ color: tk.textFaint }}>No active focuses set.</p>
          )}
          <Link to="/dictionary" className="flex items-center gap-1.5 text-xs font-semibold mt-4"
            style={{ color: tk.accent }}>
            Manage focuses <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Modules */}
      <div className="mb-10">
        <SL tk={tk}>Your modules</SL>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => <ModuleCard key={m.name} module={m} tk={tk} />)}
        </div>
      </div>

      {/* Life domains */}
      <div>
        <SL tk={tk}>Life domains</SL>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {domainData.map((d) => <DomainPill key={d.name} domain={d} count={stats.domainStats[d.name] || 0} tk={tk} />)}
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: tk.textFaint }}>
          Click any domain to access related tools and content.
        </p>
      </div>
    </div>
  );
}