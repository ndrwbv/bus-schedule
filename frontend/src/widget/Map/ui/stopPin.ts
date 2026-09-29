import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { getStopTimes } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { ISchedule } from 'shared/store/schedule/ISchedule'

/**
 * Stop pin on the map: a small card "12 мин / в город →" with a tail pointing at the stop.
 * Opposite platforms of the same stop stand a few metres apart, so every pin says which
 * way it goes — colour and text, never colour alone.
 */

type Urgency = 'imminent' | 'soon' | 'later' | 'none'

interface PinTime {
	text: string
	unit: string | null
	clock: string | null
	urgency: Urgency
	approx: boolean
}

// Same thresholds as the "next bus" card (HowMuchLeft) so the two never disagree
const urgencyOf = (hours: number, minutes: number): Urgency => {
	if (hours >= 1) return `later`
	if (minutes <= 15) return `imminent`
	if (minutes < 35) return `soon`

	return `later`
}

const MAX_HOURS_SHOWN = 3

export const getPinTime = (schedule: ISchedule, stop: IStops<DirectionsNew>, dayKey: number): PinTime => {
	const { times, interpolated } = getStopTimes(schedule, stop.direction, dayKey, stop.label)
	const closest = findClosesTime(times)
	const none: PinTime = { text: `—`, unit: null, clock: null, urgency: `none`, approx: false }

	if (!closest) return none

	const date = new Date(closest)
	const hoursPadded = String(date.getHours()).padStart(2, `0`)
	const minutesPadded = String(date.getMinutes()).padStart(2, `0`)
	const clock = `${hoursPadded}:${minutesPadded}`

	const { hours, minutes } = calculateHowMuchIsLeft(closest)
	// far-off buses: no countdown, but the selected pin still says when the first one comes
	if (hours === null || minutes === null) return none
	if (hours > MAX_HOURS_SHOWN) return { ...none, clock, approx: interpolated }
	const urgency = urgencyOf(hours, minutes)

	if (hours > 0) return { text: `${hours} ч ${minutes}`, unit: `мин`, clock, urgency, approx: interpolated }

	return { text: `${minutes}`, unit: `мин`, clock, urgency, approx: interpolated }
}

const escapeHtml = (value: string): string => value.replace(/["&'<>]/g, ch => `&#${ch.charCodeAt(0)};`)

export const DIRECTION_TEXT: Record<DirectionsNew, string> = {
	[DirectionsNew.out]: `в город`,
	[DirectionsNew.inLB]: `из города`,
	[DirectionsNew.inSP]: `из города`,
}

export const stopPinHtml = (stop: IStops<DirectionsNew>, time: PinTime, selected: boolean): string => {
	const approx = time.approx ? `~` : ``
	// a dash has nothing to be approximate about
	const approxCountdown = time.urgency === `none` ? `` : approx
	const dirClass = stop.direction === DirectionsNew.out ? `stop-pin--to-city` : `stop-pin--from-city`
	const label = escapeHtml(stop.label)
	const unit = time.unit ? `<span class="stop-pin__unit">${time.unit}</span>` : ``
	const clock = selected && time.clock ? `<div class="stop-pin__clock">в ${approx}${time.clock}</div>` : ``
	const name = selected ? `<div class="stop-pin__name">${label}</div>` : ``

	return `
		<div class="stop-pin ${dirClass}${selected ? ` stop-pin--selected` : ``}" title="${label} · ${
		DIRECTION_TEXT[stop.direction]
	}">
			<div class="stop-pin__card">
				${name}
				<div class="stop-pin__time stop-pin__time--${time.urgency}">${approxCountdown}${time.text}${unit}</div>
				${clock}
				<div class="stop-pin__dir">${DIRECTION_TEXT[stop.direction]} →</div>
			</div>
			<div class="stop-pin__tail"></div>
		</div>
	`
}
