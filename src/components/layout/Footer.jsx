import { Github, Linkedin, Mail, Terminal, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  const quickLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Dictionary", path: "/dictionary" },
    { name: "Diary", path: "/diary" },
    { name: "Habits", path: "/habits" },
    { name: "Projects", path: "/projects" },
    { name: "Tools", path: "/tools" },
  ];

  const domains = [
    { name: "Physical", color: "#34d399" },
    { name: "Spiritual", color: "#c084fc" },
    { name: "Mental", color: "#60a5fa" },
    { name: "Technical", color: "#fb923c" },
    { name: "Self", color: "#f472b6" },
    { name: "Financial", color: "#2dd4bf" },
  ];

  const features = [
    "Daily Journaling",
    "Habit Tracking",
    "Focus Management",
    "Project Tracking",
    "Budget Tools",
    "Link Organization",
  ];

  return (
    <footer
      style={{
        background: "#0a0a0f",
        borderTop: "1px solid #27272a",
        fontFamily: "'Syne', sans-serif",
        marginTop: "6rem",
      }}
    >
      {/* ── Top divider accent ── */}
      <div
        style={{
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #f59e0b44, #c084fc44, transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto px-5 py-12">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "#f59e0b22", border: "1px solid #f59e0b44" }}
              >
                <Terminal className="w-4 h-4" style={{ color: "#f59e0b" }} />
              </div>
              <span className="text-lg font-bold" style={{ color: "#f0f0f8" }}>
                Life{" "}
                <span
                  style={{
                    color: "#f59e0b",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  OS
                </span>
              </span>
            </div>

            <p className="text-sm leading-relaxed mb-5" style={{ color: "#52525b" }}>
              Your personal operating system for managing life across all
              domains. Built for clarity, designed for growth.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {[
                {
                  href: "https://github.com/khaleelsyed8",
                  icon: Github,
                  label: "GitHub",
                },
                {
                  href: "https://www.linkedin.com/in/syed-khaleel-ahmed/",
                  icon: Linkedin,
                  label: "LinkedIn",
                },
                {
                  href: "mailto:hello@lifeos.com",
                  icon: Mail,
                  label: "Email",
                },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    color: "#71717a",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#f59e0b44";
                    e.currentTarget.style.color = "#f59e0b";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#27272a";
                    e.currentTarget.style.color = "#71717a";
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{
                color: "#f59e0b",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-1.5 text-sm transition-colors group"
                    style={{ color: "#52525b" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#a1a1aa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#52525b")
                    }
                  >
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Life Domains */}
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{
                color: "#f59e0b",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Life Domains
            </p>
            <ul className="space-y-2.5">
              {domains.map((d) => (
                <li key={d.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span style={{ color: "#52525b" }}>{d.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{
                color: "#f59e0b",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Features
            </p>
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li key={f} className="text-sm" style={{ color: "#52525b" }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: "1px solid #27272a" }}
        >
          <p
            className="text-xs"
            style={{
              color: "#3f3f46",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            © {year} Life OS — built for personal growth.
          </p>

          <div className="flex gap-5">
            {["Privacy", "Terms", "Feedback"].map((label) => (
              <button
                key={label}
                className="text-xs transition-colors"
                style={{ color: "#3f3f46" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#71717a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#3f3f46")
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Version */}
        <p
          className="text-center text-xs mt-5"
          style={{
            color: "#27272a",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          v1.0.0 · Last updated{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </footer>
  );
}