import { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL = "https://ai-notes-app-5cid.onrender.com";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showSummaryId, setShowSummaryId] = useState(null);
  

  /* ---------------- FETCH NOTES ---------------- */
  const fetchNotes = async () => {
    const res = await fetch(`${BACKEND_URL}/api/notes`);
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------------- CREATE NOTE ---------------- */
  const saveNote = async () => {
    if (!content.trim()) return;

    await fetch(`${BACKEND_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    fetchNotes();
  };

  /* ---------------- DELETE NOTE ---------------- */
  const deleteNote = async (id) => {
    await fetch(`${BACKEND_URL}/api/notes/${id}`, {
      method: "DELETE",
    });
    fetchNotes();
  };

  /* ---------------- EDIT NOTE ---------------- */
  const startEdit = (note) => {
  setEditingId(note.id);
  setEditTitle(note.title || "");
  setEditContent(note.content || "");
};


  const saveEdit = async (id) => {
  await fetch(`${BACKEND_URL}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: editTitle,
      content: editContent,
    }),
  });

  setEditingId(null);
  setEditTitle("");
  setEditContent("");
  fetchNotes();
};


  /* ---------------- AI SUMMARY (ON DEMAND) ---------------- */
  const summarizeNote = async (id) => {
    const res = await fetch(`${BACKEND_URL}/api/notes/${id}/summarize`, {
      method: "POST",
    });
    const data = await res.json();

    setNotes(
      notes.map((n) =>
        n.id === id ? { ...n, summary: data.summary } : n
      )
    );
    setShowSummaryId(id);
  };

  /* ---------------- SEARCH (SAFE) ---------------- */
  const filteredNotes = notes.filter((n) => {
    if (!search.trim()) return true;

    return (
      (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (n.content || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="app-header">
        <h1>AI Notes</h1>
        <p>Smart note-taking with on-demand AI summarization</p>
      </header>

      {/* MAIN */}
      <div className="container">
        {/* ADD NOTE */}
        <div className="card">
          <input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button onClick={saveNote}>Save Note</button>
        </div>

        {/* SEARCH */}
        <input
          className="search"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* NOTES LIST */}
        {filteredNotes.map((note) => (
          <div key={note.id} className="note">
            <div className="note-header">
              <h3>{note.title || "Untitled"}</h3>

              <div className="icons">
                <span title="Summarize" onClick={() => summarizeNote(note.id)}>
                  🤖
                </span>
                <span title="Edit" onClick={() => startEdit(note)}>
                  ✏️
                </span>
                <span title="Delete" onClick={() => deleteNote(note.id)}>
                  🗑️
                </span>
              </div>
            </div>

            {/* EDIT MODE */}
            {editingId === note.id ? (
  <>
    <input
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      placeholder="Edit title"
    />

    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
    />

    <button onClick={() => saveEdit(note.id)}>Save</button>
  </>
) : (
  <p>{note.content}</p>
)}



            {/* AI SUMMARY */}
            {showSummaryId === note.id && note.summary && (
              <div className="summary">
                <strong>AI Summary</strong>
                <p>{note.summary}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
