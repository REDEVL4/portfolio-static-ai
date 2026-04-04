# Govardhan Reddy Narala Portfolio

This repository contains my portfolio website. I built it to present my work the way I actually want it to be reviewed: through project context, system thinking, measurable outcomes, and direct links to the code and notebooks behind the work.

The site is mostly static, but it is driven by a generated data layer so I do not have to rewrite project content by hand every time I update GitHub or my profile details. It also includes a lightweight Node server for AI-powered project summaries and the portfolio chatbot.

## What is in this project

- A multi-page portfolio site built with HTML, CSS, JavaScript, and Bootstrap
- A generated portfolio data file at `data/portfolio.generated.json`
- A sync script that pulls project metadata from GitHub and merges it with curated overrides
- LinkedIn/profile data managed locally through `data/linkedin-profile.json`
- Project detail pages with case studies, architecture images, and embedded notebooks when available
- A Node server that powers the chatbot and AI project snapshot endpoints

## Project structure

```text
.
|-- index.html
|-- projects.html
|-- project.html
|-- about.html
|-- experience.html
|-- css/
|-- js/
|-- content/
|   |-- case-studies/
|   `-- notebooks/
|-- data/
|   |-- portfolio.seed.json
|   |-- portfolio.generated.json
|   |-- linkedin-profile.json
|   `-- job-farming-chat.md
|-- scripts/
|   `-- sync-portfolio-data.mjs
`-- server.mjs
```

## How the site works

I keep the portfolio content in two layers:

1. `data/portfolio.seed.json`
   This is the curated source where I control summaries, highlights, featured projects, case study links, and presentation details.

2. `data/portfolio.generated.json`
   This file is produced by the sync script. It combines the curated seed data with GitHub repository metadata and my local profile data.

That setup lets me keep the site polished without making it brittle.

## Running locally

Install nothing extra beyond Node unless you want notebook conversion or other local tooling.

Start the site with:

```bash
npm start
```

or:

```bash
node server.mjs
```

Then open:

```text
http://localhost:8000
```

I use the Node server because the site has two API-backed features:

- `POST /api/chat`
- `POST /api/project-insights`

If I only need to inspect static rendering, any local server works, but the AI features require `server.mjs`.

## Syncing GitHub and profile data

To regenerate the portfolio data:

```bash
npm run sync
```

or:

```bash
node scripts/sync-portfolio-data.mjs
```

The sync script does a few things:

- reads `data/portfolio.seed.json`
- reads `data/linkedin-profile.json`
- pulls GitHub repository metadata for my account
- auto-discovers notebooks in supported repos
- writes the final output to `data/portfolio.generated.json`

If GitHub rate limits become a problem, I set:

```bash
GITHUB_TOKEN=your_token_here
```

## Automation

GitHub changes can now be refreshed automatically through:

```text
.github/workflows/refresh-portfolio.yml
```

That workflow:

- runs every 6 hours
- can also be triggered manually from GitHub Actions
- regenerates `data/portfolio.generated.json`
- commits and pushes the updated generated data if anything changed

This means GitHub-side portfolio updates are automated as long as the project metadata can be derived from repository state and the curated overrides already in `data/portfolio.seed.json`.

### Important LinkedIn limitation

I looked into using the official LinkedIn API for the same kind of automatic sync. In practice, that is much more limited than GitHub:

- LinkedIn self-serve API access is constrained and is not intended to be the fundamental basis of an application
- app creation requires a LinkedIn Page association
- the self-serve profile surface is limited
- richer profile fields such as current experience and education are tied to higher access tiers
- full profile sections like About, skills, certifications, and custom narrative content are not a dependable general-purpose sync source for a public portfolio

Because of that, I treat LinkedIn as a curated source rather than a live always-on data feed. The stable pattern for this portfolio is:

1. Use GitHub automation for repository-driven updates.
2. Use LinkedIn export/source updates for profile narrative changes.
3. Regenerate the portfolio data after those profile-source updates.

If I later get approved LinkedIn API access for a supported member-data scenario, I can extend the sync flow. Until then, using local LinkedIn source files is the more reliable and policy-safe path.

## AI integration

The portfolio can use OpenAI for:

- the chatbot
- project-specific AI summaries on the detail page

To enable that locally:

```bash
OPENAI_API_KEY=your_key_here
```

Optional:

```bash
OPENAI_MODEL=gpt-4o-mini
GITHUB_TOKEN=your_token_here
```

If `OPENAI_API_KEY` is not set, the site falls back to deterministic local responses so the pages still work.

## Case studies and notebooks

Each project page can pull from multiple sources:

- GitHub repository metadata
- local Markdown case studies in `content/case-studies/`
- embedded notebooks discovered from GitHub repos
- architecture images under `assets/img/`

For case studies, I add a markdown file and point to it from the project override.

For notebooks, the sync script tries to find `.ipynb` files in the GitHub repo automatically and exposes them through an embeddable notebook viewer link.

## LinkedIn note

I am not scraping LinkedIn from the browser. That is not a stable or production-safe approach.

Instead, I maintain my profile details in:

```text
data/linkedin-profile.json
```

That keeps the site reliable and makes updates predictable.

## Job Farming notes

This project also supports an optional notes file:

```text
data/job-farming-chat.md
```

If that file exists, the AI endpoints use it as additional context when generating answers and project summaries.

## Why I built it this way

I wanted the portfolio to reflect how I actually work. Most portfolio sites look good but become painful to maintain. I wanted something that stays structured, can reuse GitHub and profile data, and still lets me write custom case-study content where depth matters.

The result is a site that is simple to host, easy to refresh, and flexible enough to present research projects, data work, backend engineering work, and notebook-heavy projects in one place.

## Deploying on Render from GitHub

This project deploys cleanly on Render as a Node web service.

### Option 1: Render Blueprint (recommended)

This repo includes `render.yaml`, so Render can auto-configure build/start settings.

1. Push this repository to GitHub.
2. In Render, click New > Blueprint.
3. Connect your GitHub account and select this repository.
4. Render will detect `render.yaml` and create the service.
5. In Render dashboard, add secret environment variables:
   - `OPENAI_API_KEY`
   - `GITHUB_TOKEN` (optional)
6. Deploy.

### Option 2: Manual Web Service setup

If you do not want to use Blueprint:

1. In Render, click New > Web Service.
2. Connect this GitHub repository.
3. Use these settings:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables:
   - `OPENAI_API_KEY` (required for AI responses)
   - `OPENAI_MODEL` (optional, default is `gpt-4o-mini`)
   - `GITHUB_TOKEN` (optional, helps with GitHub API limits)
5. Deploy.

### Render notes

- Render injects `PORT` automatically. `server.mjs` already reads it, so no port changes are needed.
- If `OPENAI_API_KEY` is missing, the chatbot/project insight endpoints fall back to deterministic local responses.
- Run `npm run sync` and commit updated `data/portfolio.generated.json` before each deploy when your project/profile data changes.
