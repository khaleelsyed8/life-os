import { useState, useEffect, useRef } from "react";
import { PenLine, X, Trash2, Minus } from "lucide-react";

const STORAGE_KEY = "lifeos-scratchpad";

export default function ScratchPad() {
  const [open,      setOpen]      = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [text,      setText]      = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );
  const textareaRef = useRef(null);

  /* Persist every keystroke */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, text);
  }, [text]);

  /* Focus textarea when pad opens */
  useEffect(() => {
    if (open && !minimised) setTimeout(() => textareaRef.current?.focus(), 80);
  }, [open, minimised]);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimised(false); }}
          title="Open Scratch Pad"
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all"
          style={{
            background: "var(--accent)",
            color:      "#d97706",
            border:     "1px solid #d97706",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        >
          <PenLine size={18} />
        </button>
      )}

      {/* ── Pad ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-40 w-80 rounded-2xl shadow-2xl overflow-hidden transition-all"
          style={{
            background: "var(--bg-surface)",
            border:     "1px solid #d97706",
            fontFamily: "'Syne', sans-serif",
            backdropFilter: "blur(2px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: minimised ? "none" : "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <PenLine size={13} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--accent)", fontFamily: "'Space Mono', monospace" }}>
                Scratch Pad
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Minimise */}
              <button
                onClick={() => setMinimised((m) => !m)}
                title={minimised ? "Expand" : "Minimise"}
                className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                style={{ color: "var(--text-faint)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
              >
                <Minus size={12} />
              </button>
              {/* Clear */}
              {!minimised && text.trim() && (
                <button
                  onClick={() => setText("")}
                  title="Clear"
                  className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                  style={{ color: "var(--text-faint)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
                >
                  <Trash2 size={12} />
                </button>
              )}
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                style={{ color: "var(--text-faint)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Body */}
          {!minimised && (
            <>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Quick thought? Drop it here. Auto-saved."
                rows={8}
                className="w-full resize-none px-4 py-3 text-sm outline-none"
                style={{
                  background: "var(--bg-surface)",
                  color:      "var(--text)",
                  lineHeight: 1.7,
                }}
              />
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span className="text-xs" style={{ color: "var(--text-faint)", fontFamily: "'Space Mono', monospace" }}>
                  {wordCount} word{wordCount !== 1 ? "s" : ""} · auto-saved
                </span>
                <span className="text-xs" style={{ color: "var(--text-faint)", fontFamily: "'Space Mono', monospace" }}>
                  {text.length} chars
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}