import { FetchInfoResponse } from 'shared/api'
import SCHEDULE from 'consts/schedule'

export function createMockApi() {
	return {
		fetchSchedule: async () => ({ fields: { schedule: SCHEDULE, holidays: { data: [] } } }),
		fetchInfo: async () => ({
			fields: {
				message: 'Leave your feedback',
				id: 1,
				link: 'https://forms.gle/NstJzZ4Ck8RoEtEF8',
			},
		}),
	}
}
