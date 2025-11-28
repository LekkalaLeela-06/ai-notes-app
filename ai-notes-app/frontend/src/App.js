import React, { useState, useEffect } from "react";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  function loadNotes() {
    fetch("/api/notes")
      .then((r) => r.json())
      .then(setNotes);
  }

  async function addNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const j = await res.json();
    setNotes([j, ...notes]);
    setText("");
  }

  async function searchNotes() {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const j = await res.json();
    setNotes(j);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Notes App</h1>

      <textarea
        rows="5"
        cols="80"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note here..."
      />
      <br />
      <button onClick={addNote}>Save Note + AI Summary</button>

      <hr />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search semantically..."
      />
      <button onClick={searchNotes}>Search</button>

      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            <b>{n.title}</b>
            <p>{n.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
