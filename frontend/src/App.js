import { useEffect, useState } from "react";

const BACKEND_URL = "https://ai-notes-app-5cid.onrender.com";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH NOTES ---------------- */
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notes`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------------- SAVE NOTE ---------------- */
  const saveNote = async () => {
    if (!content.trim()) return alert("Write something!");

    setLoading(true);

    await fetch(`${BACKEND_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    setLoading(false);

    fetchNotes(); // refresh UI
  };

  /* ---------------- SEARCH ---------------- */
  const filteredNotes = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>AI Notes App</h1>
      <p style={styles.sub}>AI-powered notes with search</p>

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
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button style={styles.button} onClick={saveNote} disabled={loading}>
          {loading ? "Saving..." : "Save Note"}
        </button>
      </div>

      {/* SEARCH */}
      <div style={styles.card}>
        <input
          style={styles.input}
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* NOTES */}
      <div>
        {filteredNotes.length === 0 && (
          <p style={{ textAlign: "center" }}>No notes found</p>
        )}

        {filteredNotes.map((note) => (
          <div key={note.id} style={styles.note}>
            <h3>{note.title || "Untitled Note"}</h3>
            <p>{note.content}</p>
            <small>{note.summary}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  page: {
    maxWidth: "900px",
    margin: "auto",
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    background: "#f5f7fb",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    marginBottom: "0.3rem",
  },
  sub: {
    textAlign: "center",
    color: "#666",
    marginBottom: "2rem",
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  note: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
};
