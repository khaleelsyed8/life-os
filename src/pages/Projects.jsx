import { useState } from "react";
import {
  Briefcase, Plus, Trash2, ExternalLink,
  PauseCircle, CheckCircle, PlayCircle,
  Folder, TrendingUp, Clock, Award, Zap,
} from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";

/* ── Helpers ─────────────────────────────────────────────────────────── */
const STATUS = {
  Active: {
    label: "Active",
    icon: PlayCircle,
    color: "#34d399",
    bg: "#34d39914",
    border: "#34d39944",
  },
  Paused: {
    label: "Paused",
    icon: PauseCircle,
    color: "#f59e0b",
    bg: "#f59e0b14",
    border: "#f59e0b44",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "#60a5fa",
    bg: "#60a5fa14",
    border: "#60a5fa44",
  },
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
  "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 text-sm transition-colors";

/* ── Component ───────────────────────────────────────────────────────── */
export default function Projects() {
  const [projects, setProjects] = useLocalStorage("projects", []);
  const [filterStatus, setFilterStatus] = useState("All");

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");

  function addProject() {
    if (!name.trim() || !link.trim()) return;
    setProjects([
      {
        id: Date.now(),
        name,
        link,
        status,
        description: description || null,
        createdAt: new Date().toISOString(),
      },
      ...projects,
    ]);
    setName(""); setLink(""); setStatus("Active"); setDescription("");
  }

  function removeProject(id) {
    setProjects(projects.filter((p) => p.id !== id));
  }

  function updateStatus(id, newStatus) {
    setProjects(projects.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
  }

  const counts = {
    All: projects.length,
    Active: projects.filter((p) => p.status === "Active").length,
    Paused: projects.filter((p) => p.status === "Paused").length,
    Completed: projects.filter((p) => p.status === "Completed").length,
  };

  const filtered = filterStatus === "All" ? projects : projects.filter((p) => p.status === filterStatus);
  const completionRate = projects.length > 0 ? Math.round((counts.Completed / projects.length) * 100) : 0;

  return (
    <div className="space-y-8" style={{ fontFamily: "'Syne', sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p
            className="text-xs tracking-widest uppercase text-orange-400 mb-1"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Project tracker
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 leading-none">
            Projects
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Track what you're building.</p>
        </div>

        {/* Stat pills */}
        <div className="flex gap-3">
          {[
            { label: "Total", value: counts.All, color: "#fb923c" },
            { label: "Active", value: counts.Active, color: "#34d399" },
            { label: "Done", value: counts.Completed, color: "#60a5fa" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center min-w-[64px]"
            >
              <p
                className="text-2xl font-extrabold"
                style={{ color: s.color, fontFamily: "'Space Mono', monospace" }}
              >
                {s.value}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add form ────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <SL>New project</SL>
        <div className="flex flex-col gap-3">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Project name *"
            className={inputCls}
          />
          <input
            value={link} onChange={(e) => setLink(e.target.value)}
            placeholder="Project URL *"
            className={inputCls}
          />
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className={`${inputCls} resize-none`}
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={status} onChange={(e) => setStatus(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-orange-500/50 text-sm transition-colors"
            >
              {Object.keys(STATUS).map((s) => (
                <option key={s} value={s} style={{ background: "#18181b" }}>{s}</option>
              ))}
            </select>
            <button
              onClick={addProject}
              disabled={!name || !link}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all whitespace-nowrap"
              style={{ background: "#fb923c", color: "#0a0a0f" }}
            >
              <Plus className="w-4 h-4" /> Add project
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {["All", "Active", "Paused", "Completed"].map((f) => {
          const isActive = filterStatus === f;
          const color = f === "All" ? "#fb923c" : STATUS[f]?.color;
          return (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: isActive ? `${color}22` : "#18181b",
                border: `1px solid ${isActive ? `${color}66` : "#27272a"}`,
                color: isActive ? color : "#71717a",
              }}
            >
              {f} ({counts[f] ?? counts.All})
            </button>
          );
        })}
      </div>

      {/* ── Project grid ────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
          <Briefcase className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">
            {filterStatus === "All" ? "No projects yet." : `No ${filterStatus.toLowerCase()} projects.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((project) => {
            const meta = STATUS[project.status];
            const StatusIcon = meta.icon;

            return (
              <div
                key={project.id}
                className="group relative bg-zinc-900 rounded-2xl p-5 border transition-colors hover:border-zinc-700 overflow-hidden"
                style={{ borderColor: "#27272a" }}
              >
                {/* Ambient color glow top-right */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
                  style={{ background: meta.color }}
                />

                {/* Status badge */}
                <div
                  className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: meta.bg, color: meta.color, fontFamily: "'Space Mono', monospace" }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {meta.label}
                </div>

                {/* Title row */}
                <div className="flex items-start gap-3 mb-4 pr-24">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                  >
                    <Folder className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-100 text-base truncate">{project.name}</h3>
                    {project.createdAt && (
                      <p
                        className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        <Clock className="w-3 h-3" />
                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    {project.description}
                  </p>
                )}

                {/* Link */}
                <a
                  href={project.link} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs mb-5 transition-colors hover:underline truncate max-w-full"
                  style={{ color: meta.color, fontFamily: "'Space Mono', monospace" }}
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{project.link}</span>
                </a>

                {/* Action bar */}
                <div
                  className="flex items-center justify-between pt-4 border-t border-zinc-800"
                >
                  {/* Status switcher */}
                  <div className="flex gap-1.5">
                    {Object.entries(STATUS).map(([key, m]) => {
                      const Icon = m.icon;
                      const isCurrent = project.status === key;
                      return (
                        <button
                          key={key}
                          onClick={() => updateStatus(project.id, key)}
                          disabled={isCurrent}
                          title={key}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: isCurrent ? m.bg : "transparent",
                            border: `1px solid ${isCurrent ? m.border : "#27272a"}`,
                            color: isCurrent ? m.color : "#52525b",
                            cursor: isCurrent ? "default" : "pointer",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeProject(project.id)}
                    className="p-2 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Completed watermark */}
                {project.status === "Completed" && (
                  <div className="absolute bottom-4 right-14 opacity-5 pointer-events-none">
                    <Award className="w-16 h-16 text-blue-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom stats ────────────────────────────────────── */}
      {projects.length > 0 && (
        <div>
          <SL>Overview</SL>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {counts.Active > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#34d39914", border: "1px solid #34d39944" }}>
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-emerald-400" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {counts.Active}
                  </p>
                  <p className="text-xs text-zinc-500">In progress</p>
                </div>
              </div>
            )}
            {counts.Completed > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#60a5fa14", border: "1px solid #60a5fa44" }}>
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-blue-400" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {completionRate}%
                  </p>
                  <p className="text-xs text-zinc-500">Completion rate</p>
                </div>
              </div>
            )}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#fb923c14", border: "1px solid #fb923c44" }}>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-orange-400" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {counts.All}
                </p>
                <p className="text-xs text-zinc-500">Total projects</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}