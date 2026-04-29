/**
 * downloadData.js
 * Exports all Life OS localStorage data as a multi-sheet .xlsx file.
 * Requires: npm install xlsx
 */
import * as XLSX from "xlsx";

/* ── Helpers ─────────────────────────────────────────────────────────── */
const parse = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};

/* ── Sheet builders ──────────────────────────────────────────────────── */

function buildDiarySheet() {
  const entries = parse("diary-entries");
  if (!entries.length) return [{ Note: "No diary entries found." }];
  return entries.map((e) => ({
    Date:     fmtDate(e.createdAt),
    Time:     e.createdAt ? new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    Mood:     e.mood || "",
    Status:   e.archived ? "Archived" : "Active",
    "Last edited": e.updatedAt ? fmtDate(e.updatedAt) : "",
    Content:  e.content || "",
  }));
}

function buildHabitsSheet() {
  const habits = parse("habits");
  if (!habits.length) return [{ Note: "No habits found." }];

  const rows = [];
  habits.forEach((h) => {
    const checks = h.checks || {};
    const doneCount = Object.values(checks).filter(Boolean).length;
    rows.push({
      "Habit name":       h.name,
      "Total days checked": doneCount,
      "All checked dates":  Object.entries(checks)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .sort()
        .join(", "),
    });
  });
  return rows;
}

function buildProjectsSheet() {
  const projects = parse("projects");
  if (!projects.length) return [{ Note: "No projects found." }];
  return projects.map((p) => ({
    Name:        p.name,
    Status:      p.status,
    Link:        p.link || "",
    Description: p.description || "",
    Created:     fmtDate(p.createdAt),
  }));
}

function buildBudgetSheet() {
  const items = parse("budget-items");
  if (!items.length) return [{ Note: "No budget entries found." }];
  return items.map((i) => ({
    Month:        i.month || "",
    Date:         fmtDate(i.createdAt),
    Description:  i.label,
    Type:         i.type,
    Category:     i.type === "Expense" ? (i.category || "") : "",
    "Payment mode": i.type === "Expense" ? (i.paymentMode || "Cash") : "",
    "Amount (₹)": i.amount,
  }));
}

function buildLinksSheet() {
  const links = parse("links");
  if (!links.length) return [{ Note: "No links found." }];
  return links.map((l) => ({
    Title:  l.title,
    URL:    l.url,
    Domain: l.domain,
  }));
}

function buildFocusSheet() {
  const focuses = parse("focus-items");
  if (!focuses.length) return [{ Note: "No focus items found." }];
  return focuses.map((f) => ({
    Title:    f.title,
    Started:  fmtDate(f.startDate),
    Deadline: f.endDate ? fmtDate(f.endDate) : "No deadline",
  }));
}

/* ── Style helpers ───────────────────────────────────────────────────── */
function styleHeader(ws, headers) {
  headers.forEach((_, i) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font:      { bold: true, color: { rgb: "FFFFFF" } },
      fill:      { patternType: "solid", fgColor: { rgb: "1C1C22" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        bottom: { style: "thin", color: { rgb: "F59E0B" } },
      },
    };
  });
}

function autoWidth(ws, data) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  ws["!cols"] = keys.map((k) => ({
    wch: Math.max(
      k.length + 2,
      ...data.map((row) => String(row[k] ?? "").length)
    ),
  }));
}

/* ── Main export function ────────────────────────────────────────────── */
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
    if (data.length && !data[0].Note) {
      styleHeader(ws, Object.keys(data[0]));
    }
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  /* Summary sheet */
  const summary = [
    { Section: "Diary",       Records: parse("diary-entries").length         },
    { Section: "Habits",      Records: parse("habits").length                },
    { Section: "Projects",    Records: parse("projects").length              },
    { Section: "Budget",      Records: parse("budget-items").length          },
    { Section: "Links",       Records: parse("links").length                 },
    { Section: "Focus Items", Records: parse("focus-items").length           },
    { Section: "Exported on", Records: new Date().toLocaleString("en-US")   },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summary);
  autoWidth(summaryWs, summary);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  const fileName = `LifeOS_export_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}