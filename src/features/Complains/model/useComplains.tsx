import { AndrewLytics } from 'shared/lib'
import { Directions, StopKeys } from 'interfaces/Stops'
import { useEffect, useState } from 'react'
import { ComplainType } from '../model/Complains'
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

function useComplains() {
	const [complains, setComplains] = useState<IComplainsResponse[]>([])

	const fetchComplains = () => {
		fetch('https://popooga.ru/graphql', {
			headers: {
				accept: '*/*',
				'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
				'content-type': 'application/json',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
			},
			referrer: 'https://popooga.ru/graphql',
			referrerPolicy: 'strict-origin-when-cross-origin',
			body: '{"operationName":"C","variables":{},"query":"query C {\\n  findComplains {\\n    id\\n    stop\\n    direction\\n    date\\n    type\\n    on\\n  }\\n}\\n"}',
			method: 'POST',
			mode: 'cors',
			credentials: 'omit',
		})
			.then(res => res.json())
			.then(res => setComplains(res.data.findComplains))
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

	const addComplain = (data: IComplains) => {
		AndrewLytics('addComplainMethod')
		const body = {
			operationName: null,
			variables: {
				data,
			},
			query: `mutation Complain($data: ComplainsInputDTO!) {createComplain(data: $data) {id}
			}`,
		}

		fetch('https://popooga.ru/graphql', {
			headers: {
				accept: '*/*',
				'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
				'content-type': 'application/json',
				'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"macOS"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
			},
			referrer: 'https://popooga.ru/graphql',
			referrerPolicy: 'strict-origin-when-cross-origin',
			body: JSON.stringify(body),
			method: 'POST',
			mode: 'cors',
			credentials: 'omit',
		}).catch(e => {})
	}

	return { complains: complains, addComplain }
}

export default useComplains
