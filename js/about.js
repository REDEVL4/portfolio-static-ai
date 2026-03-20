import { escapeHtml, loadPortfolioData } from "./data-service.js";

async function init() {
  const data = await loadPortfolioData();
  const about = document.getElementById("aboutCopy");
  const skills = document.getElementById("skillCloud");
  const education = document.getElementById("educationList");

  about.innerHTML = (data.profile?.about || [])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

  skills.innerHTML = (data.site?.skills || [])
    .map((skill) => `<span class="pill">${escapeHtml(skill)}</span>`)
    .join("");

  education.innerHTML = (data.profile?.education || [])
    .map(
      (item) => `
        <div class="education-card">
          <div class="fw-semibold">${escapeHtml(item.degree)}</div>
          <div class="text-secondary">${escapeHtml(item.institution)}</div>
        </div>
      `
    )
    .join("");
}

init().catch((error) => console.error(error));
