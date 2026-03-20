import { escapeHtml, formatDateLabel, loadPortfolioData } from "./data-service.js";

async function init() {
  const data = await loadPortfolioData();
  const timeline = document.getElementById("experienceTimeline");

  timeline.innerHTML = (data.profile?.experience || [])
    .map(
      (item) => `
        <div class="timeline-item">
          <div class="timeline-line"></div>
          <div class="timeline-card">
            <div class="d-flex flex-wrap justify-content-between gap-3">
              <div>
                <div class="fw-semibold">${escapeHtml(item.role)}</div>
                <div class="text-secondary">${escapeHtml(item.company)}${item.location ? `, ${escapeHtml(item.location)}` : ""}</div>
              </div>
              <div class="timeline-range">${formatDateLabel(item.start)} - ${formatDateLabel(item.end)}</div>
            </div>
            <ul class="timeline-list">
              ${(item.highlights || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
            </ul>
          </div>
        </div>
      `
    )
    .join("");
}

init().catch((error) => console.error(error));
