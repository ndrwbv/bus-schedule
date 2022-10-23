export interface ISchedule {
  in: Record<number, Record<string, string[]>>;
  out: Record<number, Record<string, string[]>>;
}
