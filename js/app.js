import { escapeHtml, formatMonthYear, loadPortfolioData } from "./data-service.js";

function badge(text) {
  return `<span class="pill">${escapeHtml(text)}</span>`;
}

function projectSlide(project, active) {
  const img = project.images?.[0] || "assets/img/placeholder-1.svg";
  const tags = (project.tags || []).slice(0, 3).map(badge).join("");
  const updated = project.github?.updatedAt
    ? `<div class="eyebrow mt-3">Updated ${formatMonthYear(project.github.updatedAt)}</div>`
    : "";

  return `
    <div class="carousel-item ${active ? "active" : ""}">
      <img src="${img}" class="featured-image" alt="${escapeHtml(project.title)} preview">
      <div class="mt-4">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div class="section-kicker">${escapeHtml(project.type || "Project")}</div>
            <div class="featured-title">${escapeHtml(project.title)}</div>
          </div>
          <a class="btn btn-sm btn-outline-light hero-action" href="project.html?slug=${encodeURIComponent(project.slug)}">Open</a>
        </div>
        <p class="featured-copy">${escapeHtml(project.summary || "")}</p>
        <div class="d-flex flex-wrap gap-2">${tags}</div>
        ${updated}
      </div>
    </div>
  `;
}

function statCard(label, value) {
  return `
    <div class="col-12 col-md-4">
      <div class="metric-card">
        <div class="metric-label">${escapeHtml(label)}</div>
        <div class="metric-value">${escapeHtml(value)}</div>
      </div>
    </div>
  `;
}

async function renderHome() {
  const data = await loadPortfolioData();
  const featured = data.projects.filter((project) => project.featured).slice(0, 5);
  const profile = data.profile || {};
  const site = data.site || {};

  document.title = `${site.name} | Portfolio`;

  const headline = document.getElementById("heroHeadline");
  const intro = document.getElementById("heroIntro");
  const summary = document.getElementById("heroSummary");
  const skills = document.getElementById("heroSkills");
  const metrics = document.getElementById("heroMetrics");
  const slides = document.getElementById("featuredSlides");
  const focus = document.getElementById("focusAreas");

  if (headline) {
    headline.textContent = profile.headline || site.headline || "";
  }

  if (intro) {
    intro.textContent = site.heroIntro || "";
  }

  if (summary) {
    summary.innerHTML = (profile.about || site.heroSummary || [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
  }

  if (skills) {
    skills.innerHTML = (site.skills || []).map(badge).join("");
  }

  if (focus) {
    focus.innerHTML = (site.focusAreas || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  if (metrics) {
    metrics.innerHTML = [
      statCard("Projects", String(data.meta?.projectCount || 0)),
      statCard("Featured", String(data.meta?.featuredCount || 0)),
      statCard("Location", site.location || "Available remotely")
    ].join("");
  }

  if (slides) {
    slides.innerHTML = featured.map((project, index) => projectSlide(project, index === 0)).join("");
  }

  const githubLink = document.getElementById("githubLink");
  const linkedinLink = document.getElementById("linkedinLink");
  const emailLink = document.getElementById("emailLink");
  const resumeLink = document.getElementById("resumeLink");

  if (githubLink) {
    githubLink.href = site.githubUrl || "#";
  }

  if (linkedinLink) {
    linkedinLink.href = site.linkedinUrl || "#";
  }

  if (emailLink) {
    emailLink.href = `mailto:${site.email || ""}`;
  }

  if (resumeLink) {
    resumeLink.href = site.resumeUrl || "#";
  }
}

renderHome().catch((error) => {
  console.error(error);
  const fallback = document.getElementById("featuredSlides");
  if (fallback) {
    fallback.innerHTML = `<div class="text-white-50">Portfolio data failed to load. Regenerate data or refresh the page.</div>`;
  }
});
