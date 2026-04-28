import { useState } from "react";
import { 
  Wallet, Plus, Trash2, ArrowDownCircle, Calendar, 
  TrendingUp, Home, Heart, Target, Calculator, 
  Zap, CreditCard, Landmark, ArrowUpCircle, X 
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
  accent:    isDark ? "#c084fc" : "#9333ea",
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.35)",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

function monthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const CAT = {
  Need:       { label: "Need",       color: "#60a5fa", icon: Home,       bg: "#60a5fa14", border: "#60a5fa33" },
  Want:       { label: "Want",       color: "#f472b6", icon: Heart,      bg: "#f472b614", border: "#f472b633" },
  Investment: { label: "Investment", color: "#34d399", icon: TrendingUp, bg: "#34d39914", border: "#34d39933" },
  Debt:       { label: "Debt",       color: "#fb923c", icon: CreditCard, bg: "#fb923c14", border: "#fb923c33" },
  Income:     { label: "Income",     color: "#c084fc", icon: Landmark,   bg: "#c084fc14", border: "#c084fc33" },
};

/* ── UI Components ───────────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ fontFamily: mono, color: tk.accent }}>
      {children}
    </span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

/* ── Main Component ──────────────────────────────────────────────────── */
export default function Tools() {
  const { isDark } = useTheme();
  const tk = t(isDark);

  const [data, setData] = useLocalStorage(`finance-${monthKey()}`, { inc: 0, txs: [] });
  const [desc, setDesc] = useState("");
  const [amt,  setAmt]  = useState("");
  const [cat,  setCat]  = useState("Need");
  const [isIncome, setIsIncome] = useState(false); // Toggle between Expense and Income
  const [deletingId, setDeletingId] = useState(null);

  const addTx = () => {
    if (!desc || !amt) return;
    const finalCat = isIncome ? "Income" : cat;
    setData({ 
      ...data, 
      txs: [{ 
        id: Date.now(), 
        desc, 
        amt: parseFloat(amt), 
        cat: finalCat, 
        type: isIncome ? "income" : "expense",
        date: new Date().toISOString() 
      }, ...data.txs] 
    });
    setDesc(""); setAmt("");
  };

  const removeTx = (id) => setData({ ...data, txs: data.txs.filter(t => t.id !== id) });
  const setInc = (val) => setData({ ...data, inc: parseFloat(val) || 0 });

  const totalExp = data.txs.filter(t => t.cat !== "Income").reduce((s, t) => s + t.amt, 0);
  const totalInc = data.inc + data.txs.filter(t => t.cat === "Income").reduce((s, t) => s + t.amt, 0);
  const totalBal = totalInc - totalExp;
  const savRate  = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0;
  
  const creditExp = data.txs.filter(t => t.cat === "Debt").reduce((s, t) => s + t.amt, 0);

  return (
    <div className="space-y-8 pb-10" style={{ fontFamily: sans }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-bold mb-1"
            style={{ fontFamily: mono, color: tk.accent }}>
            Financial OS
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: tk.text }}>
            Tools
          </h1>
          <p className="text-sm mt-2" style={{ color: tk.textMuted }}>Manage resources, optimize flow.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl px-4 py-3 text-center min-w-[100px]"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <p className="text-2xl font-extrabold" style={{ color: tk.accent, fontFamily: mono }}>
              {savRate}%
            </p>
            <p className="text-xs mt-0.5 uppercase tracking-tighter" style={{ color: tk.textFaint }}>Savings Rate</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", val: totalInc, color: "#34d399", icon: Landmark },
          { label: "Total Expenses", val: totalExp, color: "#f87171", icon: ArrowDownCircle },
          { label: "Net Cash Flow",  val: totalBal, color: tk.text,   icon: Wallet },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>{s.label}</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: s.color, fontFamily: mono }}>
              ₹{s.val.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Entry */}
        <div className="lg:col-span-5 space-y-8">
          <section className="rounded-2xl p-6 space-y-6"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <SL tk={tk}>Configure</SL>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold mb-2 block tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>Monthly Base Salary</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: tk.textFaint }}>₹</span>
                  <input type="number" value={data.inc} onChange={(e) => setInc(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text }} />
                </div>
              </div>

              <div className="pt-4" style={{ borderTop: `1px solid ${tk.border}` }}>
                <label className="text-[10px] uppercase font-bold mb-3 block tracking-widest" style={{ color: tk.textFaint, fontFamily: mono }}>Log Transaction</label>
                
                {/* Income/Expense Toggle */}
                <div className="flex p-1 rounded-xl mb-4" style={{ background: tk.surface2 }}>
                  <button 
                    onClick={() => setIsIncome(false)}
                    className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    style={{ 
                      background: !isIncome ? tk.surface : "transparent",
                      color: !isIncome ? tk.text : tk.textFaint,
                      boxShadow: !isIncome ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                    }}>
                    <ArrowDownCircle size={14} /> Expense
                  </button>
                  <button 
                    onClick={() => setIsIncome(true)}
                    className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    style={{ 
                      background: isIncome ? tk.surface : "transparent",
                      color: isIncome ? "#c084fc" : tk.textFaint,
                      boxShadow: isIncome ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
                    }}>
                    <ArrowUpCircle size={14} /> Income
                  </button>
                </div>

                <div className="space-y-3">
                  <input placeholder={isIncome ? "Source (e.g. Stock returns, Gift)" : "Description (e.g. Rent, Coffee)"} 
                    value={desc} onChange={(e) => setDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text }} />
                  
                  <div className="flex gap-3">
                    <input type="number" placeholder="Amount" value={amt} onChange={(e) => setAmt(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text }} />
                    
                    {!isIncome && (
                      <select value={cat} onChange={(e) => setCat(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
                        style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text }}>
                        {Object.keys(CAT).filter(k => k !== "Income").map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    )}
                  </div>

                  <button onClick={addTx} disabled={!desc || !amt}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg"
                    style={{ 
                      background: isIncome ? "#147a18" : "#ab0909", 
                      color: "#ffffff",
                      shadowColor: isIncome ? "rgba(192, 132, 252, 0.2)" : "rgba(147, 51, 234, 0.2)"
                    }}>
                    <Plus className="w-4 h-4" /> Log {isIncome ? "Income" : "Expense"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-6"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <SL tk={tk}>Distribution</SL>
            <div className="space-y-5">
              {Object.entries(CAT).map(([k, c]) => {
                const total = data.txs.filter(t => t.cat === k).reduce((s, t) => s + t.amt, 0);
                const compareBase = k === "Income" ? totalInc : totalInc;
                const pct   = compareBase > 0 ? Math.min(100, Math.round((total / compareBase) * 100)) : 0;
                return (
                  <div key={k} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold" style={{ fontFamily: mono }}>
                      <span style={{ color: tk.text }}>{c.label}</span>
                      <span style={{ color: tk.textFaint }}>₹{total.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: tk.surface2 }}>
                      <div className="h-full rounded-full transition-all duration-700" 
                           style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: History & Insights */}
        <div className="lg:col-span-7 space-y-6">
          <section className="space-y-4">
            <SL tk={tk}>Financial Pulse</SL>
            <div className="rounded-2xl p-6 flex gap-4 items-start"
              style={{ background: `${tk.accent}10`, border: `1px solid ${tk.accent}20` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${tk.accent}20` }}>
                <Zap className="w-5 h-5" style={{ color: tk.accent }} />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-base" style={{ color: tk.text }}>Insights</p>
                <div className="space-y-1.5 text-sm" style={{ color: tk.textSub }}>
                  {savRate >= 20 && <p>✨ Excellent — saving <span className="font-bold" style={{ color: tk.accent }}>{savRate}%</span> of total revenue.</p>}
                  {totalBal < 0 && <p>🚨 Deficit Alert: Expenses exceed total income.</p>}
                  {creditExp > totalInc * 0.3 && totalInc > 0 && <p>💳 High Debt Service: Credit usage at <span className="font-bold" style={{ color: "#fb923c" }}>{Math.round((creditExp / totalInc) * 100)}%</span> of income.</p>}
                  {data.txs.filter(t => t.cat === "Income").length > 0 && <p>📈 Supplementary income detected. Diversification is healthy.</p>}
                  {data.txs.length === 0 && <p>Start logging to see your financial health analysis.</p>}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SL tk={tk}>Transaction Feed</SL>
            {data.txs.length === 0 ? (
              <div className="text-center py-20 rounded-2xl" style={{ border: `1px dashed ${tk.border}` }}>
                <Calculator className="w-10 h-10 mx-auto mb-3" style={{ color: tk.textFaint }} />
                <p className="text-sm" style={{ color: tk.textFaint }}>No records yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.txs.map((tx) => {
                  const C = CAT[tx.cat] || CAT.Need;
                  return (
                    <div key={tx.id}
                      className="group rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                      style={{ background: tk.surface, border: `1px solid ${tk.border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.border2)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.border)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          {tx.cat === "Income" ? <ArrowUpCircle size={18} color={C.color} /> : <C.icon className="w-4.5 h-4.5" style={{ color: C.color }} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: tk.text }}>{tx.desc}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: tk.textFaint, fontFamily: mono }}>{tx.cat}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold" style={{ color: tx.cat === "Income" ? "#34d399" : tk.text, fontFamily: mono }}>
                          {tx.cat === "Income" ? "+" : "-"}₹{tx.amt.toLocaleString()}
                        </p>
                        <button onClick={() => setDeletingId(tx.id)}
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: tk.overlay, backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingId(null); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: tk.surface, border: `1px solid ${tk.border}` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
              <Trash2 className="w-6 h-6" style={{ color: "#ef4444" }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: tk.text }}>Remove record?</h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              Your financial overview will be updated immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 text-sm rounded-xl transition-colors font-bold"
                style={{ border: `1px solid ${tk.border2}`, color: tk.textMuted, background: "transparent" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { removeTx(deletingId); setDeletingId(null); }}
                className="px-6 py-2.5 text-sm rounded-xl font-bold"
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