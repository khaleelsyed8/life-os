import React, { useState, useEffect } from "react";
import {
  BookOpen, Calendar, CheckSquare, Briefcase, Calculator,
  Heart, Brain, Dumbbell, Code, User, DollarSign,
  ArrowUpRight, Activity, Clock, Target, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { secureGet } from "../hooks/useLocalStorage";  // ← reads encrypted data correctly

/* ── Design tokens ───────────────────────────────────────────────────── */
const t = (isDark) => ({
  bg:        isDark ? "#0a0a0f" : "#f4f4f8",
  surface:   isDark ? "#18181b" : "#ffffff",
  surface2:  isDark ? "#1c1c22" : "#ededf3",
  border:    isDark ? "#27272a" : "#e4e4e7",
  border2:   isDark ? "#3f3f46" : "#d4d4d8",
  text:      isDark ? "#f0f0f8" : "#09090b",
  textSub:   isDark ? "#a1a1aa" : "#3f3f46",
  textMuted: isDark ? "#71717a" : "#71717a",
  textFaint: isDark ? "#52525b" : "#a1a1aa",
  accent:    isDark ? "#f59e0b" : "#d97706",
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.35)",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

/* ── Helpers ─────────────────────────────────────────────────────────── */
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

/* Must match the key used in Tools.jsx */
const currentFinanceKey = () => {
  const d = new Date();
  return `finance-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/* ── Sub-components ─────────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ color: tk.accent, fontFamily: mono }}>
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
      <circle cx={size/2} cy={size/2} r={r} stroke={color}    strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
};

const StatCard = ({ label, value, color, icon: Icon, tk }) => (
  <div className="rounded-2xl px-5 py-4"
    style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs uppercase tracking-wider font-bold" style={{ color: tk.textFaint }}>{label}</p>
      {Icon && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      )}
    </div>
    <p className="text-3xl font-extrabold leading-none" style={{ color, fontFamily: mono }}>{value}</p>
  </div>
);

const ModuleCard = ({ module, tk }) => {
  const Icon = module.icon;
  return (
    <Link to={module.path}
      className="group relative flex flex-col justify-between rounded-2xl p-5 overflow-hidden transition-all duration-300"
      style={{ minHeight: 165, background: tk.surface, border: `1px solid ${tk.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.border2; e.currentTarget.style.background = tk.surface2; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;  e.currentTarget.style.background = tk.surface; }}
    >
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-[0.08] pointer-events-none"
        style={{ background: module.accent }} />
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${module.accent}20`, border: `1px solid ${module.accent}40` }}>
          <Icon className="w-5 h-5" style={{ color: module.accent }} />
        </div>
        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: module.accent }} />
      </div>
      <div>
        <p className="font-bold text-base mb-1" style={{ color: tk.text }}>{module.name}</p>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: tk.textFaint }}>{module.description}</p>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full" style={{ background: module.accent }} />
          <span className="text-xs font-bold" style={{ color: module.accent }}>{module.stat}</span>
        </div>
      </div>
    </Link>
  );
};

const DomainPill = ({ domain, count, tk }) => {
  const Icon = domain.icon;
  return (
    <Link to={domain.path}
      className="flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all"
      style={{ background: tk.surface, border: `1px solid ${tk.border}` }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = domain.color + "66"; e.currentTarget.style.background = tk.surface2; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border; e.currentTarget.style.background = tk.surface; }}
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${domain.color}18`, border: `1px solid ${domain.color}30` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: domain.color }} />
      </div>
      <span className="text-sm font-semibold flex-1" style={{ color: tk.textSub }}>{domain.name}</span>
      {count > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
          style={{ color: domain.color, background: `${domain.color}18`, fontFamily: mono }}>
          {count}
        </span>
      )}
    </Link>
  );
};

/* ── Main Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const { isDark, userName } = useTheme();
  const tk = t(isDark);

  const [stats, setStats] = useState({
    totalLinks:   0,
    diaryEntries: 0,
    activeHabits: 0,
    ProjectCount: 0,
    focuses:      [],
    recentDiary:  null,
    todayHabits:  { completed: 0, total: 0, habits: [] },
    domainStats:  {},
    netCashFlow:  null,
  });

  useEffect(() => {
    /*
      ALL reads go through secureGet so they decrypt the AES-encrypted
      data that useLocalStorage writes. Plain JSON.parse would return
      garbled ciphertext, which is why counts showed 0 before.

      Keys must exactly match what each page passes to useLocalStorage():
        Diary      → "diary-entries"
        Habits     → "habits"
        Projects   → "projects-v3"   (check Projects.jsx if still 0)
        Dictionary → "links"
        Focuses    → "focus-items"   (check Dictionary.jsx)
        Finance    → "finance-YYYY-MM"
    */
    const links    = secureGet("links",             []);
    const diary    = secureGet("diary-entries",     []);
    const habits   = secureGet("habits",            []);
    const projects = secureGet("projects-v3",       []);
    const focuses  = secureGet("focus-items",       []);
    const finance  = secureGet(currentFinanceKey(), { inc: "", txs: [] });

    const today = new Date().toISOString().split("T")[0];

    const todayHabitsData = habits.map((h) => ({
      name:    h.name,
      checked: !!(h.checks && h.checks[today]),
    }));

    /* Finance: salary (string) + income transactions */
    const baseSalary  = Number(finance.inc)  || 0;
    const txs         = finance.txs          || [];
    const incomeTxs   = txs.filter((tx) => tx.cat === "Income").reduce((s, tx) => s + tx.amt, 0);
    const totalInc    = baseSalary + incomeTxs;
    const totalExp    = txs.filter((tx) => tx.cat !== "Income").reduce((s, tx) => s + tx.amt, 0);
    const hasFinance  = baseSalary > 0 || txs.length > 0;
    const netCashFlow = hasFinance ? totalInc - totalExp : null;

    setStats({
      totalLinks:   links.length,
      diaryEntries: diary.length,
      activeHabits: habits.length,
      ProjectCount: projects.length,
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
        Technical: links.filter((l) => l.domain === "Technical").length
                   + projects.filter((p) => p.status === "Active").length,
        Self:      focuses.length,
        Financial: txs.length,
      },
      netCashFlow,
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

  return (
    <div className="min-h-screen py-8" style={{ fontFamily: sans }}>

      {/* ── Hero ── */}
      <div className="mb-12 relative">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: tk.accent, opacity: 0.05 }} />
        <div className="absolute -top-10 right-0 w-60 h-60 rounded-full blur-3xl pointer-events-none"
          style={{ background: "#c084fc", opacity: 0.04 }} />

        <p className="text-xs tracking-[0.3em] uppercase font-bold mb-3"
          style={{ color: tk.accent, fontFamily: mono }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-none tracking-tight mb-3"
          style={{ color: tk.text }}>
          {getGreeting()}{userName ? "," : ""}{userName
            ? <span style={{ color: tk.accent }}> {userName}</span>
            : ""}.
        </h1>
        <p className="text-sm" style={{ color: tk.textMuted }}>
          Here's your Life OS overview for today.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard label="Links saved"     value={stats.totalLinks}   color="#60a5fa" icon={BookOpen}    tk={tk} />
        <StatCard label="Diary entries"   value={stats.diaryEntries} color="#c084fc" icon={Calendar}    tk={tk} />
        <StatCard label="Total projects"  value={stats.ProjectCount} color="#fb923c" icon={Briefcase}   tk={tk} />
        <StatCard label="Active habits"   value={stats.activeHabits} color="#34d399" icon={CheckSquare} tk={tk} />
      </div>

      {/* ── 3-column info row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">

        {/* Habits today */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold mb-0.5"
                style={{ color: tk.textFaint, fontFamily: mono }}>Habits today</p>
              <p className="text-xs" style={{ color: tk.textFaint }}>
                {stats.todayHabits.completed}/{stats.todayHabits.total} complete
              </p>
            </div>
            <Activity className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <Ring pct={pct} color="#34d399" tk={tk} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: tk.text, fontFamily: mono }}>{pct}%</span>
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
                  <span className="truncate" style={{
                    color: h.checked ? tk.textFaint : tk.textSub,
                    textDecoration: h.checked ? "line-through" : "none",
                  }}>{h.name}</span>
                </div>
              ))}
              {stats.todayHabits.total === 0 && (
                <p className="text-xs italic" style={{ color: tk.textFaint }}>No habits set yet.</p>
              )}
            </div>
          </div>
          <Link to="/habits" className="flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "#34d399" }}>
            Open habits <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Recent diary */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs uppercase tracking-widest font-bold"
              style={{ color: tk.textFaint, fontFamily: mono }}>Latest entry</p>
            <Calendar className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          {stats.recentDiary ? (
            <>
              <p className="text-xs mb-2 font-semibold" style={{ color: "#c084fc", fontFamily: mono }}>
                {new Date(stats.recentDiary.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
              <p className="text-sm leading-relaxed line-clamp-5" style={{ color: tk.textSub }}>
                {stats.recentDiary.content}
              </p>
            </>
          ) : (
            <p className="text-sm italic" style={{ color: tk.textFaint }}>No entries yet. Start journaling.</p>
          )}
          <Link to="/diary" className="flex items-center gap-1.5 text-xs font-bold mt-4"
            style={{ color: "#c084fc" }}>
            Open diary <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Current focus */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs uppercase tracking-widest font-bold"
              style={{ color: tk.textFaint, fontFamily: mono }}>Current focus</p>
            <Target className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          {stats.focuses.length > 0 ? (
            <div className="space-y-3">
              {stats.focuses.map((focus) => {
                const days = getDaysRemaining(focus.deadline);
                return (
                  <div key={focus.id} className="pl-3 py-0.5"
                    style={{ borderLeft: `2px solid ${tk.accent}` }}>
                    <p className="text-sm font-semibold truncate" style={{ color: tk.text }}>{focus.title}</p>
                    {focus.deadline && (
                      <p className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ fontFamily: mono, color: days < 0 ? "#f87171" : days === 0 ? tk.accent : tk.textFaint }}>
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
          <Link to="/dictionary" className="flex items-center gap-1.5 text-xs font-bold mt-4"
            style={{ color: tk.accent }}>
            Manage focuses <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Finance snapshot (only if data exists) ── */}
      {stats.netCashFlow !== null && (
        <div className="mb-12">
          <SL tk={tk}>This month</SL>
          <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: stats.netCashFlow >= 0 ? "#34d39920" : "#f8717120",
                border:     `1px solid ${stats.netCashFlow >= 0 ? "#34d39940" : "#f8717140"}`,
              }}>
              <TrendingUp className="w-5 h-5" style={{ color: stats.netCashFlow >= 0 ? "#34d399" : "#f87171" }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold mb-0.5"
                style={{ color: tk.textFaint, fontFamily: mono }}>Net cash flow</p>
              <p className="text-2xl font-extrabold"
                style={{ color: stats.netCashFlow >= 0 ? "#34d399" : "#f87171", fontFamily: mono }}>
                {stats.netCashFlow >= 0 ? "+" : ""}₹{stats.netCashFlow.toLocaleString()}
              </p>
            </div>
            <Link to="/tools" className="ml-auto flex items-center gap-1.5 text-xs font-bold"
              style={{ color: "#2dd4bf" }}>
              View details <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Modules ── */}
      <div className="mb-12">
        <SL tk={tk}>Your modules</SL>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => <ModuleCard key={m.name} module={m} tk={tk} />)}
        </div>
      </div>

      {/* ── Life domains ── */}
      <div>
        <SL tk={tk}>Life domains</SL>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {domainData.map((d) => (
            <DomainPill key={d.name} domain={d} count={stats.domainStats[d.name] || 0} tk={tk} />
          ))}
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: tk.textFaint }}>
          Click any domain to access related tools and content.
        </p>
      </div>
    </div>
  );
}