import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const generatedDataPath = path.join(dataDir, "portfolio.generated.json");
const linkedinPath = path.join(dataDir, "linkedin-profile.json");
const jobFarmingPath = path.join(dataDir, "job-farming-chat.md");
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-server"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function readJson(filePath, fallback = null) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (fallback !== null) {
      return fallback;
    }
    throw error;
  }
}

async function readText(filePath, fallback = "") {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return fallback;
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function loadPortfolioContext() {
  const [portfolio, linkedin, jobFarmingChat] = await Promise.all([
    readJson(generatedDataPath),
    readJson(linkedinPath, {}),
    readText(jobFarmingPath, "")
  ]);

  return { portfolio, linkedin, jobFarmingChat };
}

function extractProjectSlug(pageUrl) {
  if (!pageUrl) {
    return null;
  }
  try {
    const url = new URL(pageUrl, `http://localhost:${port}`);
    return url.searchParams.get("slug");
  } catch {
    return null;
  }
}

async function fetchGithubReadme(owner, repo) {
  if (!owner || !repo) {
    return "";
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: {
      ...githubHeaders(),
      Accept: "application/vnd.github.raw+json"
    }
  });

  if (!response.ok) {
    return "";
  }

  return response.text();
}

async function callOpenAIJson({ systemPrompt, userPrompt }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("OpenAI API error detail:", detail);
    throw new Error(`OpenAI request failed (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned no content");
  }
  // console.log("OpenAI response content:", content);
  return JSON.parse(content);
}

function fallbackInsights(project) {
  return {
    source: "fallback",
    summary: project.summary || "Project summary unavailable.",
    whyItMatters: `${project.title} shows how I approach ${project.type?.toLowerCase() || "engineering"} work with measurable structure, technical depth, and clear outcomes.`,
    technicalHighlights: project.highlights || [],
    keyOutcomes: (project.highlights || []).map((item) => `${project.title}: ${item}`),
    note: process.env.OPENAI_API_KEY
      ? "AI insight generation failed, so a deterministic fallback summary is shown."
      : "OPENAI_API_KEY is not set, so a deterministic fallback summary is shown."
  };
}

async function buildProjectInsights(project, context) {
  const githubReadme = await fetchGithubReadme(project.github?.owner, project.github?.repo);
  const caseStudy = project.links?.caseStudy
    ? await readText(path.join(rootDir, project.links.caseStudy), "")
    : "";

  const systemPrompt = [
    "You generate concise but high-signal portfolio project briefs.",
    "Return valid JSON with keys: summary, whyItMatters, technicalHighlights, keyOutcomes.",
    "technicalHighlights and keyOutcomes should contain 3 to 5 short strings.",
    "Do not invent metrics that are not supported by context."
  ].join(" ");

  const userPrompt = JSON.stringify({
    siteProfile: context.portfolio.profile,
    linkedinProfile: context.linkedin,
    jobFarmingChat: context.jobFarmingChat || null,
    project
  })
    + "\n\nGitHub README:\n"
    + githubReadme
    + "\n\nCase study markdown:\n"
    + caseStudy;

  try {
    const ai = await callOpenAIJson({ systemPrompt, userPrompt });
    return { source: "openai", ...ai };
  } catch {
    return fallbackInsights(project);
  }
}

function localChatAnswer(message, portfolio, project) {
  const normalized = message.toLowerCase();

  if (project) {
    return `${project.title}: ${project.summary} ${(project.highlights || []).slice(0, 2).join(" ")}`.trim();
  }

  if (normalized.includes("experience")) {
    return `Recent experience includes ${(portfolio.profile?.experience || []).slice(0, 3).map((item) => `${item.role} at ${item.company}`).join(", ")}.`;
  }

  if (normalized.includes("skill") || normalized.includes("stack")) {
    return `Core stack: ${(portfolio.site?.skills || []).slice(0, 8).join(", ")}.`;
  }

  const matchedProject = (portfolio.projects || []).find((item) => {
    const haystack = [item.title, item.summary, ...(item.tags || []), ...(item.stack || [])].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });

  if (matchedProject) {
    return `${matchedProject.title}: ${matchedProject.summary}`;
  }

  return "Ask about a specific project, your experience, or your technical stack.";
}

async function buildChatReply(message, context, project) {
  const systemPrompt = [
    "You are the portfolio assistant for Govardhan Reddy Narala.",
    "Answer in first person when describing work.",
    "Ground answers in the provided portfolio, GitHub, LinkedIn profile data, and optional Job Farming notes.",
    "Keep answers concise and recruiter-friendly.",
    "Return valid JSON with one key: reply."
  ].join(" ");

  const userPrompt = JSON.stringify({
    message,
    project,
    profile: context.portfolio.profile,
    site: context.portfolio.site,
    projects: context.portfolio.projects.map((item) => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      highlights: item.highlights,
      tags: item.tags,
      stack: item.stack
    })),
    linkedinProfile: context.linkedin,
    jobFarmingChat: context.jobFarmingChat || null
  });

  try {
    const ai = await callOpenAIJson({ systemPrompt, userPrompt });
    return ai.reply || localChatAnswer(message, context.portfolio, project);
  } catch {
    return localChatAnswer(message, context.portfolio, project);
  }
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/project-insights" && req.method === "POST") {
    const body = await readBody(req);
    const context = await loadPortfolioContext();
    const project = context.portfolio.projects.find((item) => item.slug === body.slug);

    if (!project) {
      sendJson(res, 404, { error: "Project not found" });
      return;
    }

    const insights = await buildProjectInsights(project, context);
    sendJson(res, 200, { project: project.slug, insights });
    return;
  }

  if (pathname === "/api/chat" && req.method === "POST") {
    const body = await readBody(req);
    const context = await loadPortfolioContext();
    const slug = body.slug || extractProjectSlug(body.pageUrl);
    const project = context.portfolio.projects.find((item) => item.slug === slug) || null;
    const reply = await buildChatReply(body.message || "", context, project);
    sendJson(res, 200, { reply });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

function resolveStaticPath(pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(rootDir, requested));
  if (!filePath.startsWith(rootDir)) {
    return null;
  }
  return filePath;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
      return;
    }

    const filePath = resolveStaticPath(url.pathname);
    if (!filePath || !existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}).listen(port, () => {
  console.log(`Portfolio server running at http://localhost:${port}`);
  console.log("process.env.OPENAI_API_KEY is", process.env.OPENAI_API_KEY ? "set" : "not set");
});
