import { DirectionsNew, IOption, IStops, StopKeys } from '../Stops'

export const STOPS_OUT: IStops<DirectionsNew.out>[] = [
	{
		id: `6`,
		label: `Cеребряный бор`,
		direction: DirectionsNew.out,
		latLon: [56.459504, 84.906008],
	},
	{
		id: `7`,
		label: `Анны Ахматовой`,
		direction: DirectionsNew.out,
		latLon: [56.463523, 84.905045],
	},
	{
		id: `8`,
		label: `Поликлиника (Алые Паруса)`,
		direction: DirectionsNew.out,
		latLon: [56.467513, 84.90402],
	},
	{
		id: `9`,
		label: `В. Маяковского`,
		direction: DirectionsNew.out,
		latLon: [56.464614, 84.907864],
	},
	{
		id: `10`,
		label: `Набережная`,
		direction: DirectionsNew.out,
		latLon: [56.45292620490357, 84.92287951144814],
	},
	{
		id: `11`,
		label: `Лагерный Сад`,
		direction: DirectionsNew.out,
		latLon: [56.455588, 84.951577],
	},
	{
		id: `12`,
		label: `Учебная`,
		direction: DirectionsNew.out,
		latLon: [56.459444, 84.951251],
	},
	{
		id: `13`,
		label: `ТЭМЗ`,
		direction: DirectionsNew.out,
		latLon: [56.462612, 84.951128],
	},
	{
		id: `14`,
		label: `ТГУ`,
		direction: DirectionsNew.out,
		latLon: [56.469669, 84.950769],
	},
	{
		id: `15`,
		label: `Новособорная`,
		direction: DirectionsNew.out,
		latLon: [56.474462, 84.950485],
	},
	{
		id: `16`,
		label: `Главпочтамт`,
		direction: DirectionsNew.out,
		latLon: [56.479882, 84.949912],
	},
	{
		id: `17`,
		label: `ТЮЗ`,
		direction: DirectionsNew.out,
		latLon: [56.48193, 84.949246],
	},
	{
		id: `18`,
		label: `ЦУМ`,
		direction: DirectionsNew.out,
		latLon: [56.49119, 84.948318],
	},

	{
		id: `19`,
		label: `Интернационалистов`,
		direction: DirectionsNew.out,
		latLon: [56.514892, 84.984452],
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
