/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FC, useState } from 'react'
import { SCHEDULE } from 'shared/common'

import { DevStyled } from './Dev.styles'

type TTimeCode = { mins: number; hours: number }
const minutesToString = (minutes: number): string => (minutes < 10 ? `0${minutes}` : `${minutes}`)

const parseTimeCode = (timeCode: string): TTimeCode => {
	const splitted = timeCode.split(`:`)

	return {
		hours: Number(splitted[0]),
		mins: Number(splitted[1]),
	}
}

const timeCodeToMinutes = (timeCode: TTimeCode): number => timeCode.hours * 60 + timeCode.mins

const increeseStopTime = (timeCode: string, on: number): string => {
	const splittedCode = timeCode.split(`:`)
	const hours = Number(splittedCode[0])
	const mins = Number(splittedCode[1])

	if (mins + on > 59) {
		const newMins = mins + on - 60

		return `${hours + 1}:${minutesToString(newMins)}`
	}

	return `${hours}:${minutesToString(mins + on)}`
}

const increeseTimeCodesArray = (timeCodes: string[], on: number, lessThenTimeCode: string): string[] => {
	const lessMinutes = timeCodeToMinutes(parseTimeCode(lessThenTimeCode))

	return timeCodes.map(code => {
		const currentCode = timeCodeToMinutes(parseTimeCode(code))
		const diff = lessMinutes - currentCode

		if (diff < 0) {
			return code
		}

		return increeseStopTime(code, on)
	})
}

const addStopAfter = ({
	stopName,
	afterStop,
	on,
	lessThenTimeCode,
	exceptDays,
	keys,
}: {
	stopName: string
	afterStop: string
	on: number
	lessThenTimeCode: string
	exceptDays: number[]
	keys: string[]
}) => {
	let newSchedule = { in: {}, out: {} }

	;[...new Array(7)].forEach((_, index) => {
		const useDefault = exceptDays.includes(index)

		let newIn = SCHEDULE.in[index]
		if (keys.includes(`in`)) {
			const newInStopsKeys = SCHEDULE.in[index][afterStop]
			newIn = {
				...SCHEDULE.in[index],
				[stopName]: useDefault ? newInStopsKeys : increeseTimeCodesArray(newInStopsKeys, on, lessThenTimeCode),
			}
		}

		let newOut = SCHEDULE.out[index]
		if (keys.includes(`out`)) {
			const newOutStopsKeys = SCHEDULE.out[index][afterStop]
			newOut = {
				...SCHEDULE.out[index],
				[stopName]: newOutStopsKeys,
			}
		}

		newSchedule = {
			in: {
				...newSchedule.in,
				[index]: newIn,
			},
			out: {
				...newSchedule.out,
				[index]: newOut,
			},
		}
	})

	return newSchedule
}

export const Dev: FC = () => {
	const [newSchedule, setNewSchedule] = useState(SCHEDULE)

	const handleAddStop = (): void => {
		const schedule = addStopAfter({
			stopName: `Маяк`,
			afterStop: `Марины Цветаевой (Торта)`,
			on: 1,
			lessThenTimeCode: `12:38`,
			exceptDays: [0, 6],
			keys: [`in`],
		})

		setNewSchedule(schedule)
	}

	const handleJSON = () => {
		console.log(JSON.stringify(newSchedule))
	}

	const handleLog = () => {
		console.log(newSchedule)
	}

	return (
		<DevStyled>
			<button type="button" onClick={handleAddStop}>
				Добавить остановку
			</button>

			<button type="button" onClick={handleJSON}>
				JSON
			</button>

			<button type="button" onClick={handleLog}>
				Log
			</button>
		</DevStyled>
	)
}
