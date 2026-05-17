import { useState } from "react";
import {
  ShoppingBasket, Plus, Pencil, Trash2, Check, X,
  AlertTriangle, Package, Milk, Apple,
} from "lucide-react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useTheme } from "../ThemeContext";

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
  accent:    isDark ? "#34d399" : "#059669",   // green theme for groceries
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.40)",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

/* ── Unit options ────────────────────────────────────────────────────── */
const UNITS = ["packets", "kg", "g", "litres", "ml", "pieces", "dozen", "bottles", "cans", "boxes"];

/* ── Default grocery list ────────────────────────────────────────────── */
const DEFAULTS = [
  { id: 1, name: "Rava (Sooji)",     qty: 2,  unit: "packets",  lowAt: 1, note: "Pantry shelf",      category: "Grains"    },
  { id: 2, name: "Maida",            qty: 1,  unit: "packets",  lowAt: 1, note: "Pantry shelf",      category: "Grains"    },
  { id: 3, name: "Rice",             qty: 5,  unit: "kg",       lowAt: 2, note: "Pantry shelf",      category: "Grains"    },
  { id: 4, name: "Wheat Flour",      qty: 3,  unit: "kg",       lowAt: 1, note: "Pantry shelf",      category: "Grains"    },
  { id: 5, name: "Milk",             qty: 2,  unit: "litres",   lowAt: 1, note: "Fridge — top shelf", category: "Dairy"     },
  { id: 6, name: "Eggs",             qty: 12, unit: "pieces",   lowAt: 4, note: "Fridge door",       category: "Dairy"     },
  { id: 7, name: "Curd / Yoghurt",   qty: 1,  unit: "kg",       lowAt: 1, note: "Fridge",            category: "Dairy"     },
  { id: 8, name: "Tomatoes",         qty: 6,  unit: "pieces",   lowAt: 2, note: "Counter / fridge",  category: "Vegetables"},
  { id: 9, name: "Onions",           qty: 8,  unit: "pieces",   lowAt: 3, note: "Dry storage",       category: "Vegetables"},
  { id:10, name: "Potatoes",         qty: 6,  unit: "pieces",   lowAt: 2, note: "Dry storage",       category: "Vegetables"},
  { id:11, name: "Green Chillies",   qty: 10, unit: "pieces",   lowAt: 4, note: "Fridge",            category: "Vegetables"},
  { id:12, name: "Bananas",          qty: 6,  unit: "pieces",   lowAt: 2, note: "Counter",           category: "Fruits"    },
  { id:13, name: "Apples",           qty: 4,  unit: "pieces",   lowAt: 2, note: "Fridge",            category: "Fruits"    },
  { id:14, name: "Cooking Oil",      qty: 1,  unit: "litres",   lowAt: 1, note: "Kitchen shelf",     category: "Pantry"    },
  { id:15, name: "Dal (Toor)",       qty: 1,  unit: "kg",       lowAt: 1, note: "Pantry",            category: "Pantry"    },
  { id:16, name: "Salt",             qty: 1,  unit: "packets",  lowAt: 1, note: "Kitchen shelf",     category: "Pantry"    },
  { id:17, name: "Sugar",            qty: 1,  unit: "kg",       lowAt: 1, note: "Kitchen shelf",     category: "Pantry"    },
  { id:18, name: "Tea / Coffee",     qty: 1,  unit: "packets",  lowAt: 1, note: "Kitchen shelf",     category: "Pantry"    },
];

const CATEGORIES = ["All", "Grains", "Dairy", "Vegetables", "Fruits", "Pantry", "Other"];

const CAT_COLOR = {
  Grains:     "#f59e0b",
  Dairy:      "#60a5fa",
  Vegetables: "#34d399",
  Fruits:     "#f472b6",
  Pantry:     "#fb923c",
  Other:      "#a78bfa",
};

/* ── Sanitise numeric qty input ──────────────────────────────────────── */
function sanitiseQty(raw) {
  const n = raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  return n === "" ? "" : n;
}

/* ── SL section label ────────────────────────────────────────────────── */
const SL = ({ children, tk }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-xs tracking-widest uppercase font-bold"
      style={{ fontFamily: mono, color: tk.accent }}>{children}</span>
    <div className="flex-1 h-px" style={{ background: tk.border }} />
  </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
export default function GroceryTracker() {
  const { isDark } = useTheme();
  const tk = t(isDark);

  const [items,    setItems]    = useLocalStorage("grocery-items", DEFAULTS);
  const [filter,   setFilter]   = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [deletingId,setDeletingId]= useState(null);
  const [showAdd,  setShowAdd]  = useState(false);

  /* ── Add form state ── */
  const [newName, setNewName]   = useState("");
  const [newQty,  setNewQty]    = useState("");
  const [newUnit, setNewUnit]   = useState("packets");
  const [newLow,  setNewLow]    = useState("1");
  const [newNote, setNewNote]   = useState("");
  const [newCat,  setNewCat]    = useState("Pantry");

  /* ── Edit form state ── */
  const [editName, setEditName] = useState("");
  const [editQty,  setEditQty]  = useState("");
  const [editUnit, setEditUnit] = useState("packets");
  const [editLow,  setEditLow]  = useState("1");
  const [editNote, setEditNote] = useState("");
  const [editCat,  setEditCat]  = useState("Pantry");

  /* ── CRUD ── */
  function addItem() {
    if (!newName.trim() || newQty === "") return;
    setItems([...items, {
      id:       Date.now(),
      name:     newName.trim(),
      qty:      Number(newQty),
      unit:     newUnit,
      lowAt:    Number(newLow) || 1,
      note:     newNote.trim().slice(0, 50),
      category: newCat,
    }]);
    setNewName(""); setNewQty(""); setNewNote(""); setNewUnit("packets"); setNewLow("1"); setNewCat("Pantry");
    setShowAdd(false);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQty(String(item.qty));
    setEditUnit(item.unit);
    setEditLow(String(item.lowAt));
    setEditNote(item.note || "");
    setEditCat(item.category || "Other");
  }

  function saveEdit() {
    if (!editName.trim() || editQty === "") return;
    setItems(items.map((item) => item.id === editingId ? {
      ...item,
      name:     editName.trim(),
      qty:      Number(editQty),
      unit:     editUnit,
      lowAt:    Number(editLow) || 1,
      note:     editNote.trim().slice(0, 50),
      category: editCat,
    } : item));
    setEditingId(null);
  }

  function deleteItem(id) {
    setItems(items.filter((i) => i.id !== id));
    setDeletingId(null);
  }

  /* Quick +/- buttons */
  function adjustQty(id, delta) {
    setItems(items.map((item) =>
      item.id === id ? { ...item, qty: Math.max(0, +(item.qty + delta).toFixed(2)) } : item
    ));
  }

  /* ── Derived ── */
  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);
  const lowCount = items.filter((i) => i.qty <= i.lowAt).length;

  /* ── Shared input style ── */
  const inp = {
    background: tk.inputBg,
    border:     `1px solid ${tk.inputBdr}`,
    color:      tk.text,
    fontFamily: sans,
    borderRadius: 12,
    outline: "none",
    fontSize: 14,
    padding: "10px 14px",
    width: "100%",
    transition: "border-color 0.2s",
  };

  const focusAccent = (e) => (e.target.style.borderColor = tk.accent);
  const blurReset   = (e) => (e.target.style.borderColor = tk.inputBdr);

  return (
    <div className="space-y-8" style={{ fontFamily: sans }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-bold mb-1"
            style={{ fontFamily: mono, color: tk.accent }}>Home Pantry</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: tk.text }}>
            Grocery Tracker
          </h1>
          <p className="text-sm mt-2" style={{ color: tk.textMuted }}>
            Know what's at home before you shop.
          </p>
        </div>

        {/* Stats pills */}
        <div className="flex gap-3 flex-shrink-0">
          <div className="rounded-xl px-4 py-3 text-center"
            style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
            <p className="text-2xl font-extrabold" style={{ color: tk.accent, fontFamily: mono }}>
              {items.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: tk.textFaint }}>Items</p>
          </div>
          {lowCount > 0 && (
            <div className="rounded-xl px-4 py-3 text-center"
              style={{ background: "#f8717114", border: "1px solid #f8717133" }}>
              <p className="text-2xl font-extrabold" style={{ color: "#f87171", fontFamily: mono }}>
                {lowCount}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#f87171" }}>Low stock</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Low stock banner ── */}
      {lowCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "#f8717110", border: "1px solid #f8717130" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#f87171" }} />
          <p className="text-sm font-semibold" style={{ color: "#f87171" }}>
            {lowCount} item{lowCount > 1 ? "s are" : " is"} running low — consider restocking.
          </p>
        </div>
      )}

      {/* ── Category filter + Add button ── */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: filter === cat
                ? (cat === "All" ? tk.accent : CAT_COLOR[cat] || tk.accent) + "22"
                : tk.surface,
              border: `1px solid ${filter === cat
                ? (cat === "All" ? tk.accent : CAT_COLOR[cat] || tk.accent) + "66"
                : tk.border}`,
              color: filter === cat
                ? (cat === "All" ? tk.accent : CAT_COLOR[cat] || tk.accent)
                : tk.textMuted,
            }}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1.5" style={{ opacity: 0.6 }}>
                {items.filter((i) => i.category === cat).length}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{
            background: showAdd ? `${tk.accent}22` : tk.surface,
            border:     `1px solid ${showAdd ? `${tk.accent}66` : tk.border}`,
            color:      showAdd ? tk.accent : tk.textMuted,
          }}
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? "Cancel" : "Add item"}
        </button>
      </div>

      {/* ── Add item form ── */}
      {showAdd && (
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: tk.surface, border: `1px solid ${tk.accent}44` }}>
          <SL tk={tk}>New item</SL>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold mb-1.5 block tracking-widest"
                style={{ color: tk.textFaint, fontFamily: mono }}>Item name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Basmati Rice"
                style={inp}
                onFocus={focusAccent} onBlur={blurReset}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold mb-1.5 block tracking-widest"
                  style={{ color: tk.textFaint, fontFamily: mono }}>Quantity</label>
                <input
                  type="text" inputMode="decimal"
                  value={newQty}
                  onChange={(e) => setNewQty(sanitiseQty(e.target.value))}
                  placeholder="2"
                  style={inp}
                  onFocus={focusAccent} onBlur={blurReset}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold mb-1.5 block tracking-widest"
                  style={{ color: tk.textFaint, fontFamily: mono }}>Unit</label>
                <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                  style={{ ...inp, cursor: "pointer", appearance: "none" }}
                  onFocus={focusAccent} onBlur={blurReset}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold mb-1.5 block tracking-widest"
                style={{ color: tk.textFaint, fontFamily: mono }}>Category</label>
              <select value={newCat} onChange={(e) => setNewCat(e.target.value)}
                style={{ ...inp, cursor: "pointer", appearance: "none" }}
                onFocus={focusAccent} onBlur={blurReset}>
                {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold mb-1.5 block tracking-widest"
                style={{ color: tk.textFaint, fontFamily: mono }}>Low stock alert at</label>
              <input
                type="text" inputMode="decimal"
                value={newLow}
                onChange={(e) => setNewLow(sanitiseQty(e.target.value))}
                placeholder="1"
                style={inp}
                onFocus={focusAccent} onBlur={blurReset}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold mb-1.5 block tracking-widest"
              style={{ color: tk.textFaint, fontFamily: mono }}>
              Note <span style={{ color: tk.textFaint, fontWeight: 400 }}>(optional · max 50 chars — where it's kept, usage etc.)</span>
            </label>
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value.slice(0, 50))}
              placeholder="e.g. Pantry shelf, fridge door…"
              style={inp}
              onFocus={focusAccent} onBlur={blurReset}
            />
            <p className="text-xs mt-1 text-right" style={{ color: newNote.length >= 45 ? "#f87171" : tk.textFaint, fontFamily: mono }}>
              {newNote.length}/50
            </p>
          </div>
          <button
            onClick={addItem}
            disabled={!newName.trim() || newQty === ""}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: tk.accent, color: "#09090b" }}
          >
            <Plus className="w-4 h-4" /> Add to pantry
          </button>
        </div>
      )}

      {/* ── Item list ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ border: `1px dashed ${tk.border}` }}>
          <ShoppingBasket className="w-10 h-10 mx-auto mb-3" style={{ color: tk.textFaint }} />
          <p className="text-sm" style={{ color: tk.textFaint }}>
            {filter === "All" ? "No items yet." : `No items in ${filter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isLow  = item.qty <= item.lowAt;
            const catColor = CAT_COLOR[item.category] || "#a78bfa";
            const isEdit = editingId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl p-4 transition-all"
                style={{
                  background: tk.surface,
                  border: `1px solid ${isLow ? "#f8717144" : tk.border}`,
                }}
                onMouseEnter={(e) => { if (!isEdit) e.currentTarget.style.borderColor = isLow ? "#f87171aa" : tk.border2; }}
                onMouseLeave={(e) => { if (!isEdit) e.currentTarget.style.borderColor = isLow ? "#f8717144" : tk.border; }}
              >
                {isEdit ? (
                  /* ── Inline edit mode ── */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold mb-1 block tracking-widest"
                          style={{ color: tk.textFaint, fontFamily: mono }}>Name</label>
                        <input value={editName} onChange={(e) => setEditName(e.target.value)}
                          style={inp} onFocus={focusAccent} onBlur={blurReset} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold mb-1 block tracking-widest"
                            style={{ color: tk.textFaint, fontFamily: mono }}>Qty</label>
                          <input type="text" inputMode="decimal"
                            value={editQty} onChange={(e) => setEditQty(sanitiseQty(e.target.value))}
                            style={inp} onFocus={focusAccent} onBlur={blurReset} />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold mb-1 block tracking-widest"
                            style={{ color: tk.textFaint, fontFamily: mono }}>Unit</label>
                          <select value={editUnit} onChange={(e) => setEditUnit(e.target.value)}
                            style={{ ...inp, cursor: "pointer", appearance: "none" }}
                            onFocus={focusAccent} onBlur={blurReset}>
                            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold mb-1 block tracking-widest"
                          style={{ color: tk.textFaint, fontFamily: mono }}>Category</label>
                        <select value={editCat} onChange={(e) => setEditCat(e.target.value)}
                          style={{ ...inp, cursor: "pointer", appearance: "none" }}
                          onFocus={focusAccent} onBlur={blurReset}>
                          {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold mb-1 block tracking-widest"
                          style={{ color: tk.textFaint, fontFamily: mono }}>Low stock at</label>
                        <input type="text" inputMode="decimal"
                          value={editLow} onChange={(e) => setEditLow(sanitiseQty(e.target.value))}
                          style={inp} onFocus={focusAccent} onBlur={blurReset} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold mb-1 block tracking-widest"
                        style={{ color: tk.textFaint, fontFamily: mono }}>Note</label>
                      <input value={editNote} onChange={(e) => setEditNote(e.target.value.slice(0, 50))}
                        placeholder="Where it's kept, usage notes…"
                        style={inp} onFocus={focusAccent} onBlur={blurReset} />
                      <p className="text-xs mt-1 text-right"
                        style={{ color: editNote.length >= 45 ? "#f87171" : tk.textFaint, fontFamily: mono }}>
                        {editNote.length}/50
                      </p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit}
                        disabled={!editName.trim() || editQty === ""}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                        style={{ background: tk.accent, color: "#09090b" }}>
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                        style={{ background: "transparent", border: `1px solid ${tk.border2}`, color: tk.textMuted }}>
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Display mode ── */
                  <div className="flex items-center gap-4">
                    {/* Category dot */}
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: catColor }} />

                    {/* Name + note */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm" style={{ color: tk.text }}>{item.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: `${catColor}20`, color: catColor }}>
                          {item.category}
                        </span>
                        {isLow && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: "#f8717120", color: "#f87171" }}>
                            <AlertTriangle className="w-2.5 h-2.5" /> Low
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: tk.textFaint }}>
                          {item.note}
                        </p>
                      )}
                    </div>

                    {/* Quick +/- + quantity */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => adjustQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold transition-all"
                        style={{ background: tk.surface2, border: `1px solid ${tk.border}`, color: tk.textMuted }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f87171"; e.currentTarget.style.color = "#f87171"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;  e.currentTarget.style.color = tk.textMuted; }}
                      >−</button>

                      <div className="text-center" style={{ minWidth: 60 }}>
                        <p className="text-base font-extrabold leading-none"
                          style={{ color: isLow ? "#f87171" : tk.text, fontFamily: mono }}>
                          {item.qty}
                        </p>
                        <p className="text-[10px]" style={{ color: tk.textFaint }}>{item.unit}</p>
                      </div>

                      <button
                        onClick={() => adjustQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold transition-all"
                        style={{ background: tk.surface2, border: `1px solid ${tk.border}`, color: tk.textMuted }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = tk.accent; e.currentTarget.style.color = tk.accent; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = tk.border;  e.currentTarget.style.color = tk.textMuted; }}
                      >+</button>
                    </div>

                    {/* Edit + Delete */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: tk.textFaint, background: "transparent" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = tk.accent)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeletingId(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ color: tk.textFaint, background: "transparent" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete confirm modal ── */}
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
            <h3 className="text-lg font-bold mb-1" style={{ color: tk.text }}>Remove item?</h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              This will be removed from your pantry list.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 text-sm rounded-xl font-bold"
                style={{ border: `1px solid ${tk.border2}`, color: tk.textMuted, background: "transparent" }}>
                Cancel
              </button>
              <button onClick={() => deleteItem(deletingId)}
                className="px-6 py-2.5 text-sm rounded-xl font-bold"
                style={{ background: "#ef4444", color: "#ffffff" }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}