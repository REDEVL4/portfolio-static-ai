# JobFusion

## What it is
A personal full-stack system that puts job search, resume tailoring, and application tracking in one loop. Most tools do one of those. This one does the handoff between them.

## What it does
- Searches roles through Greenhouse and Lever style feeds, plus Tavily and Apify discovery, and an experimental LinkedIn public connector.
- Stores multiple resumes, picks an active one, and tails a resume and cover letter against a job description.
- Tracks applications with notes and status history.
- Switches LLM backends: local Ollama, OpenAI, OpenAI-compatible endpoints, or Azure Foundry style deployments.
- Caches discovery results in Redis so leaving the jobs page does not immediately re-run a provider call.

## Stack
Next.js 16, React 19, TypeScript, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis, Celery, OpenSearch, MinIO, Docker Compose.

## Layout
apps/web is the workspace. apps/api is the backend. A worker, Postgres, Redis, OpenSearch, MinIO, and a LinkedIn helper come up with docker compose.
