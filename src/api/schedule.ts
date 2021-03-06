import config from 'configs/base'
import { Contentful } from 'interfaces/Contentful'
import { IHolidays } from 'interfaces/IHolidays'
import { ISchedule } from 'interfaces/ISchedule'

export type FetchScheduleResponse = Promise<Contentful<{ schedule: ISchedule; holidays: { data: IHolidays } }>>

export const fetchSchedule = (): FetchScheduleResponse => {
	return fetch(
		`https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/43nolroEBc5PNSMub6VR8G?access_token=${config.CONTENTFUL_TOKEN}`,
	).then(res => res.json())
}
