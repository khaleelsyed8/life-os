import * as XLSX from "xlsx";
import { secureGet } from "./useLocalStorage";

const currentFinanceKey = () => {
  const d = new Date();
  return `finance-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

/* ── Sheet builders ──────────────────────────────────────────────────── */
function buildDiarySheet() {
  const entries = secureGet("diary-entries", []);
  if (!entries.length) return [{ Note: "No diary entries found." }];
  return entries.map((e) => ({
    Date:          fmtDate(e.createdAt),
    Time:          e.createdAt ? new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    Mood:          e.mood || "",
    Status:        e.archived ? "Archived" : "Active",
    "Last edited": e.updatedAt ? fmtDate(e.updatedAt) : "",
    Content:       e.content || "",
  }));
}

function buildHabitsSheet() {
  const habits = secureGet("habits", []);
  if (!habits.length) return [{ Note: "No habits found." }];
  return habits.map((h) => {
    const checks    = h.checks || {};
    const doneCount = Object.values(checks).filter(Boolean).length;
    return {
      "Habit name":         h.name,
      "Total days checked": doneCount,
      "All checked dates":  Object.entries(checks).filter(([, v]) => v).map(([k]) => k).sort().join(", "),
    };
  });
}

function buildProjectsSheet() {
  const projects = secureGet("projects-v3", []); // matches Projects.jsx key
  if (!projects.length) return [{ Note: "No projects found." }];
  return projects.map((p) => ({
    Name:        p.name,
    Status:      p.status,
    Link:        p.link || "",
    Description: p.description || "",
    Created:     fmtDate(p.created || p.createdAt),
  }));
}

function buildBudgetSheet() {
  const finance = secureGet(currentFinanceKey(), { inc: 0, txs: [] }); // matches Tools.jsx key
  const txs     = finance.txs || [];
  if (!txs.length) return [{ Note: "No budget entries found." }];
  return txs.map((tx) => ({
    Date:         fmtDate(tx.date),
    Description:  tx.desc,
    Type:         tx.type === "income" ? "Income" : "Expense",
    Category:     tx.cat || "",
    "Amount (₹)": tx.amt,
  }));
}

function buildLinksSheet() {
  const links = secureGet("links", []);
  if (!links.length) return [{ Note: "No links found." }];
  return links.map((l) => ({ Title: l.title, URL: l.url, Domain: l.domain }));
}

function buildFocusSheet() {
  const focuses = secureGet("focus-items", []);
  if (!focuses.length) return [{ Note: "No focus items found." }];
  return focuses.map((f) => ({
    Title:    f.title,
    Started:  fmtDate(f.startDate),
    Deadline: f.endDate ? fmtDate(f.endDate) : "No deadline",
  }));
}

/* ── Auto column width ───────────────────────────────────────────────── */
function autoWidth(ws, data) {
  if (!data.length) return;
  ws["!cols"] = Object.keys(data[0]).map((k) => ({
    wch: Math.max(k.length + 2, ...data.map((row) => String(row[k] ?? "").length)),
  }));
}

/* ── Main export ─────────────────────────────────────────────────────── */
export function downloadAllData() {
  const wb = XLSX.utils.book_new();

  const sheets = [
    { name: "Diary",       data: buildDiarySheet()    },
    { name: "Habits",      data: buildHabitsSheet()   },
    { name: "Projects",    data: buildProjectsSheet() },
    { name: "Budget",      data: buildBudgetSheet()   },
    { name: "Links",       data: buildLinksSheet()    },
    { name: "Focus Items", data: buildFocusSheet()    },
  ];

  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    autoWidth(ws, data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  // Summary
  const summary = [
    { Section: "Diary",       Records: secureGet("diary-entries", []).length },
    { Section: "Habits",      Records: secureGet("habits",        []).length },
    { Section: "Projects",    Records: secureGet("projects-v3",   []).length },
    { Section: "Budget txns", Records: (secureGet(currentFinanceKey(), { txs: [] }).txs || []).length },
    { Section: "Links",       Records: secureGet("links",         []).length },
    { Section: "Focus items", Records: secureGet("focus-items",   []).length },
    { Section: "Exported on", Records: new Date().toLocaleString("en-US")   },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summary);
  autoWidth(summaryWs, summary);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  XLSX.writeFile(wb, `LifeOS_export_${new Date().toISOString().split("T")[0]}.xlsx`);
}