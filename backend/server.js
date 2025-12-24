import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 10000;

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ------------------ DATABASE ------------------ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ------------------ OPENAI ------------------ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ------------------ HEALTH CHECK ------------------ */
app.get("/", (req, res) => {
  res.send("AI Notes Backend Running!");
});

/* ------------------ SETUP (RUN ONCE) ------------------ */
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
    res.send("Database setup completed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Setup failed");
  }
});

/* ------------------ SAVE NOTE ------------------ */
app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" });
    }

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Simple summary (can be AI later)
    const summary = content.slice(0, 120) + "...";

    await pool.query(
      `
      INSERT INTO notes (title, content, summary, embedding)
      VALUES ($1, $2, $3, $4)
      `,
      [title, content, summary, embedding]
    );

    res.status(201).json({ message: "Note saved successfully" });
  } catch (err) {
    console.error("SAVE NOTE ERROR:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

/* ------------------ GET ALL NOTES ------------------ */
app.get("/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, content, summary FROM notes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("FETCH NOTES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

/* ------------------ SEMANTIC SEARCH ------------------ */
app.post("/notes/search", async (req, res) => {
  try {
    const { query } = req.body;

    const queryEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const embedding = queryEmbeddingResponse.data[0].embedding;

    const result = await pool.query(
      `
      SELECT id, title, summary
      FROM notes
      ORDER BY embedding <-> $1
      LIMIT 5
      `,
      [embedding]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ------------------ START SERVER ------------------ */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
