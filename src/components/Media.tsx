import { lazy, Suspense, useEffect, useRef, type CSSProperties } from "react";
import type { MediaItem } from "../data/projects";
import { useLightbox } from "./Lightbox";

const NativeComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "make-choice-fate": lazy(() => import("./MakeChoiceFate")),
  "lets-hug": lazy(() => import("./LetsHug")),
  "makuly-model": lazy(() => import("./MakulyModel")),
  "makuly-thumbnail": lazy(() => import("./MakulyThumbnail")),
};

type Props = {
  item: MediaItem;
  /** "cover" fills a fixed-height frame (feed); "flow" keeps natural height (detail) */
  fit?: "cover" | "flow";
  priority?: boolean;
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
    return (
      <iframe
        className={`embed${item.interactive ? " embed-interactive" : ""}`}
        src={item.src}
        title={item.title ?? "Embedded media"}
        style={style}
        // Interactive embeds load eagerly; lazy iframes can stay blank until
        // scrolled near, which read as "empty space".
        loading={item.interactive ? "eager" : priority ? "eager" : "lazy"}
        // `camera; microphone` are required for webcam-based sketches
        // (e.g. ml5 / p5 pose tracking) and must be delegated to the iframe —
        // Safari in particular blocks getUserMedia in cross-origin frames
        // without this.
        allow="camera; microphone; autoplay; fullscreen; encrypted-media; gyroscope; accelerometer; picture-in-picture; clipboard-write; xr-spatial-tracking"
        allowFullScreen
      />
    );
  }

  if (item.type === "video") {
    return (
      <AutoplayVideo
        src={item.src}
        poster={item.poster}
        style={style}
        priority={priority}
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
  style,
  priority,
}: {
  src: string;
  poster?: string;
  style?: CSSProperties;
  priority: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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

    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      style={style}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      preload={priority ? "auto" : "metadata"}
    />
  );
}
