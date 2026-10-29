// Builds app/apps.json from the GitHub and Vercel APIs — every live app, all years.
// Env: GITHUB_TOKEN (optional, raises rate limit), VERCEL_TOKEN (optional; without it the
// previous Vercel entries in apps.json are kept).
import { readFile, writeFile } from "node:fs/promises";

const GH_USER = "Eeman1113";
const VERCEL_TEAM = "team_Pi7z9gVoUB6nnUD8Huw2Jkrh";
const SELF = ["shipped", "shipped-2026"];
const OUT = new URL("../app/apps.json", import.meta.url);

const previous = await readFile(OUT, "utf8").then(JSON.parse).catch(() => ({ apps: [] }));

async function json(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function githubPages() {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await json(`https://api.github.com/users/${GH_USER}/repos?type=owner&per_page=100&page=${page}`, headers);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const candidates = repos.filter(
    (r) => r.has_pages && !SELF.includes(r.name) && !r.name.toLowerCase().endsWith(".github.io"),
  );
  // Follow redirects so custom domains resolve, and drop sites that don't load.
  const checked = await Promise.all(
    candidates.map(async (r) => {
      try {
        const res = await fetch(`https://${GH_USER.toLowerCase()}.github.io/${r.name}/`, { redirect: "follow" });
        if (!res.ok) return null;
        return { date: r.created_at.slice(0, 10), name: r.name, host: "pages", url: res.url };
      } catch {
        return null;
      }
    }),
  );
  return checked.filter(Boolean);
}

async function vercelProjects() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.warn("VERCEL_TOKEN not set; keeping previous Vercel entries");
    return previous.apps.filter((a) => a.host === "vercel");
  }
  const headers = { Authorization: `Bearer ${token}` };
  const projects = [];
  let until = "";
  do {
    const data = await json(`https://api.vercel.com/v9/projects?teamId=${VERCEL_TEAM}&limit=100${until && `&until=${until}`}`, headers);
    projects.push(...data.projects);
    until = data.pagination?.next ?? "";
  } while (until);
  return projects
    .map((p) => {
      const prod = p.targets?.production;
      const alias = prod?.alias?.[0];
      if (prod?.readyState !== "READY" || !alias) return null;
      return { date: new Date(p.createdAt).toISOString().slice(0, 10), name: p.name, host: "vercel", url: `https://${alias}` };
    })
    .filter(Boolean);
}

const apps = [...(await githubPages()), ...(await vercelProjects())].sort(
  (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name),
);
const years = [...new Set(apps.map((a) => a.date.slice(0, 4)))].sort();
await writeFile(
  OUT,
  JSON.stringify(
    { year: String(new Date().getUTCFullYear()), years, updated: new Date().toISOString().slice(0, 10), apps },
    null,
    2,
  ) + "\n",
);
console.log(`${apps.length} apps across ${years.length} years (${apps.filter((a) => a.host === "pages").length} Pages, ${apps.filter((a) => a.host === "vercel").length} Vercel)`);
