# Heer Mehta — Portfolio design options

Four design directions for Heer Mehta's portfolio.

| Option | Path | Stack | Idea |
| --- | --- | --- | --- |
| 1 · The Monument | `/` | HTML, CSS, JS | Name at full width, live API console |
| 2 · The Reel | `/option2/` | HTML, CSS, JS | Pinned sentence with a reel of projects |
| 3 · The Graph | `/option3/dist/` | TypeScript, Vite, Three.js | Interactive 3D graph of skills and projects |
| 4 · The Story | `/option4/dist/` | TypeScript, Vite, GSAP, Lenis | Clean, scroll-driven story |

Options 3 and 4 are Vite projects. The built output is committed in each `dist/` folder so the whole repo can be served as static files.

To rebuild one:

```bash
cd option3   # or option4
npm install
npm run build
```

Preview locally from the repo root with `npx serve .`.

The photo and resume are loaded from the existing site (heer-mehta-portfolio.vercel.app). Copy them into the repo before replacing that site.
