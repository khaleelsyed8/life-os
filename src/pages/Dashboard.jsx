import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Briefcase,
  Calculator,
  TrendingUp,
  Star,
  Clock,
  Target,
  ExternalLink,
  Heart,
  Brain,
  Dumbbell,
  Code,
  User,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Storage ────────────────────────────────────────────────────────────────
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
};

// ─── Tiny helpers ────────────────────────────────────────────────────────────
const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Thin horizontal rule with label */
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span
      style={{ fontFamily: "'Space Mono', monospace" }}
      className="text-xs tracking-widest uppercase text-amber-400 font-bold"
    >
      {children}
    </span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
);

/** Animated circular progress ring */
const Ring = ({ pct, size = 96, stroke = 6, color = '#f59e0b' }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#27272a" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
};

/** Module card */
const ModuleCard = ({ module }) => {
  const Icon = module.icon;
  return (
    <Link
      to={module.path}
      className="group relative flex flex-col justify-between rounded-2xl p-5 border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-800"
      style={{ minHeight: 160 }}
    >
      {/* accent blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ background: module.accent }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${module.accent}22`, border: `1px solid ${module.accent}44` }}
        >
          <Icon className="w-5 h-5" style={{ color: module.accent }} />
        </div>
        <ArrowUpRight
          className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors"
        />
      </div>

      <div>
        <p className="text-zinc-100 font-semibold text-base mb-1">{module.name}</p>
        <p className="text-zinc-500 text-xs mb-3 leading-relaxed">{module.description}</p>
        <span
          className="text-xs font-bold tracking-wide"
          style={{ color: module.accent }}
        >
          {module.stat}
        </span>
      </div>
    </Link>
  );
};

/** Domain pill */
const DomainPill = ({ domain, count }) => {
  const Icon = domain.icon;
  return (
    <Link
      to={domain.path}
      className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800 transition-all"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${domain.color}22` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: domain.color }} />
      </div>
      <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors font-medium">
        {domain.name}
      </span>
      {count > 0 && (
        <span className="ml-auto text-xs text-zinc-500 font-mono">{count}</span>
      )}
    </Link>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLinks: 0,
    diaryEntries: 0,
    activeHabits: 0,
    activeProjects: 0,
    pausedProjects: 0,
    completedProjects: 0,
    ProjectCount: 0,
    focuses: [],
    recentDiary: null,
    todayHabits: { completed: 0, total: 0, habits: [] },
    domainStats: {},
  });

  useEffect(() => {
    // Inject fonts
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const links = storage.get('links') || [];
    const diary = storage.get('diary-entries') || [];
    const habits = storage.get('habits') || [];
    const projects = storage.get('projects') || [];
    const focuses = storage.get('focus-items') || [];

    const today = new Date().toISOString().split('T')[0];
    const todayHabitsData = habits.map((h) => ({
      name: h.name,
      checked: h.checks && h.checks[today],
      domain: h.domain || 'Physical',
    }));
    const completed = todayHabitsData.filter((h) => h.checked).length;

    const domainStats = {
      Physical: links.filter((l) => l.domain === 'Physical').length,
      Spiritual: links.filter((l) => l.domain === 'Spiritual').length,
      Mental: links.filter((l) => l.domain === 'Mental').length,
      Technical:
        links.filter((l) => l.domain === 'Technical').length +
        projects.filter((p) => p.status === 'Active').length,
      Self: focuses.length,
      Financial: (storage.get('budget-items') || []).filter(
        (i) => i.month === new Date().toISOString().slice(0, 7)
      ).length,
    };

    setStats({
      totalLinks: links.length,
      diaryEntries: diary.length,
      activeHabits: habits.length,
      activeProjects: projects.filter((p) => p.status === 'active').length,
      pausedProjects: projects.filter((p) => p.status === 'Paused').length,
      completedProjects: projects.filter((p) => p.status === 'Completed').length,
      ProjectCount: projects.filter((p) =>
        ['Active', 'Paused', 'Completed'].includes(p.status)
      ).length,
      focuses: focuses.slice(0, 3),
      recentDiary: diary[0] || null,
      todayHabits: {
        completed,
        total: habits.length,
        habits: todayHabitsData.slice(0, 4),
      },
      domainStats,
    });
  };

  const pct =
    stats.todayHabits.total > 0
      ? Math.round((stats.todayHabits.completed / stats.todayHabits.total) * 100)
      : 0;

  const modules = [
    {
      name: 'Dictionary',
      icon: BookOpen,
      path: '/dictionary',
      accent: '#60a5fa',
      description: 'Central hub for all links and resources',
      stat: `${stats.totalLinks} links saved`,
    },
    {
      name: 'Diary',
      icon: Calendar,
      path: '/diary',
      accent: '#c084fc',
      description: 'Reflect and journal your thoughts',
      stat: `${stats.diaryEntries} entries`,
    },
    {
      name: 'Habits',
      icon: CheckSquare,
      path: '/habits',
      accent: '#34d399',
      description: 'Track your daily habits and routines',
      stat: `${stats.todayHabits.completed}/${stats.todayHabits.total} done today`,
    },
    {
      name: 'Projects',
      icon: Briefcase,
      path: '/projects',
      accent: '#fb923c',
      description: 'Manage your ongoing work',
      stat: `${stats.ProjectCount} total projects`,
    },
    {
      name: 'Track Spends',
      icon: Calculator,
      path: '/tools',
      accent: '#2dd4bf',
      description: 'Budget calculator and financial tools',
      stat: 'Financial tools',
    },
  ];

  const domainData = [
    { name: 'Physical', icon: Dumbbell, color: '#34d399', path: '/habits' },
    { name: 'Spiritual', icon: Heart, color: '#c084fc', path: '/diary' },
    { name: 'Mental', icon: Brain, color: '#60a5fa', path: '/diary' },
    { name: 'Technical', icon: Code, color: '#fb923c', path: '/projects' },
    { name: 'Self', icon: User, color: '#f472b6', path: '/dictionary' },
    { name: 'Financial', icon: DollarSign, color: '#2dd4bf', path: '/tools' },
  ];

  const overviewItems = [
    { label: 'Links', value: stats.totalLinks, color: '#60a5fa' },
    { label: 'Diary entries', value: stats.diaryEntries, color: '#c084fc' },
    { label: 'Total projects', value: stats.ProjectCount, color: '#fb923c' },
    { label: 'Active habits', value: stats.activeHabits, color: '#34d399' },
  ];

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 px-4 sm:px-6 py-8 max-w-6xl mx-auto"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="mb-10 relative">
        {/* ambient glow */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -top-8 right-0 w-48 h-48 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

        <div className="relative">
          <p
            className="text-amber-400 text-xs tracking-[0.25em] uppercase font-bold mb-2"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <h1
            className="text-4xl sm:text-6xl font-extrabold text-zinc-100 leading-none tracking-tight mb-1"
          >
            {getGreeting()}.
          </h1>
          <p className="text-zinc-500 text-sm mt-3">
            Here's your Life OS overview for today.
          </p>
        </div>
      </div>

      {/* ── Overview Numbers ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {overviewItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
          >
            <p
              className="text-3xl font-extrabold mb-1"
              style={{ color: item.color, fontFamily: "'Space Mono', monospace" }}
            >
              {item.value}
            </p>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ── Three-Column Info Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

        {/* Today's Habits */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-zinc-500 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
              Habits today
            </span>
            <Activity className="w-4 h-4 text-zinc-600" />
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <Ring pct={pct} size={84} stroke={6} color="#34d399" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-xl font-bold text-zinc-100"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {pct}%
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              {stats.todayHabits.habits.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${
                      h.checked ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    {h.checked && (
                      <svg viewBox="0 0 12 12" className="w-2 h-2 text-white">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`truncate ${h.checked ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                    {h.name}
                  </span>
                </div>
              ))}
              {stats.todayHabits.total > 4 && (
                <p className="text-xs text-zinc-600">+{stats.todayHabits.total - 4} more</p>
              )}
            </div>
          </div>

          <Link
            to="/habits"
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            Open habits <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Recent Diary */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-zinc-500 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
              Latest entry
            </span>
            <Calendar className="w-4 h-4 text-zinc-600" />
          </div>

          {stats.recentDiary ? (
            <div className="flex-1">
              <p
                className="text-xs text-amber-400 mb-2 font-mono"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {new Date(stats.recentDiary.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-5">
                {stats.recentDiary.content}
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-600 italic">No entries yet. Start journaling.</p>
          )}

          <Link
            to="/diary"
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors mt-4"
          >
            Open diary <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Current Focus */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs text-zinc-500 uppercase tracking-widest" style={{ fontFamily: "'Space Mono', monospace" }}>
              Current focus
            </span>
            <Target className="w-4 h-4 text-zinc-600" />
          </div>

          {stats.focuses.length > 0 ? (
            <div className="space-y-3">
              {stats.focuses.map((focus) => {
                const days = getDaysRemaining(focus.deadline);
                return (
                  <div
                    key={focus.id}
                    className="border-l-2 border-amber-500 pl-3"
                  >
                    <p className="text-sm font-semibold text-zinc-200 truncate">{focus.title}</p>
                    {focus.deadline && (
                      <p
                        className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        <Clock className="w-3 h-3" />
                        <span
                          className={
                            days < 0
                              ? 'text-red-400'
                              : days === 0
                              ? 'text-amber-400'
                              : 'text-zinc-500'
                          }
                        >
                          {days > 0
                            ? `${days}d left`
                            : days === 0
                            ? 'Due today'
                            : `${Math.abs(days)}d overdue`}
                        </span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 italic">No active focuses set.</p>
          )}

          <Link
            to="/dictionary"
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors mt-4"
          >
            Manage focuses <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Module Cards ─────────────────────────────────────────────────── */}
      <div className="mb-10">
        <SectionLabel>Your modules</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <ModuleCard key={m.name} module={m} />
          ))}
        </div>
      </div>

      {/* ── Life Domains ─────────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Life domains</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {domainData.map((d) => (
            <DomainPill key={d.name} domain={d} count={stats.domainStats[d.name] || 0} />
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-4 text-center">
          Click any domain to access related tools and content.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;