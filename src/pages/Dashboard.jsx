import React, { useState, useEffect } from "react";
import {
  BookOpen, Calendar, CheckSquare, Briefcase, Calculator,
  Heart, Brain, Dumbbell, Code, User, DollarSign,
  ArrowUpRight, Activity, Clock, Target, TrendingUp,
  Flame, Smile,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { secureGet } from "../hooks/useLocalStorage";

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
const currentFinanceKey = () => {
  const d = new Date();
  return `finance-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const fmt = (d) => d.toISOString().split("T")[0];

/* ── Section label ───────────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ color: tk.accent, fontFamily: mono }}>{children}</span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

/* ── Habit ring ──────────────────────────────────────────────────────── */
const Ring = ({ pct, size = 84, stroke = 6, color = "#34d399", tk }) => {
  const r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r;
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

/* ── VISUALIZATION 1: Diary writing heatmap (last 35 days) ──────────── */
const DiaryHeatmap = ({ diary, tk }) => {
  const today = new Date();
  const cells = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    const key = fmt(d);
    const count = diary.filter((e) => e.createdAt?.startsWith(key)).length;
    return { key, count, d };
  });

  const maxCount = Math.max(...cells.map((c) => c.count), 1);

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {cells.map((cell) => {
          const intensity = cell.count === 0 ? 0 : Math.max(0.2, cell.count / maxCount);
          const isToday = cell.key === fmt(today);
          return (
            <div
              key={cell.key}
              title={`${cell.key}: ${cell.count} entr${cell.count === 1 ? "y" : "ies"}`}
              className="rounded-sm transition-all cursor-default"
              style={{
                width: 14, height: 14,
                background: cell.count > 0
                  ? `rgba(192,132,252,${intensity})`
                  : tk.surface2,
                border: isToday ? "1px solid #c084fc" : `1px solid ${tk.border}`,
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs" style={{ color: tk.textFaint }}>35-day writing activity</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: tk.textFaint }}>Less</span>
          {[0.1, 0.3, 0.55, 0.8, 1].map((o, i) => (
            <div key={i} className="rounded-sm" style={{ width: 10, height: 10, background: `rgba(192,132,252,${o})` }} />
          ))}
          <span className="text-xs" style={{ color: tk.textFaint }}>More</span>
        </div>
      </div>
    </div>
  );
};

/* ── VISUALIZATION 2: Mood distribution donut ───────────────────────── */
const MOOD_MAP = {
  "🤩": { label: "Amazing",  color: "#34d399" },
  "😊": { label: "Good",     color: "#60a5fa" },
  "😐": { label: "Neutral",  color: "#f59e0b" },
  "😔": { label: "Low",      color: "#c084fc" },
  "😤": { label: "Stressed", color: "#f87171" },
};

const MoodDonut = ({ diary, tk }) => {
  const [hovered, setHovered] = useState(null);
  const withMood = diary.filter((e) => e.mood && MOOD_MAP[e.mood]);
  const total = withMood.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <Smile className="w-8 h-8" style={{ color: tk.textFaint }} />
        <p className="text-xs" style={{ color: tk.textFaint }}>Log moods in diary to see trends</p>
      </div>
    );
  }

  const counts = Object.entries(MOOD_MAP).map(([emoji, meta]) => ({
    emoji, ...meta,
    count: withMood.filter((e) => e.mood === emoji).length,
  })).filter((m) => m.count > 0);

  /* SVG donut — manual arc calculation */
  const size = 100, cx = 50, cy = 50, r = 36, stroke = 12;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = counts.map((m) => {
    const pct   = m.count / total;
    const dash  = pct * circ;
    const gap   = circ - dash;
    const start = offset;
    offset += dash;
    return { ...m, pct, dash, gap, start };
  });

  const active = hovered !== null ? slices[hovered] : null;

  return (
    <div className="flex items-center gap-5">
      {/* Donut */}
      <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
        <svg width={100} height={100} className="-rotate-90">
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r}
              stroke={s.color} strokeWidth={stroke} fill="none"
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.start}
              style={{
                transition: "stroke-width 0.2s ease, opacity 0.2s ease",
                strokeWidth: hovered === i ? stroke + 3 : stroke,
                opacity: hovered !== null && hovered !== i ? 0.4 : 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {active ? (
            <>
              <span className="text-xl leading-none">{active.emoji}</span>
              <span className="text-xs font-bold mt-0.5" style={{ color: active.color, fontFamily: mono }}>
                {Math.round(active.pct * 100)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-extrabold" style={{ color: tk.text, fontFamily: mono }}>{total}</span>
              <span className="text-[9px]" style={{ color: tk.textFaint }}>logged</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={i}
            className="flex items-center gap-2 cursor-default rounded-lg px-2 py-1 transition-all"
            style={{ background: hovered === i ? `${s.color}15` : "transparent" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs flex-1" style={{ color: hovered === i ? s.color : tk.textSub }}>
              {s.emoji} {s.label}
            </span>
            <span className="text-xs font-bold" style={{ color: tk.textFaint, fontFamily: mono }}>
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── VISUALIZATION 3: Habit consistency bars (this week) ─────────────── */
const HabitConsistency = ({ habits, tk }) => {
  const today = new Date();
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - 6 + i); return fmt(d);
  });
  const dayLabels = ["6d", "5d", "4d", "3d", "2d", "Yst", "Tdy"];

  if (habits.length === 0) {
    return <p className="text-xs text-center py-6" style={{ color: tk.textFaint }}>No habits tracked yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {/* Day labels */}
      <div className="flex items-center gap-1.5">
        <div style={{ width: 90, flexShrink: 0 }} />
        {dayLabels.map((l, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] font-bold" style={{
              color: i === 6 ? tk.accent : tk.textFaint,
              fontFamily: mono,
            }}>{l}</span>
          </div>
        ))}
      </div>
      {/* Habit rows */}
      {habits.slice(0, 6).map((h) => {
        const checked = days.map((d) => !!(h.checks && h.checks[d]));
        const weekCount = checked.filter(Boolean).length;
        return (
          <div key={h.id} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: 90 }}>
              <p className="text-xs font-semibold truncate" style={{ color: tk.textSub }}>{h.name}</p>
            </div>
            {checked.map((c, i) => (
              <div key={i} className="flex-1 flex justify-center">
                <div className="w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={{
                    background: c ? "#34d399" : i === 6 ? `#34d39918` : tk.surface2,
                    border:     `1px solid ${c ? "#34d399" : i === 6 ? "#34d39944" : tk.border}`,
                  }}>
                  {c && (
                    <svg viewBox="0 0 10 10" style={{ width: 8, height: 8, color: "#09090b" }}>
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
            <span className="text-[10px] font-bold ml-1 flex-shrink-0"
              style={{ color: weekCount >= 5 ? "#34d399" : tk.textFaint, fontFamily: mono, minWidth: 24 }}>
              {weekCount}/7
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* ── VISUALIZATION 4: Spend breakdown bars ───────────────────────────── */
const SpendBreakdown = ({ txs, totalInc, tk }) => {
  const [hovered, setHovered] = useState(null);
  const cats = [
    { key: "Need",       color: "#60a5fa", label: "Needs"       },
    { key: "Want",       color: "#f472b6", label: "Wants"       },
    { key: "Investment", color: "#34d399", label: "Investment"  },
    { key: "Debt",       color: "#fb923c", label: "Debt"        },
  ];

  const totalExp = txs.filter((tx) => tx.cat !== "Income").reduce((s, tx) => s + tx.amt, 0);
  const base = Math.max(totalExp, totalInc, 1);

  return (
    <div className="space-y-3">
      {cats.map((c, i) => {
        const amt = txs.filter((tx) => tx.cat === c.key).reduce((s, tx) => s + tx.amt, 0);
        const pct = Math.min(100, Math.round((amt / base) * 100));
        if (amt === 0) return null;
        return (
          <div key={c.key}
            className="cursor-default"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-xs font-semibold" style={{ color: hovered === i ? c.color : tk.textSub }}>
                  {c.label}
                </span>
              </div>
              <span className="text-xs font-bold" style={{ color: tk.textFaint, fontFamily: mono }}>
                ₹{amt.toLocaleString()} · {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: tk.surface2 }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: c.color,
                  opacity: hovered !== null && hovered !== i ? 0.3 : 1,
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Module card ─────────────────────────────────────────────────────── */
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
        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: module.accent }} />
      </div>
      <div>
        <p className="font-semibold text-base mb-1" style={{ color: tk.text }}>{module.name}</p>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: tk.textFaint }}>{module.description}</p>
        <span className="text-xs font-bold" style={{ color: module.accent }}>{module.stat}</span>
      </div>
    </Link>
  );
};

/* ── Domain pill ─────────────────────────────────────────────────────── */
const DomainPill = ({ domain, count, tk }) => {
  const Icon = domain.icon;
  return (
    <Link to={domain.path}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all"
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
        <span className="ml-auto text-xs" style={{ color: tk.textFaint, fontFamily: mono }}>{count}</span>
      )}
    </Link>
  );
};

/* ── Main Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const { isDark, userName } = useTheme();
  const tk = t(isDark);

  const [stats, setStats] = useState({
    totalLinks: 0, diaryEntries: 0, activeHabits: 0, ProjectCount: 0,
    focuses: [], recentDiary: null,
    todayHabits: { completed: 0, total: 0, habits: [] },
    domainStats: {},
    netCashFlow: null, financeRatio: 0,
    allDiary: [], allHabits: [], allTxs: [], totalInc: 0,
  });

  useEffect(() => {
    const links    = secureGet("links",             []);
    const diary    = secureGet("diary-entries",     []);
    const habits   = secureGet("habits",            []);
    const projects = secureGet("projects-v3",       []);
    const focuses  = secureGet("focus-items",       []);
    const finance  = secureGet(currentFinanceKey(), { inc: "", txs: [] });

    const today = new Date().toISOString().split("T")[0];
    const todayHabitsData = habits.map((h) => ({
      name: h.name, checked: !!(h.checks && h.checks[today]),
    }));

    const baseSalary = Number(finance.inc) || 0;
    const txs        = finance.txs || [];
    const incomeTxs  = txs.filter((tx) => tx.cat === "Income").reduce((s, tx) => s + tx.amt, 0);
    const totalInc   = baseSalary + incomeTxs;
    const totalExp   = txs.filter((tx) => tx.cat !== "Income").reduce((s, tx) => s + tx.amt, 0);
    const hasFinance = baseSalary > 0 || txs.length > 0;

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
      netCashFlow:  hasFinance ? totalInc - totalExp : null,
      financeRatio: totalInc > 0 ? (totalExp / totalInc) * 100 : 0,
      allDiary:  diary,
      allHabits: habits,
      allTxs:    txs,
      totalInc,
    });
  }, []);

  const pct = stats.todayHabits.total > 0
    ? Math.round((stats.todayHabits.completed / stats.todayHabits.total) * 100) : 0;

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
    { label: "Links",    value: stats.totalLinks,   color: "#60a5fa" },
    { label: "Diary",    value: stats.diaryEntries, color: "#c084fc" },
    { label: "Projects", value: stats.ProjectCount, color: "#fb923c" },
    { label: "Habits",   value: stats.activeHabits, color: "#34d399" },
  ];

  /* Streak across all habits */
  const topStreak = stats.allHabits.reduce((max, h) => {
    let s = 0, d = new Date();
    while (h.checks && h.checks[fmt(d)]) { s++; d.setDate(d.getDate() - 1); }
    return Math.max(max, s);
  }, 0);

  return (
    <div className="min-h-screen px-0 py-8" style={{ fontFamily: sans }}>

      {/* ── Hero ── */}
      <div className="mb-10 relative">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: tk.accent, opacity: 0.04 }} />
        <p className="text-xs tracking-[0.25em] uppercase font-bold mb-2"
          style={{ color: tk.accent, fontFamily: mono }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-none tracking-tight mb-1"
          style={{ color: tk.text }}>
          {getGreeting()},{userName && <span style={{ color: tk.accent }}> {userName}</span>}.
        </h1>
        <p className="text-sm mt-3" style={{ color: tk.textMuted }}>
          Here's your Life OS overview for today.
        </p>
      </div>

      {/* ── Overview numbers ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {overviewItems.map((item) => (
          <div key={item.label} className="rounded-xl px-4 py-4"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <p className="text-3xl font-extrabold mb-1" style={{ color: item.color, fontFamily: mono }}>
              {item.value}
            </p>
            <p className="text-xs uppercase tracking-wider" style={{ color: tk.textFaint }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* ── Row 1: Habits today + Diary heatmap ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Habits today ring */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>
              Habits today
            </span>
            <Activity className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <Ring pct={pct} color="#34d399" tk={tk} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: tk.text, fontFamily: mono }}>{pct}%</span>
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
          {topStreak > 0 && (
            <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg"
              style={{ background: "#fb923c18", border: "1px solid #fb923c33" }}>
              <Flame className="w-3 h-3" style={{ color: "#fb923c" }} />
              <span className="text-xs font-bold" style={{ color: "#fb923c" }}>
                Best streak: {topStreak}d
              </span>
            </div>
          )}
          <Link to="/habits" className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: "#34d399" }}>
            Open habits <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Diary writing heatmap — spans 2 cols */}
        <div className="md:col-span-2 rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>
              Writing activity
            </span>
            <Calendar className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          <DiaryHeatmap diary={stats.allDiary} tk={tk} />
          <Link to="/diary" className="flex items-center gap-1.5 text-xs font-semibold mt-4"
            style={{ color: "#c084fc" }}>
            Open diary <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Row 2: Habit consistency + Mood donut ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Habit consistency grid */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>
              7-day consistency
            </span>
            <CheckSquare className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          <HabitConsistency habits={stats.allHabits} tk={tk} />
          <Link to="/habits" className="flex items-center gap-1.5 text-xs font-semibold mt-4"
            style={{ color: "#34d399" }}>
            Open habits <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Mood donut */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>
              Mood distribution
            </span>
            <Smile className="w-4 h-4" style={{ color: tk.textFaint }} />
          </div>
          <MoodDonut diary={stats.allDiary} tk={tk} />
          <Link to="/diary" className="flex items-center gap-1.5 text-xs font-semibold mt-4"
            style={{ color: "#c084fc" }}>
            Open diary <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Row 3: Focus + Finance (conditional) ── */}
      <div className={`grid grid-cols-1 ${stats.netCashFlow !== null ? "md:grid-cols-2" : ""} gap-4 mb-10`}>

        {/* Current focus */}
        <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>
              Current focus
            </span>
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
          <Link to="/dictionary" className="flex items-center gap-1.5 text-xs font-semibold mt-4"
            style={{ color: tk.accent }}>
            Manage focuses <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Spend breakdown — only renders if finance data exists */}
        {stats.netCashFlow !== null && (
          <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs uppercase tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>
                Spend breakdown
              </span>
              <TrendingUp className="w-4 h-4" style={{ color: tk.textFaint }} />
            </div>

            {/* Net cashflow pill */}
            <div className="flex items-center gap-3 mb-5 px-3 py-2.5 rounded-xl"
              style={{
                background: stats.netCashFlow >= 0 ? "#34d39914" : "#f8717114",
                border: `1px solid ${stats.netCashFlow >= 0 ? "#34d39933" : "#f8717133"}`,
              }}>
              <TrendingUp className="w-4 h-4 flex-shrink-0"
                style={{ color: stats.netCashFlow >= 0 ? "#34d399" : "#f87171" }} />
              <div>
                <p className="text-[10px] font-bold uppercase" style={{ color: tk.textFaint }}>Net this month</p>
                <p className="text-sm font-extrabold" style={{
                  color: stats.netCashFlow >= 0 ? "#34d399" : "#f87171", fontFamily: mono,
                }}>
                  {stats.netCashFlow >= 0 ? "+" : ""}₹{stats.netCashFlow.toLocaleString()}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] font-bold uppercase" style={{ color: tk.textFaint }}>Spent</p>
                <p className="text-sm font-extrabold" style={{ color: "#f87171", fontFamily: mono }}>
                  {Math.round(stats.financeRatio)}%
                </p>
              </div>
            </div>

            <SpendBreakdown txs={stats.allTxs} totalInc={stats.totalInc} tk={tk} />
            <Link to="/tools" className="flex items-center gap-1.5 text-xs font-semibold mt-4"
              style={{ color: "#2dd4bf" }}>
              View full finance <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Modules ── */}
      <div className="mb-10">
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