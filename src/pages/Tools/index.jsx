import { useState } from "react";
import { Wallet, ShoppingBasket, ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "../ThemeContext";
import BudgetCalc     from "./BudgetCalc";
import GroceryTracker from "./GroceryTracker";

/* ── Design tokens ───────────────────────────────────────────────────── */
const t = (isDark) => ({
  surface:   isDark ? "#18181b" : "#ffffff",
  surface2:  isDark ? "#1c1c22" : "#ededf3",
  border:    isDark ? "#27272a" : "#e4e4e7",
  border2:   isDark ? "#3f3f46" : "#d4d4d8",
  text:      isDark ? "#f0f0f8" : "#09090b",
  textSub:   isDark ? "#a1a1aa" : "#3f3f46",
  textMuted: isDark ? "#71717a" : "#71717a",
  textFaint: isDark ? "#52525b" : "#a1a1aa",
  accent:    isDark ? "#f59e0b" : "#d97706",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

/* ── Tool registry — add new tools here as you build them ───────────── */
const TOOLS = [
  {
    id:          "budget",
    name:        "Budget Calculator",
    tagline:     "Financial OS",
    description: "Track your monthly income and expenses across categories. Log salary, investments, debts, and discretionary spending. Visualise your savings rate and 50/30/20 health score.",
    accent:      "#c084fc",
    icon:        Wallet,
    component:   BudgetCalc,
    badge:       null,
  },
  {
    id:          "grocery",
    name:        "Grocery Tracker",
    tagline:     "Home Pantry",
    description: "Keep track of everything in your kitchen. Know exactly how much rice, milk, or eggs you have left. Get low-stock alerts before you run out.",
    accent:      "#34d399",
    icon:        ShoppingBasket,
    component:   GroceryTracker,
    badge:       "New",
  },
];

/* ── Tool card on the hub ────────────────────────────────────────────── */
function ToolCard({ tool, onSelect, tk }) {
  const Icon = tool.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(tool.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative w-full text-left rounded-2xl p-6 sm:p-8 overflow-hidden transition-all duration-300"
      style={{
        background:   hovered ? tk.surface2 : tk.surface,
        border:       `1px solid ${hovered ? tool.accent + "66" : tk.border}`,
        transform:    hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow:    hovered ? `0 12px 40px ${tool.accent}18` : "none",
      }}
    >
      {/* Background glow blob */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity duration-500"
        style={{ background: tool.accent, opacity: hovered ? 0.08 : 0.03 }}
      />

      {/* Badge */}
      {tool.badge && (
        <span
          className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${tool.accent}22`, color: tool.accent, fontFamily: mono }}
        >
          {tool.badge}
        </span>
      )}

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
        style={{
          background: `${tool.accent}18`,
          border:     `1px solid ${tool.accent}${hovered ? "66" : "33"}`,
          transform:  hovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        <Icon className="w-7 h-7" style={{ color: tool.accent }} />
      </div>

      {/* Text */}
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: tool.accent, fontFamily: mono }}>
        {tool.tagline}
      </p>
      <h2 className="text-2xl font-extrabold mb-3 transition-colors"
        style={{ color: tk.text }}>
        {tool.name}
      </h2>
      <p className="text-sm leading-relaxed mb-6"
        style={{ color: tk.textSub }}>
        {tool.description}
      </p>

      {/* CTA */}
      <div
        className="flex items-center gap-2 text-sm font-bold transition-all duration-300"
        style={{ color: tool.accent }}
      >
        Open tool
        <ArrowRight
          className="w-4 h-4 transition-transform duration-300"
          style={{ transform: hovered ? "translateX(4px)" : "translateX(0)" }}
        />
      </div>
    </button>
  );
}

/* ── Main hub ────────────────────────────────────────────────────────── */
export default function Tools() {
  const { isDark } = useTheme();
  const tk = t(isDark);
  const [activeTool, setActiveTool] = useState(null);

  const active = TOOLS.find((t) => t.id === activeTool);
  const ActiveComponent = active?.component;

  return (
    <div style={{ fontFamily: sans }}>

      {/* ── Hub view ── */}
      {!activeTool && (
        <div className="space-y-10">

          {/* Header */}
          <div>
            <p className="text-xs tracking-widest uppercase font-bold mb-2"
              style={{ fontFamily: mono, color: tk.accent }}>
              Daily Life Tools
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-none mb-3"
              style={{ color: tk.text }}>
              Tools
            </h1>
            <p className="text-sm" style={{ color: tk.textMuted }}>
              Pick a tool to get started. More coming soon.
            </p>
          </div>

          {/* Tool cards — big row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={setActiveTool} tk={tk} />
            ))}

            {/* Coming soon placeholder */}
            <div
              className="relative rounded-2xl p-6 sm:p-8 overflow-hidden"
              style={{
                border:     `1px dashed ${tk.border}`,
                background: "transparent",
                opacity:    0.5,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6" style={{ color: tk.textFaint }} />
                <p className="text-sm font-bold" style={{ color: tk.textFaint }}>More tools coming</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: tk.textFaint }}>
                Habit streaks exporter, calorie tracker, water intake log, and more are on the roadmap.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Active tool view ── */}
      {activeTool && ActiveComponent && (
        <div>
          {/* Back bar */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              style={{
                background: tk.surface,
                border:     `1px solid ${tk.border}`,
                color:      tk.textMuted,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.border2; e.currentTarget.style.color = tk.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;  e.currentTarget.style.color = tk.textMuted; }}
            >
              ← Back to tools
            </button>

            {/* Other tool pills for quick switching */}
            {TOOLS.filter((t) => t.id !== activeTool).map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: `${tool.accent}14`,
                    border:     `1px solid ${tool.accent}33`,
                    color:      tool.accent,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = `${tool.accent}24`)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = `${tool.accent}14`)}
                >
                  <Icon className="w-3 h-3" />
                  {tool.name}
                </button>
              );
            })}
          </div>

          <ActiveComponent />
        </div>
      )}
    </div>
  );
}