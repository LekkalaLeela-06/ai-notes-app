import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

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

/* ------------------ HEALTH CHECK ------------------ */
app.get("/", (req, res) => {
  res.send("AI Notes Backend Running!");
});

/* ------------------ SETUP (RUN ONCE) ------------------ */
app.get("/setup", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    res.send("Database setup completed");
  } catch (err) {
    console.error("SETUP ERROR:", err);
    res.status(500).send("Setup failed");
  }
});

/* ------------------ SAVE NOTE ------------------ */
app.post("/api/notes", async (req, res) => {
  try {
    console.log("SAVE NOTE BODY:", req.body);

    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const summary = content.slice(0, 120) + "...";

    const result = await pool.query(
      "INSERT INTO notes (title, content, summary) VALUES ($1, $2, $3) RETURNING *",
      [title || "", content, summary]
    );

    console.log("SAVED NOTE:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

/* ------------------ GET ALL NOTES ------------------ */
app.get("/api/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

/* ------------------ SIMPLE SEARCH ------------------ */
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;

    const result = await pool.query(
      `
      SELECT id, title, summary
      FROM notes
      WHERE title ILIKE $1 OR content ILIKE $1
      ORDER BY id DESC
      `,
      [`%${q}%`]
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
