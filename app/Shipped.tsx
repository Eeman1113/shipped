"use client";

import { useState } from "react";
import type { App, Host } from "./apps";

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const HOST_LABEL: Record<Host, string> = { pages: "GitHub Pages", vercel: "Vercel" };
const HOSTS: { id: "all" | Host; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pages", label: "GitHub Pages" },
  { id: "vercel", label: "Vercel" },
];

const pretty = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const month = (d: string) => Number(d.slice(5, 7));

type Props = { apps: App[]; years: string[]; currentYear: string; updated: string };

export default function Shipped({ apps, years, currentYear, updated }: Props) {
  // scope is a year ("2026") or "all" for all time; this year is the default.
  const [scope, setScope] = useState<string>(currentYear);
  const [host, setHost] = useState<"all" | Host>("all");
  const [query, setQuery] = useState("");

  const allTime = scope === "all";
  const inScope = allTime ? apps : apps.filter((a) => a.date.startsWith(scope));
  const pages = inScope.filter((a) => a.host === "pages").length;
  const vercel = inScope.length - pages;

  // Months elapsed in the scope, used for the per-month average.
  const first = inScope[0]?.date ?? `${scope}-01-01`;
  const last = inScope[inScope.length - 1]?.date ?? first;
  const lastMonth = inScope.length ? Math.max(...inScope.map((a) => month(a.date))) : 1;
  const span = allTime
    ? Math.max(1, (Number(last.slice(0, 4)) - Number(first.slice(0, 4))) * 12 + month(last) - month(first) + 1)
    : lastMonth;

  // One bar per year on all time, one per month inside a year.
  const buckets = (allTime ? years : SHORT).map((key, i) => {
    const mine = allTime ? inScope.filter((a) => a.date.startsWith(key as string)) : inScope.filter((a) => month(a.date) === i + 1);
    const p = mine.filter((a) => a.host === "pages").length;
    return {
      key: String(key),
      label: allTime ? String(key) : SHORT[i],
      title: allTime ? String(key) : SHORT[i],
      p,
      v: mine.length - p,
      total: mine.length,
      future: !allTime && i + 1 > lastMonth,
    };
  });
  const max = Math.max(1, ...buckets.map((b) => b.total));

  const q = query.trim().toLowerCase();
  const shown = inScope.filter(
    (a) => (host === "all" || a.host === host) && (!q || a.name.toLowerCase().includes(q) || a.url.toLowerCase().includes(q)),
  );

  // All time groups by year, a single year groups by month. Newest first either way.
  const groups = allTime
    ? [...years]
        .reverse()
        .map((y) => ({ key: y, name: y, apps: shown.filter((a) => a.date.startsWith(y)) }))
        .filter((g) => g.apps.length)
    : LONG.map((name, i) => ({ key: name, name, apps: shown.filter((a) => month(a.date) === i + 1) }))
        .filter((g) => g.apps.length)
        .reverse();

  const stamp = new Date(updated + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const range = allTime
    ? `${years[0]} – ${years[years.length - 1]}`
    : `Jan – ${SHORT[lastMonth - 1]} ${scope}`;

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Eeman1113 · {range}</div>
        <h1>
          <span className="n">{inScope.length}</span> webapps shipped {allTime ? "all time" : "this year"}
        </h1>
        <p className="lede">
          {allTime
            ? "Every app I've put live, on GitHub Pages and Vercel. Each link opens the live site."
            : `Every app I've put live in ${scope}, on GitHub Pages and Vercel. Each link opens the live site.`}
        </p>
        <div className="seg scope" role="group" aria-label="Time range">
          <button aria-pressed={!allTime} onClick={() => setScope(currentYear)}>
            {currentYear}
          </button>
          <button aria-pressed={allTime} onClick={() => setScope("all")}>
            All time
          </button>
        </div>
        <div className="stats">
          <span>
            <b>{pages}</b> on GitHub Pages
          </span>
          <span>
            <b>{vercel}</b> on Vercel
          </span>
          <span>
            about <b>{Math.round(inScope.length / span)}</b> a month
          </span>
        </div>
        <div className="strip" style={{ gridTemplateColumns: allTime ? `repeat(${buckets.length}, 52px)` : "repeat(12, 1fr)" }} aria-label={`Apps shipped per ${allTime ? "year" : "month"}`}>
          {buckets.map((b) => (
            <div key={b.key} className={b.future ? "m future" : "m"} title={`${b.title}: ${b.total} apps (${b.p} Pages, ${b.v} Vercel)`}>
              <div className="bar" style={{ height: b.total ? (b.total / max) * 60 : 2 }}>
                {b.p > 0 && <i className="p" style={{ flex: b.p }} />}
                {b.v > 0 && <i className="v" style={{ flex: b.v }} />}
              </div>
              <div className="lbl">{b.label}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="controls">
        <div className="seg" role="group" aria-label="Filter by host">
          {HOSTS.map((h) => (
            <button key={h.id} aria-pressed={host === h.id} onClick={() => setHost(h.id)}>
              {h.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          id="q"
          placeholder="Search apps"
          aria-label="Search apps"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <main className="months">
        {groups.length === 0 && <p className="empty">No apps match “{query}”.</p>}
        {groups.map((g) => (
          <section key={g.key} className="month">
            <h2>
              {g.name}
              <small>
                {g.apps.length} app{g.apps.length > 1 ? "s" : ""}
              </small>
            </h2>
            <div className="list">
              {[...g.apps]
                .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name))
                .map((a) => (
                  <a key={a.url} className="app" href={a.url} target="_blank" rel="noopener">
                    <span className="day">
                      {SHORT[month(a.date) - 1]} {Number(a.date.slice(8))}
                    </span>
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

      <footer>Dates are when each repo or project was created. Updates daily. Last updated {stamp}.</footer>
    </div>
  );
}
