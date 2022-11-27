import { DirectionsNew, IOption, IStops, StopKeysOut } from '../Stops'

export const STOPS_OUT: IStops<DirectionsNew.out>[] = [
	{
		id: `1`,
		label: `Поликлиника (Алые Паруса)`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `2`,
		label: `Cеребряный бор`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `3`,
		label: `Анны Ахматовой`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `4`,
		label: `Поликлиника (Алые Паруса)`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `5`,
		label: `В. Маяковского`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `6`,
		label: `Набережная`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `7`,
		label: `Лагерный Сад`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `8`,
		label: `Учебная`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `9`,
		label: `ТЭМЗ`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `10`,
		label: `ТГУ`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `11`,
		label: `Новособорная`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `11`,
		label: `Главпочтамт`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `12`,
		label: `ТЮЗ`,
		direction: DirectionsNew.out,
		latLon: null,
	},
	{
		id: `13`,
		label: `ЦУМ`,
		direction: DirectionsNew.out,
		latLon: null,
	},

	{
		id: `14`,
		label: `Интернационалистов`,
		direction: DirectionsNew.out,
		latLon: null,
	},
]

export const StopsOutOptions: IOption<StopKeysOut | null>[] = [
	{
		label: `Не выбрано`,
		value: null,
	},
	...STOPS_OUT.map(stop => ({
		label: stop.label,
		value: stop.label,
	})),
]
