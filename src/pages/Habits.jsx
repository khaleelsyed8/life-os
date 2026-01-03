import { useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  TrendingUp,
  Flame,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
} from "lucide-react";
import Card from "../components/ui/Card";
import useLocalStorage from "../hooks/useLocalStorage";

/* ------------------ Date Helpers ------------------ */
function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function isFutureDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return d > today;
}

function getWeekDates(baseDate = new Date()) {
  const date = new Date(baseDate);
  const day = date.getDay();
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - day);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function calculateStreak(checks) {
  let streak = 0;
  let d = new Date();

  while (true) {
    const key = formatDate(d);
    if (checks[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }

  return streak;
}

/* ------------------ Component ------------------ */
export default function Habits() {
  const [habits, setHabits] = useLocalStorage("habits", []);
  const [newHabit, setNewHabit] = useState("");
  const [weekStart, setWeekStart] = useState(new Date());
  const [animatingCell, setAnimatingCell] = useState(null);

  const weekDates = getWeekDates(weekStart);

  function addHabit() {
    if (!newHabit.trim()) return;

    setHabits([
      ...habits,
      {
        id: Date.now(),
        name: newHabit,
        checks: {},
      },
    ]);
    setNewHabit("");
  }

  function toggleHabit(habitId, date) {
    const key = formatDate(date);

    setAnimatingCell(`${habitId}-${key}`);
    setTimeout(() => setAnimatingCell(null), 600);

    setHabits(
      habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              checks: {
                ...h.checks,
                [key]: !h.checks[key],
              },
            }
          : h
      )
    );
  }

  function deleteHabit(id) {
    setHabits(habits.filter((h) => h.id !== id));
  }

  function navigateWeek(direction) {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setWeekStart(newDate);
  }

  function goToToday() {
    setWeekStart(new Date());
  }

  const totalChecks = habits.reduce(
    (sum, h) => sum + weekDates.filter((d) => h.checks[formatDate(d)]).length,
    0
  );

  const maxChecks = habits.length * 7;
  const progress = maxChecks === 0 ? 0 : Math.round((totalChecks / maxChecks) * 100);

  const isCurrentWeek = () => {
    const today = new Date();
    const todayStr = formatDate(today);
    const weekStartStr = formatDate(weekDates[0]);
    const weekEndStr = formatDate(weekDates[6]);
    return todayStr >= weekStartStr && todayStr <= weekEndStr;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Habits
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Build consistency, not perfection.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3 sm:gap-4">
          <div className="text-center bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md border border-indigo-100">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{habits.length}</div>
            <div className="text-xs text-gray-600">Active Habits</div>
          </div>
          <div className="text-center bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md border border-indigo-100">
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">{totalChecks}</div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>
        </div>
      </div>

      {/* Add Habit */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Add New Habit</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="e.g., Morning workout, Read 30 minutes..."
            className="flex-1 border-2 border-green-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all outline-none"
            onKeyPress={(e) => e.key === "Enter" && addHabit()}
          />
          <button
            onClick={addHabit}
            disabled={!newHabit.trim()}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </Card>

      {/* Week Navigation + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Week Selector */}
        <Card>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-green-50 rounded-lg transition-all flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <h2 className="font-bold text-sm sm:text-base text-gray-800">
                  {isCurrentWeek() ? "This Week" : "Week View"}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                {weekDates[6].toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {!isCurrentWeek() && (
                <button
                  onClick={goToToday}
                  className="text-xs text-green-600 hover:text-green-700 font-semibold mt-2"
                >
                  Go to Today →
                </button>
              )}
            </div>

            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-green-50 rounded-lg transition-all flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </Card>

        {/* Progress Ring */}
        <Card className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h3 className="font-bold text-sm sm:text-base text-gray-800">Weekly Progress</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              {totalChecks} / {maxChecks} completed
            </p>
          </div>

          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#e0e7ff"
                strokeWidth="6"
                fill="none"
                className="sm:hidden"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e0e7ff"
                strokeWidth="8"
                fill="none"
                className="hidden sm:block"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#22c55e"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 sm:hidden"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#22c55e"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 hidden sm:block"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{progress}%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Habit Cards */}
      <div className="space-y-4">
        {habits.length === 0 && (
          <Card className="text-center py-12">
            <CheckSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-base sm:text-lg text-gray-500">No habits yet.</p>
            <p className="text-sm text-gray-400 mt-2">Start simple. Add your first habit above.</p>
          </Card>
        )}

        {habits.map((habit) => {
          const streak = calculateStreak(habit.checks);
          const weekChecks = weekDates.filter((d) => habit.checks[formatDate(d)]).length;
          const weekProgress = Math.round((weekChecks / 7) * 100);

          return (
            <Card key={habit.id} hover className="group">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900">{habit.name}</h3>
                    {streak > 0 && (
                      <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                        <Flame className="w-3 h-3" />
                        {streak} day streak
                      </div>
                    )}
                  </div>

                  {/* Week Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 min-w-[3rem]">
                      {weekChecks}/7
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 text-gray-400 sm:opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all self-end sm:self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Week Checkboxes - Scrollable on mobile */}
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                <div className="grid grid-cols-7 gap-2 min-w-[500px] sm:min-w-0">
                  {weekDates.map((date) => {
                    const key = formatDate(date);
                    const checked = habit.checks[key];
                    const isFuture = isFutureDate(date);
                    const isToday = formatDate(new Date()) === key;
                    const cellId = `${habit.id}-${key}`;
                    const isAnimating = animatingCell === cellId;

                    return (
                      <div key={key} className="text-center">
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                        <button
                          disabled={isFuture}
                          onClick={() => toggleHabit(habit.id, date)}
                          className={`relative w-full h-10 sm:h-12 rounded-xl border-2 flex items-center justify-center transition-all font-bold text-base sm:text-lg ${
                            checked
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-500 text-white shadow-lg scale-105"
                              : isToday
                              ? "border-green-400 bg-green-50 text-gray-600 hover:bg-green-100"
                              : "border-gray-300 text-gray-400 hover:border-green-300 hover:bg-green-50"
                          } ${isFuture ? "opacity-30 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
                        >
                          {checked && (
                            <>
                              <span className={isAnimating ? "animate-bounce" : ""}>✓</span>
                              {isAnimating && (
                                <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl animate-ping">
                                  ⭐
                                </span>
                              )}
                            </>
                          )}
                          {!checked && !isFuture && (
                            <span className="opacity-0 group-hover:opacity-50 transition-opacity text-sm">
                              +
                            </span>
                          )}
                          {isToday && !checked && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Achievement Badges */}
              {streak >= 7 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-600">
                      {streak >= 30
                        ? "🏆 30+ Day Champion!"
                        : streak >= 21
                        ? "🌟 21+ Day Master!"
                        : streak >= 14
                        ? "💪 2 Week Warrior!"
                        : "🎯 Week Complete!"}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Motivational Footer */}
      {habits.length > 0 && progress === 100 && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-8">
          <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Perfect Week! 🎉</h3>
          <p className="text-sm sm:text-base text-green-100">
            You completed all your habits this week. Keep up the amazing work!
          </p>
        </Card>
      )}
    </div>
  );
}