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
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Storage utility for localStorage
const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLinks: 0,
    diaryEntries: 0,
    activeHabits: 0,
    activeProjects: 0,
    focuses: [],
    recentDiary: null,
    todayHabits: { completed: 0, total: 0, habits: [] },
    domainStats: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const links = storage.get('links') || [];
    const diary = storage.get('diary-entries') || [];
    const habits = storage.get('habits') || [];
    const projects = storage.get('projects') || [];
    const focuses = storage.get('focus-items') || [];

    // Calculate today's habit completion
    const today = new Date().toISOString().split('T')[0];
    const todayHabitsData = habits.map(h => ({
      name: h.name,
      checked: h.checks && h.checks[today],
      domain: h.domain || 'Physical'
    }));
    const completed = todayHabitsData.filter(h => h.checked).length;

    // Calculate domain statistics
    const domainStats = {
      Physical: links.filter(l => l.domain === 'Physical').length,
      Spiritual: links.filter(l => l.domain === 'Spiritual').length,
      Mental: links.filter(l => l.domain === 'Mental').length,
      Technical: links.filter(l => l.domain === 'Technical').length + projects.filter(p => p.status === 'Active').length,
      Self: focuses.length,
      Financial: (storage.get('budget-items') || []).filter(i => i.month === new Date().toISOString().slice(0, 7)).length
    };

    setStats({
      totalLinks: links.length,
      diaryEntries: diary.length,
      activeHabits: habits.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      pausedProjects: projects.filter(p => p.status === "Paused").length,
      completedProjects: projects.filter(p => p.status === "Completed").length,
      ProjectCount: projects.filter(p => ["Active", "Paused", "Completed"].includes(p.status)).length,
      focuses: focuses.slice(0, 3),
      recentDiary: diary[0] || null,
      todayHabits: { 
        completed, 
        total: habits.length,
        habits: todayHabitsData.slice(0, 3) // Show max 3 habits
      },
      domainStats
    });
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const modules = [
    {
      name: 'Dictionary',
      icon: BookOpen,
      path: '/dictionary',
      color: 'from-blue-500 to-indigo-600',
      description: 'Your central hub for all links and resources',
      stat: `${stats.totalLinks} links`,
      statColor: 'text-blue-600'
    },
    {
      name: 'Diary',
      icon: Calendar,
      path: '/diary',
      color: 'from-purple-500 to-pink-600',
      description: 'Reflect and journal your thoughts',
      stat: `${stats.diaryEntries} entries`,
      statColor: 'text-purple-600'
    },
    {
      name: 'Habits',
      icon: CheckSquare,
      path: '/habits',
      color: 'from-green-500 to-emerald-600',
      description: 'Track your daily habits and routines',
      stat: `${stats.todayHabits.completed}/${stats.todayHabits.total} today`,
      statColor: 'text-green-600'
    },
    {
      name: 'Projects',
      icon: Briefcase,
      path: '/projects',
      color: 'from-orange-500 to-red-600',
      description: 'Manage your ongoing projects',
      stat: `${stats.ProjectCount} projects`,
      statColor: 'text-orange-600'
    },
    {
      name: 'Track your Spends',
      icon: Calculator,
      path: '/tools',
      color: 'from-teal-500 to-cyan-600',
      description: 'Budget calculator',
      stat: 'Financial tools',
      statColor: 'text-teal-600'
    }
  ];

  const habitCompletionPercentage = stats.todayHabits.total > 0 
    ? Math.round((stats.todayHabits.completed / stats.todayHabits.total) * 100) 
    : 0;

  const domainData = [
    { name: 'Physical', icon: Dumbbell, color: 'from-green-500 to-emerald-600', path: '/habits' },
    { name: 'Spiritual', icon: Heart, color: 'from-purple-500 to-violet-600', path: '/diary' },
    { name: 'Mental', icon: Brain, color: 'from-blue-500 to-cyan-600', path: '/diary' },
    { name: 'Technical', icon: Code, color: 'from-orange-500 to-red-600', path: '/projects' },
    { name: 'Self', icon: User, color: 'from-pink-500 to-rose-600', path: '/dictionary' },
    { name: 'Financial', icon: DollarSign, color: 'from-teal-500 to-green-600', path: '/tools' }
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {getGreeting()}
        </h1>
        <p className="text-sm sm:text-lg text-gray-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Current Focus Section */}
      {stats.focuses.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-xl sm:text-2xl font-bold">Current Focus</h2>
          </div>
          <div className="space-y-3">
            {stats.focuses.map(focus => {
              const daysRemaining = getDaysRemaining(focus.deadline);
              return (
                <div key={focus.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg truncate">{focus.title}</h3>
                      {focus.deadline && (
                        <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-white/90">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {daysRemaining > 0 ? (
                            <span>{daysRemaining} days remaining</span>
                          ) : daysRemaining === 0 ? (
                            <span className="font-semibold">Due today!</span>
                          ) : (
                            <span className="text-red-200">{Math.abs(daysRemaining)} days overdue</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 flex-shrink-0 ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
          <Link 
            to="/dictionary"
            className="inline-flex items-center gap-2 mt-4 text-xs sm:text-sm text-white/90 hover:text-white transition-all"
          >
            View all focuses <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Today's Habit Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Today's Habits</h3>
            <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
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
                  cx="64"
                  cy="64"
                  r="56"
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
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - habitCompletionPercentage / 100)}`}
                  className="transition-all duration-1000 sm:hidden"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#22c55e"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - habitCompletionPercentage / 100)}`}
                  className="transition-all duration-1000 hidden sm:block"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-1xl sm:text-3xl font-bold text-gray-800">{habitCompletionPercentage}%</div>
                  <div className="text-xs text-gray-600">{stats.todayHabits.completed}/{stats.todayHabits.total}</div>
                </div>
              </div>
            </div>

            {/* Habit List */}
            {stats.todayHabits.habits.length > 0 && (
              <div className="flex-1 space-y-2">
                {stats.todayHabits.habits.map((habit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                      habit.checked 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {habit.checked && <span className="text-xs">✓</span>}
                    </div>
                    <span className={`truncate ${habit.checked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {habit.name}
                    </span>
                  </div>
                ))}
                {stats.todayHabits.total > 3 && (
                  <div className="text-xs text-gray-500 italic">
                    +{stats.todayHabits.total - 3} more habits
                  </div>
                )}
              </div>
            )}
          </div>
          <Link 
            to="/habits"
            className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            View Habits →
          </Link>
        </div>

        {/* Recent Diary Entry */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Latest Entry</h3>
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          </div>
          {stats.recentDiary ? (
            <div>
              <p className="text-xs text-gray-500 mb-2">
                {new Date(stats.recentDiary.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-700 line-clamp-4">
                {stats.recentDiary.content}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No entries yet</p>
          )}
          <Link 
            to="/diary"
            className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-semibold mt-4"
          >
            Open Diary →
          </Link>
        </div>

        {/* Quick Overview */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Overview</h3>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Links</span>
              <span className="text-lg font-bold text-blue-600">{stats.totalLinks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Diary Entries</span>
              <span className="text-lg font-bold text-purple-600">{stats.diaryEntries}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="text-lg font-bold text-orange-600">{stats.ProjectCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Your Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.name}
                to={module.path}
                className="group bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-indigo-100 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {module.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  {module.description}
                </p>
                <div className={`text-xs sm:text-sm font-bold ${module.statColor}`}>
                  {module.stat}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Life Domains Quick Access */}
      <div className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Life Domains</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {domainData.map((domain) => {
            const Icon = domain.icon;
            const count = stats.domainStats[domain.name] || 0;
            
            return (
              <Link
                key={domain.name}
                to={domain.path}
                className="group bg-white rounded-xl p-3 sm:p-4 shadow-md border border-indigo-100 hover:shadow-lg hover:scale-105 transition-all text-center"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${domain.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">{domain.name}</p>
                {count > 0 && (
                  <p className="text-xs text-indigo-600 font-bold">{count} items</p>
                )}
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center">
          Click on any domain to access related content and tools
        </p>
      </div>
    </div>
  );
};

export default Dashboard;