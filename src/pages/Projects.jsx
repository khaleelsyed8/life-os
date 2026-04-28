import { useState } from "react";
import { 
  Briefcase, Plus, Trash2, ExternalLink, PauseCircle, 
  CheckCircle, PlayCircle, Folder, TrendingUp, Clock, 
  Award, Zap, Calendar, X, AlignLeft 
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
  accent:    isDark ? "#60a5fa" : "#3b82f6",
  inputBg:   isDark ? "#0a0a0f" : "#ffffff",
  inputBdr:  isDark ? "#3f3f46" : "#d4d4d8",
  overlay:   isDark ? "rgba(0,0,0,0.70)" : "rgba(0,0,0,0.35)",
});

const mono = "'Space Mono', monospace";
const sans = "'Syne', sans-serif";

const STATUS = {
  Active:    { label: "Active",    icon: PlayCircle,  color: "#34d399", bg: "#34d39914", border: "#34d39933" },
  Paused:    { label: "Paused",    icon: PauseCircle, color: "#f59e0b", bg: "#f59e0b14", border: "#f59e0b33" },
  Completed: { label: "Completed", icon: CheckCircle, color: "#60a5fa", bg: "#60a5fa14", border: "#60a5fa33" },
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
export default function Projects() {
  const { isDark } = useTheme();
  const tk = t(isDark);

  const [projects, setProjects] = useLocalStorage("projects-v3", []);
  const [name, setName]               = useState("");
  const [link, setLink]               = useState("");
  const [description, setDescription] = useState("");
  const [deletingId, setDeletingId]   = useState(null);

  const addProject = () => {
    if (!name.trim() || !link.trim()) return;
    setProjects([{ 
      id: Date.now(), 
      name, 
      link, 
      description: description.trim(), 
      status: "Active", 
      created: new Date().toISOString() 
    }, ...projects]);
    setName(""); setLink(""); setDescription("");
  };

  const updateStatus = (id, status) => {
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const activeCount = projects.filter(p => p.status === "Active").length;
  const completed   = projects.filter(p => p.status === "Completed").length;
  const completeRate = projects.length > 0 ? Math.round((completed / projects.length) * 100) : 0;

  return (
    <div className="space-y-10 pb-10" style={{ fontFamily: sans }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase font-bold mb-1"
            style={{ fontFamily: mono, color: tk.accent }}>
            Build & Execute
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-none" style={{ color: tk.text }}>
            Projects
          </h1>
          <p className="text-sm mt-2" style={{ color: tk.textMuted }}>Ship meaningful work. Tracking {projects.length} initiatives.</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "In Flight", value: activeCount, color: "#34d399" },
            { label: "Success Rate", value: `${completeRate}%`, color: "#60a5fa" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl px-4 py-3 text-center min-w-[100px]"
              style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
              <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: mono }}>{s.value}</p>
              <p className="text-xs mt-0.5 uppercase tracking-tighter" style={{ color: tk.textFaint }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Project Composer */}
      <div className="rounded-2xl p-6" style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
        <SL tk={tk}>Initiate new project</SL>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: tk.textFaint, fontFamily: mono }}>Name *</label>
               <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text }}
                onFocus={(e) => (e.target.style.borderColor = tk.accent)}
                onBlur={(e)  => (e.target.style.borderColor = tk.inputBdr)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: tk.textFaint, fontFamily: mono }}>URL *</label>
              <input
                value={link} onChange={(e) => setLink(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text }}
                onFocus={(e) => (e.target.style.borderColor = tk.accent)}
                onBlur={(e)  => (e.target.style.borderColor = tk.inputBdr)}
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: tk.textFaint, fontFamily: mono }}>Description (Optional)</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the goals of this project?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style={{ background: tk.inputBg, border: `1px solid ${tk.inputBdr}`, color: tk.text, fontFamily: sans }}
              onFocus={(e) => (e.target.style.borderColor = tk.accent)}
              onBlur={(e)  => (e.target.style.borderColor = tk.inputBdr)}
            />
          </div>

          <button onClick={addProject} disabled={!name.trim() || !link.trim()}
            className="flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all disabled:opacity-40 shadow-lg shadow-blue-500/10"
            style={{ background: tk.accent, color: "#ffffff" }}>
            <Plus className="w-4 h-4" /> Start Initiative
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-24 rounded-2xl" style={{ border: `1px dashed ${tk.border}` }}>
          <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: tk.textFaint }} />
          <p className="text-sm font-medium" style={{ color: tk.textFaint }}>No active projects recorded. Define your vision.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <SL tk={tk}>Active Pipeline</SL>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {projects.map((project) => {
              const S = STATUS[project.status];
              return (
                <div key={project.id}
                  className="group rounded-2xl p-6 transition-all flex flex-col justify-between"
                  style={{ background: tk.surface, border: `1px solid ${tk.border}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = tk.border2)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = tk.border)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: S.bg, color: S.color, border: `1px solid ${S.border}` }}>
                            <S.icon className="w-3 h-3" />
                            {S.label}
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: tk.textFaint, fontFamily: mono }}>
                            {new Date(project.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold truncate mb-1" style={{ color: tk.text }}>{project.name}</h3>
                        <a href={project.link} target="_blank" rel="noreferrer" 
                          className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: tk.accent }}>
                          <ExternalLink size={12} /> {project.link}
                        </a>
                      </div>
                      <button onClick={() => setDeletingId(project.id)}
                        className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        style={{ color: tk.textFaint }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = tk.textFaint)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {project.description && (
                      <div className="flex gap-3 items-start p-3 rounded-xl" style={{ background: tk.surface2 }}>
                        <AlignLeft className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: tk.textFaint }} />
                        <p className="text-sm leading-relaxed" style={{ color: tk.textSub }}>{project.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6 pt-4" style={{ borderTop: `1px solid ${tk.border}` }}>
                    {Object.keys(STATUS).map((sKey) => {
                      const isActive = project.status === sKey;
                      const sInfo = STATUS[sKey];
                      return (
                        <button
                          key={sKey}
                          onClick={() => updateStatus(project.id, sKey)}
                          className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2"
                          style={{ 
                            background: isActive ? sInfo.bg : "transparent",
                            color: isActive ? sInfo.color : tk.textFaint,
                            border: `1px solid ${isActive ? sInfo.border : tk.border}`
                          }}
                        >
                          {isActive && <CheckCircle className="w-3 h-3" />}
                          {sKey.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats & Motivation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-6 flex items-center gap-5"
          style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#60a5fa15", border: "1px solid #60a5fa33" }}>
            <Award className="w-6 h-6" style={{ color: "#60a5fa" }} />
          </div>
          <div>
            <p className="text-3xl font-extrabold" style={{ color: "#60a5fa", fontFamily: mono }}>{completeRate}%</p>
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: tk.textFaint }}>Success Rate</p>
          </div>
        </div>
        <div className="rounded-2xl p-6 flex items-center gap-5"
          style={{ background: tk.surface, border: `1px solid ${tk.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#34d39915", border: "1px solid #34d39933" }}>
            <TrendingUp className="w-6 h-6" style={{ color: "#34d399" }} />
          </div>
          <div>
            <p className="text-3xl font-extrabold" style={{ color: "#34d399", fontFamily: mono }}>{activeCount}</p>
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: tk.textFaint }}>Active Sprints</p>
          </div>
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
            <h3 className="text-lg font-bold mb-1" style={{ color: tk.text }}>Archive project?</h3>
            <p className="text-sm mb-6" style={{ color: tk.textMuted }}>
              Removing this project will also delete its history, links, and description.
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
                onClick={() => { deleteProject(deletingId); setDeletingId(null); }}
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