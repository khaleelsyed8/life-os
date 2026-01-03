import { useState } from "react";
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  PauseCircle,
  CheckCircle,
  PlayCircle,
  Folder,
  TrendingUp,
  Clock,
  Award,
  Zap,
} from "lucide-react";
import Card from "../components/ui/Card";
import useLocalStorage from "../hooks/useLocalStorage";

/* ------------------ Helpers ------------------ */
const STATUS_META = {
  Active: {
    label: "Active",
    icon: PlayCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-300",
    gradient: "from-green-500 to-emerald-600",
    badge: "bg-green-100 text-green-700",
  },
  Paused: {
    label: "Paused",
    icon: PauseCircle,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    gradient: "from-yellow-500 to-orange-600",
    badge: "bg-yellow-100 text-yellow-700",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-300",
    gradient: "from-indigo-500 to-purple-600",
    badge: "bg-indigo-100 text-indigo-700",
  },
};

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

    setName("");
    setLink("");
    setStatus("Active");
    setDescription("");
  }

  function removeProject(id) {
    setProjects(projects.filter((p) => p.id !== id));
  }

  function updateStatus(id, newStatus) {
    setProjects(projects.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
  }

  const statusCounts = {
    All: projects.length,
    Active: projects.filter((p) => p.status === "Active").length,
    Paused: projects.filter((p) => p.status === "Paused").length,
    Completed: projects.filter((p) => p.status === "Completed").length,
  };

  const filteredProjects =
    filterStatus === "All" ? projects : projects.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Track what you're building.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="text-center bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md border border-indigo-100">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{projects.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md border border-indigo-100">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{statusCounts.Active}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
          <div className="text-center bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md border border-indigo-100">
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{statusCounts.Completed}</div>
            <div className="text-xs text-gray-600">Done</div>
          </div>
        </div>
      </div>

      {/* ================= ADD PROJECT ================= */}
      <section className="space-y-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Add New Project</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name *"
              className="border-2 border-orange-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
            />

            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Project link (URL) *"
              className="border-2 border-orange-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project description (optional)"
            rows="3"
            className="w-full border-2 border-orange-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none resize-none mb-3"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 border-2 border-orange-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none bg-white"
            >
              {Object.keys(STATUS_META).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={addProject}
              disabled={!name || !link}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        </Card>
      </section>

      {/* ================= FILTER TABS ================= */}
      <section>
        <div className="flex items-center gap-2 flex-wrap">
          {["All", "Active", "Paused", "Completed"].map((filterOption) => {
            const isActive = filterStatus === filterOption;
            const count = statusCounts[filterOption];

            return (
              <button
                key={filterOption}
                onClick={() => setFilterStatus(filterOption)}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-orange-50 border border-indigo-100"
                }`}
              >
                {filterOption} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= PROJECT LIST ================= */}
      <section className="space-y-4">
        {filteredProjects.length === 0 && (
          <Card className="text-center py-12">
            <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-base sm:text-lg text-gray-500">
              {filterStatus === "All" ? "No projects yet." : `No ${filterStatus.toLowerCase()} projects.`}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {filterStatus === "All"
                ? "Add your first project to get started."
                : `Try adding a project or changing the filter.`}
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredProjects.map((project) => {
            const meta = STATUS_META[project.status];
            const StatusIcon = meta.icon;

            return (
              <Card
                key={project.id}
                hover
                className={`group relative overflow-hidden ${meta.bg} border-2 ${meta.border}`}
              >
                {/* Status Ribbon */}
                <div className="absolute top-0 right-0">
                  <div
                    className={`${meta.badge} px-3 py-1 rounded-bl-xl flex items-center gap-1 text-xs font-bold shadow-md`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {meta.label}
                  </div>
                </div>

                <div className="pt-2">
                  {/* Project Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate">{project.name}</h3>
                      {project.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          Created{" "}
                          {new Date(project.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <div className="mb-4 p-3 bg-white/50 rounded-lg border border-white">
                      <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                    </div>
                  )}

                  {/* Project Link */}
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold ${meta.color} hover:underline mb-4 break-all`}
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{project.link}</span>
                  </a>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-white gap-3">
                    {/* Status Changer */}
                    <div className="flex gap-1">
                      {Object.keys(STATUS_META).map((statusOption) => {
                        const isCurrentStatus = project.status === statusOption;
                        const statusMeta = STATUS_META[statusOption];
                        const StatusOptionIcon = statusMeta.icon;

                        return (
                          <button
                            key={statusOption}
                            onClick={() => updateStatus(project.id, statusOption)}
                            disabled={isCurrentStatus}
                            className={`p-2 rounded-lg transition-all ${
                              isCurrentStatus
                                ? `${statusMeta.bg} ${statusMeta.color} cursor-default`
                                : "bg-white/50 text-gray-400 hover:bg-white hover:text-gray-700"
                            }`}
                            title={`Set to ${statusOption}`}
                          >
                            <StatusOptionIcon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeProject(project.id)}
                      className="p-2 text-gray-400 sm:opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Completion Badge */}
                {project.status === "Completed" && (
                  <div className="absolute bottom-4 right-4 opacity-10">
                    <Award className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================= MOTIVATIONAL STATS ================= */}
      {projects.length > 0 && (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Active Velocity */}
            {statusCounts.Active > 0 && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{statusCounts.Active}</div>
                    <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Completion Rate */}
            {statusCounts.Completed > 0 && (
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                      {Math.round((statusCounts.Completed / projects.length) * 100)}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Total Progress */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">{projects.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Projects</div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}