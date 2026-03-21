import { escapeHtml, formatDateLabel, loadPortfolioData } from "./data-service.js";

async function init() {
  const data = await loadPortfolioData();
  const about = document.getElementById("aboutCopy");
  const skills = document.getElementById("skillCloud");
  const education = document.getElementById("educationList");
  const certifications = document.getElementById("certificationList");
  const honors = document.getElementById("honorList");

  about.innerHTML = (data.profile?.about || [])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

  const mergedSkills = [...new Set([...(data.site?.skills || []), ...(data.profile?.topSkills || [])])];
  skills.innerHTML = mergedSkills
    .map((skill) => `<span class="pill">${escapeHtml(skill)}</span>`)
    .join("");

  education.innerHTML = (data.profile?.education || [])
    .map(
      (item) => `
        <div class="education-card">
          <div class="fw-semibold">${escapeHtml(item.degree)}</div>
          <div class="text-secondary">${escapeHtml(item.institution)}</div>
          <div class="text-secondary">${escapeHtml(formatDateLabel(item.start))} - ${escapeHtml(formatDateLabel(item.end))}</div>
        </div>
      `
    )
    .join("");

  if (certifications) {
    certifications.innerHTML = (data.profile?.certifications || [])
      .map((item) => `<div class="education-card"><div class="fw-semibold">${escapeHtml(item)}</div></div>`)
      .join("");
  }

  if (honors) {
    honors.innerHTML = (data.profile?.honors || [])
      .map((item) => `<span class="pill">${escapeHtml(item)}</span>`)
      .join("");
  }
}

init().catch((error) => console.error(error));
