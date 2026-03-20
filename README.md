# Static Portfolio With Generated Data

This repo is a static portfolio site with a generated data layer and optional AI endpoints:
- Frontend pages render from `data/portfolio.generated.json`
- GitHub repositories can be synced automatically into that file
- LinkedIn profile data is ingested from `data/linkedin-profile.json`
- Project detail pages support Markdown case studies and notebook embeds
- The chatbot and project detail page can call ChatGPT through a local Node server

## 1) Run locally

Preferred local server:
```bash
node server.mjs
```

Open:
```bash
http://localhost:3000
```

The static-only options still work for simple page rendering, but AI endpoints require the Node server.

Use any local server only if you do not need AI features. `fetch()` needs HTTP, not `file://`.

### Option A: Python
```bash
cd portfolio_static
python -m http.server 8000
```

### Option B: VS Code Live Server
Open the repo and run Live Server against the project root.

## 2) Sync portfolio data

Base config lives in:
- `data/portfolio.seed.json`

Optional LinkedIn source lives in:
- `data/linkedin-profile.json`

Generated output lives in:
- `data/portfolio.generated.json`

Run the sync:
```bash
node scripts/sync-portfolio-data.mjs
```

Optional:
- Set `GITHUB_TOKEN` to avoid low anonymous rate limits.
- New public GitHub repos for `REDEVL4` will be discovered automatically.
- Use `projectOverrides` in `data/portfolio.seed.json` for curated fields such as `featured`, `summary`, `caseStudy`, `notebook`, and custom highlights.

## 3) Add case studies
Put Markdown here:
- `content/case-studies/<slug>.md`

Link it in `data/portfolio.seed.json` under the matching project override:
```json
"caseStudy": "content/case-studies/<slug>.md"
```

## 4) Add notebook outputs
Convert a notebook to HTML:
```bash
jupyter nbconvert --to html your_notebook.ipynb
```

Move the output to:
- `content/notebooks/<slug>.html`

Link it in `data/portfolio.seed.json`:
```json
"notebook": "content/notebooks/<slug>.html"
```

## 5) Deploy

### GitHub Pages
- Push the repo
- Configure Pages to publish from the root

### Netlify or Cloudflare Pages
- Build command: none
- Publish directory: `/`

## 6) LinkedIn note

This repo does not scrape LinkedIn in the browser. That is not a production-grade approach because LinkedIn has no supported anonymous public profile API for this use case.

The production-safe pattern here is:
1. Export or maintain your LinkedIn profile data in `data/linkedin-profile.json`.
2. Run the sync script.
3. Deploy the generated static site.

If you later obtain approved LinkedIn API access, extend `scripts/sync-portfolio-data.mjs` to replace the local LinkedIn source.

## 7) ChatGPT integration

Set:
```bash
OPENAI_API_KEY=your_key_here
```

Optional:
```bash
OPENAI_MODEL=gpt-4o-mini
GITHUB_TOKEN=your_github_token_here
```

The Node server provides:
- `POST /api/chat` for the chatbot
- `POST /api/project-insights` for AI-generated project briefs on the detail page

If `OPENAI_API_KEY` is not set, the site falls back to deterministic non-AI summaries.

## 8) Job Farming source

I cannot access your private ChatGPT conversation history directly. To incorporate the "Job Farming" chat into the site, paste or export that chat into:
- `data/job-farming-chat.md`

The AI endpoints will automatically use that file as additional context once it exists.

## Next steps
1. Replace placeholder images with real screenshots or GIFs.
2. Tighten `data/linkedin-profile.json` to match your final resume and LinkedIn.
3. Paste the Job Farming chat into `data/job-farming-chat.md`.
4. Run `node scripts/sync-portfolio-data.mjs` whenever GitHub or LinkedIn source data changes.
