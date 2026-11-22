# Yewon Jang — Portfolio

A minimal, image-led portfolio for a visual communication designer.

- **Visual direction** — large-scale, immersive, full-bleed media on a black
  background (inspired by Vitaly Akimov).
- **Information architecture** — a clean 12-column grid and a two-column
  project page: metadata on the left, a continuous, gapless media scroll on the
  right (inspired by Dohee Kim).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
public/
  fonts/        Bona Nova web fonts
  media/        one folder per project  ← your real assets live here
    my-project/
      home.webp or home.mp4   optional homepage media
      01.png  02.mp4 …   detail media, shown in numerical order
scripts/
  scan-media.mjs   scans public/media → src/data/media-manifest.json
src/
  data/
    media-manifest.json  auto-generated — do not edit by hand
    projects.ts          ← edit project TEXT here (title, year, …)
  pages/
    Home.tsx       homepage visual feed
    Project.tsx    project detail page (4-column grid)
    About.tsx      info page
  components/      Header, Footer, Media
  index.css        all styling (theme, grid, layout)
```

## Adding / replacing projects (folder-driven)

The site reads the **folders inside `public/media/`**. You almost never touch
code to add work.

1. Create a folder named after the project slug, e.g. `public/media/my-project/`.
2. For a featured project, add a `home.*` image or video, or use the first detail image.
3. Add media files named `01`, `02`, `03`, … — these appear on the detail page
   in numerical order. Images (`png jpg jpeg gif webp avif svg`) and videos
   (`mp4 mov webm m4v`) are detected automatically. GIFs animate inline; videos
   autoplay muted + looped.
4. The scan runs automatically on `npm run dev` / `npm run build`. If you add
   files while the dev server is already running, run `npm run scan` (or restart).

### Editing the text for a project

Open **`src/data/projects.ts`** and edit the `META` map. Keys are the folder
names:

```ts
const META = {
  "my-project": {
    title: "My Project",
    year: "2026",
    category: "Moving Image",   // Branding · Moving Image · Installation · Publication …
    role: "Direction, Edit",
    description: "Short blurb shown in the left column.",
  },
};
```

Use `featured` in `Home.tsx` to select and order homepage projects, and
`ORDER` in `projects.ts` for project-page navigation. Projects without a
`META` entry use their folder name as the title.
