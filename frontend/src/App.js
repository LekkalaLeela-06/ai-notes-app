import { useEffect, useState } from "react";
import "./App.css";

const API = "https://ai-notes-app-5cid.onrender.com/api";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const loadNotes = async () => {
    const res = await fetch(`${API}/notes`);
    setNotes(await res.json());
  };

  useEffect(() => { loadNotes(); }, []);

  const saveNote = async () => {
    await fetch(`${API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setTitle(""); setContent("");
    loadNotes();
  };

  const summarize = async (id) => {
    await fetch(`${API}/notes/${id}/summarize`, { method: "POST" });
    loadNotes();
  };

  const remove = async (id) => {
    await fetch(`${API}/notes/${id}`, { method: "DELETE" });
    loadNotes();
  };

  return (
    <div className="app">
      <h1>AI Notes</h1>

      <div className="new-note">
        <input placeholder="Title" value={title}
          onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Write note..."
          value={content}
          onChange={e => setContent(e.target.value)} />
        <button onClick={saveNote}>Save</button>
      </div>

      <div className="notes">
        {notes.map(n => (
          <div className="card" key={n.id}>
            <h3>{n.title}</h3>
            <p>{n.content}</p>

            {n.summary && (
              <div className="summary">
                <strong>Summary</strong>
                <p>{n.summary}</p>
              </div>
            )}

            <div className="actions">
              <button onClick={() => summarize(n.id)}>🧠</button>
              <button onClick={() => remove(n.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
