import { Heart, Github, Linkedin, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Dictionary', path: '/dictionary' },
    { name: 'Diary', path: '/diary' },
    { name: 'Habits', path: '/habits' },
    { name: 'Projects', path: '/projects' },
    { name: 'Tools', path: '/tools' },
  ];

  const domains = [
    'Physical',
    'Spiritual', 
    'Mental',
    'Technical',
    'Self',
    'Financial'
  ];

  return (
    <footer className="mt-16 sm:mt-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Life OS</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Your personal operating system for managing life across all domains. 
              Built for clarity, designed for growth.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/khaleelsyed8"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/syed-khaleel-ahmed/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@lifeos.com"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/80 hover:text-white text-sm transition-colors inline-block hover:translate-x-1 transform duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Life Domains */}
          <div>
            <h4 className="text-lg font-bold mb-4">Life Domains</h4>
            <ul className="space-y-2">
              {domains.map((domain) => (
                <li key={domain}>
                  <span className="text-white/80 text-sm block">
                    {domain}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-bold mb-4">Features</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>📝 Daily Journaling</li>
              <li>✅ Habit Tracking</li>
              <li>🎯 Focus Management</li>
              <li>💼 Project Tracking</li>
              <li>💰 Budget Tools</li>
              <li>🔗 Link Organization</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-6 sm:my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/80 text-xs sm:text-sm text-center sm:text-left">
            © {currentYear} Life OS. Built with{' '}
            <Heart className="w-4 h-4 inline-block text-red-400 animate-pulse" />{' '}
            for personal growth.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <button className="text-white/80 hover:text-white transition-colors">
              Privacy
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              Terms
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              Feedback
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-white/60 text-xs">
            Version 1.0.0 • Last updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </footer>
  );
}