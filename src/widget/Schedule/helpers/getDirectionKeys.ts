import { ISchedule } from 'widget/Schedule/types/ISchedule'
import { DirectionsNew } from 'widget/Schedule/types/Stops'

export const getDirectionKeys = (schedule: ISchedule, direction: DirectionsNew, currentDayKey: number): string[] =>
	direction ? Object.keys(schedule[direction][currentDayKey]) : []
