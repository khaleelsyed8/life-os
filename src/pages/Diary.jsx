import { useState } from "react";
import {
  Calendar,
  Archive,
  Trash2,
  Plus,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import Card from "../components/ui/Card";
import useLocalStorage from "../hooks/useLocalStorage";

export default function Diary() {
  const [entries, setEntries] = useLocalStorage("diary-entries", []);
  const [text, setText] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function addEntry() {
    if (!text.trim()) return;

    setEntries([
      {
        id: Date.now(),
        content: text,
        createdAt: new Date().toISOString(),
        archived: false,
      },
      ...entries,
    ]);

    setText("");
  }

  function archiveEntry(id) {
    setEntries(
      entries.map((e) =>
        e.id === id ? { ...e, archived: true } : e
      )
    );
  }

  function deleteEntry(id) {
    setEntries(entries.filter((e) => e.id !== id));
  }

  function unarchiveEntry(id) {
    setEntries(
      entries.map((e) =>
        e.id === id ? { ...e, archived: false } : e
      )
    );
  }

  const activeEntries = entries.filter((e) => !e.archived);
  const archivedEntries = entries.filter((e) => e.archived);

  return (
    <div className="space-y-8">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Diary
            </h1>
            <p className="text-gray-600">Write freely. No pressure.</p>
          </div>
        </div>

        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            showArchived
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-purple-50 border"
          }`}
        >
          <Archive className="w-4 h-4" />
          {showArchived ? "Hide Archived" : "Show Archived"}
        </button>
      </div>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {activeEntries.length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600">
              {archivedEntries.length}
            </div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {entries.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </Card>
      </div>

      {/* ---------- WRITE ---------- */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full min-h-[160px] resize-none rounded-xl border-2 border-purple-200 p-4 text-lg outline-none focus:ring-4 focus:ring-purple-100"
        />

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {text.length} characters
          </span>
          <button
            onClick={addEntry}
            disabled={!text.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            Save Entry
          </button>
        </div>
      </Card>

      {/* ---------- ACTIVE ENTRIES ---------- */}
      <div className="space-y-4">
        {activeEntries.map((entry) => (
          <Card key={entry.id} hover className="group">
            <div className="flex justify-between items-center text-xs text-purple-600 mb-2">
              <span>
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
              <span>
                {new Date(entry.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {entry.content}
            </p>

            <div className="flex gap-4 mt-4 pt-4 border-t lg:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => archiveEntry(entry.id)}
                className="text-purple-600 sm:text-gray-600 sm:hover:text-purple-600 text-sm flex gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>

              <button
                onClick={() => setDeletingId(entry.id)}
                className="text-red-600 sm:text-gray-600 sm:hover:text-red-600 text-sm flex gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* ---------- ARCHIVED ---------- */}
      {showArchived && (
        <div className="space-y-4 pt-8 border-t border-dashed">
          {archivedEntries.map((entry) => (
            <Card key={entry.id} className="opacity-80">
              <p className="text-gray-700">{entry.content}</p>

              <div className="flex gap-4 mt-4 pt-4 border-t">
                <button
                  onClick={() => unarchiveEntry(entry.id)}
                  className="text-green-600 flex gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Unarchive
                </button>

                <button
                  onClick={() => setDeletingId(entry.id)}
                  className="text-red-600 flex gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- DELETE CONFIRM MODAL ---------- */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Card className="w-[90%] max-w-md bg-white border-2 border-purple-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Delete entry?</h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 text-sm rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    deleteEntry(deletingId);
                    setDeletingId(null);
                  }}
                  className="px-5 py-2 text-sm text-white rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
