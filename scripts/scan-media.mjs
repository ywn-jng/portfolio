/**
 * Scans /public/media and generates src/data/media-manifest.json.
 *
 * Each subfolder of /public/media is treated as one project (folder name = slug).
 * Inside a folder:
 *   - thumbnail.*          → homepage preview (image or video)
 *   - 01.*, 02.*, 03.* …   → detail-page media, shown in numerical order
 *
 * File type (image vs video) is inferred from the extension.
 * Run automatically via `predev` / `prebuild` and on file changes during dev
 * (see the watch plugin in vite.config.ts), or manually with `npm run scan`.
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MEDIA_DIR = join(ROOT, "public", "media");
const OUT_FILE = join(ROOT, "src", "data", "media-manifest.json");

const VIDEO_EXT = new Set(["mp4", "mov", "webm", "m4v", "ogv"]);
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg"]);

const typeOf = (file) => {
  const ext = extname(file).slice(1).toLowerCase();
  if (VIDEO_EXT.has(ext)) return "video";
  if (IMAGE_EXT.has(ext)) return "image";
  return null;
};

const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

/**
 * Build the manifest and write it to disk.
 * @returns {{ slug: string, thumbnail: string, media: number }[]} summary
 */
export function scanMedia({ silent = false } = {}) {
  const manifest = {};

  const folders = readdirSync(MEDIA_DIR)
    .filter((name) => !name.startsWith(".") && isDir(join(MEDIA_DIR, name)))
    .sort();

  for (const slug of folders) {
    const dir = join(MEDIA_DIR, slug);
    const files = readdirSync(dir).filter((f) => !f.startsWith("."));

    let thumbnail = null;
    const numbered = [];

    for (const file of files) {
      const type = typeOf(file);
      if (!type) continue;

      const name = basename(file, extname(file)).toLowerCase();
      const src = `/media/${slug}/${file}`;

      if (name === "thumbnail") {
        thumbnail = { type, src };
        continue;
      }

      const num = parseInt(name, 10);
      if (!Number.isNaN(num)) {
        numbered.push({ order: num, type, src });
      }
    }

    numbered.sort((a, b) => a.order - b.order);

    // Optional /process/ subfolder — images of the project's development,
    // shown as the horizontal process gallery (numerical order).
    const processDir = join(dir, "process");
    const process = [];
    if (isDir(processDir)) {
      const pfiles = readdirSync(processDir).filter((f) => !f.startsWith("."));
      const pnumbered = [];
      for (const file of pfiles) {
        if (typeOf(file) !== "image") continue;
        const name = basename(file, extname(file)).toLowerCase();
        const num = parseInt(name, 10);
        pnumbered.push({
          order: Number.isNaN(num) ? Infinity : num,
          src: `/media/${slug}/process/${file}`,
        });
      }
      pnumbered.sort((a, b) => a.order - b.order);
      for (const { src } of pnumbered) process.push({ type: "image", src });
    }

    manifest[slug] = {
      thumbnail,
      media: numbered.map(({ type, src }) => ({ type, src })),
      process,
    };
  }

  writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n");

  const summary = Object.entries(manifest).map(([slug, data]) => ({
    slug,
    thumbnail: data.thumbnail ? data.thumbnail.type : "MISSING",
    media: data.media.length,
    process: data.process.length,
  }));

  if (!silent) {
    console.log(
      `[scan-media] wrote ${summary.length} project(s) → ${OUT_FILE}`
    );
    for (const s of summary) {
      console.log(
        `  • ${s.slug}: thumbnail=${s.thumbnail}, media=${s.media}, process=${s.process}`
      );
    }
  }

  return summary;
}

// Run directly (npm run scan / predev / prebuild)
if (import.meta.url === `file://${process.argv[1]}`) {
  scanMedia();
}
