import { STOPS } from 'shared/store/busStop/const/stops'
import { v4 as uuidv4 } from 'uuid'

import { IPassenger } from '../IPassenger'

const randomInt = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

const nameList = [`Андрей`, `Игорь`, `Женя`, `Настя`]
const secondNameList = [`Иванов`, `Кедров`, `Бебуревшивили`]
const zodiakSignList = [`Лев`]
const occupationList = [`Предприниматель`]

export const generatePassenger = (stopIndex: number): IPassenger => ({
	id: uuidv4(),
	name: nameList[randomInt(0, nameList.length - 1)],
	secondName: secondNameList[randomInt(0, secondNameList.length - 1)],
	zodiakSign: zodiakSignList[randomInt(0, zodiakSignList.length - 1)],
	occupation: occupationList[randomInt(0, occupationList.length - 1)],
	travel: {
		fromStopIndex: stopIndex,
		toStopIndex: randomInt(stopIndex + 1, STOPS.length - 1),
	},
})

export const generatePassengers = ({
	min,
	max,
	stopIndex,
}: {
	min: number
	max: number
	stopIndex: number
}): IPassenger[] => {
	const amount = randomInt(min, max)
	const arr: unknown[] = new Array(amount) as unknown[]

	return [...arr].map(() => generatePassenger(stopIndex))
}
