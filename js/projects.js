import { escapeHtml, formatMonthYear, loadPortfolioData, projectSearchText } from "./data-service.js";

let allProjects = [];
let activeTag = "All";
let activeSort = "featured";

function el(id) {
  return document.getElementById(id);
}

function unique(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function buttonClass(tag) {
  return tag === activeTag ? "btn btn-sm btn-light chip-btn active" : "btn btn-sm btn-outline-light chip-btn";
}

function renderTagBar(tags) {
  const tagBar = el("tagBar");
  if (!tagBar) {
    return;
  }

  tagBar.innerHTML = ["All", ...tags]
    .map((tag) => `<button class="${buttonClass(tag)}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
    .join("");

  tagBar.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeTag = button.dataset.tag;
      render();
    });
  });
}

function repoMeta(project) {
  const parts = [];

  if (project.github?.language) {
    parts.push(project.github.language);
  }

  if (project.github?.updatedAt) {
    parts.push(`Updated ${formatMonthYear(project.github.updatedAt)}`);
  }

  if (project.github?.stars !== null && project.github?.stars !== undefined) {
    parts.push(`${project.github.stars} stars`);
  }

  return parts.map((part) => `<span>${escapeHtml(part)}</span>`).join("<span class=\"dot\"></span>");
}

function projectCard(project) {
  const img = project.images?.[0] || "assets/img/placeholder-1.svg";
  const tags = (project.tags || []).slice(0, 4).map((tag) => `<span class="pill small">${escapeHtml(tag)}</span>`).join("");
  const highlights = (project.highlights || []).slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `
    <article class="col-md-6 col-xl-4">
      <div class="project-card h-100" data-tilt>
        <img src="${img}" class="project-thumb" alt="${escapeHtml(project.title)} preview">
        <div class="project-body">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <div class="section-kicker">${escapeHtml(project.type || "Project")}</div>
              <h2 class="project-title">${escapeHtml(project.title)}</h2>
            </div>
            ${project.featured ? '<span class="pill accent">Featured</span>' : ""}
          </div>
          <p class="project-summary">${escapeHtml(project.summary || "")}</p>
          <div class="d-flex flex-wrap gap-2">${tags}</div>
          <div class="project-meta">${repoMeta(project)}</div>
          <ul class="project-list">${highlights}</ul>
        </div>
        <div class="project-actions">
          <a class="btn btn-sm btn-light" href="project.html?slug=${encodeURIComponent(project.slug)}">View Details</a>
          ${project.links?.github ? `<a class="btn btn-sm btn-outline-light" href="${project.links.github}" target="_blank" rel="noopener">GitHub</a>` : ""}
          ${project.links?.demo ? `<a class="btn btn-sm btn-outline-light" href="${project.links.demo}" target="_blank" rel="noopener">Demo</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

function applyFilters() {
  const query = (el("searchInput")?.value || "").trim().toLowerCase();
  const filtered = allProjects.filter((project) => {
    const matchesTag = activeTag === "All" || (project.tags || []).includes(activeTag);
    const matchesQuery = !query || projectSearchText(project).includes(query);
    return matchesTag && matchesQuery;
  });

  const sorters = {
    featured: (left, right) => Number(right.featured) - Number(left.featured) || left.title.localeCompare(right.title),
    updated: (left, right) => (Date.parse(right.github?.updatedAt || 0) || 0) - (Date.parse(left.github?.updatedAt || 0) || 0),
    alpha: (left, right) => left.title.localeCompare(right.title)
  };

  return filtered.sort(sorters[activeSort]);
}

function renderEmptyState() {
  return `
    <div class="col-12">
      <div class="empty-state">
        <h2>No matching projects</h2>
        <p>Try a different tag or search term. I organized this page so it is easy to move between project types and stacks.</p>
      </div>
    </div>
  `;
}

function render() {
  const filtered = applyFilters();
  el("projectGrid").innerHTML = filtered.length ? filtered.map(projectCard).join("") : renderEmptyState();
  renderTagBar(unique(allProjects.flatMap((project) => project.tags || [])));
}

async function init() {
  const data = await loadPortfolioData();
  allProjects = data.projects || [];

  const summary = document.getElementById("projectSummary");
  if (summary) {
    summary.textContent = `I am using this page to organize ${allProjects.length} projects across backend systems, full-stack platforms, data pipelines, and ML work so it is easy to jump into the technical details behind each one.`;
  }

  const searchInput = el("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", render);
  }

  const sortSelect = el("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      activeSort = sortSelect.value;
      render();
    });
  }

  render();
}

init().catch((error) => {
  console.error(error);
  el("projectGrid").innerHTML = renderEmptyState();
});
