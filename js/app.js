import { escapeHtml, formatMonthYear, loadPortfolioData } from "./data-service.js";

function badge(text) {
  return `<span class="pill">${escapeHtml(text)}</span>`;
}

function metricCard(label, value) {
  return `
    <div class="col-12 col-md-6 col-xl-3">
      <div class="metric-card" data-tilt>
        <div class="metric-label">${escapeHtml(label)}</div>
        <div class="metric-value">${escapeHtml(value)}</div>
      </div>
    </div>
  `;
}

function proofCard(text) {
  return `
    <div class="proof-card">
      <span class="proof-dot"></span>
      <span>${escapeHtml(text)}</span>
    </div>
  `;
}

function valueCard(item) {
  return `
    <div class="col-md-6">
      <div class="surface-panel surface-panel--compact h-100" data-tilt>
        <div class="section-kicker">Core Strength</div>
        <h3 class="surface-title">${escapeHtml(item.title)}</h3>
        <p class="mb-0 text-secondary">${escapeHtml(item.copy)}</p>
      </div>
    </div>
  `;
}

function featuredGridCard(project) {
  const image = project.images?.[0] || "assets/img/placeholder-1.svg";
  const tags = (project.tags || []).slice(0, 3).map((tag) => `<span class="pill small">${escapeHtml(tag)}</span>`).join("");
  const updated = project.github?.updatedAt ? `Updated ${formatMonthYear(project.github.updatedAt)}` : project.type || "Project";

  return `
    <article class="col-md-6 col-xl-4">
      <div class="project-card h-100" data-tilt>
        <img src="${image}" class="project-thumb" alt="${escapeHtml(project.title)} preview">
        <div class="project-body">
          <div class="project-meta project-meta--single">${escapeHtml(updated)}</div>
          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-summary">${escapeHtml(project.summary || "")}</p>
          <div class="d-flex flex-wrap gap-2">${tags}</div>
        </div>
        <div class="project-actions">
          <a class="btn btn-sm btn-dark" href="project.html?slug=${encodeURIComponent(project.slug)}">View Details</a>
          ${project.links?.github ? `<a class="btn btn-sm btn-outline-dark" href="${project.links.github}" target="_blank" rel="noopener">GitHub</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

function spotlightButton(project, index, isActive) {
  const label = project.type || "Project";

  return `
    <button
      class="spotlight-nav-btn ${isActive ? "is-active" : ""}"
      type="button"
      data-spotlight-index="${index}"
      aria-pressed="${isActive ? "true" : "false"}"
    >
      <span class="spotlight-nav-meta">${escapeHtml(label)}</span>
      <span class="spotlight-nav-title">${escapeHtml(project.title)}</span>
    </button>
  `;
}

function renderSpotlight(featured, index) {
  const project = featured[index];
  if (!project) {
    return;
  }

  const visual = document.getElementById("spotlightVisual");
  const meta = document.getElementById("spotlightMeta");
  const title = document.getElementById("spotlightTitle");
  const summary = document.getElementById("spotlightSummary");
  const tags = document.getElementById("spotlightTags");
  const primary = document.getElementById("spotlightPrimary");
  const secondary = document.getElementById("spotlightSecondary");
  const nav = document.getElementById("spotlightNav");

  if (visual) {
    const image = project.images?.[0] || "assets/img/placeholder-1.svg";
    visual.innerHTML = `
      <img src="${image}" class="spotlight-image" alt="${escapeHtml(project.title)} preview">
      <div class="spotlight-visual-overlay">
        <span class="spotlight-overlay-label">${escapeHtml(project.type || "Project")}</span>
        <span class="spotlight-overlay-title">${escapeHtml(project.title)}</span>
      </div>
    `;
  }

  if (meta) {
    const bits = [project.type, project.github?.updatedAt ? `Updated ${formatMonthYear(project.github.updatedAt)}` : "", project.github?.language]
      .filter(Boolean)
      .join(" • ");
    meta.textContent = bits;
  }

  if (title) {
    title.textContent = project.title;
  }

  if (summary) {
    summary.textContent = project.summary || "";
  }

  if (tags) {
    tags.innerHTML = (project.tags || []).slice(0, 4).map(badge).join("");
  }

  if (primary) {
    primary.href = `project.html?slug=${encodeURIComponent(project.slug)}`;
  }

  if (secondary) {
    const githubUrl = project.links?.github || project.github?.url || "#";
    secondary.href = githubUrl;
    secondary.style.display = githubUrl === "#" ? "none" : "";
  }

  if (nav) {
    nav.innerHTML = featured.map((item, itemIndex) => spotlightButton(item, itemIndex, itemIndex === index)).join("");
    nav.querySelectorAll("[data-spotlight-index]").forEach((button) => {
      button.addEventListener("click", () => {
        renderSpotlight(featured, Number(button.dataset.spotlightIndex || 0));
      });
    });
  }
}

async function renderHome() {
  const data = await loadPortfolioData();
  const featured = (data.projects || []).filter((project) => project.featured);
  const profile = data.profile || {};
  const site = data.site || {};

  document.title = `${site.name} | Portfolio`;

  const heroTitle = document.getElementById("heroTitle");
  const intro = document.getElementById("heroIntro");
  const headline = document.getElementById("heroHeadline");
  const summary = document.getElementById("heroSummary");
  const skills = document.getElementById("heroSkills");
  const metrics = document.getElementById("heroMetrics");
  const proof = document.getElementById("heroProof");
  const focus = document.getElementById("focusAreas");
  const valueCards = document.getElementById("homeValueCards");
  const featuredGrid = document.getElementById("homeFeaturedGrid");
  const githubLink = document.getElementById("githubLink");
  const linkedinLink = document.getElementById("linkedinLink");
  const emailLink = document.getElementById("emailLink");
  const resumeLink = document.getElementById("resumeLink");
  const resumePanelLink = document.getElementById("resumePanelLink");
  const contactMeta = document.getElementById("contactMeta");

  if (heroTitle) {
    heroTitle.textContent = site.heroTitle || "Software Engineer";
  }

  if (intro) {
    intro.textContent = site.heroIntro || "";
  }

  if (headline) {
    headline.textContent = site.headline || profile.headline || "";
  }

  if (summary) {
    summary.innerHTML = (site.heroSummary || profile.about || [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
  }

  if (skills) {
    skills.innerHTML = (site.skills || []).map(badge).join("");
  }

  if (proof) {
    proof.innerHTML = (site.heroProofPoints || []).map(proofCard).join("");
  }

  if (metrics) {
    metrics.innerHTML = (site.heroMetrics || []).map((item) => metricCard(item.label, item.value)).join("");
  }

  if (focus) {
    focus.innerHTML = (site.focusAreas || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  if (valueCards) {
    valueCards.innerHTML = (site.homeValueCards || []).map(valueCard).join("");
  }

  if (featuredGrid) {
    featuredGrid.innerHTML = featured.slice(0, 3).map(featuredGridCard).join("");
  }

  renderSpotlight(featured.slice(0, 5), 0);

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

  if (resumePanelLink) {
    resumePanelLink.href = site.resumeUrl || "#";
  }

  if (contactMeta) {
    contactMeta.textContent = [site.location, site.phone, site.email]
      .filter(Boolean)
      .join(" • ");
  }
}

renderHome().catch((error) => {
  console.error(error);
  const fallback = document.getElementById("spotlightTitle");
  if (fallback) {
    fallback.textContent = "Portfolio data failed to load.";
  }
});
