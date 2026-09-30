export enum ComplainType {
	'earlier' = `earlier`,
	'later' = `later`,
	not_arrive = `not_arrive`,
	passed_by = `passed_by`,
	arrived = `arrived`,
}

/** One row of GET /api/complains/delays */
export interface DelayStat {
	stop: string
	direction: string
	/** null — every trip at this stop together */
	scheduledTime: string | null
	median: number
	p25: number
	p75: number
	count: number
	days: number
}
