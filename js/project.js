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
  const technicalHighlights = (insights.technicalHighlights || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const outcomes = (insights.keyOutcomes || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <div class="ai-meta">Source: ${escapeHtml(insights.source || "unknown")}</div>
    <p class="detail-summary mt-2 mb-3">${escapeHtml(insights.summary || "")}</p>
    <div class="content-card mb-3">
      <div class="content-card-title">Why It Matters</div>
      <p class="mb-0 mt-2 text-secondary">${escapeHtml(insights.whyItMatters || "")}</p>
    </div>
    <div class="row g-3">
      <div class="col-md-6">
        <div class="content-card">
          <div class="content-card-title">Technical Highlights</div>
          <ul class="detail-list mt-2">${technicalHighlights}</ul>
        </div>
      </div>
      <div class="col-md-6">
        <div class="content-card">
          <div class="content-card-title">Key Outcomes</div>
          <ul class="detail-list mt-2">${outcomes}</ul>
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

  target.innerHTML = `<div class="small text-secondary">Loading project snapshot...</div>`;

  try {
    const response = await fetch("/api/project-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });

    if (!response.ok) {
      throw new Error("AI project snapshot failed");
    }

    const data = await response.json();
    target.innerHTML = renderAiInsights(data.insights || {});
  } catch (error) {
    console.error(error);
    target.innerHTML = `<div class="small text-secondary">The live project snapshot is unavailable right now. Start the Node server and set OPENAI_API_KEY if you want the ChatGPT-backed version.</div>`;
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
  if (project.links?.notebook) links.push(button("Notebook Viewer", project.links.notebook));
  if (project.links?.notebookSource) links.push(button("Notebook Source", project.links.notebookSource));
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
    const notebookNote = document.getElementById("notebookNote");
    if (notebookNote && project.links?.notebookSource) {
      notebookNote.innerHTML = `Embedded via nbviewer. <a class="text-decoration-none" href="${escapeHtml(project.links.notebookSource)}" target="_blank" rel="noopener">Open the source notebook on GitHub</a> if you want the original file.`;
    }
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
