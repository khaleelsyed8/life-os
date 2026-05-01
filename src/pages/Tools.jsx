import { useState } from "react";
import {
  Wallet, Plus, Trash2, ArrowDownCircle,
  TrendingUp, Home, Heart, Calculator,
  Zap, CreditCard, Landmark, ArrowUpCircle,
  RefreshCw, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, XCircle,
} from "lucide-react";
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
  accent:    isDark ? "#c084fc" : "#9333ea",
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.35)",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

/* ── Helpers ─────────────────────────────────────────────────────────── */
function monthKey(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `finance-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/* Digits only, no leading zeros, max N digits */
function sanitiseNum(raw, max = 7) {
  return raw.replace(/\D/g, "").replace(/^0+(\d)/, "$1").slice(0, max);
}

/* ── Category config ─────────────────────────────────────────────────── */
const CAT = {
  Salary:     { label: "Salary",     color: "#c084fc", icon: Landmark,      bg: "#c084fc14", border: "#c084fc33", type: "income"  },
  Income:     { label: "Income",     color: "#a78bfa", icon: ArrowUpCircle, bg: "#a78bfa14", border: "#a78bfa33", type: "income"  },
  Need:       { label: "Need",       color: "#60a5fa", icon: Home,          bg: "#60a5fa14", border: "#60a5fa33", type: "expense" },
  Want:       { label: "Want",       color: "#f472b6", icon: Heart,         bg: "#f472b614", border: "#f472b633", type: "expense" },
  Investment: { label: "Investment", color: "#34d399", icon: TrendingUp,    bg: "#34d39914", border: "#34d39933", type: "expense" },
  Debt:       { label: "Debt",       color: "#fb923c", icon: CreditCard,    bg: "#fb923c14", border: "#fb923c33", type: "expense" },
};

const INCOME_CATS  = Object.entries(CAT).filter(([, v]) => v.type === "income").map(([k]) => k);
const EXPENSE_CATS = Object.entries(CAT).filter(([, v]) => v.type === "expense").map(([k]) => k);

/* ── 50/30/20 rule checker ───────────────────────────────────────────── */
/*
  50% Needs, 30% Wants, 20% Savings/Investment
  We map: Need→Needs, Want→Wants, Investment→Savings bucket
*/
function RuleChecker({ txs, totalInc, tk }) {
  if (totalInc === 0) return null;

  const needs = txs.filter((tx) => tx.cat === "Need").reduce((s, tx) => s + tx.amt, 0);
  const wants = txs.filter((tx) => tx.cat === "Want").reduce((s, tx) => s + tx.amt, 0);
  const invest = txs.filter((tx) => tx.cat === "Investment").reduce((s, tx) => s + tx.amt, 0);

  const needsPct  = Math.round((needs  / totalInc) * 100);
  const wantsPct  = Math.round((wants  / totalInc) * 100);
  const investPct = Math.round((invest / totalInc) * 100);

  const rules = [
    { label: "Needs",       pct: needsPct,  target: 50,  pass: needsPct  <= 50, color: "#60a5fa", tip: "≤50% of income" },
    { label: "Wants",       pct: wantsPct,  target: 30,  pass: wantsPct  <= 30, color: "#f472b6", tip: "≤30% of income" },
    { label: "Investment",  pct: investPct, target: 20,  pass: investPct >= 20, color: "#34d399", tip: "≥20% of income" },
  ];

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: tk.accent, fontFamily: mono }}>
          50 / 30 / 20 Rule
        </p>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
          style={{ background: `${tk.accent}18`, color: tk.accent }}>
          {rules.filter((r) => r.pass).length}/3 passing
        </span>
      </div>
      {rules.map((r) => {
        const Icon = r.pass ? CheckCircle : r.pct === 0 ? AlertCircle : XCircle;
        const statusColor = r.pass ? "#34d399" : r.pct === 0 ? tk.textFaint : "#f87171";
        return (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: statusColor }} />
                <span className="text-xs font-semibold" style={{ color: tk.textSub }}>{r.label}</span>
                <span className="text-[10px]" style={{ color: tk.textFaint }}>({r.tip})</span>
              </div>
              <span className="text-xs font-bold" style={{ color: statusColor, fontFamily: mono }}>
                {r.pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: tk.surface2 }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(r.pct, 100)}%`,
                  background: r.pass ? r.color : "#f87171",
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Day-of-month spending pattern ──────────────────────────────────── */
function SpendPattern({ txs, tk }) {
  const expTxs = txs.filter((tx) => CAT[tx.cat]?.type === "expense");
  if (expTxs.length === 0) return null;

  /* Group spend by day-of-month */
  const byDay = {};
  expTxs.forEach((tx) => {
    const day = new Date(tx.date).getDate();
    byDay[day] = (byDay[day] || 0) + tx.amt;
  });

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const maxAmt = Math.max(...Object.values(byDay), 1);
  const today = new Date().getDate();

  return (
    <div className="rounded-2xl p-5" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: tk.accent, fontFamily: mono }}>
        Daily spend pattern
      </p>
      <div className="flex items-end gap-px" style={{ height: 60 }}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const amt = byDay[day] || 0;
          const h   = amt > 0 ? Math.max(4, Math.round((amt / maxAmt) * 60)) : 2;
          const isToday = day === today;
          return (
            <div key={day} className="flex-1 flex flex-col items-center justify-end group relative"
              style={{ height: 60 }}>
              <div
                title={amt > 0 ? `Day ${day}: ₹${amt.toLocaleString()}` : `Day ${day}: ₹0`}
                className="w-full rounded-sm transition-all cursor-default"
                style={{
                  height: h,
                  background: amt > 0
                    ? isToday ? tk.accent : "#60a5fa"
                    : tk.surface2,
                  opacity: amt > 0 ? 0.85 : 0.4,
                  border: isToday ? `1px solid ${tk.accent}` : "none",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px]" style={{ color: tk.textFaint, fontFamily: mono }}>1</span>
        <span className="text-[9px]" style={{ color: tk.textFaint, fontFamily: mono }}>{Math.ceil(daysInMonth / 2)}</span>
        <span className="text-[9px]" style={{ color: tk.textFaint, fontFamily: mono }}>{daysInMonth}</span>
      </div>
    </div>
  );
}

/* ── UI primitives ───────────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ fontFamily: mono, color: tk.accent }}>{children}</span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
export default function Tools() {
  const { isDark } = useTheme();
  const tk = t(isDark);

  /* Month navigation — 0 = current, -1 = last month, etc. */
  const [monthOffset, setMonthOffset] = useState(0);
  const isCurrentMonth = monthOffset === 0;

  const [data, setData] = useLocalStorage(monthKey(monthOffset), { txs: [] });

  const [desc,      setDesc]      = useState("");
  const [amt,       setAmt]       = useState("");
  const [cat,       setCat]       = useState("Need");
  const [isIncome,  setIsIncome]  = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Add transaction ── */
  const addTx = () => {
    if (!desc.trim() || !amt) return;
    const finalCat = isIncome
      ? (cat === "Need" || cat === "Want" || cat === "Investment" || cat === "Debt" ? "Income" : cat)
      : cat;
    const resolvedCat = isIncome ? (["Salary", "Income"].includes(cat) ? cat : "Income") : cat;
    setData({
      ...data,
      txs: [{
        id:        Date.now(),
        desc:      desc.trim(),
        amt:       Number(amt),
        cat:       isIncome ? (incomeCat) : cat,
        recurring,
        date:      new Date().toISOString(),
      }, ...data.txs],
    });
    setDesc(""); setAmt(""); setRecurring(false);
  };

  /* income category state when toggle is income */
  const [incomeCat, setIncomeCat] = useState("Salary");

  const addTxFixed = () => {
    if (!desc.trim() || !amt) return;
    setData({
      ...data,
      txs: [{
        id:        Date.now(),
        desc:      desc.trim(),
        amt:       Number(amt),
        cat:       isIncome ? incomeCat : cat,
        recurring,
        date:      new Date().toISOString(),
      }, ...data.txs],
    });
    setDesc(""); setAmt(""); setRecurring(false);
  };

  const removeTx = (id) => setData({ ...data, txs: data.txs.filter((tx) => tx.id !== id) });

  /* ── Calculations ── */
  const txs       = data.txs || [];
  const totalInc  = txs.filter((tx) => INCOME_CATS.includes(tx.cat)).reduce((s, tx) => s + tx.amt, 0);
  const totalExp  = txs.filter((tx) => EXPENSE_CATS.includes(tx.cat)).reduce((s, tx) => s + tx.amt, 0);
  const totalBal  = totalInc - totalExp;
  const savRate   = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0;
  const debtAmt   = txs.filter((tx) => tx.cat === "Debt").reduce((s, tx) => s + tx.amt, 0);

  const inputStyle = {
    background: tk.inputBg,
    border:     `1px solid ${tk.inputBdr}`,
    color:      tk.text,
    fontFamily: sans,
  };

  return (
    <div className="space-y-8 pb-10" style={{ fontFamily: sans }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-bold mb-1"
            style={{ fontFamily: mono, color: tk.accent }}>Financial OS</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: tk.text }}>
            Tools
          </h1>
          <p className="text-sm mt-2" style={{ color: tk.textMuted }}>Manage resources, optimize flow.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month navigator */}
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <button onClick={() => setMonthOffset((o) => o - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: tk.textMuted, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = tk.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = tk.textMuted)}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2" style={{ color: tk.text, fontFamily: mono, minWidth: 110, textAlign: "center" }}>
              {monthLabel(monthOffset)}
            </span>
            <button onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ color: tk.textMuted, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = tk.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = tk.textMuted)}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* Savings rate pill */}
          <div className="rounded-xl px-4 py-3 text-center"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <p className="text-2xl font-extrabold" style={{ color: savRate >= 20 ? "#34d399" : savRate > 0 ? tk.accent : "#f87171", fontFamily: mono }}>
              {savRate}%
            </p>
            <p className="text-xs mt-0.5 uppercase tracking-tighter" style={{ color: tk.textFaint }}>Savings rate</p>
          </div>
        </div>
      </div>

      {/* ── Overview cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Income",   val: totalInc, color: "#34d399", icon: Landmark        },
          { label: "Total Expenses", val: totalExp, color: "#f87171", icon: ArrowDownCircle  },
          { label: "Net Cash Flow",  val: totalBal, color: totalBal >= 0 ? "#34d399" : "#f87171", icon: Wallet },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest"
                style={{ color: tk.textFaint, fontFamily: mono }}>{s.label}</p>
            </div>
            <p className="text-3xl font-extrabold" style={{ color: s.color, fontFamily: mono }}>
              ₹{s.val.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left column ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Log transaction */}
          <section className="rounded-2xl p-6 space-y-5"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <SL tk={tk}>Log transaction</SL>

            {/* Income / Expense toggle */}
            <div className="flex p-1 rounded-xl" style={{ background: tk.surface2 }}>
              {[
                { label: "Expense", value: false, icon: ArrowDownCircle, activeColor: tk.text },
                { label: "Income",  value: true,  icon: ArrowUpCircle,   activeColor: "#c084fc" },
              ].map(({ label, value, icon: Icon, activeColor }) => (
                <button key={label} onClick={() => setIsIncome(value)}
                  className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  style={{
                    background:  isIncome === value ? tk.surface : "transparent",
                    color:       isIncome === value ? activeColor : tk.textFaint,
                    boxShadow:   isIncome === value ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Description */}
              <input
                placeholder={isIncome ? "Source (e.g. Monthly salary, Freelance, Gift)" : "Description (e.g. Rent, Coffee, Gym)"}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = tk.accent)}
                onBlur={(e)  => (e.target.style.borderColor = tk.inputBdr)}
              />

              <div className="flex gap-3">
                {/* Amount */}
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount"
                  value={amt}
                  onChange={(e) => setAmt(sanitiseNum(e.target.value, 7))}
                  maxLength={7}
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = tk.accent)}
                  onBlur={(e)  => (e.target.style.borderColor = tk.inputBdr)}
                />

                {/* Category selector */}
                <select
                  value={isIncome ? incomeCat : cat}
                  onChange={(e) => isIncome ? setIncomeCat(e.target.value) : setCat(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = tk.accent)}
                  onBlur={(e)  => (e.target.style.borderColor = tk.inputBdr)}
                >
                  {(isIncome ? INCOME_CATS : EXPENSE_CATS).map((k) => (
                    <option key={k} value={k}>{CAT[k].label}</option>
                  ))}
                </select>
              </div>

              {/* Recurring toggle */}
              <button
                onClick={() => setRecurring((r) => !r)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: recurring ? "#c084fc18" : "transparent",
                  border:     `1px solid ${recurring ? "#c084fc55" : tk.border}`,
                  color:      recurring ? "#c084fc" : tk.textFaint,
                }}>
                <RefreshCw className="w-3.5 h-3.5" />
                {recurring ? "Recurring — monthly" : "Mark as recurring"}
              </button>

              <button
                onClick={addTxFixed}
                disabled={!desc.trim() || !amt}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                style={{
                  background: isIncome ? "#147a18" : "#ab0909",
                  color:      "#ffffff",
                }}>
                <Plus className="w-4 h-4" /> Log {isIncome ? "Income" : "Expense"}
              </button>
            </div>
          </section>

          {/* Distribution bars */}
          <section className="rounded-2xl p-6"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <SL tk={tk}>Distribution</SL>
            <div className="space-y-4">
              {Object.entries(CAT).map(([k, c]) => {
                const total = txs.filter((tx) => tx.cat === k).reduce((s, tx) => s + tx.amt, 0);
                const base  = c.type === "income" ? totalInc : totalInc;
                const pct   = base > 0 ? Math.min(100, Math.round((total / base) * 100)) : 0;
                if (total === 0) return null;
                return (
                  <div key={k} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold" style={{ fontFamily: mono }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span style={{ color: tk.text }}>{c.label}</span>
                        {c.type === "income" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: `${c.color}20`, color: c.color }}>income</span>
                        )}
                      </div>
                      <span style={{ color: tk.textFaint }}>₹{total.toLocaleString()} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: tk.surface2 }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                  </div>
                );
              })}
              {txs.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: tk.textFaint }}>
                  No transactions logged yet.
                </p>
              )}
            </div>
          </section>

          {/* 50/30/20 rule */}
          <RuleChecker txs={txs} totalInc={totalInc} tk={tk} />

        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Financial pulse */}
          <section>
            <SL tk={tk}>Financial pulse</SL>
            <div className="rounded-2xl p-6 flex gap-4 items-start"
              style={{ background: `${tk.accent}10`, border: `1px solid ${tk.accent}20` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${tk.accent}20` }}>
                <Zap className="w-5 h-5" style={{ color: tk.accent }} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-start justify-between">
                  <p className="font-bold text-base" style={{ color: tk.text }}>Insights</p>
                  {totalInc > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ background: tk.surface2, color: tk.textFaint, fontFamily: mono }}>
                      ₹{totalInc.toLocaleString()} income
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-sm" style={{ color: tk.textSub }}>
                  {savRate >= 20 && (
                    <p>✨ Excellent — saving <span className="font-bold" style={{ color: "#34d399" }}>{savRate}%</span>. Above the 20% target.</p>
                  )}
                  {savRate > 0 && savRate < 20 && (
                    <p>📊 Saving <span className="font-bold" style={{ color: tk.accent }}>{savRate}%</span>. Push to 20% by reducing wants.</p>
                  )}
                  {totalBal < 0 && (
                    <p>🚨 Deficit of <span className="font-bold" style={{ color: "#f87171" }}>₹{Math.abs(totalBal).toLocaleString()}</span>. Expenses exceed income.</p>
                  )}
                  {debtAmt > totalInc * 0.3 && totalInc > 0 && (
                    <p>💳 Debt at <span className="font-bold" style={{ color: "#fb923c" }}>{Math.round((debtAmt / totalInc) * 100)}%</span> of income — consider reducing.</p>
                  )}
                  {txs.filter((tx) => tx.recurring).length > 0 && (
                    <p>🔁 <span className="font-bold">{txs.filter((tx) => tx.recurring).length}</span> recurring transaction{txs.filter((tx) => tx.recurring).length > 1 ? "s" : ""} logged.</p>
                  )}
                  {txs.filter((tx) => INCOME_CATS.includes(tx.cat)).length > 1 && (
                    <p>📈 Multiple income sources detected. Diversification is healthy.</p>
                  )}
                  {txs.length === 0 && (
                    <p>Start logging transactions to see your financial health analysis.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Day-of-month spend pattern */}
          <SpendPattern txs={txs} tk={tk} />

          {/* Transaction feed */}
          <section>
            <SL tk={tk}>Transaction feed</SL>
            {txs.length === 0 ? (
              <div className="text-center py-20 rounded-2xl"
                style={{ border: `1px dashed ${tk.border}` }}>
                <Calculator className="w-10 h-10 mx-auto mb-3" style={{ color: tk.textFaint }} />
                <p className="text-sm" style={{ color: tk.textFaint }}>No records for {monthLabel(monthOffset)}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {txs.map((tx) => {
                  const C = CAT[tx.cat] || CAT.Need;
                  const isIncomeTx = INCOME_CATS.includes(tx.cat);
                  return (
                    <div key={tx.id}
                      className="rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                      style={{ background: tk.surface, border: `1px solid ${tk.border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.border2)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.border)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <C.icon className="w-4 h-4" style={{ color: C.color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-sm truncate" style={{ color: tk.text }}>{tx.desc}</p>
                            {tx.recurring && (
                              <RefreshCw className="w-3 h-3 flex-shrink-0" style={{ color: "#c084fc" }} />
                            )}
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: tk.textFaint, fontFamily: mono }}>{tx.cat}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p className="text-sm font-bold whitespace-nowrap"
                          style={{ color: isIncomeTx ? "#34d399" : tk.text, fontFamily: mono }}>
                          {isIncomeTx ? "+" : "-"}₹{tx.amt.toLocaleString()}
                        </p>
                        {/* Always visible — not hover-only (touch friendly) */}
                        <button
                          onClick={() => setDeletingId(tx.id)}
                          className="p-2 rounded-lg transition-colors flex-shrink-0"
                          style={{ color: tk.textFaint, background: "transparent" }}
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

      {/* ── Delete modal ── */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: tk.overlay, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingId(null); }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: tk.surface, border: `1px solid ${tk.border}`, fontFamily: sans }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#ef444422", border: "1px solid #ef444444" }}>
              <Trash2 className="w-6 h-6" style={{ color: "#ef4444" }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: tk.text }}>Remove record?</h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              Your financial overview will be updated immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 text-sm rounded-xl font-bold transition-colors"
                style={{ border: `1px solid ${tk.border2}`, color: tk.textMuted, background: "transparent" }}>
                Cancel
              </button>
              <button onClick={() => { removeTx(deletingId); setDeletingId(null); }}
                className="px-6 py-2.5 text-sm rounded-xl font-bold"
                style={{ background: "#ef4444", color: "#ffffff" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}