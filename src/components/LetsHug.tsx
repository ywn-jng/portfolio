import { useEffect, useRef, useState } from "react";
import p5 from "p5";

// ml5 is loaded from CDN — it doesn't have a clean ESM build
declare global {
  interface Window {
    ml5: any;
  }
}

function loadMl5(): Promise<void> {
  if (window.ml5) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/ml5@0.12.2/dist/ml5.min.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load ml5"));
    document.head.appendChild(s);
  });
}

const CONTACT_THRESHOLD = 32;
const MIN_PART_SCORE = 0.02;
const BODY_SAMPLE_STEPS = 12;
const TORSO_STEPS = 10;
const CONTACT_SPATIAL_CELL = 35;
const CONTACT_MERGE_DISTANCE = 4;
const MAX_CONTACT_POINTS = 1500;
const SMOOTHING_FACTOR = 0.15;
const MATCH_DISTANCE = 150;
const PARTICLE_LIMIT = 10000;
const PARTICLE_MIN_SIZE = 2.0;
const PARTICLE_MAX_SIZE = 4.0;
const PARTICLE_JITTER = 0.45;

const SKELETON_CONNECTIONS = [
  ["nose", "leftEye"], ["nose", "rightEye"],
  ["leftEye", "leftEar"], ["rightEye", "rightEar"],
  ["leftShoulder", "rightShoulder"],
  ["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"],
  ["leftShoulder", "leftHip"], ["rightShoulder", "rightHip"],
  ["leftHip", "rightHip"],
  ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"],
  ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"],
];

export default function LetsHug() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Export handler ref so the button can trigger it
  const exportRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    (async () => {
      try {
        await loadMl5();
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) return;

      const sketch = (p: p5) => {
        let video: any;
        let poseNet: any;
        let poses: any[] = [];
        let particles: any[] = [];
        let contactPoints: any[] = [];
        let contactArea = 0;
        const trackedPoses = new Map<number, any>();
        let nextPoseId = 0;

        const viewTransform = {
          scale: 1, offsetX: 0, offsetY: 0,
          drawWidth: 0, drawHeight: 0,
          sourceWidth: 640, sourceHeight: 480,
        };

        function projectPoint(point: any) {
          return {
            x: viewTransform.offsetX + (viewTransform.sourceWidth - point.x) * viewTransform.scale,
            y: viewTransform.offsetY + point.y * viewTransform.scale,
          };
        }

        function mapKeypoints(keypoints: any[]) {
          const map: any = {};
          for (const kp of keypoints) map[kp.part] = { x: kp.position.x, y: kp.position.y, score: kp.score };
          return map;
        }

        function getKeypointCenter(keypoints: any[]) {
          let sx = 0, sy = 0, c = 0;
          for (const kp of keypoints) {
            if (kp.score > MIN_PART_SCORE) { sx += kp.position.x; sy += kp.position.y; c++; }
          }
          return c ? { x: sx / c, y: sy / c } : { x: 0, y: 0 };
        }

        function buildSkeletonFromPose(pose: any) {
          const km = mapKeypoints(pose.keypoints);
          const skel: any[] = [];
          for (const [a, b] of SKELETON_CONNECTIONS) {
            const pa = km[a], pb = km[b];
            if (pa && pb && pa.score > MIN_PART_SCORE && pb.score > MIN_PART_SCORE)
              skel.push([{ score: pa.score, position: { x: pa.x, y: pa.y } }, { score: pb.score, position: { x: pb.x, y: pb.y } }]);
          }
          return skel;
        }

        function matchTrackedCenter(rawPose: any, usedIds: Set<number>) {
          const center = getKeypointCenter(rawPose.keypoints);
          let matchId: number | null = null;
          let bestDist = MATCH_DISTANCE;
          for (const [id, track] of trackedPoses.entries()) {
            if (usedIds.has(id) || !track.center) continue;
            const d = p.dist(center.x, center.y, track.center.x, track.center.y);
            if (d < bestDist) { bestDist = d; matchId = id; }
          }
          return matchId ?? nextPoseId++;
        }

        function applySmoothingToPose(rawPose: any, previous: any) {
          const smoothed = rawPose.keypoints.map((kp: any) => {
            const prev = previous?.keypoints?.[kp.part];
            const pos = prev
              ? { x: p.lerp(prev.x, kp.position.x, SMOOTHING_FACTOR), y: p.lerp(prev.y, kp.position.y, SMOOTHING_FACTOR) }
              : { x: kp.position.x, y: kp.position.y };
            return { ...kp, position: pos };
          });
          return { ...rawPose, keypoints: smoothed };
        }

        function smoothAndFormatPoses(detections: any[]) {
          const formatted: any[] = [];
          const usedIds = new Set<number>();
          const sorted = detections.sort((a: any, b: any) => b.pose.score - a.pose.score);
          for (const det of sorted) {
            const rawPose = det.pose;
            if (!rawPose?.keypoints) continue;
            const rawCenter = getKeypointCenter(rawPose.keypoints);
            let dup = false;
            for (const f of formatted) {
              const ec = getKeypointCenter(f.pose.keypoints);
              if (p.dist(rawCenter.x, rawCenter.y, ec.x, ec.y) < 50) { dup = true; break; }
            }
            if (dup) continue;
            const id = matchTrackedCenter(rawPose, usedIds);
            const prev = trackedPoses.get(id);
            const smoothed = applySmoothingToPose(rawPose, prev);
            const skeleton = buildSkeletonFromPose(smoothed);
            const km = mapKeypoints(smoothed.keypoints);
            const center = getKeypointCenter(smoothed.keypoints);
            trackedPoses.set(id, { keypoints: km, center, lastSeen: p.frameCount });
            usedIds.add(id);
            smoothed.skeleton = skeleton;
            formatted.push({ pose: smoothed, skeleton, id });
            if (formatted.length >= 2) break;
          }
          for (const [id, track] of trackedPoses.entries()) {
            if (track.lastSeen < p.frameCount - 30) trackedPoses.delete(id);
          }
          return formatted;
        }

        function shuffleInPlace(arr: any[]) {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }

        function isDistinctContact(points: any[], c: any, minD: number) {
          const lookback = Math.min(points.length, 40);
          for (let i = points.length - 1; i >= points.length - lookback; i--) {
            const e = points[i];
            if (Math.abs(c.x - e.x) + Math.abs(c.y - e.y) < minD) return false;
          }
          return true;
        }

        function buildSpatialHash(points: any[], cellSize: number) {
          const hash = new Map<string, any[]>();
          for (const pt of points) {
            const key = `${Math.floor(pt.x / cellSize)}-${Math.floor(pt.y / cellSize)}`;
            if (!hash.has(key)) hash.set(key, []);
            hash.get(key)!.push(pt);
          }
          return hash;
        }

        function getNeighborPoints(hash: Map<string, any[]>, point: any, cellSize: number) {
          const neighbors: any[] = [];
          const cx = Math.floor(point.x / cellSize), cy = Math.floor(point.y / cellSize);
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            const key = `${cx + dx}-${cy + dy}`;
            if (hash.has(key)) neighbors.push(...hash.get(key)!);
          }
          return neighbors;
        }

        function getKeypoint(pose: any, part: string) {
          return pose.keypoints.find((k: any) => k.part === part);
        }

        function lerpPoint(a: any, b: any, t: number) {
          return { x: p.lerp(a.x, b.x, t), y: p.lerp(a.y, b.y, t) };
        }

        function sampleTorso(pose: any) {
          const ls = getKeypoint(pose, "leftShoulder"), rs = getKeypoint(pose, "rightShoulder");
          const lh = getKeypoint(pose, "leftHip"), rh = getKeypoint(pose, "rightHip");
          if (!ls || !rs || !lh || !rh) return [];
          if (ls.score < MIN_PART_SCORE || rs.score < MIN_PART_SCORE || lh.score < MIN_PART_SCORE || rh.score < MIN_PART_SCORE) return [];
          const samples: any[] = [];
          for (let h = 0; h <= TORSO_STEPS; h++) {
            const t = h / TORSO_STEPS;
            const top = lerpPoint(ls.position, rs.position, t);
            const bottom = lerpPoint(lh.position, rh.position, t);
            for (let v = 0; v <= TORSO_STEPS; v++) {
              const vt = p.constrain((v / TORSO_STEPS) + p.random(-0.05, 0.05), 0, 1);
              const s = lerpPoint(top, bottom, vt);
              samples.push({ x: s.x + p.random(-2, 2), y: s.y + p.random(-2, 2), weight: 1.2 });
            }
          }
          return samples;
        }

        function buildBodyField(pose: any) {
          const samples: any[] = [];
          const skeleton = pose.skeleton || [];
          for (const [partA, partB] of skeleton) {
            if (partA.score < MIN_PART_SCORE || partB.score < MIN_PART_SCORE) continue;
            for (let step = 0; step <= BODY_SAMPLE_STEPS; step++) {
              const t = p.constrain((step / BODY_SAMPLE_STEPS) + p.random(-0.05, 0.05), 0, 1);
              samples.push({ x: p.lerp(partA.position.x, partB.position.x, t), y: p.lerp(partA.position.y, partB.position.y, t), weight: 1 });
            }
          }
          return samples.concat(sampleTorso(pose));
        }

        function calculateContactArea() {
          contactArea = 0;
          contactPoints = [];
          if (poses.length < 2) { particles.length = 0; return; }
          const samplesA = buildBodyField(poses[0].pose);
          const samplesB = buildBodyField(poses[1].pose);
          if (!samplesA.length || !samplesB.length) { particles.length = 0; return; }
          const hashB = buildSpatialHash(samplesB, CONTACT_SPATIAL_CELL);
          shuffleInPlace(samplesA);
          for (const sa of samplesA) {
            const neighbors = getNeighborPoints(hashB, sa, CONTACT_SPATIAL_CELL);
            for (const sb of neighbors) {
              const d = p.dist(sa.x, sa.y, sb.x, sb.y);
              if (d < CONTACT_THRESHOLD) {
                const mid = { x: (sa.x + sb.x) / 2 + p.random(-2, 2), y: (sa.y + sb.y) / 2 + p.random(-2, 2), weight: (sa.weight + sb.weight) / 2 };
                if (isDistinctContact(contactPoints, mid, CONTACT_MERGE_DISTANCE)) contactPoints.push(mid);
              }
            }
          }
          if (contactPoints.length > MAX_CONTACT_POINTS) { shuffleInPlace(contactPoints); contactPoints.length = MAX_CONTACT_POINTS; }
          contactArea = contactPoints.reduce((sum, pt) => sum + pt.weight, 0);
          if (contactPoints.length) emitContactParticles(contactPoints);
          else particles.length = 0;
        }

        function emitContactParticles(points: any[]) {
          const density = p.constrain(points.length / 1.5, 20, 150);
          for (const pt of points) {
            const spawns = Math.round(p.random(density * 0.8, density * 1.2));
            for (let j = 0; j < spawns; j++) {
              if (particles.length >= PARTICLE_LIMIT) particles.splice(0, particles.length - PARTICLE_LIMIT + 1);
              particles.push({
                x: pt.x + p.random(-3.5, 3.5), y: pt.y + p.random(-3.5, 3.5),
                vx: p.random(-0.15, 0.15), vy: p.random(-0.15, 0.15),
                size: p.random(PARTICLE_MIN_SIZE, PARTICLE_MAX_SIZE),
                life: p.random(25, 60), maxLife: p.random(25, 60),
                color: [255, 0, 0],
              });
            }
          }
        }

        // Export current particle state as transparent PNG
        exportRef.current = () => {
          const pg = p.createGraphics(p.width, p.height);
          pg.clear();
          pg.noStroke();
          pg.fill(0, 0, 0);
          for (const part of particles) {
            const lifeRatio = Math.max(part.life / part.maxLife, 0);
            const size = part.size * lifeRatio;
            if (size <= 0.05) continue;
            const proj = projectPoint(part);
            if (!isFinite(proj.x) || !isFinite(proj.y)) continue;
            pg.ellipse(proj.x, proj.y, size * viewTransform.scale, size * viewTransform.scale);
          }
          pg.save("lets_hug_export.png");
          pg.remove();
        };

        p.setup = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          const canvas = p.createCanvas(w, h);
          canvas.parent(container);
          video = p.createCapture(p.VIDEO, () => {
            if (video.elt?.videoWidth) {
              viewTransform.sourceWidth = video.elt.videoWidth;
              viewTransform.sourceHeight = video.elt.videoHeight;
            }
          });
          video.size(640, 480);
          video.hide();
          video.elt.setAttribute("playsinline", "");

          poseNet = window.ml5.poseNet(video, {
            detectionType: "multiple", flipHorizontal: false,
            maxPoseDetections: 2, scoreThreshold: MIN_PART_SCORE,
            minConfidence: MIN_PART_SCORE, nmsRadius: 15,
          }, () => setStatus("ready"));

          poseNet.on("pose", (results: any) => {
            poses = smoothAndFormatPoses(results);
            calculateContactArea();
          });

          setStatus("ready");
        };

        p.windowResized = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          p.resizeCanvas(w, h);
        };

        p.draw = () => {
          p.background(0);
          if (!video || !video.elt?.videoWidth) return;

          // Update transform
          const sw = video.elt.videoWidth || viewTransform.sourceWidth;
          const sh = video.elt.videoHeight || viewTransform.sourceHeight;
          viewTransform.sourceWidth = sw;
          viewTransform.sourceHeight = sh;
          const scale = Math.min(p.width / sw, p.height / sh);
          viewTransform.scale = scale;
          viewTransform.drawWidth = sw * scale;
          viewTransform.drawHeight = sh * scale;
          viewTransform.offsetX = (p.width - viewTransform.drawWidth) / 2;
          viewTransform.offsetY = (p.height - viewTransform.drawHeight) / 2;

          // Draw video
          p.push();
          p.translate(viewTransform.offsetX + viewTransform.drawWidth, viewTransform.offsetY);
          p.scale(-viewTransform.scale, viewTransform.scale);
          p.image(video, 0, 0, sw, sh);
          p.pop();

          // Atmosphere overlay
          p.noStroke();
          p.fill(0, 170);
          p.rect(0, 0, p.width, p.height);

          // Draw skeleton lines
          if (poses.length >= 2) {
            for (const poseData of poses) {
              const skeleton = poseData.skeleton || [];
              p.stroke(255);
              p.strokeWeight(3);
              for (const [partA, partB] of skeleton) {
                const a = projectPoint(partA.position);
                const b = projectPoint(partB.position);
                p.line(a.x, a.y, b.x, b.y);
              }
              p.noStroke();
              p.fill(255);
              for (const kp of poseData.pose.keypoints) {
                if (kp.score > MIN_PART_SCORE) {
                  const proj = projectPoint(kp.position);
                  p.ellipse(proj.x, proj.y, 8, 8);
                }
              }
            }
          }

          // Draw particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const part = particles[i];
            part.x += part.vx + p.random(-PARTICLE_JITTER, PARTICLE_JITTER);
            part.y += part.vy + p.random(-PARTICLE_JITTER, PARTICLE_JITTER);
            part.life -= 1;
            const lifeRatio = Math.max(part.life / part.maxLife, 0);
            const size = part.size * lifeRatio;
            if (size <= 0.05 || part.life <= 0) { particles.splice(i, 1); continue; }
            const proj = projectPoint(part);
            p.noStroke();
            p.fill(part.color[0], part.color[1], part.color[2]);
            p.ellipse(proj.x, proj.y, size * viewTransform.scale, size * viewTransform.scale);
          }

          // Contact info
          p.push();
          p.fill(255);
          p.noStroke();
          p.textSize(13);
          p.textAlign(p.LEFT, p.TOP);
          p.text(`Contact Value: ${Math.round(contactArea)}`, 20, 20);
          p.pop();
        };
      };

      if (!cancelled) {
        p5Ref.current = new p5(sketch);
      }
    })();

    return () => {
      cancelled = true;
      p5Ref.current?.remove();
      p5Ref.current = null;
    };
  }, []);

  return (
    <div className="lets-hug" ref={containerRef}>
      {status === "loading" && (
        <div className="lets-hug-status">Loading camera &amp; model…</div>
      )}
      {status === "error" && (
        <div className="lets-hug-status">Failed to load ml5. Please check your connection.</div>
      )}
      <button
        type="button"
        className="mcf-export lets-hug-export"
        aria-label="Save as PNG"
        title="Save as PNG"
        onClick={(e) => { e.stopPropagation(); exportRef.current(); }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    </div>
  );
}
