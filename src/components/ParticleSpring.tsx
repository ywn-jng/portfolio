import { useLayoutEffect, useRef, useState } from "react";

export type TimelineEntry = {
  category: "experience" | "education" | "exhibition";
  name: string;
  url: string;
  detail: string;
  date: string;
};

const turns = 12;
const dotCount = turns * 154;
const segmentCount = dotCount * 3;
const fullTurn = Math.PI * 2;
const rotationPeriod = 42_000;
const cameraTilt = 8 * Math.PI / 180;
const cameraSin = Math.sin(cameraTilt);
const cameraCos = Math.cos(cameraTilt);
const springRadius = 0.36;
const categories = [
  ["experience", "Work"],
  ["education", "Study"],
  ["exhibition", "Exhibit"],
] as const;
// Vary the spacing and depth, with longer arms that sweep past both edges.
const labelLayout: { rows: number; turn: number; radius?: number; outside?: boolean }[] = [
  { rows: 4.4, turn: 0.22, outside: true },
  { rows: 5.7, turn: 0.69, outside: true },
  { rows: 4.1, turn: 0.40, outside: true },
  { rows: 5.6, turn: 0.90, radius: 0.58 },
  { rows: 4.1, turn: 0.53, outside: true },
  { rows: 5.2, turn: 0.08, radius: 0.43 },
  { rows: 4.4, turn: 0.29, outside: true },
  { rows: 5.4, turn: 0.63, radius: 0.47 },
  { rows: 4.0, turn: 0.81, outside: true },
  { rows: 4.9, turn: 0.35, radius: 0.62 },
  { rows: 5.5, turn: 0.97, outside: true },
  { rows: 3.8, turn: 0.76, outside: true },
];

const helix = Array.from({ length: segmentCount + 1 }, (_, index) => {
  const progress = index / segmentCount;
  const angle = progress * turns * fullTurn - Math.PI / 2;
  return {
    x: Math.cos(angle),
    height: progress - 0.5,
    z: Math.sin(angle),
  };
});

type Connector = {
  item: HTMLLIElement;
  sample: number;
  labelX: number;
  labelY: number;
  armX: number;
  armY: number;
  armZ: number;
};

export default function ParticleSpring({ entries }: { entries: TimelineEntry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLOListElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<TimelineEntry["category"] | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const labels = labelsRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !labels || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sampleX = new Float64Array(helix.length);
    const sampleY = new Float64Array(helix.length);
    const distance = new Float64Array(helix.length);
    const items = [...labels.querySelectorAll("li")];
    let width = 0;
    let height = 0;
    let radius = 0;
    let phase = 0;
    let frame = 0;
    let connectors: Connector[] = [];
    let intervals = [0, segmentCount];

    const draw = () => {
      if (!width || !height) return;
      const cos = Math.cos(phase);
      const sin = Math.sin(phase);
      const axisLength = height * 0.92;

      for (let index = 0; index <= segmentCount; index += 1) {
        const point = helix[index];
        const x = (point.x * cos - point.z * sin) * radius;
        const z = (point.z * cos + point.x * sin) * radius;
        sampleX[index] = width / 2 + x;
        sampleY[index] = height / 2 + point.height * axisLength + z * cameraSin;
        if (index) {
          const dx = sampleX[index] - sampleX[index - 1];
          const dy = sampleY[index] - sampleY[index - 1];
          distance[index] = distance[index - 1] + Math.sqrt(dx * dx + dy * dy);
        }
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(255, 255, 255, 0.66)";
      context.beginPath();
      const spacing = distance[segmentCount] / dotCount;
      const size = 0.54;

      // Resample between fixed attachment points, so the spacing stays even
      // on screen and every connector still follows the same point in 3D.
      context.moveTo(sampleX[0] + size, sampleY[0]);
      context.arc(sampleX[0], sampleY[0], size, 0, fullTurn);
      for (let index = 1; index < intervals.length; index += 1) {
        const first = intervals[index - 1];
        const last = intervals[index];
        const length = distance[last] - distance[first];
        const steps = Math.max(1, Math.round(length / spacing));
        let segment = first + 1;
        for (let dot = 1; dot <= steps; dot += 1) {
          const target = distance[first] + length * dot / steps;
          while (segment < last && distance[segment] < target) segment += 1;
          const before = segment - 1;
          const amount = (target - distance[before]) / (distance[segment] - distance[before]);
          const x = sampleX[before] + (sampleX[segment] - sampleX[before]) * amount;
          const y = sampleY[before] + (sampleY[segment] - sampleY[before]) * amount;
          context.moveTo(x + size, y);
          context.arc(x, y, size, 0, fullTurn);
        }
      }
      context.fill();

      context.strokeStyle = "rgba(255, 255, 255, 0.46)";
      context.lineWidth = 0.65;
      context.beginPath();
      for (const { item, sample, labelX, labelY, armX, armY, armZ } of connectors) {
        // Rotate the 3D offset by the same angle as the spring. Projecting it
        // changes its screen length without changing its length in space.
        const endX = sampleX[sample] + armX * cos - armZ * sin;
        const depth = armX * sin + armZ * cos;
        const endY = sampleY[sample] + armY * cameraCos + depth * cameraSin;
        item.style.translate = `${endX - labelX}px ${endY - labelY}px`;
        context.moveTo(sampleX[sample], sampleY[sample]);
        context.lineTo(endX, endY);
      }
      context.stroke();
    };

    const layout = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;

      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      connectors = [];

      for (const item of items) item.style.translate = "";
      const measured = items.map((item, index) => ({
        item,
        box: item.getBoundingClientRect(),
        title: item.querySelector("a")?.getClientRects()[0],
        placement: labelLayout[index % labelLayout.length],
      }));
      const outsideWidths = measured.filter(({ placement }) => placement.outside).map(({ box }) => box.width);
      const outsideClearance = outsideWidths.length
        ? width / 2 - Math.min(...outsideWidths) - 18
        : width * springRadius;
      // On narrow screens, leave enough room for at least one complete label beyond the coil.
      radius = Math.min(width * springRadius, Math.max(width * 0.22, outsideClearance));

      for (const { item, box, title, placement } of measured) {
        if (!title) continue;
        const labelY = title.top - bounds.top - 6;
        const progress = (labelY / height - 0.04) / 0.92;
        const labelAngle = placement.turn * fullTurn - Math.PI / 2;
        const nearestTurn = Math.round(progress * turns - placement.turn);
        const anchorProgress = (nearestTurn + placement.turn) / turns;
        const sample = Math.max(1, Math.min(segmentCount - 1, Math.round(anchorProgress * segmentCount)));
        const point = helix[sample];
        const safeRadius = Math.max(0, (width - box.width) / 2 - 8);
        const targetRadius = placement.outside
          ? radius + box.width / 2 + Math.min(34, width * 0.04)
          : radius * (placement.radius ?? 1);
        const labelRadius = Math.min(safeRadius, targetRadius);
        const verticalOffset = (progress - 0.5 - point.height) * height * 0.92;

        connectors.push({
          item,
          sample,
          labelX: box.left + box.width / 2 - bounds.left,
          labelY,
          armX: Math.cos(labelAngle) * labelRadius - point.x * radius,
          armY: verticalOffset / cameraCos,
          armZ: Math.sin(labelAngle) * labelRadius - point.z * radius,
        });
      }
      intervals = [...new Set([0, ...connectors.map(({ sample }) => sample), segmentCount])].sort((a, b) => a - b);
      draw();
    };

    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (reducedMotion.matches) return;

      const startTime = performance.now() - phase / fullTurn * rotationPeriod;
      const animate = (time: number) => {
        phase = ((time - startTime) % rotationPeriod) / rotationPeriod * fullTurn;
        draw();
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    };

    layout();
    updateMotion();
    reducedMotion.addEventListener("change", updateMotion);
    const observer = new ResizeObserver(layout);
    observer.observe(labels);
    for (const item of labels.children) observer.observe(item);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", updateMotion);
      cancelAnimationFrame(frame);
    };
  }, []);

  const gridTemplateRows = entries.map((_, index) =>
    `minmax(calc(${labelLayout[index % labelLayout.length].rows} * var(--fs-base)), auto)`
  ).join(" ");

  return (
    <section
      className="about-spring"
      data-filtered={selectedCategory !== null}
      aria-label="Career, education and exhibitions"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <ol ref={labelsRef} className="about-timeline" style={{ gridTemplateRows }}>
        {entries.map(({ name, url, detail, date, category }) => (
          <li
            key={name}
            data-category={category}
            data-dimmed={selectedCategory !== null && selectedCategory !== category}
          >
            <a target="_blank" rel="noopener noreferrer" className="about-credit-name" href={url}>{name}</a>
            <div><em>{detail}</em></div>
            <div>{date}</div>
          </li>
        ))}
      </ol>
      <div className="about-categories" role="group" aria-label="Highlight a category">
        {categories.map(([category, label]) => (
          <button
            key={category}
            type="button"
            aria-pressed={selectedCategory === category}
            onClick={() => setSelectedCategory((current) => current === category ? null : category)}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
