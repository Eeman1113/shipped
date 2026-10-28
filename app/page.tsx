import { APPS } from "./apps";
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
  const max = Math.max(...perMonth.map((m) => m.total));

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Eeman1113 · Jan – Oct 2026</div>
        <h1>
          <span className="n">{APPS.length}</span> webapps shipped this year
        </h1>
        <p className="lede">
          Every app I&apos;ve put live in 2026, on GitHub Pages and Vercel. Each link opens the live site.
        </p>
        <div className="stats">
          <span><b>{pages}</b> on GitHub Pages</span>
          <span><b>{vercel}</b> on Vercel</span>
          <span>about <b>{Math.round(APPS.length / 10)}</b> a month</span>
        </div>
        <div className="strip" aria-label="Apps shipped per month">
          {perMonth.map((m, i) => (
            <div key={i} className={`m${i > 9 ? " future" : ""}`} title={`${MONTHS[i]}: ${m.total} apps (${m.p} Pages, ${m.v} Vercel)`}>
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

      <footer>Dates are when each repo or project was created. Updated Oct 28, 2026.</footer>
    </div>
  );
}
