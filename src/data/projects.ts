/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PROJECT DATA
 * ─────────────────────────────────────────────────────────────────────────
 *  The site is driven by the folders inside /public/media. Each folder is a
 *  project (folder name = slug) and contains:
 *      home.*               → optional homepage image or video
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
  motionFallback?: string;
  /** Direct viewing link for an embedded film. */
  watchUrl?: string;
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

type ProjectDescription = string | (string | { text: string; href: string } | { emphasis: string })[];

export type Project = {
  slug: string;
  title: string;
  status?: "ongoing";
  year: string;
  category: string;
  description: ProjectDescription;
  info?: InfoRow[];
  homeMedia?: MediaItem;
  /** Ordered, full-width media for the detail page */
  media: MediaItem[];
  /** Images from the project's /process/ folder (process gallery) */
  process: MediaItem[];
};

type ManifestEntry = {
  homeMedia: MediaItem | null;
  media: MediaItem[];
  process?: MediaItem[];
};

const MANIFEST = manifestJson as unknown as Record<string, ManifestEntry>;

export const SITE = {
  name: "Yewon Jang",
  role: "Computational · Visual · AI",
  email: "yewonjang.won@gmail.com",
  instagram: {
    handle: "@yewonnjang",
    url: "https://www.instagram.com/yewonnjang/",
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
  status?: "ongoing";
  year: string;
  category: string;
  role?: string;
  description: ProjectDescription;
};

const META: Record<string, Meta> = {
  "you-look-the-same": {
    title: "You Look the Same",
    status: "ongoing",
    category: "",
    year: "",
    description: [
      "I found this 200-year-old book in an antique shop. It celebrates the unchanging nature of the natural world while criticising humans for constantly changing. In that season, a friend who I hadn’t seen in years said to me, ",
      { emphasis: "“You look the same,”" },
      " as a compliment.\n\nWhy do we perceive change as something to be avoided? We must be hatched or go bad.",
    ],
  },
  recreatures: {
    title: "Recreatures",
    category: "3D Title Design",
    year: "2026",
    description: [
      "I was commissioned by a filmmaker at STINK to create a 3D title for a film produced for a jewellery brand, ",
      { text: "kuku laboratory", href: "https://www.instagram.com/kuku.laboratory/" },
      ". I aimed to create a new species yet to be discovered in the deep sea.",
    ],
  },
  "what-could-you-be": {
    title: "What Could You Be",
    year: "2026",
    category: "Moving Image",
    role: "Direction, Edit",
    description: `Starting this project with the personal interest in multiverse, I end up using it as a framework for asking how imagining other possible lives might change the way we relate to other people, rather than treating it as scientific hypothesis. Growing up in Korea, I often felt that success was presented through surprisingly narrow definitions. I brought Dol-jabi as a metaphor, which is a first-birthday ritual where a baby chooses from symbolic objects that predict their future. Although this tradition appears to be based on individual choice, the possibilities have already been selected by society. What does it do for us to think about possible worlds that might or might not exist?

To watch full version (5min), please email me for the link.`,
  },
  "lets-hug": {
    title: "Let's Hug",
    year: "2025",
    category: "Creative Coding",
    role: "Code, Experience Design",
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
      src: "https://www.youtube.com/embed/egIzv8ebT4M?autoplay=1&mute=1&playsinline=1&rel=0",
      ratio: 16 / 9,
      poster: "https://i.ytimg.com/vi/egIzv8ebT4M/hqdefault.jpg",
      watchUrl: "https://www.youtube.com/watch?v=egIzv8ebT4M",
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

/** Homepage order. Slugs not listed here are appended alphabetically. */
const ORDER = ["what-could-you-be", "lets-hug", "makuly", "you-look-the-same", "recreatures", "make-choice-fate"];

function buildProjects(): Project[] {
  const slugs = Object.keys(MANIFEST);
  const ordered = [
    ...ORDER.filter((s) => slugs.includes(s)),
    ...slugs.filter((s) => !ORDER.includes(s)).sort(),
  ];

  return ordered.flatMap((slug) => {
    const entry = MANIFEST[slug];
    const meta = META[slug];
    if (!entry.homeMedia && !entry.media.length) return [];

    const firstImage = entry.media.find(({ type }) => type === "image");
    const homeMedia = entry.homeMedia?.type === "video"
      ? { ...entry.homeMedia, poster: firstImage?.src }
      : entry.homeMedia ?? firstImage;

    const info: InfoRow[] = [];
    if (meta?.role) info.push({ label: "Role", value: meta.role });

    return [{
      slug,
      title: meta?.title ?? slug,
      status: meta?.status,
      year: meta?.year ?? "",
      category: meta?.category ?? "",
      description: meta?.description ?? "",
      info,
      homeMedia,
      media: (() => {
        const media = entry.media.map((item) => {
          if (item.src === "/media/recreatures/01.mp4") {
            return { ...item, motionFallback: "/media/recreatures/detail-fallback.webp" };
          }
          if (slug === "what-could-you-be" && item.type === "image") {
            return { ...item, ratio: 16 / 9 };
          }
          return item;
        });
        const base = [...(EMBEDS[slug] ?? []), ...media];
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
    }];
  });
}

export const projects: Project[] = buildProjects();

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
