export interface ISchedule {
	inSP: Record<number, Record<string, string[]>>
	out: Record<number, Record<string, string[]>>
	inLB: Record<number, Record<string, string[]>>
}
