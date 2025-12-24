import express from "express";
import pool from "../db.js";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* GET all notes */
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT id, title, content FROM notes ORDER BY id DESC"
  );
  res.json(result.rows);
});

/* SAVE note */
router.post("/", async (req, res) => {
  const { title, content } = req.body;

  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });

  const embedding = embeddingResponse.data[0].embedding;

  await pool.query(
    `INSERT INTO notes (title, content, embedding)
     VALUES ($1, $2, $3)`,
    [title, content, embedding]
  );

  res.json({ message: "Note saved" });
});

/* SEARCH notes */
router.post("/search", async (req, res) => {
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
});

export default router;
