import { config } from 'shared/configs'
import { IHolidays } from 'shared/store/holidays/IHolidays'
import { ISchedule } from 'shared/store/schedule/ISchedule'
import { baseRequest, IContentfulResponse } from 'shared/lib'

interface IScheduleResponse {
	schedule: ISchedule
	holidays: { data: IHolidays }
}

export type FetchScheduleResponse = IContentfulResponse<IScheduleResponse>

export const fetchSchedule = (): Promise<FetchScheduleResponse> => {
	return baseRequest<FetchScheduleResponse>(
		`https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/43nolroEBc5PNSMub6VR8G?access_token=${config.CONTENTFUL_TOKEN}`,
	)
}
