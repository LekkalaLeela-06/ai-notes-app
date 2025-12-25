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
  ssl: { rejectUnauthorized: false },
});

/* ------------------ HEALTH CHECK ------------------ */
app.get("/", (req, res) => {
  res.send("AI Notes Backend Running!");
});

/* ------------------ GET ALL NOTES ------------------ */
app.get("/api/notes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("FETCH NOTES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

/* ------------------ CREATE NOTE ------------------ */
app.post("/api/notes", async (req, res) => {
  try {
    const { title = "", content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const result = await pool.query(
      `INSERT INTO notes (title, content)
       VALUES ($1, $2)
       RETURNING *`,
      [title, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE NOTE ERROR:", err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

/* ------------------ UPDATE NOTE ------------------ */
app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title = "", content } = req.body;

    const result = await pool.query(
      `UPDATE notes
       SET title = $1, content = $2
       WHERE id = $3
       RETURNING *`,
      [title, content, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE NOTE ERROR:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

/* ------------------ DELETE NOTE ------------------ */
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM notes WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE NOTE ERROR:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

/* ------------------ SUMMARIZE NOTE (POST ONLY) ------------------ */
app.post("/api/notes/:id/summarize", async (req, res) => {
  try {
    const { id } = req.params;

    const noteRes = await pool.query(
      "SELECT content FROM notes WHERE id = $1",
      [id]
    );

    if (!noteRes.rows.length) {
      return res.status(404).json({ error: "Note not found" });
    }

    const content = noteRes.rows[0].content;

    // ✅ SAFE summary (no OpenAI, no crash)
    const summary = content.slice(0, 120) + "...";

    await pool.query(
      "UPDATE notes SET summary = $1 WHERE id = $2",
      [summary, id]
    );

    res.json({ summary });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Failed to summarize note" });
  }
});

/* ------------------ START SERVER ------------------ */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
