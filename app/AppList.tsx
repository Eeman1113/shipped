"use client";

import { useState } from "react";
import type { App, Host } from "./apps";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const HOST_LABEL: Record<Host, string> = { pages: "GitHub Pages", vercel: "Vercel" };
const FILTERS: { id: "all" | Host; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pages", label: "GitHub Pages" },
  { id: "vercel", label: "Vercel" },
];

const pretty = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function AppList({ apps }: { apps: App[] }) {
  const [filter, setFilter] = useState<"all" | Host>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = apps.filter(
    (a) => (filter === "all" || a.host === filter) && (!q || a.name.toLowerCase().includes(q) || a.url.toLowerCase().includes(q)),
  );

  const groups = MONTHS.map((name, i) => ({
    name,
    apps: shown.filter((a) => Number(a.date.slice(5, 7)) === i + 1).sort((a, b) => b.date.localeCompare(a.date)),
  }))
    .filter((g) => g.apps.length)
    .reverse();

  return (
    <>
      <div className="controls">
        <div className="seg" role="group" aria-label="Filter by host">
          {FILTERS.map((f) => (
            <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <input type="search" id="q" placeholder="Search apps" aria-label="Search apps" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <main className="months">
        {groups.length === 0 && <p className="empty">No apps match “{query}”.</p>}
        {groups.map((g) => (
          <section key={g.name} className="month">
            <h2>
              {g.name}
              <small>{g.apps.length} app{g.apps.length > 1 ? "s" : ""}</small>
            </h2>
            <div className="list">
              {g.apps.map((a) => (
                <a key={a.url} className="app" href={a.url} target="_blank" rel="noopener">
                  <span className="day">{g.name.slice(0, 3)} {Number(a.date.slice(8))}</span>
                  <span className="meta">
                    <span className="name">{a.name}</span>
                    <span className="url">{pretty(a.url)}</span>
                  </span>
                  <span className={`host ${a.host}`}>{HOST_LABEL[a.host]}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
