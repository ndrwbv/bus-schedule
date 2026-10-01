import { bearing as bearingOf, haversine, LatLng } from './geo';
import { detectDirection, Direction } from './direction';

/**
 * Помнит, где был каждый live-автобус последние минуты: перевозчик отдаёт только текущие
 * координаты — без id, курса и направления. Всё хранится в памяти, рестарт = пара минут
 * без направления.
 */

export interface UpstreamBus {
  lat: number;
  lng: number;
  description: string;
}

export interface TrackedBus extends UpstreamBus {
  /** Стабильный между опросами id — фронт сопоставляет маркеры по нему */
  id: string;
  direction: Direction | null;
  /** Курс 0..360 (0 = север), null — автобус давно стоит или истории нет */
  bearing: number | null;
}

interface Fix extends LatLng {
  t: number;
}

interface Track {
  id: string;
  description: string;
  fixes: Fix[];
  direction: Direction | null;
  bearing: number | null;
  bearingAt: number;
  lastSeenAt: number;
}

const HISTORY_MS = 5 * 60_000;
/**
 * Позиция «до» для направления — самая свежая, от которой автобус отъехал хотя бы на 150 м,
 * но не старше 4 минут. Окно короче там, где автобус едет: после разворота на конечной
 * подпись меняется через ~20 с, а не через 2 минуты.
 */
const BEFORE_MIN_MOVE_M = 150;
const BEFORE_MAX_MS = 4 * 60_000;
/** Курс считаем по свежему сдвигу: хотя бы на 40 м за последние 2 минуты */
const BEARING_MIN_MOVE_M = 40;
const BEARING_WINDOW_MS = 2 * 60_000;
/** Стоит дольше — стрелку убираем */
const BEARING_TTL_MS = 5 * 60_000;
/** Автобус пропал из ответа дольше этого — забываем трек */
const TRACK_TTL_MS = 10 * 60_000;
/** Дальше этого за опрос автобус не уедет — не считаем тем же автобусом */
const MAX_MATCH_M = 1_500;

export class LiveTracker {
  private tracks: Track[] = [];
  private nextId = 1;

  /** Принимает свежий ответ перевозчика, возвращает автобусы в том же порядке */
  ingest(buses: UpstreamBus[], now = Date.now()): TrackedBus[] {
    this.tracks = this.tracks.filter(t => now - t.lastSeenAt <= TRACK_TTL_MS);
    const matched = this.match(buses);

    return buses.map((bus, i) => {
      const track = matched[i] ?? this.createTrack(bus.description);
      this.update(track, bus, now);

      return {
        id: track.id,
        lat: bus.lat,
        lng: bus.lng,
        description: bus.description,
        direction: track.direction,
        bearing: track.bearing,
      };
    });
  }

  /**
   * Сначала по description (если он уникален в ответе), остальных — к ближайшему
   * свободному треку. Перевозчик может переставлять автобусы в ответе.
   */
  private match(buses: UpstreamBus[]): (Track | undefined)[] {
    const result: (Track | undefined)[] = new Array(buses.length);
    const free = new Set(this.tracks);
    const counts = new Map<string, number>();
    for (const b of buses) counts.set(b.description, (counts.get(b.description) ?? 0) + 1);

    buses.forEach((bus, i) => {
      if (!bus.description || counts.get(bus.description) !== 1) return;
      const track = [...free].find(t => t.description === bus.description);
      if (track) {
        result[i] = track;
        free.delete(track);
      }
    });

    const pairs: { i: number; track: Track; dist: number }[] = [];
    buses.forEach((bus, i) => {
      if (result[i]) return;
      for (const track of free) {
        const last = track.fixes[track.fixes.length - 1];
        if (!last) continue;
        const dist = haversine(last, bus);
        if (dist <= MAX_MATCH_M) pairs.push({ i, track, dist });
      }
    });
    pairs.sort((a, b) => a.dist - b.dist);
    for (const { i, track } of pairs) {
      if (result[i] || !free.has(track)) continue;
      result[i] = track;
      free.delete(track);
    }

    return result;
  }

  private createTrack(description: string): Track {
    const track: Track = {
      id: String(this.nextId++),
      description,
      fixes: [],
      direction: null,
      bearing: null,
      bearingAt: 0,
      lastSeenAt: 0,
    };
    this.tracks.push(track);

    return track;
  }

  private update(track: Track, bus: UpstreamBus, now: number): void {
    const cur: Fix = { lat: bus.lat, lng: bus.lng, t: now };
    track.description = bus.description;
    track.lastSeenAt = now;
    track.fixes = track.fixes.filter(f => now - f.t <= HISTORY_MS);

    for (let i = track.fixes.length - 1; i >= 0; i--) {
      const f = track.fixes[i];
      if (now - f.t > BEARING_WINDOW_MS) break;
      if (haversine(f, cur) >= BEARING_MIN_MOVE_M) {
        track.bearing = bearingOf(f, cur);
        track.bearingAt = now;
        break;
      }
    }
    if (now - track.bearingAt > BEARING_TTL_MS) track.bearing = null;

    // Не нашли точку в 150 м — берём самую старую в окне: автобус стоит, detectDirection решит по
    // конечной, курсу или прошлому направлению
    const window = track.fixes.filter(f => now - f.t <= BEFORE_MAX_MS);
    const before = [...window].reverse().find(f => haversine(f, cur) >= BEFORE_MIN_MOVE_M) ?? window[0] ?? null;
    track.direction = detectDirection(cur, before, track.direction, track.bearing);

    track.fixes.push(cur);
  }
}

export const liveTracker = new LiveTracker();
