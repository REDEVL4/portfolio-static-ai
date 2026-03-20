const DATA_PATH = "data/portfolio.generated.json";

let cachedData = null;

export async function loadPortfolioData() {
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(DATA_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load portfolio data (${response.status})`);
  }

  cachedData = await response.json();
  return cachedData;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatMonthYear(value) {
  if (!value) {
    return "Present";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(date);
}

export function formatDateLabel(value) {
  if (!value) {
    return "Present";
  }

  const [year, month = "01"] = String(value).split("-");
  const date = new Date(`${year}-${month}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(date);
}

export function projectSearchText(project) {
  return [
    project.title,
    project.summary,
    project.type,
    ...(project.tags || []),
    ...(project.stack || []),
    ...(project.highlights || []),
    project.github?.language,
    ...(project.github?.topics || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
