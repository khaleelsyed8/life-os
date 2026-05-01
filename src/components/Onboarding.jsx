import { useState, useEffect } from "react";
import { X, Sparkles, Settings, Pencil, Search, Moon, Check, Download } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

/* ── Design Tokens ───────────────────────────────────────────────────── */
const t = (isDark) => ({
  overlay: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)",
  surface: isDark ? "#18181b" : "#ffffff",
  border:  isDark ? "#27272a" : "#e4e4e7",
  text:    isDark ? "#f0f0f8" : "#09090b",
  muted:   isDark ? "#a1a1aa" : "#71717a",
  accent:  isDark ? "#60a5fa" : "#3b82f6",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

export default function Onboarding() {
  const { isDark } = useTheme();
  const tk = t(isDark);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has previously opted out
    const isHidden = localStorage.getItem("hide-onboarding") === "true";
    if (!isHidden) {
      // Small delay for a smooth entrance after page load
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = (permanent = false) => {
    if (permanent) {
      localStorage.setItem("hide-onboarding", "true");
    }
    setShow(false);
  };

  if (!show) return null;

  const features = [
    { 
      icon: Settings, 
      text: "Click the gear icon to set your name so Life OS can interact with you personally.",
      color: "#60a5fa"
    },
    { 
      icon: Pencil, 
      text: "Added a scratch pad for your flowing thoughts (bottom right).",
      color: "#34d399"
    },
    { 
      icon: Search, 
      text: "Press Windows + K (or Ctrl+Windows+K) for global search across the app.",
      color: "#f59e0b"
    },
    { 
      icon: Moon, 
      text: "Theme switching is now available inside the gear icon.",
      color: "#c084fc"
    },
    { 
      icon: Download, 
      text: "Download all your data to excel with a single click.",
      color: "#fc9484"
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: tk.overlay }}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl transition-all scale-100"
        style={{ 
          backgroundColor: tk.surface, 
          border: `1px solid ${tk.border}`,
          fontFamily: sans 
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
               style={{ background: `${tk.accent}15` }}>
            <Sparkles className="w-6 h-6" style={{ color: tk.accent }} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: tk.text }}>What's New</h2>
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: tk.muted, fontFamily: mono }}>Version 2.0 Update</p>
          </div>
        </div>

        <div className="space-y-5 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="mt-1 p-1.5 rounded-lg" style={{ background: `${f.color}15` }}>
                <f.icon size={16} style={{ color: f.color }} />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: tk.text }}>{f.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => handleClose(false)}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-95"
            style={{ background: tk.accent, color: "#ffffff" }}
          >
            Okay, got it
          </button>
          
          <button 
            onClick={() => handleClose(true)}
            className="w-full py-2 text-xs font-bold uppercase tracking-tighter transition-colors"
            style={{ color: tk.muted }}
          >
            Don't remind me again
          </button>
        </div>
      </div>
    </div>
  );
}