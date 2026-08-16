"use client";

// Frying pan with small chunks popping up and falling back, like food searing in hot oil.
import { useEffect, useRef } from "react";

interface Chunk {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  points: { x: number; y: number }[];
}

function makeChunkPoints(size: number) {
  const pointCount = 5 + Math.floor(Math.random() * 3);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const radius = size * (0.6 + Math.random() * 0.8);
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }
  return points;
}

const CHUNK_START_X = 100;
const CHUNK_END_X = 230;
const RIM_Y = 340;
const GRAVITY = 0.35;

// Pan flip cycle, mirrors a wrist flick: dip back, snap up, settle.
const FLIP_DURATION = 2000;
const FLICK_PHASE = 0.3;

// Beat of stillness before the first flick, so the pan doesn't launch
// into motion the instant the splash mounts.
const START_DELAY = 400;

// Rest beat between flicks when `repeat` is on, so consecutive flips read
// as distinct tosses rather than one continuous spin.
const REPEAT_PAUSE = 900;

// Keyframe times (cyclic — wraps from the last time back to t=0/1).
const KEYFRAME_TIMES = [0, 0.15, 0.35, 0.55, 0.75];
const KEYFRAME_ROT = [0, -6, 16, -5, 2];
const KEYFRAME_TX = [0, 28, -55, 22, -10];
const KEYFRAME_TY = [0, 5, -14, 4, -2];

interface Spline {
  values: number[];
  tangents: number[];
  durations: number[];
}

// Tension < 1 damps the spline's tangents so it doesn't overshoot past
// the keyframes on wide swings — keeps the loop-back point from snapping.
const SPLINE_TENSION = 0.55;

// Cardinal/Catmull-Rom spline through cyclic keyframes, using each
// point's neighbors to keep velocity continuous — no dead stops at
// the keyframes, unlike a plain per-segment ease.
function buildSpline(values: number[]): Spline {
  const n = values.length;
  const durations = values.map((_, i) => {
    const next = i === n - 1 ? 1 : KEYFRAME_TIMES[i + 1];
    return next - KEYFRAME_TIMES[i];
  });
  const tangents = values.map((_, i) => {
    const prev = values[(i - 1 + n) % n];
    const next = values[(i + 1) % n];
    const dPrev = durations[(i - 1 + n) % n];
    const dNext = durations[i];
    return (SPLINE_TENSION * (next - prev)) / (dPrev + dNext);
  });
  return { values, tangents, durations };
}

function evalSpline(spline: Spline, phase: number) {
  const n = spline.values.length;
  let i = n - 1;
  for (let k = 0; k < n; k++) {
    const start = KEYFRAME_TIMES[k];
    const end = k === n - 1 ? 1 : KEYFRAME_TIMES[k + 1];
    if (phase >= start && phase < end) {
      i = k;
      break;
    }
  }
  const d = spline.durations[i];
  const u = (phase - KEYFRAME_TIMES[i]) / d;
  const j = (i + 1) % n;
  const p0 = spline.values[i];
  const p1 = spline.values[j];
  const m0 = spline.tangents[i] * d;
  const m1 = spline.tangents[j] * d;
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
}

const rotSpline = buildSpline(KEYFRAME_ROT);
const txSpline = buildSpline(KEYFRAME_TX);
const tySpline = buildSpline(KEYFRAME_TY);

function getFlipTransform(phase: number) {
  return {
    rot: evalSpline(rotSpline, phase),
    tx: evalSpline(txSpline, phase),
    ty: evalSpline(tySpline, phase),
  };
}

interface PanLoaderProps {
  // Loops the flick indefinitely (with a rest beat between each) instead
  // of playing once and settling — used for the inline v9 placement,
  // which stays on the page rather than unmounting like the splash does.
  repeat?: boolean;
}

export default function PanLoader({ repeat = false }: PanLoaderProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panGroupRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panGroup = panGroupRef.current;
    const shadow = shadowRef.current;
    if (!canvas || !panGroup || !shadow) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Matches the panGroup's `transform-origin: 50% 50%` (fill-box), so
    // chunks stay pinned to the pan as it translates and rotates.
    const panBBox = panGroup.getBBox();
    const pivotX = panBBox.x + panBBox.width * 0.5;
    const pivotY = panBBox.y + panBBox.height * 0.5;

    // Live-updated rather than read once — a value snapshotted at mount
    // (or per-chunk at spawn) can go stale mid-flight if the site version
    // changes while chunks are still falling (each version's palette can
    // give this a very different color, e.g. version 8's is green), so
    // every chunk always draws with whatever this currently holds instead
    // of a color it captured for itself.
    let chunkColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-deep-leaf")
      .trim();
    const colorObserver = new MutationObserver(() => {
      chunkColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-deep-leaf")
        .trim();
    });
    colorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-version"],
    });

    let chunks: Chunk[] = [];
    let animationFrame: number;
    let spawnedCycle = -1;
    let originTime: number | null = null;

    const spawnChunk = () => {
      const size = 6 + Math.random() * 14;
      const vy0 = 10 + Math.random() * 4;
      const flightFrames = (2 * vy0) / GRAVITY;
      const startX = CHUNK_START_X + (Math.random() - 0.5) * 12;
      const endX = CHUNK_END_X + (Math.random() - 0.5) * 12;
      chunks.push({
        x: startX,
        y: RIM_Y,
        vx: (endX - startX) / flightFrames,
        vy: -vy0,
        size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        points: makeChunkPoints(size),
      });
    };

    const spawnBurst = () => {
      const count = 7 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) spawnChunk();
    };

    const loop = (rafNow: number) => {
      if (originTime === null) originTime = rafNow;
      const elapsed = rafNow - originTime;

      if (elapsed < START_DELAY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        panGroup.style.transform = "translate(0px, 0px) rotate(0deg)";
        shadow.style.transform = "translateX(0px)";
        animationFrame = requestAnimationFrame(loop);
        return;
      }

      // Non-repeating: play the flick spline through once, then hold at
      // rest. Repeating: cycle the flick with a rest pause in between.
      const now = elapsed - START_DELAY;
      let phase: number;
      let cycleIndex: number;
      if (repeat) {
        const cycleLength = FLIP_DURATION + REPEAT_PAUSE;
        cycleIndex = Math.floor(now / cycleLength);
        const cyclePos = now % cycleLength;
        phase = cyclePos >= FLIP_DURATION ? 0 : cyclePos / FLIP_DURATION;
      } else {
        cycleIndex = 0;
        const hasFlipped = now >= FLIP_DURATION;
        phase = hasFlipped ? 0 : now / FLIP_DURATION;
      }

      if (phase >= FLICK_PHASE && cycleIndex !== spawnedCycle) {
        spawnedCycle = cycleIndex;
        spawnBurst();
      }

      const { rot, tx, ty } = getFlipTransform(phase);
      panGroup.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      shadow.style.transform = `translateX(${tx}px)`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      chunks = chunks.filter((c) => {
        c.vy += GRAVITY;
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;
        return c.y < RIM_Y + 1;
      });

      ctx.save();
      ctx.translate(pivotX + tx, pivotY + ty);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.translate(-pivotX, -pivotY);

      for (const c of chunks) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.beginPath();
        const pts = c.points;
        const first = pts[0];
        const last = pts[pts.length - 1];
        ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
        for (let i = 0; i < pts.length; i++) {
          const curr = pts[i];
          const next = pts[(i + 1) % pts.length];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }
        ctx.closePath();
        ctx.fillStyle = chunkColor;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrame);
      colorObserver.disconnect();
    };
  }, [repeat]);

  return (
    <div
      className="relative scale-[0.32] sm:scale-[0.4] md:scale-[0.45]"
      style={{ width: 420, height: 460 }}
    >
      <svg
        width="420"
        height="460"
        viewBox="0 0 420 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <filter id="pan-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* soft shadow under the pan */}
        <ellipse
          ref={shadowRef}
          cx="170"
          cy="398"
          rx="120"
          ry="8"
          fill="#000000"
          opacity="0.15"
          filter="url(#pan-shadow)"
        />

        <g
          ref={panGroupRef}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          {/* handle, flush with the flat rim */}
          <rect x="250" y="340" width="140" height="16" rx="8" style={{ fill: "var(--color-deep-leaf)" }} />

          {/* pan body, seen edge-on: flat bottom, low sloped walls */}
          <path
            d="M 60 340
               L 260 340
               Q 280 340 280 358
               Q 280 390 230 390
               L 120 390
               Q 60 390 60 358
               L 60 340 Z"
            style={{ fill: "var(--color-deep-leaf)" }}
          />
        </g>
      </svg>

      <canvas
        ref={canvasRef}
        width={420}
        height={460}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
