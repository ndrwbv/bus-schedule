export interface CircuitTable {
	id: string
	day: 'weekdays' | 'weekends'
	via: 'park' | 'lb'
	rows: { stop: string; direction: 'fromCity' | 'toCity'; times: (string | null)[] }[]
}
export interface CircuitSchedule {
	effectiveFrom: string
	source: string
	tables: CircuitTable[]
}

export interface ISchedule {
	circuits?: CircuitSchedule
	inSP: Record<number, Record<string, string[]>>
	out: Record<number, Record<string, string[]>>
	inLB: Record<number, Record<string, string[]>>
}
