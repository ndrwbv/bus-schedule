import { ISchedule } from 'shared/store/schedule/ISchedule'
import { DirectionsNew } from 'shared/store/busStop/Stops'

export const getDirectionKeys = (schedule: ISchedule, direction: DirectionsNew, currentDayKey: number): string[] =>
	direction ? Object.keys(schedule[direction][currentDayKey]) : []
