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
    <div class="col-lg-4">
      <div class="info-panel h-100 value-panel" data-tilt>
        <div class="section-kicker">Core Strength</div>
        <h2 class="h4">${escapeHtml(item.title)}</h2>
        <p class="mb-0">${escapeHtml(item.copy)}</p>
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
  const proof = document.getElementById("heroProof");
  const valueCards = document.getElementById("homeValueCards");
  const heroLocation = document.getElementById("heroLocation");
  const heroPhone = document.getElementById("heroPhone");
  const heroEmail = document.getElementById("heroEmail");
  const heroResumeLink = document.getElementById("heroResumeLink");
  const resumePanelLink = document.getElementById("resumePanelLink");

  if (headline) {
    const headlineText = site.headline || profile.headline || "";
    const introText = site.heroIntro || "";
    headline.textContent = headlineText;
    headline.hidden =
      !headlineText ||
      headlineText.trim().toLowerCase() === introText.trim().toLowerCase();
  }

  if (intro) {
    intro.textContent = site.heroIntro || "";
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

  if (focus) {
    focus.innerHTML = (site.focusAreas || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  if (valueCards) {
    valueCards.innerHTML = (site.homeValueCards || []).map(valueCard).join("");
  }

  if (metrics) {
    const metricItems = site.heroMetrics?.length
      ? site.heroMetrics
      : [
          { label: "Projects", value: String(data.meta?.projectCount || 0) },
          { label: "Featured", value: String(data.meta?.featuredCount || 0) },
          { label: "Location", value: site.location || "Available remotely" }
        ];
    metrics.innerHTML = metricItems.map((item) => statCard(item.label, item.value)).join("");
  }

  if (slides) {
    slides.innerHTML = featured.map((project, index) => projectSlide(project, index === 0)).join("");
  }

  const githubLink = document.getElementById("githubLink");
  const linkedinLink = document.getElementById("linkedinLink");
  const emailLink = document.getElementById("emailLink");
  const resumeLink = document.getElementById("resumeLink");
  const contactMeta = document.getElementById("contactMeta");

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

  if (heroResumeLink) {
    heroResumeLink.href = site.resumeUrl || "#";
  }

  if (resumePanelLink) {
    resumePanelLink.href = site.resumeUrl || "#";
  }

  if (heroLocation) {
    heroLocation.textContent = site.location || "";
  }

  if (heroPhone) {
    heroPhone.textContent = site.phone || "Available on request";
    heroPhone.href = site.phone ? `tel:${site.phone.replaceAll(" ", "")}` : "#";
  }

  if (heroEmail) {
    heroEmail.textContent = site.email || "";
    heroEmail.href = site.email ? `mailto:${site.email}` : "#";
  }

  if (contactMeta) {
    contactMeta.textContent = [site.location, site.phone, site.email, "Open to software engineering and backend roles"]
      .filter(Boolean)
      .join(" | ");
  }
}

renderHome().catch((error) => {
  console.error(error);
  const fallback = document.getElementById("featuredSlides");
  if (fallback) {
    fallback.innerHTML = `<div class="text-white-50">Portfolio data failed to load. Regenerate data or refresh the page.</div>`;
  }
});
