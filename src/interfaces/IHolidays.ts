export interface IHoliday {
    name: string;
    start: string;
    end: string;
    key?: number
}

export type IHolidays = IHoliday[]