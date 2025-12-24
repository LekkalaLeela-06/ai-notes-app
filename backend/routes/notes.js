import express from "express";
import pool from "../db.js";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET all notes
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, content FROM notes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("FETCH NOTES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// SAVE a note
router.post("/", async (req, res) => {
  try {
    console.log("SAVE NOTE BODY:", req.body);

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" });
    }

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,
    });

    const embedding = embeddingResponse.data[0].embedding;
    console.log("EMBEDDING GENERATED");

    await pool.query(
      `INSERT INTO notes (title, content, embedding)
       VALUES ($1, $2, $3)`,
      [title, content, embedding]
    );

    console.log("NOTE INSERTED INTO DATABASE");
    res.json({ message: "Note saved successfully" });
  } catch (error) {
    console.error("SAVE NOTE ERROR:", error);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// SEMANTIC SEARCH
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    const queryEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const embedding = queryEmbeddingResponse.data[0].embedding;

    const result = await pool.query(
      `
      SELECT id, title, content
      FROM notes
      ORDER BY embedding <-> $1
      LIMIT 5
      `,
      [embedding]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
