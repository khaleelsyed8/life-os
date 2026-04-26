import { useState } from "react";
import {
  Wallet, Plus, Trash2, ArrowDownCircle, ArrowUpCircle,
  Calendar, TrendingUp, TrendingDown, Home, Heart, Target,
  Calculator, Zap, CreditCard, Landmark,
} from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";

/* ── Helpers ─────────────────────────────────────────────────────────── */
function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const CATEGORY = {
  Need:       { label: "Need",       color: "#60a5fa", icon: Home,      bg: "#60a5fa14", border: "#60a5fa33" },
  Want:       { label: "Want",       color: "#f472b6", icon: Heart,     bg: "#f472b614", border: "#f472b633" },
  Investment: { label: "Investment", color: "#34d399", icon: TrendingUp, bg: "#34d39914", border: "#34d39933" },
};

const PAYMENT = {
  Cash:   { label: "Cash/Bank",    icon: Landmark,   color: "#2dd4bf", bg: "#2dd4bf14", border: "#2dd4bf33" },
  Credit: { label: "Credit Card",  icon: CreditCard, color: "#c084fc", bg: "#c084fc14", border: "#c084fc33" },
};

const SL = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span
      className="text-xs tracking-widest uppercase text-amber-400 font-bold"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {children}
    </span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
);

const inputCls =
  "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-teal-500/50 text-sm transition-colors";

/* ── Component ───────────────────────────────────────────────────────── */
export default function Tools() {
  const [items, setItems] = useLocalStorage("budget-items", []);
  const [month, setMonth] = useState(currentMonthKey());

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Need");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const monthItems = items.filter((i) => i.month === month);

  function addItem() {
    if (!label.trim() || !amount) return;
    setItems([
      {
        id: Date.now(), month, label,
        amount: Number(amount), type, category,
        paymentMode: type === "Expense" ? paymentMode : "Cash",
        createdAt: new Date().toISOString(),
      },
      ...items,
    ]);
    setLabel(""); setAmount(""); setType("Expense"); setCategory("Need"); setPaymentMode("Cash");
  }

  function deleteItem(id) { setItems(items.filter((i) => i.id !== id)); }

  const income        = monthItems.filter((i) => i.type === "Income").reduce((s, i) => s + i.amount, 0);
  const cashExp       = monthItems.filter((i) => i.type === "Expense" && i.paymentMode === "Cash").reduce((s, i) => s + i.amount, 0);
  const creditExp     = monthItems.filter((i) => i.type === "Expense" && i.paymentMode === "Credit").reduce((s, i) => s + i.amount, 0);
  const totalExp      = cashExp + creditExp;
  const cashBalance   = income - cashExp;
  const totalBalance  = income - totalExp;
  const savingsRate   = income > 0 ? Math.round((totalBalance / income) * 100) : 0;

  const catBreakdown = {
    Need:       monthItems.filter((i) => i.type === "Expense" && i.category === "Need").reduce((s, i) => s + i.amount, 0),
    Want:       monthItems.filter((i) => i.type === "Expense" && i.category === "Want").reduce((s, i) => s + i.amount, 0),
    Investment: monthItems.filter((i) => i.type === "Expense" && i.category === "Investment").reduce((s, i) => s + i.amount, 0),
  };

  const fmt = (n) => `₹${n.toLocaleString()}`;

  return (
    <div className="space-y-8" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p
            className="text-xs tracking-widest uppercase text-teal-400 mb-1"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Financial tracker
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 leading-none">
            Budget
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Understand where your money goes.</p>
        </div>

        {/* Month picker */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors"
          style={{ background: "#18181b", borderColor: "#27272a" }}
        >
          <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <input
            type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent outline-none text-sm text-zinc-300"
            style={{ fontFamily: "'Space Mono', monospace" }}
          />
        </div>
      </div>

      {/* ── Key metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Income",       value: fmt(income),      color: "#34d399", icon: ArrowDownCircle },
          { label: "Cash spent",   value: fmt(cashExp),     color: "#2dd4bf", icon: Landmark       },
          { label: "Credit card",  value: fmt(creditExp),   color: "#c084fc", icon: CreditCard     },
          { label: "Cash balance", value: fmt(cashBalance),
            color: cashBalance >= 0 ? "#60a5fa" : "#fb923c",
            icon: Wallet },
          { label: "Savings rate", value: `${savingsRate}%`, color: "#f59e0b", icon: Target        },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 uppercase tracking-wider leading-tight">{s.label}</p>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color, opacity: 0.6 }} />
              </div>
              <p
                className="text-lg sm:text-xl font-extrabold truncate"
                style={{ color: s.color, fontFamily: "'Space Mono', monospace" }}
              >
                {s.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Payment breakdown ───────────────────────────────── */}
      {totalExp > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "Cash",   amount: cashExp,   pct: totalExp > 0 ? Math.round((cashExp / totalExp) * 100) : 0,   note: "Deducted from balance now" },
            { key: "Credit", amount: creditExp, pct: totalExp > 0 ? Math.round((creditExp / totalExp) * 100) : 0, note: "Due next month" },
          ].map(({ key, amount: a, pct, note }) => {
            const m = PAYMENT[key];
            const Icon = m.icon;
            return (
              <div
                key={key}
                className="bg-zinc-900 rounded-2xl p-5 border"
                style={{ borderColor: m.border }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: m.bg }}>
                    <Icon className="w-5 h-5" style={{ color: m.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{m.label}</p>
                    <p className="text-xl font-extrabold" style={{ color: m.color, fontFamily: "'Space Mono', monospace" }}>
                      {fmt(a)}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: m.color }} />
                </div>
                <p className="text-xs text-zinc-600">{pct}% of total expenses · {note}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Category breakdown ──────────────────────────────── */}
      {totalExp > 0 && (
        <div>
          <SL>Spending by category</SL>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(catBreakdown).map(([cat, amt]) => {
              const m = CATEGORY[cat];
              const Icon = m.icon;
              const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;
              const count = monthItems.filter((i) => i.type === "Expense" && i.category === cat).length;
              return (
                <div
                  key={cat}
                  className="bg-zinc-900 rounded-2xl p-5 border"
                  style={{ borderColor: m.border }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: m.bg }}>
                      <Icon className="w-4 h-4" style={{ color: m.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">{m.label}</p>
                      <p className="text-xl font-extrabold" style={{ color: m.color, fontFamily: "'Space Mono', monospace" }}>
                        {fmt(amt)}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>{pct}% of expenses</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>{count} items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add entry ───────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <SL>Add entry</SL>
        <div className="flex flex-col gap-3">
          <input value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="Description (e.g., Groceries, Salary…)" className={inputCls} />
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)" className={inputCls} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Type */}
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100 focus:outline-none focus:border-teal-500/50 text-sm">
              <option value="Expense" style={{ background: "#18181b" }}>💸 Expense</option>
              <option value="Income"  style={{ background: "#18181b" }}>💰 Income</option>
            </select>
            {/* Category */}
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              disabled={type === "Income"}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100 focus:outline-none focus:border-teal-500/50 text-sm disabled:opacity-40">
              <option value="Need"       style={{ background: "#18181b" }}>🏠 Need</option>
              <option value="Want"       style={{ background: "#18181b" }}>❤️ Want</option>
              <option value="Investment" style={{ background: "#18181b" }}>📈 Investment</option>
            </select>
            {/* Payment mode */}
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
              disabled={type === "Income"}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100 focus:outline-none focus:border-teal-500/50 text-sm disabled:opacity-40">
              <option value="Cash"   style={{ background: "#18181b" }}>🏦 Cash/Bank</option>
              <option value="Credit" style={{ background: "#18181b" }}>💳 Credit Card</option>
            </select>
            {/* Submit */}
            <button onClick={addItem} disabled={!label || !amount}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
              style={{ background: "#2dd4bf", color: "#0a0a0f" }}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* ── Transactions ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <SL>Transactions</SL>
          {monthItems.length > 0 && (
            <span
              className="text-xs text-zinc-500 ml-4 mb-5"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {monthItems.length} entries
            </span>
          )}
        </div>

        {monthItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
            <Wallet className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No entries yet for this month.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {monthItems.map((item) => {
              const cat = CATEGORY[item.category];
              const pay = PAYMENT[item.paymentMode || "Cash"];
              const CatIcon = cat?.icon || Wallet;
              const isIncome = item.type === "Income";

              return (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 sm:gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 hover:border-zinc-700 transition-colors"
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isIncome ? "#34d39914" : cat?.bg }}
                  >
                    {isIncome
                      ? <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                      : <CatIcon className="w-4 h-4" style={{ color: cat?.color }} />
                    }
                  </div>

                  {/* Label + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-200 text-sm truncate">{item.label}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{
                          background: isIncome ? "#34d39914" : cat?.bg,
                          color: isIncome ? "#34d399" : cat?.color,
                          fontFamily: "'Space Mono', monospace",
                        }}
                      >
                        {isIncome ? "Income" : item.category}
                      </span>
                      {!isIncome && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ background: pay?.bg, color: pay?.color, fontFamily: "'Space Mono', monospace" }}
                        >
                          {pay?.label}
                        </span>
                      )}
                      {item.createdAt && (
                        <span className="text-xs text-zinc-600" style={{ fontFamily: "'Space Mono', monospace" }}>
                          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + delete */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="font-extrabold text-base sm:text-lg"
                      style={{
                        color: isIncome ? "#34d399" : "#f87171",
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {isIncome ? "+" : "-"}{fmt(item.amount)}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Financial insights ──────────────────────────────── */}
      {monthItems.length >= 5 && (
        <div
          className="rounded-2xl p-5 border"
          style={{ background: "#f59e0b0a", borderColor: "#f59e0b33" }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#f59e0b22" }}
            >
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-zinc-200 mb-2">Financial Insights</p>
              <div className="space-y-1.5 text-sm text-zinc-400">
                {savingsRate >= 20 && (
                  <p>✨ Excellent — saving <span className="text-amber-400 font-bold">{savingsRate}%</span> of income.</p>
                )}
                {savingsRate >= 10 && savingsRate < 20 && (
                  <p>💪 Good — saving <span className="text-amber-400 font-bold">{savingsRate}%</span>. Try to hit 20%.</p>
                )}
                {savingsRate < 10 && savingsRate >= 0 && (
                  <p>⚠️ Savings rate is <span className="text-red-400 font-bold">{savingsRate}%</span>. Consider cutting expenses.</p>
                )}
                {totalBalance < 0 && (
                  <p>🚨 Spending more than you earn this month.</p>
                )}
                {creditExp > income * 0.3 && (
                  <p>💳 Credit card at <span className="text-purple-400 font-bold">{Math.round((creditExp / income) * 100)}%</span> of income — remember to clear it.</p>
                )}
                {catBreakdown.Need > catBreakdown.Want + catBreakdown.Investment && (
                  <p>🎯 Most spending on needs — generally healthy.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}