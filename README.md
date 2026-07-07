# Rank Your Niche

A small app for ranking anything you care about — coffee shops, board games,
hiking trails, whatever. Create a category, add a list inside it, define the
criteria that matter to you, score items 1–10 on each, and the app ranks them
into tiers automatically.

Everything is stored in your browser's local storage — no account, no server.
One example category ("Example: Coffee Shops") is seeded on first load to show
how it works; delete it whenever you like.

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

Deploys automatically to GitHub Pages via `.github/workflows/deploy.yml` on
every push to `main`.
