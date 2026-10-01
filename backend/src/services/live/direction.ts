import fs from 'fs';
import path from 'path';
import { angleDiff, buildPolyline, haversine, LatLng, Polyline, project } from './geo';
import { logger } from '../logger';

/**
 * Направление live-автобуса: «в город» (`out`) или «из города» (`inLB`).
 * Подробно — specs/14-live-bus-direction.md.
 *
 * Идея: маршрут с сентября 2026 — одна петля из двух плеч. Там, где рядом только одно
 * плечо (Левобережный — только inLB, Маяк/Набережная — только out), направление видно по
 * позиции. Где плечи идут по одной улице навстречу друг другу (пр. Ленина, конечные),
 * смотрим, вдоль какого плеча автобус продвинулся за последние ~2 минуты. На конечной
 * показываем, куда автобус поедет. Стоит — куда смотрит его курс, иначе — прошлое.
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
/**
 * Ближе этого к началу плеча — автобус на конечной и поедет по этому плечу. Важнее сдвига:
 * иначе на отстое до 4 минут висело бы направление, в котором он приехал.
 */
const TERMINAL_M = 150;
/** Курс считается «вдоль плеча», если расходится с линией не больше чем на столько */
const BEARING_MATCH_DEG = 45;

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

const DIRS: Direction[] = ['out', 'inLB'];

type Projections = Record<Direction, ReturnType<typeof project>>;

/**
 * Плечи на одной улице, а по сдвигу не понять. Так бывает у стоящего автобуса — и после
 * рестарта бэка, когда истории нет и прошлого направления тоже.
 */
function withoutProgress(nowProj: Projections, bearing: number | null, prev: Direction | null): Direction | null {
  // Свежий курс есть — плечо, которое идёт в ту же сторону (на пр. Ленина они навстречу)
  if (bearing !== null) {
    const aligned = DIRS.filter(d => angleDiff(bearing, nowProj[d].heading) <= BEARING_MATCH_DEG);
    if (aligned.length === 1) return aligned[0];
  }

  return prev;
}

/**
 * @param now     текущая позиция
 * @param before  позиция того же автобуса ~2 минуты назад (null — истории нет)
 * @param prev    последнее определённое направление этого автобуса
 * @param bearing свежий курс автобуса (null — нет или устарел)
 */
export function detectDirection(
  now: LatLng,
  before: LatLng | null,
  prev: Direction | null,
  bearing: number | null = null,
  legs: Legs | null = ROUTE_LEGS,
): Direction | null {
  if (!legs) return null;

  const nowProj: Projections = { out: project(now, legs.out), inLB: project(now, legs.inLB) };
  const near = DIRS.filter(d => nowProj[d].dist <= NEAR_M);

  if (near.length === 0) return null; // депо, объезд
  if (near.length === 1) return near[0];

  const gap = nowProj.out.dist - nowProj.inLB.dist;
  if (Math.abs(gap) >= OTHER_ROAD_M) return gap > 0 ? 'inLB' : 'out';

  // Конечная: поедет по плечу, которое здесь начинается (Интернационалистов — «из города»)
  const departing = DIRS.filter(d => nowProj[d].along <= TERMINAL_M);
  if (departing.length === 1) return departing[0];

  // Плечи на одной улице — решает движение
  if (!before) return withoutProgress(nowProj, bearing, prev);
  const moved = haversine(before, now);
  if (moved < MIN_MOVE_M) return withoutProgress(nowProj, bearing, prev);

  const progressed = near.filter(d => {
    const beforeProj = project(before, legs[d]);
    if (beforeProj.dist > NEAR_M) return false;
    return nowProj[d].along - beforeProj.along >= moved * MIN_ALONG_SHARE;
  });

  // Если автобус приехал на общий участок с участка одного плеча — это плечо
  if (progressed.length === 0) {
    const cameFrom = DIRS.filter(d => project(before, legs[d]).dist <= NEAR_M);
    return cameFrom.length === 1 ? cameFrom[0] : withoutProgress(nowProj, bearing, prev);
  }

  return progressed.length === 1 ? progressed[0] : withoutProgress(nowProj, bearing, prev);
}
