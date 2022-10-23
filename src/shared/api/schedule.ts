import { config } from 'shared/configs'
import { IHolidays } from 'widget/Schedule/types/IHolidays'
import { ISchedule } from 'widget/Schedule/types/ISchedule'
import { baseRequest, IContentfulResponse } from 'shared/lib'

interface IScheduleResponse {
	schedule: ISchedule
	holidays: { data: IHolidays }
}

export type FetchScheduleResponse = IContentfulResponse<IScheduleResponse>

export const fetchSchedule = () => {
	return baseRequest<FetchScheduleResponse>(
		`https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/43nolroEBc5PNSMub6VR8G?access_token=${config.CONTENTFUL_TOKEN}`,
	)
}
