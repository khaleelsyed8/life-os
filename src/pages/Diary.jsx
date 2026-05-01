import { useState } from "react";
import { Calendar, Archive, Trash2, Plus, RotateCcw, BookOpen, Pencil, Check, X, Lock, ShieldCheck, Settings2 } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useTheme } from "./ThemeContext";

/* ── Design tokens ───────────────────────────────────────────────────── */
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
  accent:    isDark ? "#f59e0b" : "#d97706",
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.35)",
});

const MOODS = [
  { emoji: "🤩", label: "Amazing"  },
  { emoji: "😊", label: "Good"     },
  { emoji: "😐", label: "Neutral"  },
  { emoji: "😔", label: "Low"      },
  { emoji: "😤", label: "Stressed" },
];

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

/* ── Small shared pieces ─────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ fontFamily: mono, color: "#c084fc" }}>
      {children}
    </span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

const MoodPicker = ({ value, onChange, tk }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs" style={{ color: tk.textFaint }}>Mood:</span>
    {MOODS.map((m) => (
      <button
        key={m.emoji}
        onClick={() => onChange(value === m.emoji ? null : m.emoji)}
        title={m.label}
        className="text-lg rounded-lg w-9 h-9 flex items-center justify-center transition-all"
        style={{
          background: value === m.emoji ? "#c084fc22" : "transparent",
          border:     `1px solid ${value === m.emoji ? "#c084fc66" : tk.border}`,
          transform:  value === m.emoji ? "scale(1.15)" : "scale(1)",
        }}
      >
        {m.emoji}
      </button>
    ))}
  </div>
);

/* ── Timestamp helpers ───────────────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ── Entry card ──────────────────────────────────────────────────────── */
function EntryCard({ entry, onArchive, onUnarchive, onDelete, onUpdate, tk, archived = false }) {
  const [editing,     setEditing]     = useState(false);
  const [editText,    setEditText]    = useState(entry.content);
  const [editMood,    setEditMood]    = useState(entry.mood);

  function saveEdit() {
    if (!editText.trim()) return;
    onUpdate(entry.id, editText.trim(), editMood);
    setEditing(false);
  }
  function cancelEdit() {
    setEditText(entry.content);
    setEditMood(entry.mood);
    setEditing(false);
  }

  return (
    <div
      className="group rounded-2xl p-5 transition-all"
      style={{
        background:   tk.surface,
        border:       `1px solid ${tk.border}`,
        opacity:      archived ? 0.75 : 1,
        fontFamily:   sans,
      }}
      onMouseEnter={(e) => { if (!editing) e.currentTarget.style.borderColor = tk.border2; }}
      onMouseLeave={(e) => { if (!editing) e.currentTarget.style.borderColor = tk.border;  }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.mood && !editing && (
            <span className="text-lg leading-none">{entry.mood}</span>
          )}
          <span className="text-xs font-semibold" style={{ fontFamily: mono, color: "#c084fc" }}>
            {fmtDate(entry.createdAt)}
          </span>
          <span className="text-xs" style={{ fontFamily: mono, color: tk.textFaint }}>
            {fmtTime(entry.createdAt)}
          </span>
          {entry.updatedAt && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                fontFamily:      mono,
                color:           tk.textFaint,
                background:      tk.surface2,
                border:          `1px solid ${tk.border}`,
              }}
            >
              edited {fmtDate(entry.updatedAt)} · {fmtTime(entry.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <MoodPicker value={editMood} onChange={setEditMood} tk={tk} />
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
            style={{
              background:   tk.inputBg,
              border:       `1px solid #c084fc`,
              color:        tk.text,
              fontFamily:   sans,
              minHeight:    120,
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ fontFamily: mono, color: tk.textFaint }}>
              {editText.length} chars
            </span>
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: "transparent",
                  border:     `1px solid ${tk.border2}`,
                  color:      tk.textMuted,
                }}
              >
                <X size={12} /> Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!editText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                style={{ background: "#c084fc", color: "#09090b" }}
              >
                <Check size={12} /> Save changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: tk.textSub }}>
          {entry.content}
        </p>
      )}

      {!editing && (
        <div
          className="flex gap-4 mt-4 pt-4"
          style={{ borderTop: `1px solid ${tk.border}` }}
        >
          {!archived && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: tk.textFaint }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {!archived ? (
            <button
              onClick={() => onArchive(entry.id)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: tk.textFaint }}
              onMouseEnter={(e) => (e.currentTarget.style.color = tk.textSub)}
              onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}
            >
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
          ) : (
            <button
              onClick={() => onUnarchive(entry.id)}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "#34d399" }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Unarchive
            </button>
          )}
          <button
            onClick={() => onDelete(entry.id)}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: tk.textFaint }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function Diary() {
  const { isDark } = useTheme();
  const tk = t(isDark);

  const [entries,      setEntries]      = useLocalStorage("diary-entries", []);
  const [text,         setText]         = useState("");
  const [mood,         setMood]         = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [deletingId,   setDeletingId]   = useState(null);

  /* ── New PIN-related State ── */
  const [savedPin, setSavedPin] = useLocalStorage("diary-archive-pin", null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinMode, setPinMode] = useState("verify"); // "verify", "set", "change"
  const [pinInput, setPinInput] = useState("");
  const [oldPinInput, setOldPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  /* ── PIN Functions ── */
  const handleArchiveToggle = () => {
    if (showArchived) {
      setShowArchived(false);
      return;
    }
    
    if (!savedPin) {
      setPinMode("set");
      setIsPinModalOpen(true);
    } else {
      setPinMode("verify");
      setIsPinModalOpen(true);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput.length !== 4) {
      setPinError("PIN must be 4 digits");
      return;
    }

    if (pinMode === "set") {
      setSavedPin(pinInput);
      setShowArchived(true);
      closePinModal();
    } else if (pinMode === "verify") {
      if (pinInput === savedPin) {
        setShowArchived(true);
        closePinModal();
      } else {
        setPinError("Incorrect PIN");
      }
    } else if (pinMode === "change") {
      if (oldPinInput !== savedPin) {
        setPinError("Current PIN is incorrect");
      } else {
        setSavedPin(pinInput);
        closePinModal();
      }
    }
  };

  const closePinModal = () => {
    setIsPinModalOpen(false);
    setPinInput("");
    setOldPinInput("");
    setPinError("");
  };

  /* ── CRUD ── */
  function addEntry() {
    if (!text.trim()) return;
    setEntries([
      {
        id:        Date.now(),
        content:   text.trim(),
        mood:      mood || null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        archived:  false,
      },
      ...entries,
    ]);
    setText(""); setMood(null);
  }

  function updateEntry(id, newContent, newMood) {
    setEntries(entries.map((e) =>
      e.id === id
        ? { ...e, content: newContent, mood: newMood || null, updatedAt: new Date().toISOString() }
        : e
    ));
  }

  function archiveEntry(id)   { setEntries(entries.map((e) => e.id === id ? { ...e, archived: true  } : e)); }
  function unarchiveEntry(id) { setEntries(entries.map((e) => e.id === id ? { ...e, archived: false } : e)); }
  function deleteEntry(id)    { setEntries(entries.filter((e) => e.id !== id)); }

  const active   = entries.filter((e) => !e.archived);
  const archived = entries.filter((e) =>  e.archived);

  return (
    <div className="space-y-8" style={{ fontFamily: sans }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-bold mb-1"
            style={{ fontFamily: mono, color: "#c084fc" }}>
            Personal Journal
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: tk.text }}>
            Diary
          </h1>
          <p className="text-sm mt-2" style={{ color: tk.textMuted }}>Write freely. No pressure.</p>
        </div>
        <div className="flex gap-2">
           {savedPin && (
             <button
                onClick={() => { setPinMode("change"); setIsPinModalOpen(true); }}
                className="flex items-center justify-center p-2.5 rounded-xl transition-all"
                style={{ background: tk.surface, border: `1px solid ${tk.border}`, color: tk.textFaint }}
                title="Change Archive PIN"
              >
                <Settings2 className="w-4 h-4" />
             </button>
           )}
          <button
            onClick={handleArchiveToggle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto"
            style={{
              fontFamily: mono,
              background: showArchived ? "#c084fc22" : tk.surface,
              border:     `1px solid ${showArchived ? "#c084fc66" : tk.border}`,
              color:      showArchived ? "#c084fc" : tk.textMuted,
            }}
          >
            {showArchived ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active",   value: active.length,   color: "#c084fc" },
          { label: "Archived", value: archived.length, color: tk.textFaint },
          { label: "Total",    value: entries.length,  color: tk.accent },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-4 py-4 text-center"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <p className="text-2xl sm:text-3xl font-extrabold mb-1"
              style={{ color: s.color, fontFamily: mono }}>{s.value}</p>
            <p className="text-xs uppercase tracking-wider" style={{ color: tk.textFaint }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* New entry composer */}
      <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
        <SL tk={tk}>New entry</SL>
        <div className="mb-3">
          <MoodPicker value={mood} onChange={setMood} tk={tk} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-colors"
          style={{
            background:  tk.inputBg,
            border:      `1px solid ${tk.inputBdr}`,
            color:       tk.text,
            fontFamily:  sans,
            minHeight:   140,
          }}
          onFocus={(e)  => (e.target.style.borderColor = "#c084fc")}
          onBlur={(e)   => (e.target.style.borderColor = tk.inputBdr)}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ fontFamily: mono, color: tk.textFaint }}>
            {text.length} chars
          </span>
          <button
            onClick={addEntry}
            disabled={!text.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: "#c084fc", color: "#09090b" }}
          >
            <Plus className="w-4 h-4" /> Save entry
          </button>
        </div>
      </div>

      {/* Active entries */}
      {active.length > 0 ? (
        <div>
          <SL tk={tk}>Entries ({active.length})</SL>
          <div className="space-y-3">
            {active.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                tk={tk}
                onArchive={archiveEntry}
                onUnarchive={unarchiveEntry}
                onDelete={(id) => setDeletingId(id)}
                onUpdate={updateEntry}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl"
          style={{ border: `1px dashed ${tk.border}` }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: tk.textFaint }} />
          <p className="text-sm" style={{ color: tk.textFaint }}>
            No entries yet. Write your first one above.
          </p>
        </div>
      )}

      {/* Archived entries */}
      {showArchived && (
        <div>
          <SL tk={tk}>Archived ({archived.length})</SL>
          {archived.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: tk.textFaint }}>
              Nothing archived yet.
            </p>
          ) : (
            <div className="space-y-3">
              {archived.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  tk={tk}
                  archived
                  onArchive={archiveEntry}
                  onUnarchive={unarchiveEntry}
                  onDelete={(id) => setDeletingId(id)}
                  onUpdate={updateEntry}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* PIN Security Modal */}
      {isPinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: tk.overlay, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closePinModal(); }}
        >
          <div
            className="w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: tk.surface, border: `1px solid ${tk.border}`, fontFamily: sans }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#c084fc22", border: "1px solid #c084fc44" }}>
              <Lock className="w-5 h-5" style={{ color: "#c084fc" }} />
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: tk.text }}>
              {pinMode === "set" ? "Set Archive PIN" : pinMode === "verify" ? "Enter Archive PIN" : "Change Archive PIN"}
            </h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              {pinMode === "set" ? "Protect your archived thoughts with a 4-digit code." : "Confirm your identity to proceed."}
            </p>

            <div className="space-y-4">
              {pinMode === "change" && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block" style={{ color: tk.textFaint }}>Current PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl px-4 py-3 text-center text-xl tracking-[1em] outline-none transition-colors"
                    style={{ background: tk.inputBg, border: `1px solid ${tk.border}`, color: tk.text, fontFamily: mono }}
                    placeholder="••••"
                    autoFocus
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-1 block" style={{ color: tk.textFaint }}>
                  {pinMode === "change" ? "New PIN" : "4-Digit PIN"}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl px-4 py-3 text-center text-xl tracking-[1em] outline-none transition-colors"
                  style={{ background: tk.inputBg, border: `1px solid ${tk.border}`, color: tk.text, fontFamily: mono }}
                  placeholder="••••"
                  autoFocus={pinMode !== "change"}
                />
              </div>
              
              {pinError && <p className="text-xs text-center font-bold" style={{ color: "#ef4444" }}>{pinError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={closePinModal}
                  className="px-4 py-2 text-sm rounded-xl transition-colors"
                  style={{ border: `1px solid ${tk.border2}`, color: tk.textMuted, background: "transparent" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  className="px-5 py-2 text-sm rounded-xl font-bold"
                  style={{ background: "#c084fc", color: "#09090b" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: tk.overlay, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingId(null); }}
        >
          <div
            className="w-[90%] max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: tk.surface, border: `1px solid ${tk.border}`, fontFamily: sans }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
              <Trash2 className="w-5 h-5" style={{ color: "#ef4444" }} />
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: tk.text }}>Delete entry?</h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm rounded-xl transition-colors"
                style={{ border: `1px solid ${tk.border2}`, color: tk.textMuted, background: "transparent" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteEntry(deletingId); setDeletingId(null); }}
                className="px-5 py-2 text-sm rounded-xl font-bold"
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