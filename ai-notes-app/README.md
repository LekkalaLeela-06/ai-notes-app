# AI Notes App (Full Stack + Docker + Render + AI Embeddings)

A full-stack AI-powered Notes application:
- React frontend
- Node + Express backend
- PostgreSQL + pgvector semantic search
- Docker + Render deployment
- AI summary + embedding using OpenAI API

## Run Locally

export OPENAI_API_KEY=your_key
docker compose up --build

Frontend: http://localhost:3000
Backend: http://localhost:10000

## Database Setup

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE notes(
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  summary TEXT,
  embedding vector(1536)
);

## Deploy on Render
- Create Render Postgres → copy DATABASE_URL
- Create backend (web service) → set env vars
- Create frontend (static site)
