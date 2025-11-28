require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// === AI FUNCTIONS ===
async function generateSummary(text) {
  const resp = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful summarizer." },
        { role: "user", content: `Summarize this:\n\n${text}` },
      ],
    },
    { headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
  );

  return resp.data.choices[0].message.content.trim();
}

async function generateEmbedding(text) {
  const resp = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      model: "text-embedding-3-small",
      input: text,
    },
    { headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
  );

  return resp.data.data[0].embedding;
}

// === ROUTES ===

// health
app.get("/", (req, res) => res.send("AI Notes Backend Running!"));

// get all notes
app.get("/notes", async (req, res) => {
  const result = await pool.query(
    "SELECT id, title, summary FROM notes ORDER BY id DESC"
  );
  res.json(result.rows);
});

// create a note
app.post("/notes", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });

  try {
    const summary = await generateSummary(text);
    const title = summary.substring(0, 50);
    const embedding = await generateEmbedding(text);

    const sql =
      "INSERT INTO notes(title, content, summary, embedding) VALUES($1,$2,$3,$4) RETURNING id, title, summary";
    const r = await pool.query(sql, [title, text, summary, embedding]);

    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "AI or DB error" });
  }
});

// semantic search
app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "q required" });

  try {
    const emb = await generateEmbedding(q);

    const sql = `
      SELECT id, title, summary, embedding <-> $1 AS distance
      FROM notes
      ORDER BY embedding <-> $1
      LIMIT 10;
    `;

    const result = await pool.query(sql, [emb]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "Search error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend running on port", PORT));
