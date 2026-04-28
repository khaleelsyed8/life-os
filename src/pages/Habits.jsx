import { useState } from "react";
import { 
  CheckSquare, Plus, Trash2, TrendingUp, Flame, 
  ChevronLeft, ChevronRight, Award, Check, X 
} from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useTheme } from "./ThemeContext";

/* ── Design tokens (Mirrored from Diary.jsx) ─────────────────────────── */
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
  accent:    isDark ? "#34d399" : "#29d39d", // Habit-specific green accent
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.35)",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

/* ── UI Components ───────────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ fontFamily: mono, color: tk.accent }}>
      {children}
    </span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

const Ring = ({ pct, tk }) => {
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <svg width={88} height={88} className="-rotate-90">
      <circle cx={44} cy={44} r={r} stroke={tk.border} strokeWidth={5} fill="none" />
      <circle cx={44} cy={44} r={r} stroke={tk.accent} strokeWidth={5} fill="none"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
};

/* ── Logic Helpers ───────────────────────────────────────────────────── */
function fmt(d)      { return d.toISOString().split("T")[0]; }
function isFuture(d) {
  const t = new Date(); t.setHours(0,0,0,0);
  const x = new Date(d); x.setHours(0,0,0,0); return x > t;
}
function weekDates(base = new Date()) {
  const d = new Date(base), sun = new Date(d);
  sun.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(sun); x.setDate(sun.getDate() + i); return x; });
}
function streak(checks) {
  let s = 0, d = new Date();
  while (checks[fmt(d)]) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

/* ── Main Component ──────────────────────────────────────────────────── */
export default function Habits() {
  const { isDark } = useTheme();
  const tk = t(isDark);

  const [habits,   setHabits]   = useLocalStorage("habits", []);
  const [newHabit, setNewHabit] = useState("");
  const [weekBase, setWeekBase] = useState(new Date());
  const [deletingId, setDeletingId] = useState(null);
  const [animCell, setAnimCell] = useState(null);

  const days = weekDates(weekBase);

  function addHabit() {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now(), name: newHabit, checks: {} }]);
    setNewHabit("");
  }

  function toggle(hid, date) {
    const k = fmt(date);
    setAnimCell(`${hid}-${k}`); setTimeout(() => setAnimCell(null), 600);
    setHabits(habits.map((h) => h.id === hid ? { ...h, checks: { ...h.checks, [k]: !h.checks[k] } } : h));
  }

  function deleteHabit(id) { 
    setHabits(habits.filter((h) => h.id !== id)); 
  }

  function nav(dir) { 
    const d = new Date(weekBase); 
    d.setDate(d.getDate() + dir * 7); 
    setWeekBase(d); 
  }

  const totalChecks = habits.reduce((s, h) => s + days.filter((d) => h.checks[fmt(d)]).length, 0);
  const maxChecks   = habits.length * 7;
  const progress    = maxChecks === 0 ? 0 : Math.round((totalChecks / maxChecks) * 100);
  const today       = fmt(new Date());
  const isThisWeek  = today >= fmt(days[0]) && today <= fmt(days[6]);

  return (
    <div className="space-y-8" style={{ fontFamily: sans }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-bold mb-1"
            style={{ fontFamily: mono, color: tk.accent }}>
            Daily Practice
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: tk.text }}>
            Habits
          </h1>
          <p className="text-sm mt-2" style={{ color: tk.textMuted }}>Build consistency, not perfection.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Active",    value: habits.length, color: tk.accent },
            { label: "This week", value: totalChecks,   color: tk.textSub },
          ].map((s) => (
            <div key={s.label} className="rounded-xl px-4 py-3 text-center min-w-[80px]"
              style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: mono }}>{s.value}</p>
              <p className="text-xs mt-0.5 uppercase tracking-tighter" style={{ color: tk.textFaint }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Habit Composer */}
      <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
        <SL tk={tk}>New Habit</SL>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newHabit} onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="e.g., Morning workout, Read 30 minutes…"
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text }}
            onFocus={(e) => (e.target.style.borderColor = tk.accent)}
            onBlur={(e)  => (e.target.style.borderColor = tk.inputBdr)}
          />
          <button onClick={addHabit} disabled={!newHabit.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 whitespace-nowrap"
            style={{ background: tk.accent, color: "#09090b" }}>
            <Plus className="w-4 h-4" /> Add Habit
          </button>
        </div>
      </div>

      {/* Progress & Navigation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <button onClick={() => nav(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ border: `1px solid ${tk.border}`, color: tk.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.border2; e.currentTarget.style.color = tk.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;   e.currentTarget.style.color = tk.textMuted; }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <p className="font-bold text-sm mb-1" style={{ color: tk.text }}>{isThisWeek ? "This Week" : "Week View"}</p>
            <p className="text-xs" style={{ fontFamily: mono, color: tk.textFaint }}>
              {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
              {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            {!isThisWeek && (
              <button onClick={() => setWeekBase(new Date())}
                className="text-xs font-semibold mt-2" style={{ color: tk.accent }}>
                Back to today →
              </button>
            )}
          </div>
          <button onClick={() => nav(1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ border: `1px solid ${tk.border}`, color: tk.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.border2; e.currentTarget.style.color = tk.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;   e.currentTarget.style.color = tk.textMuted; }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-2xl p-5 flex items-center justify-between"
          style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: tk.accent }} />
              <p className="font-bold text-sm" style={{ color: tk.text }}>Weekly Progress</p>
            </div>
            <p className="text-xs" style={{ fontFamily: mono, color: tk.textFaint }}>{totalChecks} / {maxChecks} completions</p>
          </div>
          <div className="relative">
            <Ring pct={progress} tk={tk} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: tk.text, fontFamily: mono }}>{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habit Cards */}
      {habits.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ border: `1px dashed ${tk.border}` }}>
          <CheckSquare className="w-12 h-12 mx-auto mb-4" style={{ color: tk.textFaint }} />
          <p className="text-sm" style={{ color: tk.textFaint }}>No habits yet. Start building consistency today.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <SL tk={tk}>Active Habits</SL>
          <div className="space-y-4">
            {habits.map((habit) => {
              const s       = streak(habit.checks);
              const wChecks = days.filter((d) => habit.checks[fmt(d)]).length;
              const wPct    = Math.round((wChecks / 7) * 100);
              return (
                <div key={habit.id}
                  className="group rounded-2xl p-5 transition-all"
                  style={{ background: tk.surface, border: `1px solid ${tk.border}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.border2)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.border)}
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg" style={{ color: tk.text }}>{habit.name}</h3>
                        {s > 0 && (
                          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                            style={{ background: "#fb923c15", color: "#fb923c", border: "1px solid #fb923c33" }}>
                            <Flame className="w-3.5 h-3.5" /> {s}d streak
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: tk.surface2 }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${wPct}%`, background: tk.accent }} />
                        </div>
                        <span className="text-xs min-w-[3rem]" style={{ fontFamily: mono, color: tk.textFaint }}>
                          {wChecks}/7
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setDeletingId(habit.id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: tk.textFaint }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Week grid */}
                  <div className="overflow-x-auto -mx-2 px-2">
                    <div className="grid grid-cols-7 gap-2 min-w-[450px] sm:min-w-0">
                      {days.map((date) => {
                        const k       = fmt(date);
                        const checked = habit.checks[k];
                        const future  = isFuture(date);
                        const isToday = today === k;
                        return (
                          <div key={k} className="text-center">
                            <p className="text-[10px] mb-2 uppercase font-bold tracking-tight" 
                               style={{ fontFamily: mono, color: tk.textFaint }}>
                              {date.toLocaleDateString("en-US", { weekday: "short" })}
                            </p>
                            <button
                              disabled={future}
                              onClick={() => toggle(habit.id, date)}
                              className="relative w-full h-12 rounded-xl flex items-center justify-center text-sm transition-all"
                              style={{
                                background:   checked ? tk.accent : isToday ? `${tk.accent}15` : tk.surface2,
                                border:       `1px solid ${checked ? tk.accent : isToday ? `${tk.accent}50` : tk.border}`,
                                color:        checked ? "#09090b" : tk.textFaint,
                                opacity:      future ? 0.3 : 1,
                                cursor:       future ? "not-allowed" : "pointer",
                                transform:    checked ? "scale(1.02)" : "scale(1)",
                              }}
                            >
                              {checked && <Check size={18} className={animCell === `${habit.id}-${k}` ? "animate-bounce" : ""} />}
                              {isToday && !checked && (
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: tk.accent }} />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {s >= 7 && (
                    <div className="mt-5 pt-4 flex items-center gap-2 text-xs font-bold" 
                         style={{ borderTop: `1px solid ${tk.border}`, color: tk.accent, fontFamily: mono }}>
                      <Award className="w-4 h-4" />
                      {s >= 30 ? "30+ DAY CHAMPION!" : s >= 21 ? "21+ DAY MASTER!" : s >= 14 ? "2 WEEK WARRIOR!" : "WEEK COMPLETE!"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perfect week celebration */}
      {habits.length > 0 && progress === 100 && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: `${tk.accent}10`, border: `1px solid ${tk.accent}30` }}>
          <Award className="w-12 h-12 mx-auto mb-3" style={{ color: tk.accent }} />
          <h3 className="text-xl font-bold mb-1" style={{ color: tk.text }}>Perfect Week!</h3>
          <p className="text-sm" style={{ color: tk.textMuted }}>Every habit completed. You're on fire!</p>
        </div>
      )}

      {/* Delete Confirmation Modal (Diary Style) */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: tk.overlay, backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingId(null); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: tk.surface, border: `1px solid ${tk.border}` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
              <Trash2 className="w-6 h-6" style={{ color: "#ef4444" }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: tk.text }}>Delete habit?</h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              Your progress and streaks for this habit will be lost forever.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 text-sm rounded-xl transition-colors font-bold"
                style={{ border: `1px solid ${tk.border2}`, color: tk.textMuted, background: "transparent" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteHabit(deletingId); setDeletingId(null); }}
                className="px-6 py-2.5 text-sm rounded-xl font-bold shadow-lg shadow-red-900/20"
                style={{ background: "#ef4444", color: "#ffffff" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}