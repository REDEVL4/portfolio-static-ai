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

function scoreNotebookPath(notebookPath) {
  const normalized = notebookPath.toLowerCase();
  let score = 0;

  if (!normalized.includes("/")) {
    score += 4;
  }
  if (normalized.includes("complete")) {
    score += 3;
  }
  if (normalized.includes("final")) {
    score += 2;
  }
  if (normalized.includes("classification") || normalized.includes("pipeline")) {
    score += 1;
  }

  score -= normalized.length / 500;
  return score;
}

async function fetchRepoTree(username, repo) {
  if (!repo?.name || !repo?.default_branch) {
    return null;
  }

  try {
    return await fetchGithubJson(
      `https://api.github.com/repos/${username}/${repo.name}/git/trees/${repo.default_branch}?recursive=1`
    );
  } catch {
    return null;
  }
}

function findNotebookAsset(username, repo, tree) {
  const notebook = (tree?.tree || [])
    .filter((item) => item.type === "blob")
    .filter((item) => item.path?.toLowerCase().endsWith(".ipynb") && !item.path.includes(".ipynb_checkpoints"))
    .sort((left, right) => scoreNotebookPath(right.path) - scoreNotebookPath(left.path))[0];

  if (!notebook) {
    return null;
  }

  return {
    path: notebook.path,
    viewerUrl: `https://nbviewer.org/github/${username}/${repo.name}/blob/${repo.default_branch}/${notebook.path}`,
    sourceUrl: `https://github.com/${username}/${repo.name}/blob/${repo.default_branch}/${notebook.path}`
  };
}

function isVisualAsset(pathname = "") {
  const normalized = pathname.toLowerCase();
  if (!/\.(png|jpe?g|gif|svg|webp|html)$/.test(normalized)) {
    return false;
  }
  if (/node_modules|dist\/|build\/|coverage\/|\.ipynb_checkpoints/.test(normalized)) {
    return false;
  }
  return /(plot|chart|result|figure|fig|image|img|output|dashboard|report|viz|visual|roc|confusion|architecture|overview|public\/images|docs\/media)/i.test(
    pathname
  );
}

function scoreVisualPath(pathname) {
  const normalized = pathname.toLowerCase();
  let score = 0;

  if (normalized.includes("docs/media")) score += 6;
  if (normalized.includes("public/images")) score += 5;
  if (normalized.includes("result") || normalized.includes("output")) score += 5;
  if (normalized.includes("plot") || normalized.includes("chart") || normalized.includes("figure")) score += 4;
  if (normalized.includes("overview") || normalized.includes("architecture")) score += 3;
  if (normalized.endsWith(".png") || normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) score += 2;
  if (!normalized.includes("/")) score += 2;

  score -= normalized.length / 500;
  return score;
}

function findVisualAssets(username, repo, tree) {
  return (tree?.tree || [])
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter(isVisualAsset)
    .sort((left, right) => scoreVisualPath(right) - scoreVisualPath(left))
    .slice(0, 8)
    .map((assetPath) => {
      const ext = path.extname(assetPath).toLowerCase();
      return {
        path: assetPath,
        type: ext === ".html" ? "html" : "image",
        previewUrl:
          ext === ".html"
            ? null
            : `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${assetPath}`,
        sourceUrl: `https://github.com/${username}/${repo.name}/blob/${repo.default_branch}/${assetPath}`
      };
    });
}

function mergeProject(override, repo, username, featuredRepos, notebookAsset, githubAssets) {
  const repoUrl = repo?.html_url || `https://github.com/${username}/${override.repo}`;
  const github = {
    owner: username,
    repo: repo?.name || override.repo,
    defaultBranch: repo?.default_branch || null,
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
      notebook: notebookAsset?.viewerUrl || override.links?.notebook || null,
      notebookSource: notebookAsset?.sourceUrl || override.links?.notebookSource || null,
      paper: override.links?.paper || null
    },
    images: override.images || ["assets/img/placeholder-1.svg"],
    githubAssets: override.githubAssets || githubAssets || [],
    github
  };
}

async function main() {
  const seed = await readJson(seedPath);
  const linkedin = await readJson(linkedinPath, {});
  const username = seed.site.githubUsername;
  const featuredRepos = seed.github?.featuredRepos || [];
  const featuredRepoOrder = new Map(featuredRepos.map((repoName, index) => [repoName, index]));

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
    const tree = await fetchRepoTree(username, repo);
    const notebookAsset = findNotebookAsset(username, repo, tree);
    const githubAssets = findVisualAssets(username, repo, tree);
    discoveredProjects.push(
      mergeProject(
        override || { repo: repo.name, title: repo.name },
        repo,
        username,
        featuredRepos,
        notebookAsset,
        githubAssets
      )
    );
  }

  for (const override of seed.projectOverrides) {
    if (repoMap.has(override.repo) || override.hidden) {
      continue;
    }
    discoveredProjects.push(mergeProject(override, null, username, featuredRepos, null, override.githubAssets || []));
  }

  discoveredProjects.sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }
    if (left.featured && right.featured) {
      const leftOrder = featuredRepoOrder.get(left.repo) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = featuredRepoOrder.get(right.repo) ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
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
