import fs from 'fs';
import path from 'path';
import { buildPolyline, haversine, LatLng, Polyline, project } from './geo';
import { logger } from '../logger';

/**
 * Направление live-автобуса: «в город» (`out`) или «из города» (`inLB`).
 * Подробно — specs/14-live-bus-direction.md.
 *
 * Идея: маршрут с сентября 2026 — одна петля из двух плеч. Там, где рядом только одно
 * плечо (Левобережный — только inLB, Маяк/Набережная — только out), направление видно по
 * позиции. Где плечи идут по одной улице навстречу друг другу (пр. Ленина, конечные),
 * смотрим, вдоль какого плеча автобус продвинулся за последние ~2 минуты.
 */

export type Direction = 'out' | 'inLB';

/** Дальше этого от линии плеча — автобус не на нём (Маяк лежит в 160 м от OSM-трассы) */
export const NEAR_M = 200;
/** Меньше этого сдвиг за окно — автобус стоит, оставляем прошлое направление */
export const MIN_MOVE_M = 100;
/**
 * Плечи рядом, но одно ближе хотя бы на столько — это разные дороги (Левитана: «из города»
 * в 50 м, дорога «в город» в 140 м), направление видно по позиции. На пр. Ленина плечи идут
 * по одной линии, там разница — метры, и решает движение.
 */
const OTHER_ROAD_M = 60;
/** Какую долю сдвига автобус должен пройти вдоль плеча, чтобы засчитать движение по нему */
const MIN_ALONG_SHARE = 0.5;

export type Legs = Record<Direction, Polyline>;

function loadLegs(): Legs | null {
  try {
    const file = path.join(__dirname, '../../data/route-112s.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as { legs: Record<Direction, [number, number][]> };
    return { out: buildPolyline(data.legs.out), inLB: buildPolyline(data.legs.inLB) };
  } catch (err) {
    // Без геометрии маршрута направление просто не считается — live работает как раньше
    logger.error({ err }, '[live] route-112s.json не загружен, направление отключено');
    return null;
  }
}

export const ROUTE_LEGS: Legs | null = loadLegs();

/**
 * @param now    текущая позиция
 * @param before позиция того же автобуса ~2 минуты назад (null — истории нет)
 * @param prev   последнее определённое направление этого автобуса
 */
export function detectDirection(
  now: LatLng,
  before: LatLng | null,
  prev: Direction | null,
  legs: Legs | null = ROUTE_LEGS,
): Direction | null {
  if (!legs) return null;

  const dirs: Direction[] = ['out', 'inLB'];
  const nowProj = { out: project(now, legs.out), inLB: project(now, legs.inLB) };
  const near = dirs.filter(d => nowProj[d].dist <= NEAR_M);

  if (near.length === 0) return null; // депо, объезд
  if (near.length === 1) return near[0];

  const gap = nowProj.out.dist - nowProj.inLB.dist;
  if (Math.abs(gap) >= OTHER_ROAD_M) return gap > 0 ? 'inLB' : 'out';

  // Плечи на одной улице — решает движение
  if (!before) return prev;
  const moved = haversine(before, now);
  if (moved < MIN_MOVE_M) return prev;

  const progressed = near.filter(d => {
    const beforeProj = project(before, legs[d]);
    if (beforeProj.dist > NEAR_M) return false;
    return nowProj[d].along - beforeProj.along >= moved * MIN_ALONG_SHARE;
  });

  // Если автобус приехал на общий участок с участка одного плеча — это плечо
  if (progressed.length === 0) {
    const cameFrom = dirs.filter(d => project(before, legs[d]).dist <= NEAR_M);
    return cameFrom.length === 1 ? cameFrom[0] : prev;
  }

  return progressed.length === 1 ? progressed[0] : prev;
}
