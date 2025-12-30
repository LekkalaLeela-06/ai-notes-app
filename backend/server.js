import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 10000;

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- DATABASE ---------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ---------- OPENAI ---------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------- HEALTH ---------- */
app.get("/", (req, res) => {
  res.send("AI Notes Backend Running!");
});

/* ---------- SETUP ---------- */
app.get("/setup", async (req, res) => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS vector;

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        summary TEXT,
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    res.send("Database ready");
  } catch (err) {
    console.error(err);
    res.status(500).send("Setup failed");
  }
});

/* ---------- CREATE NOTE ---------- */
app.post("/api/notes", async (req, res) => {
  try {
    const { title = "", content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    /* Embedding */
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });

    const embedding = embeddingRes.data[0].embedding;
    const summary = content.slice(0, 120) + "...";

    const result = await pool.query(
      `INSERT INTO notes (title, content, summary, embedding)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, content, summary, embedding]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

/* ---------- GET ALL NOTES ---------- */
app.get("/api/notes", async (req, res) => {
  const result = await pool.query(
    "SELECT id, title, summary FROM notes ORDER BY id DESC"
  );
  res.json(result.rows);
});

/* ---------- SEMANTIC SEARCH ---------- */
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const embedRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: q,
    });

    const queryEmbedding = embedRes.data[0].embedding;

    const result = await pool.query(
      `
      SELECT id, title, summary
      FROM notes
      ORDER BY embedding <-> $1
      LIMIT 5
      `,
      [queryEmbedding]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: "Search failed" });
  }
});
app.get("/setup", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        summary TEXT,
        embedding vector(1536),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    res.send("Database setup completed");
  } catch (err) {
    console.error("SETUP ERROR:", err);
    res.status(500).send("Setup failed");
  }
});

/* ---------- START ---------- */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
