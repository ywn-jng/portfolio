import { useRef, useState } from "react";
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const previousText = useRef("");

  const updateComposition = (input: string) => {
    const next = input.toLowerCase().replace(/[^a-z \n]/g, "");
    const previous = previousText.current;
    if (next === previous) return;
    previousText.current = next;

    let start = 0;
    while (start < next.length && next[start] === previous[start]) start++;
    let end = 0;
    while (end < Math.min(previous.length, next.length) - start &&
           next[next.length - 1 - end] === previous[previous.length - 1 - end]) end++;

    const added = Array.from(next.slice(start, next.length - end), (char): Glyph => {
      const id = ++idRef.current;
      if (char === "\n") return { id, kind: "newline", style: chaosStyle("newline") };
      if (char === " ") {
        return {
          id,
          kind: "space",
          style: { ...chaosStyle("space"), width: `${2 + Math.random() * 16}px` },
        };
      }
      return { id, kind: "letter", char, h: MIN_H + Math.random() * (MAX_H - MIN_H), style: chaosStyle("letter") };
    });
    setGlyphs((current) => [
      ...current.slice(0, start),
      ...added,
      ...current.slice(previous.length - end),
    ]);
  };

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
    <div className="mcf" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <textarea
        ref={inputRef}
        className="mcf-input"
        aria-label="Type to create a composition"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => updateComposition(event.currentTarget.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div className="mcf-canvas" ref={canvasRef} aria-hidden="true">
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
        {glyphs.length === 0 && (
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
