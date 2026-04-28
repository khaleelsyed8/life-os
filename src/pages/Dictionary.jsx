import { useState } from "react";
import { 
  Target, Plus, Trash2, ExternalLink, Clock, 
  Link as LinkIcon, Folder, Calendar, X 
} from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useTheme } from "./ThemeContext";

/* ── Design tokens (Mirrored from Diary.jsx) ─────────────────────────── */
const t = (isDark) => ({
  bg:        isDark ? "#0a0a0f" : "#f4f4f8",
  surface:   isDark ? "#18181b" : "#ffffff",
  surface2:  isDark ? "#1c1c22" : "#ededf3",
  border:    isDark ? "#27272a" : "#e4e4e7",
  border2:   isDark ? "#3f3f46" : "#d4d4d8",
  text:      isDark ? "#f0f0f8" : "#09090b",
  textSub:   isDark ? "#a1a1aa" : "#3f3f46",
  textMuted: isDark ? "#71717a" : "#71717a",
  textFaint: isDark ? "#52525b" : "#a1a1aa",
  accent:    isDark ? "#60a5fa" : "#2563eb", // Dictionary-specific blue accent
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.35)",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

const DOMAIN_COLORS = {
  Physical: "#34d399", Spiritual: "#c084fc", Mental:    "#60a5fa",
  Technical:"#fb923c", Self:      "#f472b6", Financial: "#2dd4bf",
  Work:     "#94a3b8", Learning:  "#f59e0b",
};
const DOMAINS = Object.keys(DOMAIN_COLORS);

/* ── Shared UI Components ────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ fontFamily: mono, color: tk.accent }}>
      {children}
    </span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

const Field = ({ value, onChange, placeholder, onFocus, onBlur, list, tk }) => (
  <input
    value={value} onChange={onChange} placeholder={placeholder}
    list={list}
    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
    style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text, fontFamily: sans }}
    onFocus={(e) => { e.target.style.borderColor = tk.accent; onFocus?.(); }}
    onBlur={(e)  => { e.target.style.borderColor = tk.inputBdr; onBlur?.(); }}
  />
);

/* ── Logic Helpers ───────────────────────────────────────────────────── */
function daysLeft(d) {
  return Math.ceil((new Date(d).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
}
function groupByDomain(links) {
  return links.reduce((a, l) => { a[l.domain] = a[l.domain] || []; a[l.domain].push(l); return a; }, {});
}

/* ── Main Component ──────────────────────────────────────────────────── */
export default function Dictionary() {
  const { isDark } = useTheme();
  const tk = t(isDark);

  const [focusItems, setFocusItems] = useLocalStorage("focus-items", []);
  const [links,      setLinks]      = useLocalStorage("links", []);

  const [title,     setTitle]     = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl,   setLinkUrl]   = useState("");
  const [domain,    setDomain]    = useState("");
  
  const [deletingFocusId, setDeletingFocusId] = useState(null);
  const [deletingLinkId,  setDeletingLinkId]  = useState(null);

  function addFocus() {
    if (!title.trim()) return;
    setFocusItems([...focusItems, { id: Date.now(), title, startDate: new Date().toISOString(), endDate: endDate || null }]);
    setTitle(""); setEndDate("");
  }
  function removeFocus(id) { setFocusItems(focusItems.filter((f) => f.id !== id)); }

  function addLink() {
    if (!linkTitle || !linkUrl || !domain) return;
    setLinks([...links, { id: Date.now(), title: linkTitle, url: linkUrl, domain }]);
    setLinkTitle(""); setLinkUrl(""); setDomain("");
  }
  function removeLink(id) { setLinks(links.filter((l) => l.id !== id)); }

  const grouped = groupByDomain(links);

  return (
    <div className="space-y-10 pb-10" style={{ fontFamily: sans }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-bold mb-1"
            style={{ fontFamily: mono, color: tk.accent }}>
            Resources & Focus
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: tk.text }}>
            Dictionary
          </h1>
          <p className="text-sm mt-2" style={{ color: tk.textMuted }}>Define what matters. Store what helps.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Focus items", value: focusItems.length, color: tk.accent },
            { label: "Links",       value: links.length,      color: tk.textSub },
          ].map((s) => (
            <div key={s.label} className="rounded-xl px-4 py-3 text-center min-w-[80px]"
              style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: mono }}>{s.value}</p>
              <p className="text-xs mt-0.5 uppercase tracking-tighter" style={{ color: tk.textFaint }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOCUS SECTION ──────────────────────────────────────────── */}
      <section className="space-y-6">
        <SL tk={tk}>Current focus</SL>

        <div className="rounded-2xl p-5"
          style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <p className="text-xs uppercase font-bold tracking-widest mb-4" 
             style={{ fontFamily: mono, color: tk.textFaint }}>
             Set new priority & Deadline
          </p>
          <div className="flex flex-col gap-3">
            <Field value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you focusing on?" tk={tk} />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1 rounded-xl px-4 transition-colors"
                style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}` }}>
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: tk.textFaint }} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="py-3 bg-transparent outline-none text-sm w-full"
                  style={{ color: tk.text, fontFamily: sans }} />
              </div>
              <button onClick={addFocus} disabled={!title.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 whitespace-nowrap"
                style={{ background: tk.accent, color: "#ffffff" }}>
                <Plus className="w-4 h-4" /> Add Focus
              </button>
            </div>
          </div>
        </div>

        {focusItems.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed ${tk.border}` }}>
            <Target className="w-10 h-10 mx-auto mb-3" style={{ color: tk.textFaint }} />
            <p className="text-sm" style={{ color: tk.textFaint }}>No focus items yet. Define your path.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {focusItems.map((item) => {
              const rem      = item.endDate ? daysLeft(item.endDate) : null;
              const overdue  = rem !== null && rem < 0;
              const urgent   = rem !== null && rem >= 0 && rem <= 3;
              const accentL  = overdue ? "#ef4444" : urgent ? tk.accent : "#60a5fa";
              return (
                <div key={item.id}
                  className="group rounded-2xl p-4 transition-all"
                  style={{
                    background:    tk.surface,
                    border:        `1px solid ${tk.border}`,
                    borderLeft:    `3px solid ${accentL}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.border2)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.border)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base" style={{ color: tk.text }}>{item.title}</p>
                      {rem !== null ? (
                        <p className="text-xs mt-1.5 flex items-center gap-1.5 font-bold" 
                           style={{ fontFamily: mono, color: accentL }}>
                          <Clock className="w-3 h-3" />
                          {overdue ? `${Math.abs(rem)}d overdue` : rem === 0 ? "Due today" : `${rem}d left`}
                        </p>
                      ) : (
                        <p className="text-xs mt-1.5 font-medium" style={{ color: tk.textFaint }}>Ongoing focus</p>
                      )}
                    </div>
                    <button onClick={() => setDeletingFocusId(item.id)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: tk.textFaint }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── LINKS SECTION ──────────────────────────────────────────── */}
      <section className="space-y-6">
        <SL tk={tk}>Quick links</SL>

        <div className="rounded-2xl p-5"
          style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <p className="text-xs uppercase font-bold tracking-widest mb-4" 
             style={{ fontFamily: mono, color: tk.textFaint }}>
             Save resource
          </p>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="Link title" tk={tk} />
              <Field value={linkUrl}   onChange={(e) => setLinkUrl(e.target.value)}   placeholder="https://..." tk={tk} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Field value={domain} onChange={(e) => setDomain(e.target.value)}
                  placeholder="Domain (Physical, Work, Learning...)" list="domain-opts" tk={tk} />
                <datalist id="domain-opts">{DOMAINS.map((d) => <option key={d} value={d} />)}</datalist>
              </div>
              <button onClick={addLink} disabled={!linkTitle || !linkUrl || !domain}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 whitespace-nowrap"
                style={{ background: "#60a5fa", color: "#ffffff" }}>
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>
          </div>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed ${tk.border}` }}>
            <LinkIcon className="w-10 h-10 mx-auto mb-3" style={{ color: tk.textFaint }} />
            <p className="text-sm" style={{ color: tk.textFaint }}>No links saved yet. Store what helps.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(grouped).map(([dom, domLinks]) => {
              const c = DOMAIN_COLORS[dom] || tk.textFaint;
              return (
                <div key={dom} className="rounded-2xl p-5"
                  style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
                  <div className="flex items-center gap-3 mb-5 pb-3" style={{ borderBottom: `1px solid ${tk.border}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${c}15` }}>
                      <Folder className="w-4.5 h-4.5" style={{ color: c }} />
                    </div>
                    <h3 className="font-bold text-lg flex-1" style={{ color: tk.text }}>{dom}</h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: `${c}15`, color: c, fontFamily: mono }}>
                      {domLinks.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {domLinks.map((link) => (
                      <div key={link.id}
                        className="group/l flex items-center justify-between p-2.5 rounded-xl transition-all gap-3"
                        style={{ background: "transparent" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = tk.surface2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <a href={link.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2.5 text-sm flex-1 min-w-0 transition-opacity hover:opacity-80" style={{ color: c }}>
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate font-medium">{link.title}</span>
                        </a>
                        <button onClick={() => setDeletingLinkId(link.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover/l:opacity-100 transition-all flex-shrink-0"
                          style={{ color: tk.textFaint }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── DELETE CONFIRMATION MODAL ───────────────────────────────── */}
      {(deletingFocusId || deletingLinkId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: tk.overlay, backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setDeletingFocusId(null); setDeletingLinkId(null); } }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: tk.surface, border: `1px solid ${tk.border}` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
              <Trash2 className="w-6 h-6" style={{ color: "#ef4444" }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: tk.text }}>Delete item?</h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              This information will be removed from your dictionary permanently.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setDeletingFocusId(null); setDeletingLinkId(null); }}
                className="px-5 py-2.5 text-sm rounded-xl transition-colors font-bold"
                style={{ border: `1px solid ${tk.border2}`, color: tk.textMuted, background: "transparent" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingFocusId) { removeFocus(deletingFocusId); setDeletingFocusId(null); }
                  if (deletingLinkId) { removeLink(deletingLinkId); setDeletingLinkId(null); }
                }}
                className="px-6 py-2.5 text-sm rounded-xl font-bold shadow-lg shadow-red-900/20"
                style={{ background: "#ef4444", color: "#ffffff" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}