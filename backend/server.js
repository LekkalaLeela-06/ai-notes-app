import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 10000;

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors());
app.use(express.json());

/* ------------------ DATABASE ------------------ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ------------------ HEALTH CHECK ------------------ */
app.get("/", (req, res) => {
  res.send("AI Notes Backend Running!");
});

/* ------------------ CREATE TABLE (RUN ONCE) ------------------ */
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
app.post("/api/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    // (For now) simple summary
    const summary = content.slice(0, 100) + "...";

    await pool.query(
      "INSERT INTO notes (title, content, summary) VALUES ($1, $2, $3)",
      [title, content, summary]
    );

    res.status(201).json({ message: "Note saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

/* ------------------ GET ALL NOTES ------------------ */
app.get("/api/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, content, summary FROM notes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

/* ------------------ SEARCH NOTES ------------------ */
app.get("/api/search", async (req, res) => {
  const { q } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT id, title, summary
      FROM notes
      WHERE title ILIKE $1 OR content ILIKE $1
      `,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ------------------ START SERVER ------------------ */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
