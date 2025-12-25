import { useEffect, useState } from "react";

const BACKEND_URL = "https://ai-notes-app-5cid.onrender.com";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);

  // Search states
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH NOTES ---------------- */
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notes`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Fetch notes failed", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------------- SAVE NOTE ---------------- */
  const saveNote = async () => {
    if (!content.trim()) {
      alert("Please write some content");
      return;
    }

    setLoading(true);

    await fetch(`${BACKEND_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    setLoading(false);

    fetchNotes();
  };

  /* ---------------- SEARCH NOTES ---------------- */
  const searchNotes = async () => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/search?q=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    }

    setSearching(false);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>AI Notes App</h1>
      <p style={styles.sub}>AI-powered notes with smart search</p>

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
        <h2>Search Notes</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            style={styles.input}
            placeholder="Search by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button style={styles.button} onClick={searchNotes}>
            Search
          </button>
        </div>

        {searching && <p>Searching...</p>}

        {!searching && searchResults.length === 0 && search && (
          <p style={{ color: "#666", marginTop: "10px" }}>
            No matching notes found.
          </p>
        )}

        {searchResults.map((note) => (
          <div key={note.id} style={styles.note}>
            <h3>{note.title || "Untitled Note"}</h3>
            <p>{note.summary}</p>
          </div>
        ))}
      </div>

      {/* ALL NOTES */}
      <div>
        <h2 style={{ marginBottom: "10px" }}>All Notes</h2>

        {notes.length === 0 && <p>No notes added yet.</p>}

        {notes.map((note) => (
          <div key={note.id} style={styles.note}>
            <h3>{note.title || "Untitled Note"}</h3>
            <p>{note.content}</p>
            <small style={{ color: "#555" }}>{note.summary}</small>
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
    fontFamily: "Segoe UI, sans-serif",
    background: "#f4f6fb",
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
    borderRadius: "10px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    fontSize: "14px",
  },
  button: {
    padding: "10px 18px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  note: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
};
