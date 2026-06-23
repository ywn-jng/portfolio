import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../data/projects";
import { useLightbox } from "../components/Lightbox";

export default function Process() {
  const { slug } = useParams();
  const project = slug ? getProject(slug) : undefined;
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const { open } = useLightbox();

  useEffect(() => {
    if (project) document.title = `${project.title} — Process`;
    window.scrollTo(0, 0);
  }, [project]);

  const images = project?.process ?? [];
  // Per-image duration (seconds) — halved from original for 2× base speed
  const duration = Math.max(22, images.length * 7);

  // Start the marquee via WAAPI once all images in the first set have loaded.
  // Using exact pixel measurements (not %) guarantees a truly seamless loop —
  // no jump at the boundary regardless of image sizes or load timing.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || images.length === 0) return;

    // Cancel any previous animation (e.g. on slug change)
    animRef.current?.cancel();
    animRef.current = null;

    const start = () => {
      // Respect the OS reduced-motion preference — skip auto-scroll
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // scrollWidth = both identical sets; half = exactly one set
      const setWidth = track.scrollWidth / 2;
      if (setWidth === 0) return;

      animRef.current = track.animate(
        [
          { transform: "translateX(0px)" },
          { transform: `translateX(-${setWidth}px)` },
        ],
        {
          duration: duration * 1000,
          iterations: Infinity,
          easing: "linear",
        }
      );
    };

    // Collect the first-set <img> elements and wait for all to load
    const allImgs = Array.from(
      track.querySelectorAll<HTMLImageElement>("img")
    );
    const firstSetImgs = allImgs.slice(0, images.length);

    if (firstSetImgs.length === 0) { start(); return; }

    let pending = firstSetImgs.length;
    const onLoad = () => { if (--pending === 0) start(); };

    firstSetImgs.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        onLoad();
      } else {
        img.addEventListener("load",  onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
      }
    });

    return () => {
      animRef.current?.cancel();
      animRef.current = null;
    };
  }, [images, duration]);

  // Set playbackRate on the live WAAPI animation
  const setRate = (rate: number) => {
    if (animRef.current) animRef.current.playbackRate = rate;
  };

  if (!project) {
    return (
      <main className="process-page">
        <div className="process-head">
          <Link to="/" className="process-back">
            Index
          </Link>
        </div>
        <div className="process-empty">Not found</div>
      </main>
    );
  }

  return (
    <main className="process-page">
      <div className="process-head">
        <Link to={`/${project.slug}`} className="process-back">
          <span className="process-back-arrow" aria-hidden="true">←</span>
          {project.title}
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="process-empty">No process images yet.</div>
      ) : (
        <>
          <div className="process" aria-label={`${project.title} — process`}>
            {/* ref is on the track; no --marquee-duration needed (WAAPI drives it) */}
            <div className="process-track" ref={trackRef}>
              {[0, 1].map((set) =>
                images.map((item, i) => (
                  <div
                    className="process-item"
                    key={`${set}-${i}`}
                    aria-hidden={set === 1 ? true : undefined}
                  >
                    <img
                      className="zoomable"
                      src={item.src}
                      alt={
                        set === 0
                          ? (item.alt ?? `${project.title} process ${i + 1}`)
                          : ""
                      }
                      onClick={() => open(item.src, item.alt)}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            className="process-speed"
            aria-label="Hold for 4× speed"
            title="Hold for 4× speed"
            onPointerDown={() => setRate(4)}
            onPointerUp={() => setRate(1)}
            onPointerLeave={() => setRate(1)}
            onPointerCancel={() => setRate(1)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5l8 7-8 7V5z M13 5l8 7-8 7V5z" />
            </svg>
          </button>
        </>
      )}
    </main>
  );
}
