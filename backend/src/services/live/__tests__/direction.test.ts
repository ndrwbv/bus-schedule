import { test } from 'node:test';
import assert from 'node:assert/strict';

import { detectDirection, ROUTE_LEGS } from '../direction';
import { LatLng } from '../geo';

// Координаты остановок — из frontend/src/shared/store/busStop/const/stops*Options.ts
const OUT = {
  serBor: { lat: 56.459504, lng: 84.906008 },
  akhmatovoy: { lat: 56.463523, lng: 84.905045 },
  mayak: { lat: 56.473628, lng: 84.898782 },
  naberezhnaya: { lat: 56.45292620490357, lng: 84.92287951144814 },
  tgu: { lat: 56.469669, lng: 84.950769 },
  glavpochtamt: { lat: 56.479882, lng: 84.949912 },
  sberbank: { lat: 56.516675, lng: 84.980733 },
};
const IN_LB = {
  internatsionalistov: { lat: 56.513582, lng: 84.989332 },
  avtopark: { lat: 56.516815, lng: 84.978774 },
  glavpochtamt: { lat: 56.47866, lng: 84.949825 },
  tgu: { lat: 56.471262, lng: 84.950286 },
  levitana: { lat: 56.446951, lng: 84.921565 },
  etyud: { lat: 56.441423, lng: 84.916935 },
  triElementa: { lat: 56.444195, lng: 84.919244 },
};
const DEPOT: LatLng = { lat: 56.43, lng: 85.05 };

test('геометрия маршрута загружена', () => {
  assert.ok(ROUTE_LEGS);
});

test('пр. Ленина на север — в город, на юг — из города', () => {
  assert.equal(detectDirection(OUT.glavpochtamt, OUT.tgu, null), 'out');
  assert.equal(detectDirection(IN_LB.tgu, IN_LB.glavpochtamt, null), 'inLB');
  // Прошлое направление не мешает, если автобус явно поехал в другую сторону
  assert.equal(detectDirection(IN_LB.tgu, IN_LB.glavpochtamt, 'out'), 'inLB');
});

test('участки одного плеча — по одной позиции, без истории', () => {
  assert.equal(detectDirection(IN_LB.levitana, null, null), 'inLB');
  assert.equal(detectDirection(IN_LB.etyud, null, null), 'inLB');
  assert.equal(detectDirection(OUT.mayak, null, null), 'out');
  assert.equal(detectDirection(OUT.naberezhnaya, null, null), 'out');
});

test('общий участок без истории — не угадываем', () => {
  assert.equal(detectDirection(OUT.tgu, null, null), null);
  assert.equal(detectDirection(OUT.tgu, null, 'inLB'), 'inLB');
});

test('стоит на остановке — прошлое направление', () => {
  const nearby = { lat: OUT.tgu.lat + 0.0002, lng: OUT.tgu.lng };
  assert.equal(detectDirection(OUT.tgu, nearby, 'inLB'), 'inLB');
  assert.equal(detectDirection(OUT.tgu, nearby, null), null);
});

test('далеко от маршрута — нет направления', () => {
  assert.equal(detectDirection(DEPOT, null, 'out'), null);
});

test('конечная Серебряный бор: приехал из Левобережного, уехал к Ахматовой', () => {
  assert.equal(detectDirection(OUT.serBor, IN_LB.triElementa, null), 'inLB');
  assert.equal(detectDirection(OUT.akhmatovoy, OUT.serBor, 'inLB'), 'out');
});

test('конечная Интернационалистов: приехал в город, уехал из города', () => {
  assert.equal(detectDirection(IN_LB.internatsionalistov, OUT.sberbank, null), 'out');
  assert.equal(detectDirection(IN_LB.avtopark, IN_LB.internatsionalistov, 'out'), 'inLB');
});

test('без геометрии маршрута — всегда null', () => {
  assert.equal(detectDirection(IN_LB.levitana, null, 'out', null), null);
});
