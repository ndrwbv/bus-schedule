import timetable from './timetable.json'

export const ROUTE_START = Date.parse(`2026-11-07T00:00:00+07:00`)
export const isNovemberRoute = (now = Date.now()): boolean => now >= ROUTE_START
export const ROUTE_SOURCE = `https://xn--80aasi5akda.online/112s`
export const ROUTE_TABLES = timetable
