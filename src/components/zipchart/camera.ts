// Camera for the hull chart: state [cx, cy, w] in viewBox units (view height w * 0.827).
// Path: van Wijk and Nuij, "Smooth and efficient zooming and panning" (2003), ported from
// d3-interpolate's interpolateZoom with rho = sqrt(2). Duration follows the path length S.
export type Cam = [number, number, number];

export const ASPECT = 0.827;
const RHO = Math.SQRT2, RHO2 = 2, RHO4 = 4;

export function zoomPath(a: Cam, b: Cam): { S: number; at: (t: number) => Cam } {
  const [ux0, uy0, w0] = a, [ux1, uy1, w1] = b;
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
  if (d2 < 1e-12) {
    const S = Math.log(w1 / w0) / RHO;
    return { S, at: (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(RHO * t * S)] };
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + RHO4 * d2) / (2 * w0 * RHO2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - RHO4 * d2) / (2 * w1 * RHO2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / RHO;
  return {
    S,
    at: (t) => {
      const s = t * S, c0 = Math.cosh(r0);
      const u = (w0 / (RHO2 * d1)) * (c0 * Math.tanh(RHO * s + r0) - Math.sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(RHO * s + r0)];
    },
  };
}

// D = clamp(1000 * |S| / 1.2, 700, 1200) ms; 0 when the view does not move.
export function duration(a: Cam, b: Cam, S: number): number {
  if (Math.abs(a[0] - b[0]) < 0.5 && Math.abs(a[1] - b[1]) < 0.5 && Math.abs(a[2] - b[2]) < 0.5) return 0;
  return Math.min(1200, Math.max(700, (1000 * Math.abs(S)) / 1.2));
}

// CSS cubic-bezier as a function of x: Newton-Raphson (8 steps), bisection fallback.
export function bezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dsx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return sy(t);
      const d = dsx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    while (hi - lo > 1e-7) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

export const EASE_GLIDE = bezier(0.25, 0.1, 0.25, 1);
export const EASE_RETARGET = bezier(0, 0, 0.58, 1);
export const EASE_RING = bezier(0.23, 1, 0.32, 1);

// Keep the view inside the chart's extent (1000 x 827).
export function clampCam(c: Cam): Cam {
  const w = c[2], h = w * ASPECT;
  return [Math.min(1000 - w / 2, Math.max(w / 2, c[0])), Math.min(827 - h / 2, Math.max(h / 2, c[1])), w];
}

export const FULL: Cam = [500, 413.5, 1000];
export const REST: Cam = [489.5, 418, 860];

// yes: frame the ZIP's box; edge: a wider view that shows the end of the lit land; outside: the full chart.
// lift (a share of the view height) moves the view down so the mark sits above centre: on a narrow
// chart, 0.1 puts it at 40% of the height, clear of a phone's sticky bottom bar.
export function targetFor(kind: string, p?: number[], lift = 0): Cam {
  if (!p || kind === "no") return [...FULL] as Cam;
  const w = kind === "maybe" ? 400 : p[2]; // yes: width worked out from the ZCTA box by the generator
  return clampCam([p[0], p[1] + lift * w * ASPECT, w]);
}

export const transformOf = (c: Cam): string => {
  const s = 1000 / c[2];
  return `translate(${(500 - c[0] * s).toFixed(3)} ${(413.5 - c[1] * s).toFixed(3)}) scale(${s.toFixed(5)})`;
};
