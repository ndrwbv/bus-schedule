import { DirectionsNew, IOption, IStops, StopKeys } from '../Stops'

export const STOPS_IN: IStops<DirectionsNew.in>[] = [
	{
		id: `15`,
		label: `Интернационалистов`,
		direction: DirectionsNew.in,
		latLon: [56.513582, 84.989332],
	},
	{
		id: `16`,
		label: `пл. Ленина`,
		direction: DirectionsNew.in,
		latLon: [56.487565, 84.948113],
	},
	{
		id: `17`,
		label: `ТЮЗ`,
		direction: DirectionsNew.in,
		latLon: [56.483271, 84.948648],
	},
	{
		id: `18`,
		label: `Главпочтамт`,
		direction: DirectionsNew.in,
		latLon: [56.47866, 84.949825],
	},
	{
		id: `19`,
		label: `Новособорная`,
		direction: DirectionsNew.in,
		latLon: [56.475608, 84.949855],
	},
	{
		id: `20`,
		label: `ТГУ`,
		direction: DirectionsNew.in,
		latLon: [56.471262, 84.950286],
	},
	{
		id: `21`,
		label: `Библиотека ТГУ`,
		direction: DirectionsNew.in,
		latLon: [56.468215, 84.950393],
	},
	{
		id: `22`,
		label: `ТЭМЗ`,
		direction: DirectionsNew.in,
		latLon: [56.463891, 84.950634],
	},
	{
		id: `23`,
		label: `Учебная`,
		direction: DirectionsNew.in,
		latLon: [56.460093, 84.950776],
	},
	{
		id: `24`,
		label: `Лагерный Сад`,
		direction: DirectionsNew.in,
		latLon: [56.45532, 84.950723],
	},
	{
		id: `25`,
		label: `Набережная`,
		direction: DirectionsNew.in,
		latLon: [56.45299174653839, 84.92356152809053],
	},
	{
		id: `26`,
		label: `В. Маяковского`,
		direction: DirectionsNew.in,
		latLon: [56.463818, 84.908527],
	},
	{
		id: `27`,
		label: `Поликлиника`,
		direction: DirectionsNew.in,
		latLon: [56.468351, 84.903903],
	},
	{
		id: `28`,
		label: `Марины Цветаевой (Торта)`,
		direction: DirectionsNew.in,
		latLon: [56.471773, 84.900123],
	},
	{
		id: `29`,
		label: `Марины Цветаевой`,
		direction: DirectionsNew.in,
		latLon: [56.470749, 84.900316],
	},
	{
		id: `30`,
		label: `Анны Ахматовой`,
		direction: DirectionsNew.in,
		latLon: [56.462885, 84.905252],
	},
	{
		id: `31`,
		label: `Cеребряный бор`,
		direction: DirectionsNew.in,
		latLon: [56.459504, 84.906008],
	},
]

export const StopsInOptions: IOption<StopKeys | null>[] = [
	{
		label: `Не выбрано`,
		value: null,
	},
	...STOPS_IN.map(stop => ({
		label: stop.label,
		value: stop.label,
	})),
]
