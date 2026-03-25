import { DirectionsNew } from 'shared/store/busStop/Stops'
import { ISchedule } from 'shared/store/schedule/ISchedule'

export const getDirectionKeys = (
	schedule: ISchedule,
	direction: DirectionsNew | undefined,
	currentDayKey: number,
): string[] => (direction ? Object.keys(schedule[direction][currentDayKey]) : [])
