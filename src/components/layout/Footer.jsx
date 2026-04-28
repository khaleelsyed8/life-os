import { Github, Linkedin, Mail, Terminal, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../pages/ThemeContext";

export default function Footer() {
  const { isDark } = useTheme();
  const year = new Date().getFullYear();

  const accent      = isDark ? "#f59e0b" : "#d97706";
  const borderColor = isDark ? "#27272a" : "#e4e4e7";
  const textFaint   = isDark ? "#52525b" : "#a1a1aa";
  const textMuted   = isDark ? "#71717a" : "#71717a";
  const textMain    = isDark ? "#f0f0f8" : "#09090b";
  const bgBase      = isDark ? "#0a0a0f" : "#f4f4f8";
  const bgSurface   = isDark ? "#18181b" : "#ffffff";
  const border2     = isDark ? "#3f3f46" : "#d4d4d8";

  const quickLinks = [
    { name: "Dashboard",  path: "/" },
    { name: "Dictionary", path: "/dictionary" },
    { name: "Diary",      path: "/diary" },
    { name: "Habits",     path: "/habits" },
    { name: "Projects",   path: "/projects" },
    { name: "Tools",      path: "/tools" },
  ];

  const domains = [
    { name: "Physical",  color: "#34d399" },
    { name: "Spiritual", color: "#c084fc" },
    { name: "Mental",    color: "#60a5fa" },
    { name: "Technical", color: "#fb923c" },
    { name: "Self",      color: "#f472b6" },
    { name: "Financial", color: "#2dd4bf" },
  ];

  const features = [
    "Daily Journaling", "Habit Tracking",    "Focus Management",
    "Project Tracking", "Budget Tools",      "Link Organization",
  ];

  return (
    <footer
      style={{
        backgroundColor: bgBase,
        borderTop:        `1px solid ${borderColor}`,
        fontFamily:       "'Syne', sans-serif",
        marginTop:        "6rem",
        transition:       "background-color 0.25s ease",
      }}
    >
      {/* Accent strip */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}44, #c084fc44, transparent)` }} />

      <div className="max-w-6xl mx-auto px-5 py-12">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
              >
                <Terminal className="w-4 h-4" style={{ color: accent }} />
              </div>
              <span className="text-lg font-bold" style={{ color: textMain }}>
                Life{" "}
                <span style={{ color: accent, fontFamily: "'Space Mono', monospace", fontSize: 13 }}>OS</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: textFaint }}>
              Your personal operating system for managing life across all domains.
              Built for clarity, designed for growth.
            </p>
            <div className="flex gap-2">
              {[
                { href: "https://github.com/khaleelsyed8",                 icon: Github,   label: "GitHub"   },
                { href: "https://www.linkedin.com/in/syed-khaleel-ahmed/", icon: Linkedin, label: "LinkedIn" },
                { href: "mailto:hello@lifeos.com",                         icon: Mail,     label: "Email"    },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: bgSurface, border: `1px solid ${borderColor}`, color: textMuted }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.color = accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor;    e.currentTarget.style.color = textMuted; }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-1.5 text-sm group transition-colors"
                    style={{ color: textFaint }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = textMain)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = textFaint)}
                  >
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Life domains */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>
              Life Domains
            </p>
            <ul className="space-y-2.5">
              {domains.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span style={{ color: textFaint }}>{d.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>
              Features
            </p>
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li key={f} className="text-sm" style={{ color: textFaint }}>{f}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <p className="text-xs" style={{ color: textFaint, fontFamily: "'Space Mono', monospace" }}>
            © {year} Life OS — built for personal growth.
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Feedback"].map((label) => (
              <button
                key={label}
                className="text-xs transition-colors"
                style={{ color: textFaint }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textMuted)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textFaint)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p
          className="text-center text-xs mt-5"
          style={{ color: textMain, fontFamily: "'Space Mono', monospace" }}
        >
          v2.0.0 · Last updated{" "}
          {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </p>
      </div>
    </footer>
  );
}