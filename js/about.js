import { escapeHtml, formatDateLabel, loadPortfolioData } from "./data-service.js";

const focusAreaCopy = {
  "Full-stack engineering": "I enjoy building the full path from user-facing workflows to backend services, data flow, and the operational pieces that keep everything reliable.",
  "Backend systems": "Most of my hands-on experience is here: APIs, service boundaries, integrations, throughput, data contracts, and the decisions that make backend systems easier to operate.",
  "Data engineering": "I like the work of turning messy source data into dependable pipelines, cleaner schemas, and outputs that are actually useful for teams downstream.",
  "Distributed systems and integrations": "A lot of my professional work has involved event-driven flows, enterprise integrations, and keeping data moving correctly across systems that do not always behave nicely.",
  "Cloud platforms and observability": "I care about what happens after deployment too, so I pay attention to monitoring, incident response, dashboards, and the signals teams need when something goes wrong.",
  "Applied machine learning": "My ML work is strongest when it is tied back to engineering reality: data preparation, evaluation, tradeoffs, and how a model would fit into a real system."
};

async function init() {
  const data = await loadPortfolioData();
  const about = document.getElementById("aboutCopy");
  const aboutSections = document.getElementById("aboutSections");
  const focusCards = document.getElementById("focusCards");
  const skills = document.getElementById("skillCloud");
  const education = document.getElementById("educationList");
  const certifications = document.getElementById("certificationList");
  const honors = document.getElementById("honorList");
  const contact = document.getElementById("aboutContact");
  const statusCards = document.getElementById("statusCards");

  const site = data.site || {};
  const profile = data.profile || {};
  const experience = profile.experience || [];

  const snapshotSections = site.aboutSections || [];
  const focusAreas = site.focusAreas || [];
  const currentStatus = site.currentStatus || [];

  about.innerHTML = (profile.about || [])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");

  if (aboutSections) {
    aboutSections.innerHTML = snapshotSections
      .map(
        (section) => `
          <div class="content-card" data-tilt>
            <div class="content-card-title">${escapeHtml(section.title)}</div>
            <p class="mb-0 mt-2 text-secondary">${escapeHtml(section.copy)}</p>
          </div>
        `
      )
      .join("");
  }

  if (focusCards) {
    focusCards.innerHTML = focusAreas
      .map(
        (item) => `
          <div class="content-card" data-tilt>
            <div class="content-card-title">${escapeHtml(item)}</div>
            <p class="mb-0 mt-2 text-secondary">${escapeHtml(
              focusAreaCopy[item] ||
                "This is a recurring theme across the work on this site, from production engineering to graduate project work."
            )}</p>
          </div>
        `
      )
      .join("");
  }

  const mergedSkills = [...new Set([...(site.skills || []), ...(profile.topSkills || [])])];
  skills.innerHTML = mergedSkills
    .map((skill) => `<span class="pill">${escapeHtml(skill)}</span>`)
    .join("");

  education.innerHTML = (profile.education || [])
    .map(
      (item) => `
        <div class="education-card" data-tilt>
          <div class="fw-semibold">${escapeHtml(item.degree)}</div>
          <div class="text-secondary">${escapeHtml(item.institution)}</div>
          <div class="text-secondary">${escapeHtml(formatDateLabel(item.start))} - ${escapeHtml(formatDateLabel(item.end))}</div>
        </div>
      `
    )
    .join("");

  if (certifications) {
    certifications.innerHTML = (profile.certifications || [])
      .map((item) => `<div class="education-card" data-tilt><div class="fw-semibold">${escapeHtml(item)}</div></div>`)
      .join("");
  }

  if (honors) {
    honors.innerHTML = (profile.honors || [])
      .map((item) => `<span class="pill">${escapeHtml(item)}</span>`)
      .join("");
  }

  if (contact) {
    const primaryExperience = experience[0];
    const headline = profile.headline || site.headline || "";
    contact.innerHTML = `
      <div class="education-card" data-tilt>
        <div class="fw-semibold">Location</div>
        <div class="text-secondary">${escapeHtml(site.location || "")}</div>
      </div>
      <div class="education-card" data-tilt>
        <div class="fw-semibold">Email</div>
        <a class="text-secondary text-decoration-none" href="mailto:${escapeHtml(site.email || "")}">${escapeHtml(site.email || "")}</a>
      </div>
      <div class="education-card" data-tilt>
        <div class="fw-semibold">What I Focus On</div>
        <div class="text-secondary">${escapeHtml(headline)}</div>
      </div>
      <div class="education-card" data-tilt>
        <div class="fw-semibold">Profiles</div>
        <div class="d-flex flex-wrap gap-2 mt-2">
          <a class="btn btn-sm btn-outline-light" href="${escapeHtml(site.linkedinUrl || "#")}" target="_blank" rel="noopener">LinkedIn</a>
          <a class="btn btn-sm btn-outline-light" href="${escapeHtml(site.githubUrl || "#")}" target="_blank" rel="noopener">GitHub</a>
          <a class="btn btn-sm btn-outline-light" href="${escapeHtml(site.resumeUrl || "#")}" target="_blank" rel="noopener">Resume</a>
        </div>
      </div>
      ${
        primaryExperience
          ? `<div class="education-card" data-tilt><div class="fw-semibold">Most Recent Role</div><div class="text-secondary">${escapeHtml(primaryExperience.role)} at ${escapeHtml(primaryExperience.company)}</div></div>`
          : ""
      }
    `;
  }

  if (statusCards) {
    statusCards.innerHTML = currentStatus
      .map(
        (item) => `
          <div class="education-card" data-tilt>
            <div class="fw-semibold">${escapeHtml(item.title)}</div>
            <div class="text-secondary">${escapeHtml(item.copy)}</div>
          </div>
        `
      )
      .join("");
  }
}

init().catch((error) => console.error(error));
