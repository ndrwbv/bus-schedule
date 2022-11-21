import { useEffect, useState } from 'react'
import { AndrewLytics } from 'shared/lib'
import { Directions, StopKeys } from 'shared/store/busStop/Stops'

import { ComplainType } from './Complains'

export interface IComplains {
	stop: StopKeys
	direction: Directions
	date: string
	type: ComplainType
	on: number
}

export interface IComplainsResponse extends IComplains {
	id: number
}
interface IReturns {
	complains: IComplainsResponse[]
	addComplain: (data: IComplains) => void
}

export const useComplains = (): IReturns => {
	const [complains, setComplains] = useState<IComplainsResponse[]>([])

	const fetchComplains = (): void => {
		fetch(`https://popooga.ru/graphql`, {
			headers: {
				accept: `*/*`,
				'accept-language': `ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7`,
				'content-type': `application/json`,
				'sec-fetch-dest': `empty`,
				'sec-fetch-mode': `cors`,
				'sec-fetch-site': `same-origin`,
			},
			referrer: `https://popooga.ru/graphql`,
			referrerPolicy: `strict-origin-when-cross-origin`,
			body: `{"operationName":"C","variables":{},"query":"query C {\\n  findComplains {\\n    id\\n    stop\\n    direction\\n    date\\n    type\\n    on\\n  }\\n}\\n"}`,
			method: `POST`,
			mode: `cors`,
			credentials: `omit`,
		})
			.then(res => res.json())
			.then(res => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (res?.data?.findComplains) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
					setComplains(res.data.findComplains)
				}

				return null
			})
			.catch(() => {})
	}

	useEffect(() => {
		fetchComplains()
		const interval = setInterval(() => {
			fetchComplains()
		}, 5000)

		return () => {
			clearInterval(interval)
		}
	}, [])

	const addComplain = (data: IComplains): void => {
		AndrewLytics(`addComplainMethod`)
		const body = {
			operationName: null,
			variables: {
				data,
			},
			query: `mutation Complain($data: ComplainsInputDTO!) {createComplain(data: $data) {id}
			}`,
		}

		fetch(`https://popooga.ru/graphql`, {
			headers: {
				accept: `*/*`,
				'accept-language': `ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7`,
				'content-type': `application/json`,
				'sec-ch-ua': `" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"`,
				'sec-ch-ua-mobile': `?0`,
				'sec-ch-ua-platform': `"macOS"`,
				'sec-fetch-dest': `empty`,
				'sec-fetch-mode': `cors`,
				'sec-fetch-site': `same-origin`,
			},
			referrer: `https://popooga.ru/graphql`,
			referrerPolicy: `strict-origin-when-cross-origin`,
			body: JSON.stringify(body),
			method: `POST`,
			mode: `cors`,
			credentials: `omit`,
		}).catch(() => {})
	}

	return { complains, addComplain }
}
