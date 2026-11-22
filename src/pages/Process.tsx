import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../data/projects";
import ArrowLeft from "../components/ArrowLeft";
import { useLightbox } from "../components/Lightbox";

export default function Process() {
  const { slug } = useParams();
  const project = slug ? getProject(slug) : undefined;
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
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
    setReady(false);
    setPaused(false);
    const track = trackRef.current;
    if (!track || images.length < 2) return;

    // Cancel any previous animation (e.g. on slug change)
    animRef.current?.cancel();
    animRef.current = null;

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
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
      setReady(true);
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
      if (img.complete) {
        onLoad();
      } else {
        img.addEventListener("load",  onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
      }
    });

    return () => {
      cancelled = true;
      firstSetImgs.forEach((img) => {
        img.removeEventListener("load", onLoad);
        img.removeEventListener("error", onLoad);
      });
      animRef.current?.cancel();
      animRef.current = null;
    };
  }, [images, duration]);

  const togglePlayback = () => {
    const animation = animRef.current;
    if (!animation) return;
    if (paused) animation.play();
    else animation.pause();
    setPaused(!paused);
  };

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
        <Link
          to={`/${project.slug}`}
          className="nav-btn page-back-arrow"
          aria-label={`Back to ${project.title}`}
        >
          <ArrowLeft />
        </Link>
        <h1 className="process-title">
          <Link to={`/${project.slug}`} className="process-back">{project.title}</Link>
        </h1>
        {images.length > 1 && (
          <div className="process-controls" role="group" aria-label="Process playback">
            <button
              type="button"
              className="nav-btn"
              aria-label={paused ? "Play" : "Pause"}
              title={paused ? "Play" : "Pause"}
              disabled={!ready}
              onClick={togglePlayback}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={paused ? "M7 4l13 8-13 8z" : "M7 4h3v16H7z M14 4h3v16h-3z"} />
              </svg>
            </button>
            <button
              type="button"
              className="nav-btn process-speed"
              aria-label="Hold for 4× speed"
              title="Hold for 4× speed"
              disabled={!ready || paused}
              onPointerDown={() => setRate(4)}
              onPointerUp={() => setRate(1)}
              onPointerLeave={() => setRate(1)}
              onPointerCancel={() => setRate(1)}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") setRate(4);
              }}
              onKeyUp={() => setRate(1)}
              onBlur={() => setRate(1)}
              onContextMenu={(event) => event.preventDefault()}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 5l8 7-8 7V5z M13 5l8 7-8 7V5z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {images.length === 0 ? (
        <div className="process-empty">No process images yet.</div>
      ) : (
        <>
          <div className="process" aria-label={`${project.title} — process`}>
            {/* ref is on the track; no --marquee-duration needed (WAAPI drives it) */}
            <div className={images.length === 1 ? "process-track process-track--single" : "process-track"} ref={trackRef}>
              {(images.length === 1 ? [0] : [0, 1]).map((set) =>
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

        </>
      )}
    </main>
  );
}
