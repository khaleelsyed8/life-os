import { NavLink } from "react-router-dom";
import { Terminal, Menu, X, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../../pages/ThemeContext";
import SettingsModal from "../ui/SettingsModal";

const navItems = [
  { path: "/",           label: "Dashboard"  },
  { path: "/dictionary", label: "Dictionary" },
  { path: "/diary",      label: "Diary"      },
  { path: "/habits",     label: "Habits"     },
  { path: "/projects",   label: "Projects"   },
  { path: "/tools",      label: "Tools"      },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState(false);
  const { isDark }              = useTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Close mobile menu on resize to desktop */
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const bg = isDark
    ? (scrolled ? "rgba(10,10,15,0.95)"  : "rgba(10,10,15,0.75)")
    : (scrolled ? "rgba(255,255,255,0.95)" : "rgba(244,244,248,0.75)");

  const borderColor = isDark ? "#27272a" : "#e4e4e7";
  const accent      = isDark ? "#f59e0b" : "#d97706";
  const textMuted   = isDark ? "#71717a" : "#71717a";
  const textSub     = isDark ? "#a1a1aa" : "#3f3f46";
  const textMain    = isDark ? "#f0f0f8" : "#09090b";
  const surfaceBg   = isDark ? "#18181b" : "#ffffff";

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background:     bg,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom:   `1px solid ${borderColor}`,
          fontFamily:     "'Syne', sans-serif",
        }}
      >
        <nav className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
              >
                <Terminal className="w-4 h-4" style={{ color: accent }} />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: textMain }}>
                Life{" "}
                <span style={{ color: accent, fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
                  OS
                </span>
              </span>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className="relative px-4 py-1.5 text-sm font-semibold transition-colors duration-200"
                  style={({ isActive }) => ({ color: isActive ? accent : textMuted })}
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                          style={{ background: accent }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Settings */}
              <button
                onClick={() => setSettings(true)}
                title="Settings"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{ background: surfaceBg, border: `1px solid ${borderColor}`, color: textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.color = textMuted; }}
              >
                <Settings size={15} />
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setOpen((o) => !o)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: open ? `${accent}22` : surfaceBg,
                  border:     `1px solid ${open ? `${accent}44` : borderColor}`,
                  color:      open ? accent : textMuted,
                }}
                aria-label="Toggle menu"
              >
                {open ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className="md:hidden overflow-hidden transition-all duration-300"
            style={{ maxHeight: open ? 340 : 0 }}
          >
            <div
              className="py-3 pb-5 flex flex-col gap-1"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={({ isActive }) => ({
                    background: isActive ? `${accent}14` : "transparent",
                    color:      isActive ? accent : textSub,
                    borderLeft: isActive ? `2px solid ${accent}` : "2px solid transparent",
                  })}
                >
                  {item.label}
                </NavLink>
              ))}

              <button
                onClick={() => { setOpen(false); setSettings(true); }}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-all flex items-center gap-2 mt-1"
                style={{ color: textMuted, borderLeft: "2px solid transparent" }}
              >
                <Settings size={14} /> Settings
              </button>
            </div>
          </div>
        </nav>
      </header>

      <SettingsModal open={settings} onClose={() => setSettings(false)} />
    </>
  );
}