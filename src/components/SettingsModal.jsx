import { useEffect, useRef, useState } from "react";
import { X, Sun, Moon, Mail, User, Check } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";
import { downloadAllData } from "../hooks/downloadData";

export default function SettingsModal({ open, onClose }) {
  const { isDark, toggle, userName, setUserName } = useTheme();
  const [nameInput, setNameInput] = useState(userName);
  const [nameSaved, setNameSaved] = useState(false);
  const inputRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  /* Sync input if userName changes externally */
  useEffect(() => { setNameInput(userName); }, [userName]);

  /* Focus input when modal opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;

  function saveName() {
    const trimmed = nameInput.trim();
    setUserName(trimmed);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  function handleFeedback() {
    const subject = encodeURIComponent("Life OS — Feedback");
    const body    = encodeURIComponent("Hi,\n\nHere's my feedback on Life OS:\n\n");
    window.location.href = `mailto:hello@lifeos.com?subject=${subject}&body=${body}`;
  }

  function handleDownload() {         setDownloading(true);
        setTimeout(() => {          // tiny delay so spinner renders
         try   { downloadAllData(); }
         catch { alert("Export failed. Make sure you have data saved."); }
         finally { setDownloading(false); }
        }, 80);
     }

  return (
    /* Backdrop — z-50, blocks clicks on everything behind */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.40)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel — explicit solid bg, never transparent */}
      <div
        className="w-[92%] max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: isDark ? "#18181b" : "#ffffff",
          border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
          fontFamily: "'Syne', sans-serif",
          color: isDark ? "#f0f0f8" : "#09090b",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}` }}
        >
          <div>
            <p className="font-bold text-base" style={{ color: isDark ? "#f0f0f8" : "#09090b" }}>
              Settings
            </p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
              Personalise your Life OS
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              color: isDark ? "#71717a" : "#71717a",
              border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isDark ? "#3f3f46" : "#d4d4d8";
              e.currentTarget.style.color = isDark ? "#f0f0f8" : "#09090b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? "#27272a" : "#e4e4e7";
              e.currentTarget.style.color = "#71717a";
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
 
          {/* ── Name ── */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: isDark ? "#f59e0b" : "#d97706", fontFamily: "'Space Mono', monospace" }}
            >
              <User size={12} /> Your name
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="e.g. Master"
                maxLength={15}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: isDark ? "#0a0a0f" : "#ffffff",
                  border: `1px solid ${isDark ? "#3f3f46" : "#d4d4d8"}`,
                  color: isDark ? "#f0f0f8" : "#09090b",
                }}
                onFocus={(e)  => (e.target.style.borderColor = isDark ? "#f59e0b" : "#d97706")}
                onBlur={(e)   => (e.target.style.borderColor = isDark ? "#3f3f46" : "#d4d4d8")}
              />
              <button
                onClick={saveName}
                className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
                style={{
                  backgroundColor: nameSaved ? "#34d399" : (isDark ? "#f59e0b" : "#d97706"),
                  color: "#09090b",
                }}
              >
                {nameSaved ? <><Check size={13} /> Saved</> : "Save"}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
                Shown in your dashboard greeting.
              </p>
              <p className="text-xs" style={{
                fontFamily: "'Space Mono', monospace",
                color: nameInput.length >= 15 ? "#f87171" : isDark ? "#52525b" : "#a1a1aa",
              }}>
                {nameInput.length}/15
              </p>
            </div>
          </div>

          {/* ── Theme ── */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: isDark ? "#f59e0b" : "#d97706", fontFamily: "'Space Mono', monospace" }}
            >
              {isDark ? <Moon size={12} /> : <Sun size={12} />} Appearance
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Dark */}
              <button
                onClick={() => { if (!isDark) toggle(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isDark ? "rgba(245,158,11,0.1)" : (isDark ? "#0a0a0f" : "#f4f4f8"),
                  border: `1px solid ${isDark ? "rgba(245,158,11,0.4)" : "#e4e4e7"}`,
                  color: isDark ? "#f59e0b" : "#71717a",
                }}
              >
                <Moon size={15} />
                <span className="text-sm font-semibold">Dark</span>
                {isDark && (
                  <span
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#f59e0b" }}
                  />
                )}
              </button>
              {/* Light */}
              <button
                onClick={() => { if (isDark) toggle(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: !isDark ? "rgba(217,119,6,0.1)" : (isDark ? "#0a0a0f" : "#f4f4f8"),
                  border: `1px solid ${!isDark ? "rgba(217,119,6,0.4)" : (isDark ? "#27272a" : "#e4e4e7")}`,
                  color: !isDark ? "#d97706" : "#71717a",
                }}
              >
                <Sun size={15} />
                <span className="text-sm font-semibold">Light</span>
                {!isDark && (
                  <span
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#d97706" }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* ── Feedback ── */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: isDark ? "#f59e0b" : "#d97706", fontFamily: "'Space Mono', monospace" }}
            >
              <Mail size={12} /> Feedback
            </label>
            <button
              onClick={handleFeedback}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: isDark ? "#0a0a0f" : "#f4f4f8",
                border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
                color: isDark ? "#a1a1aa" : "#3f3f46",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isDark ? "#f59e0b" : "#d97706";
                e.currentTarget.style.color = isDark ? "#f59e0b" : "#d97706";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? "#27272a" : "#e4e4e7";
                e.currentTarget.style.color = isDark ? "#a1a1aa" : "#3f3f46";
              }}
            >
              <Mail size={14} />
              Share feedback
            </button>
            <p className="text-xs mt-2" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
              Looking for new features or having issues? We'd love to hear from you!
            </p>
          </div>
        </div>

        <div>
  <label
    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider m-3"
    style={{ color: "var(--accent)", fontFamily: "'Space Mono', monospace" }}
  >
    Export all your data
  </label>
 
  <button
    onClick={handleDownload}
    disabled={downloading}
    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
    style={{
      background: downloading ? "var(--bg-base)" : "var(--bg-base)",
      border:     "1px solid var(--border)",
      color:      downloading ? "var(--text-faint)" : "var(--text-sub)",
    }}
    onMouseEnter={(e) => {
      if (!downloading) {
        e.currentTarget.style.borderColor = "#34d399";
        e.currentTarget.style.color = "#34d399";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.color = "var(--text-sub)";
    }}
  >
    {downloading ? (
      <>
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
        </svg>
        Preparing export…
      </>
    ) : (
      <>
        {/* Download icon inline so no extra import needed */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download all data as .xlsx
      </>
    )}
  </button>
 
  <p className="text-xs m-2" style={{ color: "var(--text-faint)" }}>
    Exports diary, habits, projects, budget, links &amp; focuses into one spreadsheet.
  </p>
</div>

        {/* Footer */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{ borderTop: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}` }}
        >
          <p
            className="text-xs"
            style={{ color: isDark ? "#52525b" : "#a1a1aa", fontFamily: "'Space Mono', monospace" }}
          >
            v2.0.0 · Life OS
          </p>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            style={{
              color: isDark ? "#71717a" : "#71717a",
              border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isDark ? "#3f3f46" : "#d4d4d8";
              e.currentTarget.style.color = isDark ? "#f0f0f8" : "#09090b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? "#27272a" : "#e4e4e7";
              e.currentTarget.style.color = "#71717a";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}