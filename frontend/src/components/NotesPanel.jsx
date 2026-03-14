import { useState, useEffect } from "react";
import { getAnalysisNotes, createAnalysisNote } from "../api/client";

function NotesPanel({ analysisId, token }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotes();
  }, [analysisId, token]);

  const loadNotes = async () => {
    if (!token || !analysisId) return;
    
    setLoading(true);
    try {
      const response = await getAnalysisNotes(token, analysisId);
      if (response.success) {
        setNotes(response.notes || []);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !token) return;

    setSubmitting(true);
    try {
      const response = await createAnalysisNote(token, analysisId, newNote.trim());
      if (response.success) {
        setNotes([response.note, ...notes]);
        setNewNote("");
        setError(null);
      } else {
        setError(response.message || "Failed to add note");
      }
    } catch (err) {
      console.error("Failed to create note:", err);
      setError("Error adding note");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="font-semibold text-rescue-dark">📝 Analysis Notes</h4>

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a personal note about this analysis..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-rescue-main focus:outline-none"
          rows="3"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!newNote.trim() || submitting}
          className="rounded-lg bg-rescue-main px-3 py-1.5 text-xs font-semibold text-white hover:bg-rescue-dark disabled:bg-slate-300"
        >
          {submitting ? "Adding..." : "Add note"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No notes yet. Add one!</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {note.authorName || "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotesPanel;
