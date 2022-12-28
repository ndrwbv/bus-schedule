import { DirectionsNew, IOption, IStops, StopKeys } from '../Stops'

export const STOPS_OUT: IStops<DirectionsNew.out>[] = [
	{
		id: `1`,
		label: `Cеребряный бор`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `2`,
		label: `Анны Ахматовой`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `3`,
		label: `Поликлиника (Алые Паруса)`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `4`,
		label: `В. Маяковского`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `5`,
		label: `Набережная`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `6`,
		label: `Лагерный Сад`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `7`,
		label: `Учебная`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `8`,
		label: `ТЭМЗ`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `9`,
		label: `ТГУ`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `10`,
		label: `Новособорная`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `11`,
		label: `Главпочтамт`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `12`,
		label: `ТЮЗ`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
	{
		id: `13`,
		label: `ЦУМ`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},

	{
		id: `14`,
		label: `Интернационалистов`,
		direction: DirectionsNew.out,
		latLon: [0, 0],
	},
]

export const StopsOutOptions: IOption<StopKeys | null>[] = [
	{
		label: `Не выбрано`,
		value: null,
	},
	...STOPS_OUT.map(stop => ({
		label: stop.label,
		value: stop.label,
	})),
]
