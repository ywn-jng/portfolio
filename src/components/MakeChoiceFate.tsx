import { useCallback, useEffect, useRef, useState } from "react";
import ProjectMediaButton from "./ProjectMediaButton";

type Glyph =
  | { id: number; kind: "letter"; char: string; h: number; style: React.CSSProperties }
  | { id: number; kind: "space"; style: React.CSSProperties }
  | { id: number; kind: "newline"; style: React.CSSProperties };

const MIN_H = 15;
const MAX_H = 80;

const IMG_BASE = "/media/make-choice-fate/alphabet/";

function chaosStyle(kind: "letter" | "space" | "newline"): React.CSSProperties {
  if (kind === "newline") {
    return { marginTop: `${(Math.random() - 0.5) * 6}px` };
  }
  const rot = (Math.random() - 0.5) * 88;
  const sc = kind === "letter" ? 0.52 + Math.random() * 1.05 : 1;
  const ml = (Math.random() - 0.5) * 14 - (kind === "letter" ? 1 : 0);
  const mt = (Math.random() - 0.5) * 12;
  const z = 1 + Math.floor(Math.random() * 220);

  const base: React.CSSProperties = {
    position: "relative",
    zIndex: z,
    marginLeft: `${ml}px`,
    marginTop: `${mt}px`,
  };

  if (kind === "space") {
    return {
      ...base,
      marginRight: `${(Math.random() - 0.5) * 6}px`,
      transform: `translateY(${(Math.random() - 0.5) * 8}px) rotate(${(Math.random() - 0.5) * 18}deg)`,
      transformOrigin: "50% 50%",
    };
  }

  return {
    ...base,
    transform: `rotate(${rot}deg) scale(${sc})`,
    transformOrigin: "50% 88%",
  };
}

export default function MakeChoiceFate() {
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [focused, setFocused] = useState(false);
  const idRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const hasContent = glyphs.length > 0;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      setGlyphs((g) => (g.length ? g.slice(0, -1) : g));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      setGlyphs((g) => [
        ...g,
        { id: ++idRef.current, kind: "newline", style: chaosStyle("newline") },
      ]);
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      const w = 2 + Math.random() * 16;
      setGlyphs((g) => [
        ...g,
        {
          id: ++idRef.current,
          kind: "space",
          style: { ...chaosStyle("space"), width: `${w}px` },
        },
      ]);
      return;
    }

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      const h = MIN_H + Math.random() * (MAX_H - MIN_H);
      setGlyphs((g) => [
        ...g,
        {
          id: ++idRef.current,
          kind: "letter",
          char: e.key.toLowerCase(),
          h,
          style: chaosStyle("letter"),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);
    el.addEventListener("keydown", handleKey);

    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
      el.removeEventListener("keydown", handleKey);
    };
  }, [handleKey]);

  // Export the canvas composition as a transparent PNG
  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas || glyphs.length === 0) return;

    const { default: html2canvas } = await import("html2canvas");
    const rendered = await html2canvas(canvas, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    const url = rendered.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "make-choice-fate.png";
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className="mcf"
      tabIndex={0}
      role="textbox"
      aria-label="Type to create a composition"
      onClick={() => containerRef.current?.focus()}
    >
      <div className="mcf-canvas" ref={canvasRef}>
        {glyphs.map((g) => {
          if (g.kind === "newline") {
            return <div key={g.id} className="mcf-newline" style={g.style} />;
          }
          if (g.kind === "space") {
            return <span key={g.id} className="mcf-space" style={g.style} />;
          }
          return (
            <span key={g.id} className="mcf-letter" style={{ ...g.style, height: `${g.h}px` }}>
              <img
                src={`${IMG_BASE}${g.char}.webp`}
                alt={g.char}
                style={{ height: `${g.h}px` }}
                draggable={false}
              />
            </span>
          );
        })}

        {/* Caret */}
        <span className={`mcf-caret${focused ? "" : " mcf-caret--idle"}`} />

        {/* Hint */}
        {!hasContent && (
          <span className="mcf-hint">type here</span>
        )}
      </div>

      {/* Download button */}
      <ProjectMediaButton
        icon="download"
        aria-label="Save as PNG"
        title="Save as PNG"
        onClick={(e) => {
          e.stopPropagation();
          handleExport();
        }}
      />
    </div>
  );
}
