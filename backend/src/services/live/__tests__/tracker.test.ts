import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { Direction } from '../direction';
import { haversine, LatLng } from '../geo';
import { LiveTracker } from '../tracker';

const SEC = 1000;
// Пр. Ленина, автобус «в город» едет на север от ТГУ к Главпочтамту
const tgu = { lat: 56.469669, lng: 84.950769 };
const north = (m: number) => ({ lat: tgu.lat + m / 110_540, lng: tgu.lng });

test('перестановка автобусов в ответе не меняет id', () => {
  const tracker = new LiveTracker();
  const a = { ...north(0), description: 'А' };
  const b = { lat: 56.441423, lng: 84.916935, description: 'Б' };

  const first = tracker.ingest([a, b], 0);
  const second = tracker.ingest([b, a], 10 * SEC);

  assert.equal(second[0].id, first[1].id);
  assert.equal(second[1].id, first[0].id);
});

test('одинаковые description — сопоставление по близости', () => {
  const tracker = new LiveTracker();
  const near = { ...north(0), description: '' };
  const far = { lat: 56.441423, lng: 84.916935, description: '' };

  const first = tracker.ingest([near, far], 0);
  const second = tracker.ingest([{ ...far, lat: far.lat + 0.0005 }, { ...north(80), description: '' }], 10 * SEC);

  assert.equal(second[0].id, first[1].id);
  assert.equal(second[1].id, first[0].id);
});

test('автобус пропал на пару опросов — id прежний', () => {
  const tracker = new LiveTracker();
  const first = tracker.ingest([{ ...north(0), description: 'А' }], 0);
  tracker.ingest([], 10 * SEC);
  tracker.ingest([], 20 * SEC);
  const back = tracker.ingest([{ ...north(150), description: 'А' }], 30 * SEC);

  assert.equal(back[0].id, first[0].id);
});

test('едет на север по Ленина: курс ~0°, через 2 минуты — «в город»', () => {
  const tracker = new LiveTracker();
  let last = tracker.ingest([{ ...north(0), description: 'А' }], 0)[0];
  assert.equal(last.bearing, null);
  assert.equal(last.direction, null);

  for (let s = 10; s <= 120; s += 10) {
    last = tracker.ingest([{ ...north(s * 6), description: 'А' }], s * SEC)[0];
  }

  assert.ok(last.bearing !== null && (last.bearing < 5 || last.bearing > 355), `bearing ${last.bearing}`);
  assert.equal(last.direction, 'out');
});

test('стоит дольше 2 + 5 минут — курс пропадает, направление остаётся', () => {
  const tracker = new LiveTracker();
  let last = tracker.ingest([{ ...north(0), description: 'А' }], 0)[0];
  for (let s = 10; s <= 120; s += 10) {
    last = tracker.ingest([{ ...north(s * 6), description: 'А' }], s * SEC)[0];
  }
  for (let s = 130; s <= 700; s += 10) {
    last = tracker.ingest([{ ...north(720), description: 'А' }], s * SEC)[0];
  }

  assert.equal(last.bearing, null);
  assert.equal(last.direction, 'out');
});

test('круг по всей петле с шумом GPS: ≥ 97 % верно, ошибки только у конечных', () => {
  const route = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../../data/route-112s.json'), 'utf8'),
  ) as { legs: Record<Direction, [number, number][]> };
  const terminals = [route.legs.out[0], route.legs.inLB[0]].map(([lat, lng]) => ({ lat, lng }));

  // Точки вдоль линии каждые 70 м — 25 км/ч при опросе раз в 10 с
  const walk = (line: [number, number][]): LatLng[] => {
    const pts: LatLng[] = [];
    let offset = 0;
    for (let i = 0; i < line.length - 1; i++) {
      const a = { lat: line[i][0], lng: line[i][1] };
      const b = { lat: line[i + 1][0], lng: line[i + 1][1] };
      const d = haversine(a, b);
      for (; offset < d; offset += 70) {
        const k = offset / d;
        pts.push({ lat: a.lat + (b.lat - a.lat) * k, lng: a.lng + (b.lng - a.lng) * k });
      }
      offset -= d;
    }
    return pts;
  };
  let seed = 1;
  const noise = (): number => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 30; // ±15 м

  const tracker = new LiveTracker();
  let t = 0;
  let ok = 0;
  let total = 0;
  for (const leg of ['out', 'inLB', 'out'] as Direction[]) {
    for (const p of walk(route.legs[leg])) {
      t += 10 * SEC;
      const bus = { lat: p.lat + noise() / 110_540, lng: p.lng + noise() / 61_500, description: 'А' };
      const { direction } = tracker.ingest([bus], t)[0];
      total++;
      if (direction === leg) ok++;
      else if (direction !== null) {
        const nearTerminal = terminals.some(term => haversine(term, p) < 300);
        assert.ok(nearTerminal, `«${direction}» вместо «${leg}» в ${p.lat.toFixed(5)},${p.lng.toFixed(5)}`);
      }
    }
  }

  assert.ok(ok / total >= 0.97, `верно ${ok} из ${total}`);
});
