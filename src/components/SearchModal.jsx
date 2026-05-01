import { useEffect, useState, useRef } from "react";
import { Search, X, BookOpen, Calendar, CheckSquare, Briefcase, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getAll() {
  const parse = (k, fallback = []) => {
    try { return JSON.parse(localStorage.getItem(k)) || fallback; } catch { return fallback; }
  };

  const diary    = parse("diary-entries").map((e) => ({
    id: `diary-${e.id}`, type: "Diary", icon: Calendar,
    title: e.content.slice(0, 60) + (e.content.length > 60 ? "…" : ""),
    sub:   new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    path:  "/diary", color: "#c084fc",
  }));

  const links    = parse("links").map((l) => ({
    id: `link-${l.id}`, type: "Link", icon: BookOpen,
    title: l.title, sub: l.domain,
    path:  l.url,   external: true, color: "#60a5fa",
  }));

  const habits   = parse("habits").map((h) => ({
    id: `habit-${h.id}`, type: "Habit", icon: CheckSquare,
    title: h.name, sub: "Habit tracker",
    path:  "/habits", color: "#34d399",
  }));

  const projects = parse("projects").map((p) => ({
    id: `proj-${p.id}`, type: "Project", icon: Briefcase,
    title: p.name, sub: p.status,
    path:  "/projects", color: "#fb923c",
  }));

  return [...diary, ...links, ...habits, ...projects];
}

export default function SearchModal() {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [cursor,  setCursor]  = useState(0);
  const inputRef              = useRef(null);
  const navigate              = useNavigate();

  /* ⌘K / Ctrl+K listener */
  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  /* Focus input on open */
  useEffect(() => {
    if (open) {
      setQuery(""); setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  /* Filter */
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      getAll()
        .filter((r) => r.title.toLowerCase().includes(q) || r.sub?.toLowerCase().includes(q))
        .slice(0, 8)
    );
    setCursor(0);
  }, [query]);

  /* Keyboard nav */
  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && results[cursor]) select(results[cursor]);
  }

  function select(item) {
    setOpen(false);
    if (item.external) { window.open(item.path, "_blank", "noreferrer"); }
    else               { navigate(item.path); }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      style={{ background: "var(--overlay)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div
        className="w-[92%] max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", fontFamily: "'Syne', sans-serif" }}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search diary, links, habits, projects…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text)" }}
          />
          <div className="flex items-center gap-1.5">
            <kbd className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-faint)", fontFamily: "'Space Mono', monospace" }}>
              ESC
            </kbd>
            <button onClick={() => setOpen(false)}
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ color: "var(--text-faint)" }}>
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() === "" && (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>Type to search across everything.</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-faint)", fontFamily: "'Space Mono', monospace" }}>⌘K to open · ESC to close</p>
            </div>
          )}

          {query.trim() !== "" && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: "var(--text-faint)" }}>No results for "{query}"</p>
            </div>
          )}

          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => select(item)}
                onMouseEnter={() => setCursor(i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: cursor === i ? "var(--bg-surface-2)" : "transparent",
                  borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}22` }}>
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{item.title}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-faint)" }}>
                    <span className="font-bold" style={{ color: item.color }}>{item.type}</span>
                    {item.sub ? ` · ${item.sub}` : ""}
                  </p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 flex items-center gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["ESC", "close"]].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-faint)" }}>
              <kbd className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border)", fontFamily: "'Space Mono', monospace" }}>
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}