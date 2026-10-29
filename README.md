# Shipped

Every webapp I've put live (GitHub Pages + Vercel), as a static Next.js site. Defaults to the
current year; the **All time** toggle shows every year.

Live: https://eeman1113.github.io/shipped/

`scripts/fetch-apps.mjs` rebuilds `app/apps.json` from the GitHub and Vercel APIs. A GitHub
Actions workflow runs it daily (and on every push to `main`), commits the snapshot, and
redeploys — so the list stays current with no manual edits.
