import { useEffect, useState } from "react";

const API_URL = "https://ai-notes-app-5cid.onrender.com";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");

  const [menuOpen, setMenuOpen] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [showSummary, setShowSummary] = useState({});
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  /* ---------- FETCH NOTES ---------- */
  const fetchNotes = async () => {
    const res = await fetch(`${API_URL}/api/notes`);
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------- ADD NOTE ---------- */
  const saveNote = async () => {
    if (!content.trim()) return alert("Write something");

    await fetch(`${API_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    fetchNotes();
  };

  /* ---------- DELETE ---------- */
  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;

    await fetch(`${API_URL}/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  };

  /* ---------- EDIT ---------- */
  const startEdit = (note) => {
    setEditId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setMenuOpen(null);
  };

  const saveEdit = async () => {
    await fetch(`${API_URL}/api/notes/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
      }),
    });

    setEditId(null);
    fetchNotes();
  };

  /* ---------- SUMMARY ---------- */
  const summarize = async (noteId) => {
    setLoadingId(noteId);

    const res = await fetch(`${API_URL}/api/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });

    const updated = await res.json();

    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? updated : n))
    );

    setShowSummary((prev) => ({ ...prev, [noteId]: true }));
    setLoadingId(null);
    setMenuOpen(null);
  };

  /* ---------- SEARCH ---------- */
  const filteredNotes = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>AI Notes</h1>

      {/* ADD NOTE */}
      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button style={styles.primaryBtn} onClick={saveNote}>
          Save Note
        </button>
      </div>

      {/* SEARCH */}
      <input
        style={styles.search}
        placeholder="Search notes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* NOTES */}
      {filteredNotes.map((note) => (
        <div key={note.id} style={styles.noteCard}>
          <div style={styles.header}>
            <h3>{note.title || "Untitled"}</h3>
            <button
              style={styles.menuIcon}
              onClick={() =>
                setMenuOpen(menuOpen === note.id ? null : note.id)
              }
            >
              ⋯
            </button>
          </div>

          {/* EDIT MODE */}
          {editId === note.id ? (
            <>
              <input
                style={styles.input}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                style={styles.textarea}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <button style={styles.primaryBtn} onClick={saveEdit}>
                Save
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setEditId(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <p style={styles.text}>{note.content}</p>

              {/* MENU */}
              {menuOpen === note.id && (
                <div style={styles.menu}>
                  <button
                    style={styles.menuBtn}
                    onClick={() => summarize(note.id)}
                  >
                    {loadingId === note.id
                      ? "Summarizing…"
                      : "Summarize 🧠"}
                  </button>
                  <button
                    style={styles.menuBtn}
                    onClick={() => startEdit(note)}
                  >
                    Edit ✏️
                  </button>
                  <button
                    style={{ ...styles.menuBtn, color: "#dc2626" }}
                    onClick={() => deleteNote(note.id)}
                  >
                    Delete 🗑️
                  </button>
                </div>
              )}

              {/* SUMMARY */}
              {showSummary[note.id] && note.summary && (
                <div style={styles.summary}>
                  <strong>AI Summary</strong>
                  <p>{note.summary}</p>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {filteredNotes.length === 0 && <p>No notes found.</p>}
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  page: {
    maxWidth: "820px",
    margin: "auto",
    padding: "24px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "system-ui",
  },
  title: { textAlign: "center", marginBottom: "20px" },
  card: {
    background: "#fff",
    padding: "16px",
    borderRadius: "14px",
    marginBottom: "20px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "8px",
    border: "1px solid #cbd5f5",
  },
  textarea: {
    width: "100%",
    height: "90px",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "8px",
    border: "1px solid #cbd5f5",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "8px",
  },
  cancelBtn: {
    background: "#e5e7eb",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
  },
  search: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5f5",
    marginBottom: "20px",
  },
  noteCard: {
    background: "#fff",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuIcon: {
    background: "none",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
  },
  menu: { marginTop: "8px" },
  menuBtn: {
    display: "block",
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    padding: "6px 12px",
    marginBottom: "6px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  text: { whiteSpace: "pre-wrap" },
  summary: {
    marginTop: "10px",
    background: "#eef2ff",
    padding: "10px",
    borderRadius: "10px",
  },
};

export default App;
