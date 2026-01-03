import { useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Home,
  Heart,
  Target,
  Calculator,
  Zap,
  CreditCard,
  Landmark,
} from "lucide-react";
import Card from "../components/ui/Card";
import useLocalStorage from "../hooks/useLocalStorage";

/* ------------------ Helpers ------------------ */
function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const CATEGORY_META = {
  Need: {
    label: "Need",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    gradient: "from-blue-500 to-cyan-600",
    icon: Home,
  },
  Want: {
    label: "Want",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    gradient: "from-pink-500 to-rose-600",
    icon: Heart,
  },
  Investment: {
    label: "Investment",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    gradient: "from-green-500 to-emerald-600",
    icon: TrendingUp,
  },
};

const PAYMENT_META = {
  Cash: {
    label: "Cash/Bank",
    icon: Landmark,
    color: "text-teal-700",
    badge: "bg-teal-100 text-teal-700"
  },
  Credit: {
    label: "Credit Card",
    icon: CreditCard,
    color: "text-purple-700",
    badge: "bg-purple-100 text-purple-700"
  }
};

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
        id: Date.now(),
        month,
        label,
        amount: Number(amount),
        type,
        category,
        paymentMode: type === "Expense" ? paymentMode : "Cash",
        createdAt: new Date().toISOString(),
      },
      ...items,
    ]);

    setLabel("");
    setAmount("");
    setType("Expense");
    setCategory("Need");
    setPaymentMode("Cash");
  }

  function deleteItem(id) {
    setItems(items.filter((i) => i.id !== id));
  }

  const income = monthItems.filter((i) => i.type === "Income").reduce((s, i) => s + i.amount, 0);

  const cashExpenses = monthItems
    .filter((i) => i.type === "Expense" && i.paymentMode === "Cash")
    .reduce((s, i) => s + i.amount, 0);

  const creditExpenses = monthItems
    .filter((i) => i.type === "Expense" && i.paymentMode === "Credit")
    .reduce((s, i) => s + i.amount, 0);

  const totalExpenses = cashExpenses + creditExpenses;
  
  const cashBalance = income - cashExpenses; // Actual money you have now
  const totalBalance = income - totalExpenses; // What you'll have after paying credit card

  // Category breakdown
  const categoryBreakdown = {
    Need: monthItems
      .filter((i) => i.type === "Expense" && i.category === "Need")
      .reduce((s, i) => s + i.amount, 0),
    Want: monthItems
      .filter((i) => i.type === "Expense" && i.category === "Want")
      .reduce((s, i) => s + i.amount, 0),
    Investment: monthItems
      .filter((i) => i.type === "Expense" && i.category === "Investment")
      .reduce((s, i) => s + i.amount, 0),
  };

  const savingsRate = income > 0 ? Math.round((totalBalance / income) * 100) : 0;

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Budget Tools
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Understand where your money goes.</p>
          </div>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border-2 border-teal-200 shadow-md hover:shadow-lg transition-all">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="outline-none text-xs sm:text-sm font-semibold text-gray-700"
          />
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Income</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">₹{income.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <ArrowDownCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Cash Spent</p>
              <p className="text-lg sm:text-2xl font-bold text-teal-600">₹{cashExpenses.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Landmark className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Credit Card</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">₹{creditExpenses.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card
          className={`bg-gradient-to-br ${
            cashBalance >= 0
              ? "from-blue-50 to-cyan-50 border-2 border-blue-300"
              : "from-orange-50 to-red-50 border-2 border-orange-300"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Cash Balance</p>
              <p className={`text-lg sm:text-2xl font-bold ${cashBalance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                ₹{cashBalance.toLocaleString()}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                cashBalance >= 0 ? "from-blue-500 to-cyan-600" : "from-orange-500 to-red-600"
              } flex items-center justify-center shadow-lg`}
            >
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Savings Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-indigo-600">{savingsRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Mode Breakdown */}
      {totalExpenses > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Cash/Bank Payment</p>
                <p className="text-2xl font-bold text-teal-600">₹{cashExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {Math.round((cashExpenses / totalExpenses) * 100)}% of total expenses • Deducted from balance
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Credit Card</p>
                <p className="text-2xl font-bold text-purple-600">₹{creditExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {Math.round((creditExpenses / totalExpenses) * 100)}% of total expenses • Due next month
            </div>
          </Card>
        </div>
      )}

      {/* ---------- Category Breakdown ---------- */}
      {totalExpenses > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {Object.entries(categoryBreakdown).map(([cat, amount]) => {
            const meta = CATEGORY_META[cat];
            const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
            const Icon = meta.icon;

            return (
              <Card key={cat} className={`${meta.bg} border-2 ${meta.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">{meta.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold ${meta.color}`}>₹{amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{percentage}% of expenses</span>
                    <span className="font-semibold">
                      {monthItems.filter((i) => i.category === cat && i.type === "Expense").length} items
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${meta.gradient} h-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ---------- Add Entry ---------- */}
      <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Add Budget Entry</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Description (e.g., Groceries, Salary...)"
            className="border-2 border-teal-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all outline-none"
          />

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            className="border-2 border-teal-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border-2 border-teal-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all outline-none bg-white font-medium"
          >
            <option value="Expense">💸 Expense</option>
            <option value="Income">💰 Income</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={type === "Income"}
            className="border-2 border-teal-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all outline-none bg-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="Need">🏠 Need</option>
            <option value="Want">❤️ Want</option>
            <option value="Investment">📈 Investment</option>
          </select>

          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            disabled={type === "Income"}
            className="border-2 border-teal-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all outline-none bg-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="Cash">🏦 Cash/Bank</option>
            <option value="Credit">💳 Credit Card</option>
          </select>

          <button
            onClick={addItem}
            disabled={!label || !amount}
            className="col-span-2 sm:col-span-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </Card>

      {/* ---------- Entries ---------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Transactions</h2>
          {monthItems.length > 0 && (
            <span className="text-xs sm:text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
              {monthItems.length} entries
            </span>
          )}
        </div>

        {monthItems.length === 0 && (
          <Card className="text-center py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600" />
            </div>
            <p className="text-base sm:text-lg text-gray-500 font-semibold">No entries for this month</p>
            <p className="text-sm text-gray-400 mt-2">Start tracking to see insights and manage your budget effectively.</p>
          </Card>
        )}

        <div className="space-y-3">
          {monthItems.map((item) => {
            const meta = CATEGORY_META[item.category];
            const paymentMeta = PAYMENT_META[item.paymentMode || 'Cash'];
            const Icon = meta?.icon || Wallet;
            const PaymentIcon = paymentMeta.icon;

            return (
              <Card
                key={item.id}
                hover
                className={`group transition-all duration-300 ${
                  item.type === "Income"
                    ? "bg-green-50 border-2 border-green-200"
                    : `${meta.bg} border-2 ${meta.border}`
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                      item.type === "Income"
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : `bg-gradient-to-br ${meta.gradient}`
                    }`}
                  >
                    {item.type === "Income" ? (
                      <ArrowDownCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base sm:text-lg truncate">{item.label}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          item.type === "Income" ? "bg-green-200 text-green-800" : `${meta.bg} ${meta.color}`
                        }`}
                      >
                        {item.type}
                      </span>
                      {item.type === "Expense" && (
                        <>
                          <span className="text-xs text-gray-500">• {item.category}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${paymentMeta.badge} flex items-center gap-1`}>
                            <PaymentIcon className="w-3 h-3" />
                            {paymentMeta.label}
                          </span>
                        </>
                      )}
                      {item.createdAt && (
                        <span className="text-xs text-gray-400">
                          •{" "}
                          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                    <span
                      className={`font-bold text-lg sm:text-2xl whitespace-nowrap ${
                        item.type === "Income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.type === "Income" ? "+" : "-"}₹{item.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-400 sm:opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---------- Financial Insights ---------- */}
      {monthItems.length >= 5 && (
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold mb-2">Financial Insights</h3>
              <div className="space-y-2 text-sm sm:text-base text-white/90">
                {savingsRate >= 20 && (
                  <p>✨ Excellent! You're saving {savingsRate}% of your income. Keep up the great work!</p>
                )}
                {savingsRate >= 10 && savingsRate < 20 && (
                  <p>💪 Good job! You're saving {savingsRate}% of your income. Try to increase it to 20% or more.</p>
                )}
                {savingsRate < 10 && savingsRate >= 0 && (
                  <p>⚠️ Your savings rate is {savingsRate}%. Consider reducing expenses or increasing income to save more.</p>
                )}
                {totalBalance < 0 && (
                  <p>🚨 You're spending more than you earn this month. Review your expenses and make adjustments.</p>
                )}
                {creditExpenses > income * 0.3 && (
                  <p>💳 Your credit card spending is high ({Math.round((creditExpenses/income)*100)}% of income). Remember to pay it off next month!</p>
                )}
                {cashBalance < 0 && creditExpenses > 0 && (
                  <p>⚠️ Your cash balance is negative, but you have ₹{creditExpenses.toLocaleString()} on credit card due next month.</p>
                )}
                {categoryBreakdown.Need > categoryBreakdown.Want + categoryBreakdown.Investment && (
                  <p>🎯 Most spending goes to needs. This is generally healthy financial behavior.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}