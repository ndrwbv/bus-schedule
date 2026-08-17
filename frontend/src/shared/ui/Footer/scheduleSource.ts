/**
 * Фотографии расписания от перевозчика — единственный первоисточник данных на сайте.
 * Лежат в frontend/public/schedule/, отдаются как статика с того же домена.
 *
 * При обновлении расписания: положить новые фото рядом, обновить этот список и дату.
 * Полная процедура — specs/13-schedule-from-images.md.
 */
export const SCHEDULE_SOURCE_DATE = `17 августа 2026`

export const SCHEDULE_SOURCE_IMAGES = [
	{ label: `Будни`, url: `/schedule/112s-weekdays-2026-08.jpg`, analyticsKey: `source:weekdays` },
	{ label: `Суббота`, url: `/schedule/112s-saturday-2026-08.jpg`, analyticsKey: `source:saturday` },
	{ label: `Воскресенье`, url: `/schedule/112s-sunday-2026-08.jpg`, analyticsKey: `source:sunday` },
] as const
