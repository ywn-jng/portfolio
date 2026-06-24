/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PROJECT DATA
 * ─────────────────────────────────────────────────────────────────────────
 *  The site is driven by the folders inside /public/media. Each folder is a
 *  project (folder name = slug) and contains:
 *      thumbnail.*          → homepage preview
 *      01.*, 02.*, 03.* …   → detail-page media, shown in numerical order
 *
 *  The media files themselves are discovered automatically by the scan script
 *  (scripts/scan-media.mjs → media-manifest.json), which runs on `npm run dev`
 *  and `npm run build`. Run it manually any time you add files: `npm run scan`.
 *
 *  The ONLY thing you edit by hand here is the written metadata for each
 *  project (title, year, category, role, description) in the META map below,
 *  plus ORDER to control the homepage sequence.
 * ─────────────────────────────────────────────────────────────────────────
 */
import manifestJson from "./media-manifest.json";

export type MediaItem = {
  type: "image" | "video" | "embed" | "native";
  /** Path relative to /public (image/video), a full URL (embed), or a component id (native) */
  src: string;
  poster?: string;
  alt?: string;
  /** Optional width/height ratio; falls back to natural size when omitted. */
  ratio?: number;
  /** Embed only: iframe accessible title */
  title?: string;
  /** Embed only: full interactive site (taller frame, no fixed ratio) */
  interactive?: boolean;
};

export type InfoRow = {
  label: string;
  value: string;
};

export type Project = {
  slug: string;
  title: string;
  year: string;
  category: string;
  description: string;
  /** Homepage feed overlay copy (column 2) */
  feedDescription?: string;
  info?: InfoRow[];
  /** Homepage feed text color over the cover: "light" (default) or "dark" */
  coverText?: "light" | "dark";
  /** Homepage feed preview */
  cover: MediaItem;
  /** Ordered, full-width media for the detail page */
  media: MediaItem[];
  /** Images from the project's /process/ folder (process gallery) */
  process: MediaItem[];
};

type ManifestEntry = {
  thumbnail: MediaItem | null;
  media: MediaItem[];
  process?: MediaItem[];
};

const MANIFEST = manifestJson as unknown as Record<string, ManifestEntry>;

export const SITE = {
  name: "Yewon Jang",
  role: "Computational · Visual · AI",
  email: "1128yewon@gmail.com",
  instagram: {
    handle: "@yewonjanng",
    url: "https://www.instagram.com/yewonjanng/",
  },
  about:
    "Yewon Jang is a London-based visual communicator originally from Seoul, working across creative coding, graphic design, and moving image. Using digital and time-based media, she explores the possibilities and limitations of computational tools through experimentation and play. Outside her practice, she is drawn to arthouse horror, Eastern philosophy, and life drawing, all of which continues to inform her practice.",
  work: [
    { org: "LG Uplus, Brand Strategy Team", when: "2022, Seoul" },
    { org: "Ewhaian, Design Team", when: "2021–2022, Seoul" },
  ],
  education: [
    {
      org: "Royal College of Art",
      detail: "MA Visual Communication",
      when: "2025–2026, London",
    },
    {
      org: "UAL London College of Communication",
      detail: "Creative Coding Short Course",
      when: "2026, London",
    },
    {
      org: "Ewha Womans University",
      detail: "BFA Design",
      when: "2020–2025, Seoul",
    },
  ],
} as const;

/* ─────────────────────── Editable project metadata ───────────────────────
 * Keys must match the folder names in /public/media.
 * Edit the text below freely — it does not affect which files are shown.
 */
type Meta = {
  title: string;
  year: string;
  category: string;
  role?: string;
  description: string;
  /** Optional short copy shown in the homepage feed overlay (column 2) */
  feedDescription?: string;
  /** Homepage feed text color over the cover: "light" (default) or "dark" */
  coverText?: "light" | "dark";
};

const META: Record<string, Meta> = {
  "what-could-you-be": {
    title: "What Could You Be",
    year: "2026",
    category: "Moving Image",
    role: "Direction, Edit",
    feedDescription:
      "There are different lives we could have lived, and possibilities lost with every choice we make. Using the metaphor of Dol-jabi, this short film explores how society presents predetermined paths under the guise of free choice.",
    description:
      "Hexagonal human, an ideal measured through appearance, education, occupation, personality, family background, and assets, reflects Korea’s highly compressed development. The tendency to focus on limited social values is visible in Dol-jabi, an event for a child’s first birthday. During the celebration, several symbolic objects are placed in front of the child and the object the child picks is believed to hint at their future. The playful tradition becomes a structured ritual where society stages possibilities through the form of free choice.",
  },
  "lets-hug": {
    title: "Let's Hug",
    year: "2025",
    category: "Creative Coding",
    role: "Code, Experience Design",
    coverText: "dark",
    description:
      "‘Let’s Hug’ detects two human bodies, measures a contact value, and visualises this through particles as people embrace, using a webcam and p5.js. Technology could bring pure joy to people, make human connection visible, and create a sense of warmth. So let’s hug !",
  },
  "make-choice-fate": {
    title: "Make Choice Fate",
    year: "2025",
    category: "Graphic Design",
    role: "Concept, Visual System",
    description:
      "Are our choices shaped by determinism or free will? These are not opposing ideas, but rather interacting concepts on a continuum. Inspired by the linear texture and flexability of corrugated cardboard as a metaphor for life, I brutally crumpled it and then digitalised it. So, which do you think works better, ‘Choice make fate’ or ‘Fate make choice’?",
  },
  makuly: {
    title: "Makuly",
    year: "2024",
    category: "Branding",
    role: "Art Direction, Identity",
    description:
      "Wanna grab a Makgeolli? Makgeolli is a traditional Korean alcoholic beverage. MAKULY aims its casual drinking culture, as people often perceive makgeolli as ‘too heavy to drink’. MAKULY proposes 4 everyday drinking situations through imagined collaborations with various F&B brands.",
  },
};

/* ───────────────────────────── Embeds ────────────────────────────────────
 * Extra media (YouTube videos, interactive sites, …) prepended BEFORE the
 * folder's image/video files on a project's detail page. Keyed by slug.
 */
const EMBEDS: Record<string, MediaItem[]> = {
  "what-could-you-be": [
    {
      type: "embed",
      src: "https://www.youtube.com/embed/YGQdBOdiH3Q?autoplay=1&mute=1&playsinline=1&rel=0",
      ratio: 16 / 9,
      title: "What Could You Be — film",
    },
  ],
  "make-choice-fate": [],
  "lets-hug": [
    {
      type: "native",
      src: "lets-hug",
      title: "Let's Hug — interactive",
    },
  ],
  makuly: [
    {
      type: "native",
      src: "makuly-model",
      title: "Makuly — 3D model",
    },
  ],
};

/**
 * INSERTS — media items spliced into the file list AFTER a given zero-based index.
 * E.g. { afterIndex: 0, item: ... } inserts between the 1st and 2nd file.
 */
const INSERTS: Record<string, { afterIndex: number; item: MediaItem }[]> = {
  "make-choice-fate": [
    {
      afterIndex: 0,
      item: { type: "native", src: "make-choice-fate", title: "Make Choice Fate — interactive" },
    },
  ],
};

const COVERS: Record<string, MediaItem> = {
  makuly: { type: "native", src: "makuly-thumbnail", title: "Makuly — 3D bottles" },
};

/** Homepage order. Slugs not listed here are appended alphabetically. */
const ORDER = ["what-could-you-be", "lets-hug", "make-choice-fate", "makuly"];

function buildProjects(): Project[] {
  const slugs = Object.keys(MANIFEST);
  const ordered = [
    ...ORDER.filter((s) => slugs.includes(s)),
    ...slugs.filter((s) => !ORDER.includes(s)).sort(),
  ];

  return ordered.map((slug) => {
    const entry = MANIFEST[slug];
    const meta = META[slug];
    const cover = COVERS[slug] ?? entry.thumbnail ?? entry.media[0];

    const info: InfoRow[] = [];
    if (meta?.role) info.push({ label: "Role", value: meta.role });

    return {
      slug,
      title: meta?.title ?? slug,
      year: meta?.year ?? "",
      category: meta?.category ?? "",
      description: meta?.description ?? "",
      feedDescription: meta?.feedDescription,
      info,
      coverText: meta?.coverText,
      cover,
      media: (() => {
        const base = [...(EMBEDS[slug] ?? []), ...entry.media];
        const ins = INSERTS[slug];
        if (!ins) return base;
        // Insert in reverse order so indices stay stable
        const out = [...base];
        [...ins].reverse().forEach(({ afterIndex, item }) => {
          out.splice(afterIndex + 1, 0, item);
        });
        return out;
      })(),
      process: entry.process ?? [],
    };
  });
}

export const projects: Project[] = buildProjects();

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
