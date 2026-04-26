import { NavLink } from "react-router-dom";
import { Zap, Menu, X, Terminal } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/dictionary", label: "Dictionary" },
  { path: "/diary", label: "Diary" },
  { path: "/habits", label: "Habits" },
  { path: "/projects", label: "Projects" },
  { path: "/tools", label: "Tools" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(10, 10, 15, 0.92)"
          : "rgba(10, 10, 15, 0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #27272a",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <nav className="max-w-6xl mx-auto px-5 py-0">
        <div className="flex items-center justify-between h-14">

          {/* ── Logo ── */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: "#f59e0b22",
                border: "1px solid #f59e0b44",
              }}
            >
              <Terminal
                className="w-4 h-4 transition-colors"
                style={{ color: "#f59e0b" }}
              />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: "#f0f0f8" }}
            >
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
          </NavLink>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                    isActive ? "" : ""
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? "#f59e0b" : "#71717a",
                })}
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {/* Active underline */}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                        style={{ background: "#f59e0b" }}
                      />
                    )}
                    {/* Hover dot */}
                    {!isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: "#52525b" }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* ── Mobile toggle ── */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{
              background: open ? "#f59e0b22" : "#18181b",
              border: `1px solid ${open ? "#f59e0b44" : "#27272a"}`,
              color: open ? "#f59e0b" : "#71717a",
            }}
            aria-label="Toggle menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: open ? 320 : 0 }}
        >
          <div
            className="py-3 pb-5 flex flex-col gap-1"
            style={{ borderTop: "1px solid #27272a" }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={({ isActive }) => ({
                  background: isActive ? "#f59e0b14" : "transparent",
                  color: isActive ? "#f59e0b" : "#a1a1aa",
                  borderLeft: isActive
                    ? "2px solid #f59e0b"
                    : "2px solid transparent",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}