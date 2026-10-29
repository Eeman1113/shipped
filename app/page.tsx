import { APPS, UPDATED, YEAR } from "./apps";
import AppList from "./AppList";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Home() {
  const pages = APPS.filter((a) => a.host === "pages").length;
  const vercel = APPS.length - pages;
  const perMonth = MONTHS.map((_, i) => {
    const inMonth = APPS.filter((a) => Number(a.date.slice(5, 7)) === i + 1);
    const p = inMonth.filter((a) => a.host === "pages").length;
    return { p, v: inMonth.length - p, total: inMonth.length };
  });
  const max = Math.max(1, ...perMonth.map((m) => m.total));
  const months = [...new Set(APPS.map((a) => Number(a.date.slice(5, 7))))];
  const last = Math.max(...months, 1);
  const updated = new Date(UPDATED + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Eeman1113 · Jan – {MONTHS[last - 1]} {YEAR}</div>
        <h1>
          <span className="n">{APPS.length}</span> webapps shipped this year
        </h1>
        <p className="lede">
          Every app I&apos;ve put live in {YEAR}, on GitHub Pages and Vercel. Each link opens the live site.
        </p>
        <div className="stats">
          <span><b>{pages}</b> on GitHub Pages</span>
          <span><b>{vercel}</b> on Vercel</span>
          <span>about <b>{Math.round(APPS.length / last)}</b> a month</span>
        </div>
        <div className="strip" aria-label="Apps shipped per month">
          {perMonth.map((m, i) => (
            <div key={i} className={`m${i + 1 > last ? " future" : ""}`} title={`${MONTHS[i]}: ${m.total} apps (${m.p} Pages, ${m.v} Vercel)`}>
              <div className="bar" style={{ height: m.total ? (m.total / max) * 60 : 2 }}>
                {m.p > 0 && <i className="p" style={{ flex: m.p }} />}
                {m.v > 0 && <i className="v" style={{ flex: m.v }} />}
              </div>
              <div className="lbl">{MONTHS[i]}</div>
            </div>
          ))}
        </div>
      </header>

      <AppList apps={APPS} />

      <footer>Dates are when each repo or project was created. Updates daily. Last updated {updated}.</footer>
    </div>
  );
}
