import { lazy, Suspense, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { MediaItem } from "../data/projects";
import { useLightbox } from "./Lightbox";

const NativeComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "make-choice-fate": lazy(() => import("./MakeChoiceFate")),
  "lets-hug": lazy(() => import("./LetsHug")),
  "makuly-model": lazy(() => import("./MakulyModel")),
};

type Props = {
  item: MediaItem;
  /** "cover" fills a fixed-height frame (feed); "flow" keeps natural height (detail) */
  fit?: "cover" | "flow";
  priority?: boolean;
  soundToggle?: boolean;
  /** when true, images open in the lightbox on click */
  zoomable?: boolean;
};

/**
 * Renders an image, a video, an embed (iframe), or a native component from a MediaItem.
 * Videos autoplay muted + looped (silent feed behaviour, like the references).
 * Embeds carry their own behaviour in the URL (e.g. YouTube ?autoplay=1).
 */
export default function Media({
  item,
  fit = "flow",
  priority = false,
  zoomable = false,
  soundToggle = false,
}: Props) {
  const { open } = useLightbox();
  const style =
    fit === "flow" && item.ratio
      ? { aspectRatio: String(item.ratio) }
      : undefined;

  if (item.type === "native") {
    const Comp = NativeComponents[item.src];
    if (!Comp) return null;
    return (
      <Suspense fallback={null}>
        <Comp />
      </Suspense>
    );
  }

  if (item.type === "embed") {
    // A file-based preview cannot send YouTube a valid web referrer.
    if (item.watchUrl && window.location.protocol === "file:") {
      return (
        <a className="embed-poster" href={item.watchUrl} target="_blank" rel="noopener noreferrer">
          <img src={item.poster} alt={item.title} style={style} />
        </a>
      );
    }

    return (
      <iframe
        className={`embed${item.interactive ? " embed-interactive" : ""}`}
        src={item.src}
        title={item.title ?? "Embedded media"}
        style={style}
        loading={item.interactive || priority ? "eager" : "lazy"}
        referrerPolicy="strict-origin-when-cross-origin"
        allow={item.interactive
          ? "camera; microphone; autoplay; fullscreen; encrypted-media; picture-in-picture"
          : "autoplay; fullscreen; encrypted-media; picture-in-picture"}
        allowFullScreen
      />
    );
  }

  if (item.type === "video") {
    return (
      <AutoplayVideo
        src={item.src}
        poster={item.poster}
        motionFallback={item.motionFallback}
        style={style}
        priority={priority}
        soundToggle={soundToggle}
      />
    );
  }

  return (
    <img
      src={item.src}
      alt={item.alt ?? ""}
      style={style}
      className={zoomable ? "zoomable" : undefined}
      onClick={zoomable ? () => open(item.src, item.alt) : undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function AutoplayVideo({
  src,
  poster,
  motionFallback,
  style,
  priority,
  soundToggle,
}: {
  src: string;
  poster?: string;
  motionFallback?: string;
  style?: CSSProperties;
  priority: boolean;
  soundToggle: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useLayoutEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const play = () => {
      void video.play().catch(() => {});
    };

    play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    const visibility = motionFallback ? new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play();
    }) : null;
    visibility?.observe(video);

    return () => {
      visibility?.disconnect();
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
    };
  }, [src, motionFallback]);

  const video = (
    <video
      ref={ref}
      src={src}
      poster={poster}
      style={style}
      autoPlay
      muted={!soundOn}
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      preload={priority ? "auto" : "metadata"}
      onPlaying={motionFallback ? () => setPlaying(true) : undefined}
      onPause={motionFallback ? () => setPlaying(false) : undefined}
    />
  );
  const playback = motionFallback ? (
    <span className="motion-cover" data-playing={playing}>
      <img src={motionFallback} alt="" loading={priority ? "eager" : "lazy"} />
      {video}
    </span>
  ) : video;

  if (soundToggle) {
    const toggleSound = () => {
      const element = ref.current;
      if (!element) return;
      const next = element.muted;
      element.muted = !next;
      setSoundOn(next);
      if (next && element.paused) void element.play().catch(() => {});
    };

    return (
      <div className="project-sound-video">
        {playback}
        <button
          type="button"
          className="project-sound-toggle"
          aria-label="Sound"
          aria-pressed={soundOn}
          title={soundOn ? "Mute" : "Unmute"}
          onClick={toggleSound}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4z" />
            {soundOn
              ? <path d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" />
              : <path d="m16 10 5 5m0-5-5 5" />}
          </svg>
        </button>
      </div>
    );
  }
  return playback;
}
