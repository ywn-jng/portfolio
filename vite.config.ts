import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
// @ts-expect-error - plain .mjs helper, no types needed
import { scanMedia } from "./scripts/scan-media.mjs";

const MEDIA_DIR = resolve(__dirname, "public/media");

/**
 * Regenerates src/data/media-manifest.json whenever files inside
 * /public/media are added, removed or renamed during dev — so swapping a
 * thumbnail (e.g. .mov → .gif) is picked up without restarting the server.
 */
function mediaManifestPlugin(): Plugin {
  const rescan = (file: string) => {
    if (!file.startsWith(MEDIA_DIR)) return;
    try {
      scanMedia({ silent: true });
    } catch (err) {
      console.error("[scan-media] failed:", err);
    }
  };

  return {
    name: "media-manifest-watch",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(MEDIA_DIR);
      server.watcher.on("add", rescan);
      server.watcher.on("unlink", rescan);
      server.watcher.on("change", rescan);
    },
  };
}

export default defineConfig({
  plugins: [react(), mediaManifestPlugin()],
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
});
