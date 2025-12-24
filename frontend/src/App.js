import { useEffect, useState } from "react";

const BACKEND_URL = "https://ai-notes-app.onrender.com";

function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // 🔹 Fetch all notes
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/notes`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  // 🔹 Save a new note
  const saveNote = async () => {
    if (!title || !content) return;

    try {
      await fetch(`${BACKEND_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      setTitle("");
      setContent("");
      fetchNotes();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  // 🔹 AI Semantic Search
  const searchNotes = async () => {
    if (!searchQuery) return;

    try {
      const res = await fetch(`${BACKEND_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Error searching notes:", err);
    }
  };

  // 🔹 Fetch notes on load
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "auto" }}>
      <h1>AI Notes App</h1>

      {/* ADD NOTE */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <textarea
          placeholder="Note content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          style={{ width: "100%", padding: "10px" }}
        />

        <button onClick={saveNote} style={{ marginTop: "10px" }}>
          Save Note
        </button>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search notes (AI semantic search)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <button onClick={searchNotes}>Search</button>
      </div>

      {/* SEARCH RESULTS */}
      {searchResults.length > 0 && (
        <div>
          <h2>Search Results</h2>
          {searchResults.map((note) => (
            <div
              key={note.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h3>{note.title}</h3>
              <p>{note.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* ALL NOTES */}
      <div>
        <h2>All Notes</h2>
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>{note.title}</h3>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
