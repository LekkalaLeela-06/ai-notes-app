import { useEffect, useState } from "react";

const API_URL = "https://ai-notes-app-5cid.onrender.com";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  /* ---------------- FETCH NOTES ---------------- */
  const fetchNotes = async () => {
    const res = await fetch(`${API_URL}/api/notes`);
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------------- SAVE NOTE ---------------- */
  const saveNote = async () => {
    if (!content.trim()) return alert("Please write a note");

    await fetch(`${API_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    fetchNotes();
  };

  /* ---------------- AI SUMMARY ---------------- */
  const generateSummary = async (noteId) => {
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

    setLoadingId(null);
  };

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredNotes = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>AI Notes</h1>
      <p style={styles.subtitle}>
        Write notes. Summarize with AI when you need it.
      </p>

      {/* ADD NOTE */}
      <div style={styles.card}>
        <h2>Add Note</h2>

        <input
          style={styles.input}
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          style={styles.textarea}
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button style={styles.primaryBtn} onClick={saveNote}>
          Save Note
        </button>
      </div>

      {/* SEARCH */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* NOTES */}
      <h2>Your Notes</h2>

      {filteredNotes.length === 0 && <p>No notes found.</p>}

      {filteredNotes.map((note) => (
        <div key={note.id} style={styles.noteCard}>
          <h3>{note.title || "Untitled Note"}</h3>
          <p style={styles.noteText}>{note.content}</p>

          {/* AI SUMMARY */}
          {note.summary && (
            <div style={styles.summaryBox}>
              <strong>AI Summary</strong>
              <p>{note.summary}</p>
            </div>
          )}

          <button
            style={styles.aiBtn}
            onClick={() => generateSummary(note.id)}
            disabled={loadingId === note.id}
          >
            {loadingId === note.id
              ? "Generating..."
              : note.summary
              ? "Re-generate Summary"
              : "Generate AI Summary"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  page: {
    maxWidth: "900px",
    margin: "auto",
    padding: "24px",
    background: "#f5f7fb",
    minHeight: "100vh",
    fontFamily: "system-ui, Arial",
  },
  title: { textAlign: "center" },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: "28px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  searchBox: {
    marginBottom: "20px",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  noteCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "18px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.07)",
  },
  noteText: {
    color: "#333",
    marginBottom: "10px",
    whiteSpace: "pre-wrap",
  },
  summaryBox: {
    background: "#eef2ff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  aiBtn: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default App;
