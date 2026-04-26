import { useState } from "react";
import { CheckSquare, Plus, Trash2, TrendingUp, Flame, ChevronLeft, ChevronRight, Calendar, Award } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";

const SL = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase text-amber-400 font-bold"
      style={{ fontFamily: "'Space Mono', monospace" }}>
      {children}
    </span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
);

function formatDate(d) { return d.toISOString().split("T")[0]; }
function isFutureDate(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  return d > today;
}
function getWeekDates(baseDate = new Date()) {
  const date = new Date(baseDate);
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday); d.setDate(sunday.getDate() + i); return d;
  });
}
function calculateStreak(checks) {
  let streak = 0, d = new Date();
  while (checks[formatDate(d)]) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

const Ring = ({ pct }) => {
  const r = 36, circ = 2 * Math.PI * r;
  return (
    <svg width={88} height={88} className="-rotate-90">
      <circle cx={44} cy={44} r={r} stroke="#27272a" strokeWidth={5} fill="none" />
      <circle cx={44} cy={44} r={r} stroke="#34d399" strokeWidth={5} fill="none"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
};

export default function Habits() {
  const [habits, setHabits] = useLocalStorage("habits", []);
  const [newHabit, setNewHabit] = useState("");
  const [weekStart, setWeekStart] = useState(new Date());
  const [animatingCell, setAnimatingCell] = useState(null);
  const weekDates = getWeekDates(weekStart);

  function addHabit() {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now(), name: newHabit, checks: {} }]);
    setNewHabit("");
  }

  function toggleHabit(habitId, date) {
    const key = formatDate(date);
    setAnimatingCell(`${habitId}-${key}`);
    setTimeout(() => setAnimatingCell(null), 600);
    setHabits(habits.map((h) =>
      h.id === habitId ? { ...h, checks: { ...h.checks, [key]: !h.checks[key] } } : h
    ));
  }

  function deleteHabit(id) { setHabits(habits.filter((h) => h.id !== id)); }
  function navigateWeek(dir) {
    const d = new Date(weekStart); d.setDate(d.getDate() + dir * 7); setWeekStart(d);
  }
  function goToToday() { setWeekStart(new Date()); }

  const totalChecks = habits.reduce((sum, h) => sum + weekDates.filter((d) => h.checks[formatDate(d)]).length, 0);
  const maxChecks = habits.length * 7;
  const progress = maxChecks === 0 ? 0 : Math.round((totalChecks / maxChecks) * 100);

  const isCurrentWeek = () => {
    const today = formatDate(new Date());
    return today >= formatDate(weekDates[0]) && today <= formatDate(weekDates[6]);
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-emerald-400 mb-1"
            style={{ fontFamily: "'Space Mono', monospace" }}>Daily practice</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 leading-none">Habits</h1>
          <p className="text-zinc-500 text-sm mt-2">Build consistency, not perfection.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Active", value: habits.length, color: "#34d399" },
            { label: "This week", value: totalChecks, color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add habit */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <SL>Add habit</SL>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newHabit} onChange={(e) => setNewHabit(e.target.value)}
            placeholder="e.g., Morning workout, Read 30 minutes…"
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 text-sm transition-colors"
          />
          <button onClick={addHabit} disabled={!newHabit.trim()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all whitespace-nowrap"
            style={{ background: "#34d399", color: "#0a0a0f" }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Week nav + progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Week selector */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
          <button onClick={() => navigateWeek(-1)}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center flex-1">
            <p className="font-bold text-zinc-200 text-sm mb-1">
              {isCurrentWeek() ? "This Week" : "Week View"}
            </p>
            <p className="text-xs text-zinc-500" style={{ fontFamily: "'Space Mono', monospace" }}>
              {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
              {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            {!isCurrentWeek() && (
              <button onClick={goToToday}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold mt-2">
                Back to today →
              </button>
            )}
          </div>
          <button onClick={() => navigateWeek(1)}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="font-bold text-zinc-200 text-sm">Weekly progress</p>
            </div>
            <p className="text-xs text-zinc-500" style={{ fontFamily: "'Space Mono', monospace" }}>
              {totalChecks} / {maxChecks} checks
            </p>
          </div>
          <div className="relative">
            <Ring pct={progress} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-zinc-100" style={{ fontFamily: "'Space Mono', monospace" }}>
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Habit cards */}
      {habits.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <CheckSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No habits yet. Add your first one above.</p>
        </div>
      ) : (
        <div>
          <SL>Your habits</SL>
          <div className="space-y-4">
            {habits.map((habit) => {
              const streak = calculateStreak(habit.checks);
              const weekChecks = weekDates.filter((d) => habit.checks[formatDate(d)]).length;
              const weekPct = Math.round((weekChecks / 7) * 100);

              return (
                <div key={habit.id} className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  {/* Habit header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-zinc-100 text-base">{habit.name}</h3>
                        {streak > 0 && (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "#fb923c22", color: "#fb923c" }}>
                            <Flame className="w-3 h-3" /> {streak}d streak
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${weekPct}%`, background: "#34d399" }} />
                        </div>
                        <span className="text-xs text-zinc-500 font-mono min-w-[2.5rem]"
                          style={{ fontFamily: "'Space Mono', monospace" }}>
                          {weekChecks}/7
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Week grid */}
                  <div className="overflow-x-auto -mx-2 px-2">
                    <div className="grid grid-cols-7 gap-2 min-w-[400px] sm:min-w-0">
                      {weekDates.map((date) => {
                        const key = formatDate(date);
                        const checked = habit.checks[key];
                        const isFuture = isFutureDate(date);
                        const isToday = formatDate(new Date()) === key;
                        const isAnimating = animatingCell === `${habit.id}-${key}`;

                        return (
                          <div key={key} className="text-center">
                            <p className="text-xs text-zinc-600 mb-1.5 uppercase"
                              style={{ fontFamily: "'Space Mono', monospace", fontSize: 9 }}>
                              {date.toLocaleDateString("en-US", { weekday: "short" })}
                            </p>
                            <button
                              disabled={isFuture}
                              onClick={() => toggleHabit(habit.id, date)}
                              className="relative w-full h-10 rounded-xl border flex items-center justify-center text-sm font-bold transition-all"
                              style={{
                                background: checked ? "#34d399" : isToday ? "#34d39911" : "#0a0a0f",
                                borderColor: checked ? "#34d399" : isToday ? "#34d39966" : "#27272a",
                                color: checked ? "#0a0a0f" : "#52525b",
                                opacity: isFuture ? 0.25 : 1,
                                cursor: isFuture ? "not-allowed" : "pointer",
                                transform: checked ? "scale(1.05)" : "scale(1)",
                              }}
                            >
                              {checked && (
                                <span className={isAnimating ? "animate-bounce" : ""}>✓</span>
                              )}
                              {isToday && !checked && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {streak >= 7 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs text-amber-400">
                      <Award className="w-3.5 h-3.5" />
                      {streak >= 30 ? "30+ Day Champion!" : streak >= 21 ? "21+ Day Master!" : streak >= 14 ? "2 Week Warrior!" : "Week Complete!"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Perfect week banner */}
      {habits.length > 0 && progress === 100 && (
        <div className="rounded-2xl p-6 text-center border border-emerald-500/30"
          style={{ background: "linear-gradient(135deg, #34d39914, #10b98114)" }}>
          <Award className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-zinc-100 mb-1">Perfect Week!</h3>
          <p className="text-sm text-zinc-400">You completed every habit this week. Remarkable.</p>
        </div>
      )}
    </div>
  );
}