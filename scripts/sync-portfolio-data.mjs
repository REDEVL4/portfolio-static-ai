import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const seedPath = path.join(dataDir, "portfolio.seed.json");
const linkedinPath = path.join(dataDir, "linkedin-profile.json");
const outputPath = path.join(dataDir, "portfolio.generated.json");

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readJson(filePath, fallback = null) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (fallback !== null) {
      return fallback;
    }
    throw error;
  }
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-sync-script"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGithubJson(url) {
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub request failed (${response.status}): ${detail}`);
  }
  return response.json();
}

function mergeProject(override, repo, username, featuredRepos) {
  const repoUrl = repo?.html_url || `https://github.com/${username}/${override.repo}`;
  const github = {
    owner: username,
    repo: repo?.name || override.repo,
    language: repo?.language || null,
    stars: repo?.stargazers_count ?? null,
    forks: repo?.forks_count ?? null,
    openIssues: repo?.open_issues_count ?? null,
    topics: repo?.topics || [],
    description: repo?.description || null,
    homepage: repo?.homepage || null,
    updatedAt: repo?.updated_at || null
  };

  return {
    slug: override.slug || slugify(override.title || override.repo),
    repo: override.repo,
    title: override.title || repo?.name || override.repo,
    featured: Boolean(override.featured || featuredRepos.includes(override.repo)),
    type: override.type || "Project",
    summary: override.summary || repo?.description || "Repository synced from GitHub.",
    tags: override.tags || github.topics || [],
    stack: override.stack || [github.language].filter(Boolean),
    highlights: override.highlights || [],
    links: {
      github: repoUrl,
      demo: override.links?.demo || github.homepage || null,
      caseStudy: override.links?.caseStudy || null,
      notebook: override.links?.notebook || null,
      paper: override.links?.paper || null
    },
    images: override.images || ["assets/img/placeholder-1.svg"],
    github
  };
}

async function main() {
  const seed = await readJson(seedPath);
  const linkedin = await readJson(linkedinPath, {});
  const username = seed.site.githubUsername;
  const featuredRepos = seed.github?.featuredRepos || [];

  let githubProfile = { followers: null, public_repos: null };
  let repos = [];

  try {
    [githubProfile, repos] = await Promise.all([
      fetchGithubJson(`https://api.github.com/users/${username}`),
      fetchGithubJson(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
    ]);
  } catch (error) {
    console.warn(`GitHub sync skipped: ${error.message}`);
  }

  const repoMap = new Map(
    repos
      .filter((repo) => seed.github?.includeForks || !repo.fork)
      .map((repo) => [repo.name, repo])
  );

  const discoveredProjects = [];

  for (const repo of repoMap.values()) {
    const override = seed.projectOverrides.find((item) => item.repo === repo.name);
    if (override?.hidden) {
      continue;
    }
    discoveredProjects.push(
      mergeProject(override || { repo: repo.name, title: repo.name }, repo, username, featuredRepos)
    );
  }

  for (const override of seed.projectOverrides) {
    if (repoMap.has(override.repo) || override.hidden) {
      continue;
    }
    discoveredProjects.push(mergeProject(override, null, username, featuredRepos));
  }

  discoveredProjects.sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }
    return left.title.localeCompare(right.title);
  });

  const output = {
    generatedAt: new Date().toISOString(),
    site: {
      ...seed.site,
      githubFollowers: githubProfile.followers ?? null,
      githubPublicRepos: githubProfile.public_repos ?? null
    },
    profile: {
      headline: linkedin.headline || seed.site.headline,
      about: linkedin.about || seed.site.heroSummary,
      experience: linkedin.experience || [],
      education: linkedin.education || [],
      topSkills: linkedin.topSkills || [],
      certifications: linkedin.certifications || [],
      honors: linkedin.honors || []
    },
    projects: discoveredProjects,
    meta: {
      projectCount: discoveredProjects.length,
      featuredCount: discoveredProjects.filter((project) => project.featured).length
    }
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
