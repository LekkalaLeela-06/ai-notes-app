import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* Health */
app.get("/", (req, res) => {
  res.send("AI Notes Backend Running!");
});

/* Get all notes */
app.get("/api/notes", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM notes ORDER BY id DESC"
  );
  res.json(result.rows);
});

/* Create note */
app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body;
  const summary = null;

  const result = await pool.query(
    "INSERT INTO notes (title, content, summary) VALUES ($1,$2,$3) RETURNING *",
    [title || "", content, summary]
  );

  res.json(result.rows[0]);
});

/* Update note */
app.put("/api/notes/:id", async (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;

  const result = await pool.query(
    "UPDATE notes SET title=$1, content=$2 WHERE id=$3 RETURNING *",
    [title, content, id]
  );

  res.json(result.rows[0]);
});

/* Delete note */
app.delete("/api/notes/:id", async (req, res) => {
  await pool.query("DELETE FROM notes WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

/* AI Summarize (does NOT remove note) */
app.post("/api/notes/:id/summarize", async (req, res) => {
  const { id } = req.params;

  const noteRes = await pool.query(
    "SELECT content FROM notes WHERE id=$1",
    [id]
  );

  const content = noteRes.rows[0].content;

  const aiRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Summarize clearly" },
      { role: "user", content },
    ],
  });

  const summary = aiRes.choices[0].message.content;

  await pool.query(
    "UPDATE notes SET summary=$1 WHERE id=$2",
    [summary, id]
  );

  res.json({ summary });
});

app.listen(PORT, () =>
  console.log(`Backend running on ${PORT}`)
);
