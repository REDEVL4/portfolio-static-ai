import { escapeHtml, formatMonthYear, loadPortfolioData } from "./data-service.js";

function queryParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

function badge(text) {
  return `<span class="pill">${escapeHtml(text)}</span>`;
}

function button(label, href, emphasis = false) {
  const className = emphasis ? "btn btn-sm btn-light" : "btn btn-sm btn-outline-light";
  return `<a class="${className}" href="${href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
}

async function loadText(filePath) {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Unable to load ${filePath}`);
  }
  return response.text();
}

function renderGallery(images = [], title = "") {
  return images
    .map((src) => `<img class="gallery-image" src="${src}" alt="${escapeHtml(title)} preview">`)
    .join("");
}

function renderAiInsights(insights) {
  const differentiators = (insights.differentiators || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const talkingPoints = (insights.interviewTalkingPoints || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const bullets = (insights.suggestedResumeBullets || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <div class="ai-meta">Source: ${escapeHtml(insights.source || "unknown")}</div>
    <p class="detail-summary mt-2 mb-3">${escapeHtml(insights.summary || "")}</p>
    <div class="content-card mb-3">
      <div class="content-card-title">Recruiter Pitch</div>
      <p class="mb-0 mt-2 text-secondary">${escapeHtml(insights.recruiterPitch || "")}</p>
    </div>
    <div class="row g-3">
      <div class="col-md-4">
        <div class="content-card">
          <div class="content-card-title">Differentiators</div>
          <ul class="detail-list mt-2">${differentiators}</ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="content-card">
          <div class="content-card-title">Interview Talking Points</div>
          <ul class="detail-list mt-2">${talkingPoints}</ul>
        </div>
      </div>
      <div class="col-md-4">
        <div class="content-card">
          <div class="content-card-title">Resume Bullets</div>
          <ul class="detail-list mt-2">${bullets}</ul>
        </div>
      </div>
    </div>
    ${insights.note ? `<div class="small text-secondary mt-3">${escapeHtml(insights.note)}</div>` : ""}
  `;
}

async function loadAiInsights(slug) {
  const target = document.getElementById("aiInsights");
  if (!target) {
    return;
  }

  target.innerHTML = `<div class="small text-secondary">Loading AI brief...</div>`;

  try {
    const response = await fetch("/api/project-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });

    if (!response.ok) {
      throw new Error("AI project brief failed");
    }

    const data = await response.json();
    target.innerHTML = renderAiInsights(data.insights || {});
  } catch (error) {
    console.error(error);
    target.innerHTML = `<div class="small text-secondary">AI project brief is unavailable. Start the Node server and set OPENAI_API_KEY for ChatGPT-backed enrichment.</div>`;
  }
}

async function init() {
  const data = await loadPortfolioData();
  const slug = queryParam("slug");
  const project = data.projects.find((item) => item.slug === slug) || data.projects[0];

  document.title = `${project.title} | ${data.site.name}`;

  document.getElementById("pTitle").textContent = project.title;
  document.getElementById("pSummary").textContent = project.summary || "";
  document.getElementById("pBadges").innerHTML = (project.tags || []).map(badge).join("");
  document.getElementById("pStack").innerHTML = (project.stack || []).map(badge).join("");
  document.getElementById("pHighlights").innerHTML = (project.highlights || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  document.getElementById("gallery").innerHTML = renderGallery(project.images, project.title);

  const repoFacts = [];
  if (project.github?.language) {
    repoFacts.push({ label: "Primary language", value: project.github.language });
  }
  if (project.github?.updatedAt) {
    repoFacts.push({ label: "Last updated", value: formatMonthYear(project.github.updatedAt) });
  }
  if (project.github?.stars !== null && project.github?.stars !== undefined) {
    repoFacts.push({ label: "Stars", value: String(project.github.stars) });
  }
  if (project.github?.forks !== null && project.github?.forks !== undefined) {
    repoFacts.push({ label: "Forks", value: String(project.github.forks) });
  }

  document.getElementById("pFacts").innerHTML = repoFacts
    .map((fact) => `<div class="col-md-6"><div class="fact-card"><div class="fact-label">${escapeHtml(fact.label)}</div><div class="fact-value">${escapeHtml(fact.value)}</div></div></div>`)
    .join("");

  const links = [];
  if (project.links?.github) links.push(button("GitHub", project.links.github, true));
  if (project.links?.demo) links.push(button("Demo", project.links.demo));
  if (project.links?.paper) links.push(button("Paper", project.links.paper));
  if (project.links?.notebook) links.push(button("Notebook", project.links.notebook));
  document.getElementById("pLinks").innerHTML = links.join("");

  const related = data.projects
    .filter((item) => item.slug !== project.slug)
    .filter((item) => item.tags?.some((tag) => project.tags?.includes(tag)))
    .slice(0, 3);

  document.getElementById("relatedProjects").innerHTML = related
    .map(
      (item) => `
        <a class="related-card" href="project.html?slug=${encodeURIComponent(item.slug)}">
          <div class="section-kicker">${escapeHtml(item.type || "Project")}</div>
          <div class="related-title">${escapeHtml(item.title)}</div>
          <div class="related-copy">${escapeHtml(item.summary || "")}</div>
        </a>
      `
    )
    .join("");

  if (project.links?.caseStudy) {
    const markdown = await loadText(project.links.caseStudy);
    document.getElementById("caseStudyWrap").style.display = "block";
    document.getElementById("caseStudy").innerHTML = marked.parse(markdown);
  }

  if (project.links?.notebook) {
    document.getElementById("notebookWrap").style.display = "block";
    document.getElementById("notebookFrame").src = project.links.notebook;
  }

  document.getElementById("refreshAiInsights")?.addEventListener("click", () => {
    loadAiInsights(project.slug);
  });

  await loadAiInsights(project.slug);
}

init().catch((error) => {
  console.error(error);
  document.getElementById("pTitle").textContent = "Project unavailable";
  document.getElementById("pSummary").textContent = "The project data could not be loaded.";
});
