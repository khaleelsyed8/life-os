import { useState } from "react";
import { Calendar, Archive, Trash2, Plus, RotateCcw, BookOpen } from "lucide-react";
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
  "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/60 text-sm transition-colors resize-none";

export default function Diary() {
  const [entries, setEntries] = useLocalStorage("diary-entries", []);
  const [text, setText] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function addEntry() {
    if (!text.trim()) return;
    setEntries([{ id: Date.now(), content: text, createdAt: new Date().toISOString(), archived: false }, ...entries]);
    setText("");
  }

  function archiveEntry(id) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, archived: true } : e)));
  }

  function deleteEntry(id) {
    setEntries(entries.filter((e) => e.id !== id));
  }

  function unarchiveEntry(id) {
    setEntries(entries.map((e) => (e.id === id ? { ...e, archived: false } : e)));
  }

  const activeEntries = entries.filter((e) => !e.archived);
  const archivedEntries = entries.filter((e) => e.archived);

  return (
    <div className="space-y-8" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-purple-400 mb-1"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            Personal Journal
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 leading-none">Diary</h1>
          <p className="text-zinc-500 text-sm mt-2">Write freely. No pressure.</p>
        </div>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          style={{
            fontFamily: "'Space Mono', monospace",
            background: showArchived ? "#c084fc22" : "#18181b",
            border: `1px solid ${showArchived ? "#c084fc66" : "#27272a"}`,
            color: showArchived ? "#c084fc" : "#71717a",
          }}
        >
          <Archive className="w-3.5 h-3.5" />
          {showArchived ? "Hide archived" : "Show archived"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active", value: activeEntries.length, color: "#c084fc" },
          { label: "Archived", value: archivedEntries.length, color: "#71717a" },
          { label: "Total", value: entries.length, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-center">
            <p className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: s.color, fontFamily: "'Space Mono', monospace" }}>
              {s.value}
            </p>
            <p className="text-zinc-500 text-xs uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Write area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <SL>New entry</SL>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className={inputCls}
          rows={6}
          style={{ minHeight: 140 }}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-zinc-600" style={{ fontFamily: "'Space Mono', monospace" }}>
            {text.length} chars
          </span>
          <button
            onClick={addEntry}
            disabled={!text.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: "#c084fc", color: "#0a0a0f" }}
          >
            <Plus className="w-4 h-4" />
            Save entry
          </button>
        </div>
      </div>

      {/* Active entries */}
      {activeEntries.length > 0 && (
        <div>
          <SL>Entries ({activeEntries.length})</SL>
          <div className="space-y-3">
            {activeEntries.map((entry) => (
              <div key={entry.id} className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-purple-400" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-xs text-zinc-600" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => archiveEntry(entry.id)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                  <button
                    onClick={() => setDeletingId(entry.id)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeEntries.length === 0 && (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No entries yet. Write your first one above.</p>
        </div>
      )}

      {/* Archived */}
      {showArchived && (
        <div>
          <SL>Archived ({archivedEntries.length})</SL>
          {archivedEntries.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">Nothing archived yet.</p>
          ) : (
            <div className="space-y-3">
              {archivedEntries.map((entry) => (
                <div key={entry.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-zinc-500 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-800">
                    <button onClick={() => unarchiveEntry(entry.id)}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> Unarchive
                    </button>
                    <button onClick={() => setDeletingId(entry.id)}
                      className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Delete entry?</h3>
            <p className="text-sm text-zinc-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { deleteEntry(deletingId); setDeletingId(null); }}
                className="px-5 py-2 text-sm rounded-xl font-bold text-white transition-colors"
                style={{ background: "#ef4444" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}