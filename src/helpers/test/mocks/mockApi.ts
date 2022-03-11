import { FetchInfoResponse } from 'api'
import SCHEDULE from 'consts/schedule'

export function createMockApi() {
	return {
		fetchSchedule: async () => ({ fields: { schedule: SCHEDULE } }),
		fetchInfo: async () => ({
			fields: {
				message: 'Оставьте свой отзыв о работе сайта',
				id: 1,
				link: 'https://forms.gle/NstJzZ4Ck8RoEtEF8',
			},
		}),
	}
}