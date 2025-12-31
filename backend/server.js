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
app.use(cors());
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

/* ------------------ INIT DATABASE ------------------ */
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`SET search_path TO public`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.notes (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT NOT NULL,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Database & notes table ready");
  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

/* ------------------ HEALTH ------------------ */
app.get("/", (req, res) => {
  res.send("AI Notes Backend Running!");
});

/* ------------------ GET ALL NOTES ------------------ */
app.get("/api/notes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, content, summary, created_at
      FROM public.notes
      ORDER BY id DESC
    `);
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

    const summary = content.slice(0, 120) + "...";

    const result = await pool.query(
      `
      INSERT INTO public.notes (title, content, summary)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [title, content, summary]
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
      `
      UPDATE public.notes
      SET title = $1, content = $2
      WHERE id = $3
      RETURNING *
      `,
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
    await pool.query(
      "DELETE FROM public.notes WHERE id = $1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE NOTE ERROR:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

/* ------------------ AI SUMMARY (ON DEMAND) ------------------ */
app.post("/api/notes/:id/summarize", async (req, res) => {
  try {
    const { id } = req.params;

    const noteRes = await pool.query(
      "SELECT content FROM public.notes WHERE id = $1",
      [id]
    );

    if (!noteRes.rows.length) {
      return res.status(404).json({ error: "Note not found" });
    }

    const content = noteRes.rows[0].content;

    // 🔹 OpenAI summary (safe + simple)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize the note briefly." },
        { role: "user", content },
      ],
    });

    const summary = completion.choices[0].message.content;

    await pool.query(
      "UPDATE public.notes SET summary = $1 WHERE id = $2",
      [summary, id]
    );

    res.json({ summary });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Failed to summarize note" });
  }
});

/* ------------------ START SERVER ------------------ */
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });
});
