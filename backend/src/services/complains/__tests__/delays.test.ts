import { test } from 'node:test';
import assert from 'node:assert/strict';

import { aggregateDelays, computeDelay, DelayRow } from '../delays';

test('computeDelay: late, early, and a mark about some other trip', () => {
  assert.equal(computeDelay('11:30', '11:34'), 4);
  assert.equal(computeDelay('11:30', '11:27'), -3);
  assert.equal(computeDelay('11:30', '12:40'), null);
  assert.equal(computeDelay('11:30', '11:00'), null);
});

const row = (delay: number, extra: Partial<DelayRow> = {}): DelayRow => ({
  stop: 'ТГУ',
  direction: 'out',
  scheduled_time: '11:30',
  delay_min: delay,
  user_id: null,
  day: '2026-09-30',
  ...extra,
});

test('aggregateDelays: median and middle half per stop and per trip', () => {
  const stats = aggregateDelays([
    row(2, { day: '2026-09-28' }),
    row(4, { day: '2026-09-29' }),
    row(6),
    row(1, { scheduled_time: '12:10' }),
  ]);

  const stop = stats.find(s => s.scheduledTime === null);
  const trip = stats.find(s => s.scheduledTime === '11:30');

  assert.deepEqual(
    { median: trip?.median, count: trip?.count, days: trip?.days, p25: trip?.p25, p75: trip?.p75 },
    { median: 4, count: 3, days: 3, p25: 3, p75: 5 },
  );
  assert.equal(stop?.count, 4);
});

test('aggregateDelays: one person, one trip, one day — one mark', () => {
  const stats = aggregateDelays([row(10, { user_id: 'a' }), row(12, { user_id: 'a' }), row(3, { user_id: 'b' })]);
  const trip = stats.find(s => s.scheduledTime === '11:30');

  assert.equal(trip?.count, 2);
});
