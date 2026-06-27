"use client";

import { useMemo } from "react";

/**
 * MatrixDotAvatar
 *
 * A deterministic, abstract "matrix dot portrait" used in testimonials.
 * Renders a 12x12 grid of circles over a faint person silhouette.
 * The dot pattern is derived from a seeded hash so each seed produces a
 * stable, unique-looking portrait. It is clearly stylized — never a real
 * photo — so no one's likeness is implied.
 */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTE = [
  "#dbeafe", // 100 — softest
  "#bfdbfe", // 200
  "#93c5fd", // 300
  "#60a5fa", // 400
  "#3b82f6", // 500
  "#2563eb", // 600
  "#1d4ed8", // 700
  "#1e3a8a", // 800 — deepest
];

/**
 * Person silhouette mask on a 12x12 grid (1 = dot, 0 = empty).
 * A generic head + shoulders shape so the dots read as a portrait.
 */
const SILHOUETTE: number[][] = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export function MatrixDotAvatar({
  seed,
  size = 48,
  className,
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const dots = useMemo(() => {
    const rng = mulberry32(hashString(seed));
    const cells: { cx: number; cy: number; r: number; color: string; opacity: number }[] = [];
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        if (!SILHOUETTE[y][x]) continue;
        // Vary radius and shade so it looks like a textured portrait, not a flat mask.
        const sizeRoll = rng();
        const r = sizeRoll > 0.85 ? 0.42 : sizeRoll > 0.55 ? 0.36 : sizeRoll > 0.25 ? 0.30 : 0.24;
        // Edge dots are lighter, interior dots deeper — gives a soft "lit" face.
        const isEdge =
          y < 2 || y > 9 || x < 2 || x > 9 ||
          (y === 2 && (x < 3 || x > 8)) ||
          (y === 9 && (x < 2 || x > 9));
        const baseShade = isEdge ? 1 : 5;
        const shadeJitter = Math.floor(rng() * 3); // 0..2
        const shadeIdx = Math.max(0, Math.min(PALETTE.length - 1, baseShade - shadeJitter));
        const color = PALETTE[shadeIdx];
        const opacity = isEdge ? 0.55 + rng() * 0.25 : 0.85 + rng() * 0.15;
        cells.push({ cx: x + 0.5, cy: y + 0.5, r, color, opacity });
      }
    }
    return cells;
  }, [seed]);

  // 12x12 viewBox so each cell is centered at x.5, y.5 with radius ~0.24-0.42
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 12 12"
        width={size}
        height={size}
        style={{ display: "block" }}
        role="img"
      >
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.color}
            opacity={d.opacity}
          />
        ))}
      </svg>
    </div>
  );
}