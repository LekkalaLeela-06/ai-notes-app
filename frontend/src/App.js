import { useEffect, useState } from "react";

const BACKEND_URL = "https://ai-notes-app-5cid.onrender.com";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH NOTES ---------------- */
  const fetchNotes = async () => {
    const res = await fetch(`${BACKEND_URL}/notes`);
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------------- SAVE NOTE ---------------- */
  const saveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content cannot be empty");
      return;
    }

    setLoading(true);
    await fetch(`${BACKEND_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    setTitle("");
    setContent("");
    setLoading(false);
    fetchNotes();
  };

  /* ---------------- AI SEARCH ---------------- */
  const searchNotes = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const res = await fetch(`${BACKEND_URL}/notes/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setSearchResults(data);
    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>AI Notes App</h1>
      <p style={styles.subtitle}>AI-powered notes with semantic search</p>

      {/* ADD NOTE */}
      <div style={styles.card}>
        <h2>Add Note</h2>
        <input
          style={styles.input}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="Write your note here..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button style={styles.button} onClick={saveNote}>
          {loading ? "Saving..." : "Save Note"}
        </button>
      </div>

      {/* SEARCH */}
      <div style={styles.card}>
        <h2>AI Semantic Search</h2>
        <input
          style={styles.input}
          placeholder="Search by meaning (AI-powered)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button style={styles.button} onClick={searchNotes}>
          {loading ? "Searching..." : "Search"}
        </button>

        {searchResults.length > 0 && (
          <div style={styles.results}>
            <h3>Search Results</h3>
            {searchResults.map((note) => (
              <div key={note.id} style={styles.note}>
                <strong>{note.title || "Untitled Note"}</strong>
                <p>{note.summary || note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALL NOTES */}
      <div style={styles.card}>
        <h2>All Notes</h2>

        {notes.length === 0 ? (
          <p style={styles.empty}>No notes added yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} style={styles.note}>
              <strong>{note.title || "Untitled Note"}</strong>
              <p>{note.content}</p>
              <small style={styles.summary}>
                AI Summary: {note.summary}
              </small>
            </div>
          ))
        )}
      </div>

      <footer style={styles.footer}>
        Built with React • OpenAI • PostgreSQL (pgvector)
      </footer>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "5px",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "30px",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto 30px",
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  button: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
  note: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    marginTop: "10px",
  },
  results: {
    marginTop: "20px",
  },
  empty: {
    color: "#6b7280",
  },
  summary: {
    color: "#4b5563",
    fontSize: "13px",
  },
  footer: {
    textAlign: "center",
    marginTop: "40px",
    color: "#6b7280",
    fontSize: "14px",
  },
};

export default App;
