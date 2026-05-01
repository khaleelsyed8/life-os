import { Github, Linkedin, Mail, Terminal, ArrowUpRight, X, Shield, FileText, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../pages/ThemeContext";
import { useState } from "react";

/* ── Policy modal content ────────────────────────────────────────────── */
const PRIVACY_CONTENT = {
  title: "Privacy Policy",
  effectiveDate: "May 2025",
  sections: [
    {
      heading: "1. Data Storage & Ownership",
      body: "Life OS stores all your personal data — including diary entries, habits, projects, financial records, and links — exclusively in your browser's local storage. No data is transmitted to, collected by, or stored on any external server operated by Life OS or any third party. You own your data entirely and at all times.",
    },
    {
      heading: "2. Encryption",
      body: "Data stored in your browser is encrypted at rest. This means that even if another party were to access your browser's local storage, your personal entries would not be readable in plain text.",
    },
    {
      heading: "3. Data Persistence & Loss Prevention",
      body: "Because your data resides in browser local storage, it is tied to the specific browser and device you use. Clearing your browser cache, cookies, or site data will permanently delete your Life OS data. We strongly recommend downloading a backup of your data regularly using the Export feature available in the application.",
    },
    {
      heading: "4. Google Drive Integration (Planned)",
      body: "We are actively developing an optional Google Drive integration that will allow you to securely back up and sync your Life OS data to your personal Google Drive account. This feature is currently in planning phase and will be opt-in. When available, only you will have access to the synced files via your own Google account credentials.",
    },
    {
      heading: "5. No Analytics or Tracking",
      body: "Life OS does not use cookies, tracking pixels, analytics SDKs, advertising networks, or any form of behavioural monitoring. We do not know who you are, how often you use the app, or what you write in it.",
    },
    {
      heading: "6. Third-Party Services",
      body: "The application does not integrate with any third-party services at this time, with the exception of the planned Google Drive integration described above.",
    },
    {
      heading: "7. Changes to This Policy",
      body: "If this policy changes materially — particularly in relation to the Google Drive integration — we will update the effective date above and, where possible, notify users within the application.",
    },
  ],
};

const TERMS_CONTENT = {
  title: "Terms of Use",
  effectiveDate: "May 2025",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: "By accessing and using Life OS, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please discontinue use of the application.",
    },
    {
      heading: "2. Nature of the Service",
      body: "Life OS is a personal productivity application provided free of charge. It is designed to help individuals organise their daily habits, diary entries, projects, financial records, and resources. The application operates entirely within your browser and does not require account creation.",
    },
    {
      heading: "3. Acceptable Use",
      body: "You agree to use Life OS only for lawful, personal, and non-commercial purposes. You shall not attempt to reverse-engineer, decompile, or exploit the application in any way that undermines its integrity or the experience of other users.",
    },
    {
      heading: "4. Data Responsibility",
      body: "Since all data is stored locally in your browser, you are solely responsible for maintaining backups of your information. Life OS cannot recover data lost due to browser cache clearing, device loss, or other circumstances beyond the application's control. We strongly recommend using the data export feature regularly.",
    },
    {
      heading: "5. No Warranties",
      body: "Life OS is provided 'as is' without warranties of any kind, express or implied. We do not guarantee that the application will be error-free, uninterrupted, or suitable for any particular purpose. Use the application at your own discretion.",
    },
    {
      heading: "6. Limitation of Liability",
      body: "To the fullest extent permitted by applicable law, Life OS and its creators shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the application, including but not limited to data loss.",
    },
    {
      heading: "7. Intellectual Property",
      body: "The design, code, and conceptual framework of Life OS are the intellectual property of its creators. You may not reproduce or redistribute any part of the application without explicit written permission.",
    },
    {
      heading: "8. Modifications",
      body: "We reserve the right to modify or discontinue the application at any time without prior notice. Material changes to these Terms will be reflected by an updated effective date.",
    },
    {
      heading: "9. Governing Law",
      body: "These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts.",
    },
  ],
};

/* ── Policy Modal ────────────────────────────────────────────────────── */
function PolicyModal({ content, tk, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: tk.overlay, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{
          backgroundColor: tk.surface,
          border: `1px solid ${tk.border}`,
          maxHeight: "85vh",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: `1px solid ${tk.border}` }}>
          <div>
            <p className="font-bold text-lg" style={{ color: tk.text }}>{content.title}</p>
            <p className="text-xs mt-0.5" style={{ color: tk.textFaint, fontFamily: "'Space Mono', monospace" }}>
              Effective: {content.effectiveDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: `1px solid ${tk.border}`, color: tk.textMuted, background: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.border2; e.currentTarget.style.color = tk.text; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;  e.currentTarget.style.color = tk.textMuted; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {content.sections.map((s) => (
            <div key={s.heading}>
              <p className="text-sm font-bold mb-2" style={{ color: tk.text }}>{s.heading}</p>
              <p className="text-sm leading-relaxed" style={{ color: tk.textSub }}>{s.body}</p>
            </div>
          ))}

          {/* Data note at bottom */}
          <div className="rounded-xl p-4 mt-4"
            style={{ background: `${tk.accent}10`, border: `1px solid ${tk.accent}25` }}>
            <p className="text-xs font-bold mb-1" style={{ color: tk.accent }}>⚡ Quick summary</p>
            <p className="text-xs leading-relaxed" style={{ color: tk.textSub }}>
              Your data lives in your browser only. Export it regularly to avoid loss. No accounts, no servers, no tracking.
              Google Drive sync is coming soon as an optional feature.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${tk.border}` }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: tk.surface2, color: tk.textMuted, border: `1px solid ${tk.border}` }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Footer ─────────────────────────────────────────────────────── */
export default function Footer() {
  const { isDark } = useTheme();
  const navigate   = useNavigate();
  const year       = new Date().getFullYear();

  const [modal, setModal] = useState(null); // null | "privacy" | "terms"

  const accent      = isDark ? "#f59e0b"  : "#d97706";
  const borderColor = isDark ? "#27272a"  : "#e4e4e7";
  const textFaint   = isDark ? "#52525b"  : "#a1a1aa";
  const textMuted   = isDark ? "#71717a"  : "#71717a";
  const textMain    = isDark ? "#f0f0f8"  : "#09090b";
  const bgBase      = isDark ? "#0a0a0f"  : "#f4f4f8";
  const bgSurface   = isDark ? "#18181b"  : "#ffffff";
  const bgSurface2  = isDark ? "#1c1c22"  : "#ededf3";
  const border2     = isDark ? "#3f3f46"  : "#d4d4d8";
  const overlay     = isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.40)";

  const tk = { surface: bgSurface, surface2: bgSurface2, border: borderColor, border2, text: textMain, textSub: isDark ? "#a1a1aa" : "#3f3f46", textMuted, textFaint, accent, overlay };

  /* Scroll to top then navigate */
  function handleNavClick(path) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(path);
  }

  function handleFeedback() {
    const subject = encodeURIComponent("Life OS — Feedback");
    const body    = encodeURIComponent("Hi,\n\nHere's my feedback on Life OS:\n\n");
    window.location.href = `mailto:hello@lifeos.com?subject=${subject}&body=${body}`;
  }

  const quickLinks = [
    { name: "Dashboard",  path: "/" },
    { name: "Dictionary", path: "/dictionary" },
    { name: "Diary",      path: "/diary" },
    { name: "Habits",     path: "/habits" },
    { name: "Projects",   path: "/projects" },
    { name: "Tools",      path: "/tools" },
  ];

  const domains = [
    { name: "Physical",  color: "#34d399" },
    { name: "Spiritual", color: "#c084fc" },
    { name: "Mental",    color: "#60a5fa" },
    { name: "Technical", color: "#fb923c" },
    { name: "Self",      color: "#f472b6" },
    { name: "Financial", color: "#2dd4bf" },
  ];

  const features = [
    "Daily Journaling", "Habit Tracking",
    "Focus Management", "Project Tracking",
    "Budget Tools",     "Link Organization",
  ];

  return (
    <>
      <footer style={{ backgroundColor: bgBase, borderTop: `1px solid ${borderColor}`, fontFamily: "'Syne', sans-serif", transition: "background-color 0.25s ease" }}>

        {/* Accent strip */}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}44, #c084fc44, transparent)` }} />

        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
                  <Terminal className="w-4 h-4" style={{ color: accent }} />
                </div>
                <span className="text-lg font-bold" style={{ color: textMain }}>
                  Life <span style={{ color: accent, fontFamily: "'Space Mono', monospace", fontSize: 13 }}>OS</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: textFaint }}>
                Your personal operating system for managing life across all domains.
                Built for clarity, designed for growth.
              </p>
              <div className="flex gap-2">
                {[
                  { href: "https://github.com/khaleelsyed8",                 icon: Github,   label: "GitHub"   },
                  { href: "https://www.linkedin.com/in/syed-khaleel-ahmed/", icon: Linkedin, label: "LinkedIn" },
                  { href: "mailto:hello@lifeos.com",                         icon: Mail,     label: "Email"    },
                ].map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: bgSurface, border: `1px solid ${borderColor}`, color: textMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.color = accent; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor;    e.currentTarget.style.color = textMuted; }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links — scroll-to-top on click */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>Quick Links</p>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <button
                      onClick={() => handleNavClick(link.path)}
                      className="flex items-center gap-1.5 text-sm group transition-colors text-left"
                      style={{ color: textFaint }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = textMain)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = textFaint)}
                    >
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Life domains */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>Life Domains</p>
              <ul className="space-y-2.5">
                {domains.map((d) => (
                  <li key={d.name} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span style={{ color: textFaint }}>{d.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features + Feedback */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>Features</p>
              <ul className="space-y-2.5 mb-6">
                {features.map((f) => (
                  <li key={f} className="text-sm" style={{ color: textFaint }}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
            style={{ borderTop: `1px solid ${borderColor}` }}>
            <p className="text-xs" style={{ color: textFaint, fontFamily: "'Space Mono', monospace" }}>
              © {year} Life OS — built for personal growth.
            </p>
            <div className="flex gap-5">
              <button
                onClick={() => setModal("privacy")}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: textFaint }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textMuted)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textFaint)}
              >
                <Shield className="w-3 h-3" /> Privacy
              </button>
              <button
                onClick={() => setModal("terms")}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: textFaint }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textMuted)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textFaint)}
              >
                <FileText className="w-3 h-3" /> Terms
              </button>
              <button
                onClick={handleFeedback}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: textFaint }}
                onMouseEnter={(e) => (e.currentTarget.style.color = textMuted)}
                onMouseLeave={(e) => (e.currentTarget.style.color = textFaint)}
              >
                <MessageSquare className="w-3 h-3" /> Feedback
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-5"
            style={{ color: textFaint, fontFamily: "'Space Mono', monospace" }}>
            v2.0.0 · Last updated {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        </div>
      </footer>

      {/* Policy modals */}
      {modal === "privacy" && (
        <PolicyModal content={PRIVACY_CONTENT} tk={tk} onClose={() => setModal(null)} />
      )}
      {modal === "terms" && (
        <PolicyModal content={TERMS_CONTENT} tk={tk} onClose={() => setModal(null)} />
      )}
    </>
  );
}