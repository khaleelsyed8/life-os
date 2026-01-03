import { useState } from "react";
import { 
  Target, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
  Folder,
  Star,
  Calendar
} from "lucide-react";
import Card from "../components/ui/Card";
import useLocalStorage from "../hooks/useLocalStorage";

/* ------------------ Helpers ------------------ */
function daysLeft(endDate) {
  const diff =
    new Date(endDate).setHours(0, 0, 0, 0) -
    new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function groupByDomain(links) {
  return links.reduce((acc, link) => {
    acc[link.domain] = acc[link.domain] || [];
    acc[link.domain].push(link);
    return acc;
  }, {});
}

/* ------------------ Page ------------------ */
export default function Dictionary() {
  /* -------- Focus -------- */
  const [focusItems, setFocusItems] = useLocalStorage("focus-items", []);
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");

  /* -------- Links -------- */
  const [links, setLinks] = useLocalStorage("links", []);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [domain, setDomain] = useState("");

  // Predefined domains for suggestions
  const suggestedDomains = ["Physical", "Spiritual", "Mental", "Technical", "Self", "Financial", "Work", "Learning"];

  function addFocus() {
    if (!title.trim()) return;

    setFocusItems([
      ...focusItems,
      {
        id: Date.now(),
        title,
        startDate: new Date().toISOString(),
        endDate: endDate || null,
      },
    ]);

    setTitle("");
    setEndDate("");
  }

  function removeFocus(id) {
    setFocusItems(focusItems.filter((f) => f.id !== id));
  }

  function addLink() {
    if (!linkTitle || !linkUrl || !domain) return;

    setLinks([
      ...links,
      {
        id: Date.now(),
        title: linkTitle,
        url: linkUrl,
        domain,
      },
    ]);

    setLinkTitle("");
    setLinkUrl("");
    setDomain("");
  }

  function removeLink(id) {
    setLinks(links.filter((l) => l.id !== id));
  }

  const groupedLinks = groupByDomain(links);
  const domainColors = {
    Physical: "from-green-500 to-emerald-600",
    Spiritual: "from-purple-500 to-violet-600",
    Mental: "from-blue-500 to-cyan-600",
    Technical: "from-orange-500 to-red-600",
    Self: "from-pink-500 to-rose-600",
    Financial: "from-teal-500 to-green-600",
    Work: "from-gray-600 to-gray-800",
    Learning: "from-yellow-500 to-orange-600",
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dictionary
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Define what matters. Store what helps.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 sm:gap-4">
          <div className="text-center bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md border border-indigo-100">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{focusItems.length}</div>
            <div className="text-xs text-gray-600">Focus Items</div>
          </div>
          <div className="text-center bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md border border-indigo-100">
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{links.length}</div>
            <div className="text-xs text-gray-600">Links</div>
          </div>
        </div>
      </div>

      {/* ================= FOCUS ================= */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Current Focus</h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600 -mt-2 sm:-mt-4">Set your priorities and target completion dates.</p>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Add New Focus</h3>
          </div>
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you focusing on?"
              className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 border-2 border-blue-200 rounded-xl px-4 bg-white flex-1">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="py-3 outline-none w-full text-sm sm:text-base"
                />
              </div>

              <button
                onClick={addFocus}
                disabled={!title.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Focus
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {focusItems.length === 0 && (
            <Card className="text-center py-12">
              <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-500">No focus items yet.</p>
              <p className="text-sm text-gray-400 mt-2">Add your first focus to get started.</p>
            </Card>
          )}

          {focusItems.map((item) => {
            const remaining = item.endDate && daysLeft(item.endDate);
            const isOverdue = remaining !== null && remaining < 0;
            const isUrgent = remaining !== null && remaining > 0 && remaining <= 3;

            return (
              <Card
                key={item.id}
                hover
                className={`group ${
                  isOverdue 
                    ? 'border-red-300 bg-red-50' 
                    : isUrgent 
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-indigo-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isOverdue 
                          ? 'bg-red-200' 
                          : isUrgent 
                          ? 'bg-yellow-200'
                          : 'bg-blue-100'
                      }`}>
                        {isOverdue ? (
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        ) : isUrgent ? (
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700" />
                        ) : (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 break-words">{item.title}</h3>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                          {item.endDate ? (
                            <div className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${
                              isOverdue
                                ? "text-red-600"
                                : isUrgent
                                ? "text-yellow-700"
                                : "text-gray-600"
                            }`}>
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>
                                {isOverdue
                                  ? `Overdue by ${Math.abs(remaining)} day(s)`
                                  : `${remaining} day(s) remaining`}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                              Ongoing focus
                            </div>
                          )}
                          
                          {item.endDate && (
                            <div className="text-xs text-gray-400">
                              Due: {new Date(item.endDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFocus(item.id)}
                    className="p-2 text-gray-400 sm:opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all self-end sm:self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================= LINKS ================= */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quick Links</h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600 -mt-2 sm:-mt-4">Store your important resources and bookmarks.</p>

        {/* Add Link */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Add New Link</h3>
          </div>
          <div className="flex flex-col gap-3">
            <input
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              placeholder="Link title"
              className="border-2 border-indigo-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="border-2 border-indigo-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Domain"
                  list="domain-suggestions"
                  className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                />
                <datalist id="domain-suggestions">
                  {suggestedDomains.map(d => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
              <button
                onClick={addLink}
                disabled={!linkTitle || !linkUrl || !domain}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
          </div>
        </Card>

        {/* Grouped Links */}
        {Object.keys(groupedLinks).length === 0 && (
          <Card className="text-center py-12">
            <LinkIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-base sm:text-lg text-gray-500">No links saved yet.</p>
            <p className="text-sm text-gray-400 mt-2">Add your first link to organize your resources.</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {Object.entries(groupedLinks).map(
            ([domainName, domainLinks]) => (
              <Card 
                key={domainName} 
                className="space-y-3"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${
                    domainColors[domainName] || 'from-gray-500 to-gray-700'
                  } flex items-center justify-center flex-shrink-0`}>
                    <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate flex-1">
                    {domainName}
                  </h3>
                  <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                    {domainLinks.length}
                  </div>
                </div>

                <div className="space-y-2">
                  {domainLinks.map((link) => (
                    <div
                      key={link.id}
                      className="group flex justify-between items-center p-2 sm:p-3 hover:bg-indigo-50 rounded-lg transition-all gap-2"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium flex-1 min-w-0"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate text-sm sm:text-base">{link.title}</span>
                      </a>

                      <button
                        onClick={() => removeLink(link.id)}
                        className="p-2 text-gray-400 sm:opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )
          )}
        </div>
      </section>
    </div>
  );
}