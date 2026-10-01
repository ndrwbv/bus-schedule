/** Точка в градусах */
export interface LatLng {
  lat: number;
  lng: number;
}

const EARTH_R = 6_371_000;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Расстояние по сфере, метры */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

/** Азимут из a в b: 0 = север, 90 = восток, по часовой, 0..360 */
export function bearing(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Локальная равнопромежуточная проекция вокруг Томска: на масштабе маршрута ошибка — сантиметры
const M_PER_DEG_LAT = 110_540;
const M_PER_DEG_LNG = 111_320 * Math.cos(toRad(56.47));

function toXY(p: LatLng): [number, number] {
  return [p.lng * M_PER_DEG_LNG, p.lat * M_PER_DEG_LAT];
}

/** Ломаная с накопленной длиной — чтобы считать, сколько метров вдоль неё проехано */
export interface Polyline {
  points: [number, number][];
  /** cum[i] — длина от начала до points[i], метры */
  cum: number[];
}

export function buildPolyline(latLngs: [number, number][]): Polyline {
  const points = latLngs.map(([lat, lng]) => toXY({ lat, lng }));
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return { points, cum };
}

/**
 * Проекция точки на ломаную.
 * `dist` — расстояние до линии, `along` — сколько метров от начала линии до проекции.
 */
export function project(p: LatLng, line: Polyline): { dist: number; along: number } {
  const [px, py] = toXY(p);
  let best = { dist: Infinity, along: 0 };

  for (let i = 0; i < line.points.length - 1; i++) {
    const [ax, ay] = line.points[i];
    const [bx, by] = line.points[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    const dist = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (dist < best.dist) best = { dist, along: line.cum[i] + t * Math.sqrt(len2) };
  }

  return best;
}
