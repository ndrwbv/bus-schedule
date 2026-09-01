/**
 * Фотографии расписания от перевозчика — единственный первоисточник данных на сайте.
 * Лежат в frontend/public/schedule/, отдаются как статика с того же домена.
 *
 * С сентября 2026 перевозчик печатает две таблицы вместо трёх: будни и
 * «выходные и праздничные дни» (суббота и воскресенье теперь одинаковые).
 *
 * При обновлении расписания: положить новые фото рядом, обновить этот список и дату.
 * Полная процедура — specs/13-schedule-from-images.md.
 */
export const SCHEDULE_SOURCE_DATE = `1 сентября 2026`

export const SCHEDULE_SOURCE_IMAGES = [
	{ label: `Будни`, url: `/schedule/112s-weekdays-2026-09.jpg`, analyticsKey: `source:weekdays` },
	{ label: `Выходные`, url: `/schedule/112s-weekends-2026-09.jpg`, analyticsKey: `source:weekends` },
] as const
