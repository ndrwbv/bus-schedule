import { calculateHowMuchIsLeft } from 'shared/lib/time/calculateHowMuchIsLeft'
import { findClosesTime } from 'shared/lib/time/findClosesTime'
import { getStopTimes } from 'shared/store/busStop/const/stops'
import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { ISchedule } from 'shared/store/schedule/ISchedule'

import { getPinContent } from './getPinContent'

/** Pin HTML for a stop — its next bus counted from printed or estimated (interpolated) times */
export const stopPinHtml = (
	schedule: ISchedule,
	stop: IStops<DirectionsNew>,
	dayKey: number,
	selected: boolean,
): string => {
	const { times } = getStopTimes(schedule, stop.direction, dayKey, stop.label)
	const closest = findClosesTime(times)
	const timeLeft = closest ? calculateHowMuchIsLeft(closest) : { hours: null, minutes: null }

	return getPinContent(timeLeft, stop, selected)
}
