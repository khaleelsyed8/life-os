import { useState } from "react";
import { Target, Plus, Trash2, ExternalLink, Clock, AlertCircle, CheckCircle, Link as LinkIcon, Folder, Star, Calendar } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";

const SL = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase text-amber-400 font-bold"
      style={{ fontFamily: "'Space Mono', monospace" }}>
      {children}
    </span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
);

const inputCls =
  "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 text-sm transition-colors";

function daysLeft(endDate) {
  const diff = new Date(endDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function groupByDomain(links) {
  return links.reduce((acc, link) => {
    acc[link.domain] = acc[link.domain] || [];
    acc[link.domain].push(link);
    return acc;
  }, {});
}

const DOMAIN_COLORS = {
  Physical: "#34d399", Spiritual: "#c084fc", Mental: "#60a5fa",
  Technical: "#fb923c", Self: "#f472b6", Financial: "#2dd4bf",
  Work: "#94a3b8", Learning: "#f59e0b",
};

const suggestedDomains = ["Physical", "Spiritual", "Mental", "Technical", "Self", "Financial", "Work", "Learning"];

export default function Dictionary() {
  const [focusItems, setFocusItems] = useLocalStorage("focus-items", []);
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");

  const [links, setLinks] = useLocalStorage("links", []);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [domain, setDomain] = useState("");

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

  const groupedLinks = groupByDomain(links);

  return (
    <div className="space-y-10" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-blue-400 mb-1"
            style={{ fontFamily: "'Space Mono', monospace" }}>Resources & Focus</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 leading-none">Dictionary</h1>
          <p className="text-zinc-500 text-sm mt-2">Define what matters. Store what helps.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Focus items", value: focusItems.length, color: "#f59e0b" },
            { label: "Links", value: links.length, color: "#60a5fa" },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOCUS ─────────────────────────────────────────── */}
      <section>
        <SL>Current focus</SL>

        {/* Add form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
            Add new focus
          </p>
          <div className="flex flex-col gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you focusing on?"
              className={inputCls}
              onKeyDown={(e) => e.key === "Enter" && addFocus()}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4">
                <Calendar className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="py-3 bg-transparent outline-none text-sm text-zinc-300 w-full" />
              </div>
              <button onClick={addFocus} disabled={!title.trim()}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all whitespace-nowrap"
                style={{ background: "#f59e0b", color: "#0a0a0f" }}>
                <Plus className="w-4 h-4" /> Add focus
              </button>
            </div>
          </div>
        </div>

        {/* Focus list */}
        {focusItems.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
            <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No focus items yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {focusItems.map((item) => {
              const remaining = item.endDate ? daysLeft(item.endDate) : null;
              const isOverdue = remaining !== null && remaining < 0;
              const isUrgent = remaining !== null && remaining >= 0 && remaining <= 3;

              return (
                <div key={item.id}
                  className="group bg-zinc-900 border rounded-2xl p-4 hover:border-zinc-700 transition-colors"
                  style={{
                    borderColor: isOverdue ? "#ef444444" : isUrgent ? "#f59e0b44" : "#27272a",
                    borderLeftWidth: 2,
                    borderLeftColor: isOverdue ? "#ef4444" : isUrgent ? "#f59e0b" : "#60a5fa",
                  }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-100 text-base">{item.title}</p>
                      {remaining !== null ? (
                        <p className="text-xs mt-1 flex items-center gap-1.5"
                          style={{ fontFamily: "'Space Mono', monospace", color: isOverdue ? "#ef4444" : isUrgent ? "#f59e0b" : "#71717a" }}>
                          <Clock className="w-3 h-3" />
                          {isOverdue ? `${Math.abs(remaining)}d overdue` : remaining === 0 ? "Due today" : `${remaining}d left`}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-600 mt-1">Ongoing focus</p>
                      )}
                    </div>
                    <button onClick={() => removeFocus(item.id)}
                      className="p-2 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── LINKS ─────────────────────────────────────────── */}
      <section>
        <SL>Quick links</SL>

        {/* Add form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
            Add new link
          </p>
          <div className="flex flex-col gap-3">
            <input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Link title" className={inputCls} />
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com" className={inputCls} />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input value={domain} onChange={(e) => setDomain(e.target.value)}
                  placeholder="Domain (e.g., Mental, Technical…)"
                  list="domain-suggestions"
                  className={inputCls} />
                <datalist id="domain-suggestions">
                  {suggestedDomains.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>
              <button onClick={addLink} disabled={!linkTitle || !linkUrl || !domain}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all whitespace-nowrap"
                style={{ background: "#60a5fa", color: "#0a0a0f" }}>
                <Plus className="w-4 h-4" /> Add link
              </button>
            </div>
          </div>
        </div>

        {/* Grouped links */}
        {Object.keys(groupedLinks).length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
            <LinkIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No links saved yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(groupedLinks).map(([domainName, domainLinks]) => {
              const color = DOMAIN_COLORS[domainName] || "#71717a";
              return (
                <div key={domainName} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}22` }}>
                      <Folder className="w-4 h-4" style={{ color }} />
                    </div>
                    <h3 className="font-bold text-zinc-200 flex-1">{domainName}</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: `${color}22`, color, fontFamily: "'Space Mono', monospace" }}>
                      {domainLinks.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {domainLinks.map((link) => (
                      <div key={link.id} className="group/link flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors gap-2">
                        <a href={link.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 text-sm flex-1 min-w-0 transition-colors"
                          style={{ color }}>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{link.title}</span>
                        </a>
                        <button onClick={() => removeLink(link.id)}
                          className="p-1.5 text-zinc-700 hover:text-red-400 opacity-0 group-hover/link:opacity-100 transition-all rounded hover:bg-red-500/10 flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}