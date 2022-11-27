import { DirectionsNew, IOption, IStops, StopKeys } from '../Stops'

export const STOPS_IN: IStops<DirectionsNew.in>[] = [
	{
		id: `15`,
		label: `Интернационалистов`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `16`,
		label: `пл. Ленина`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `17`,
		label: `ТЮЗ`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `18`,
		label: `Главпочтамт`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `19`,
		label: `Новособорная`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `20`,
		label: `ТГУ`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `21`,
		label: `Библиотека ТГУ`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `22`,
		label: `ТЭМЗ`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `23`,
		label: `Учебная`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `24`,
		label: `Лагерный Сад`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `25`,
		label: `Набережная`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `26`,
		label: `В. Маяковского`,
		direction: DirectionsNew.in,
		latLon: null,
	},
	{
		id: `27`,
		label: `Поликлиника`,
		direction: DirectionsNew.in,
		latLon: [84.904959, 56.467793],
	},
	{
		id: `28`,
		label: `Марины Цветаевой (Торта)`,
		direction: DirectionsNew.in,
		latLon: [84.900123, 56.471773],
	},
	{
		id: `29`,
		label: `Марины Цветаевой`,
		direction: DirectionsNew.in,
		latLon: [84.90048, 56.470898],
	},
	{
		id: `30`,
		label: `Анны Ахматовой`,
		direction: DirectionsNew.in,
		latLon: [84.906086, 56.463109],
	},
	{
		id: `31`,
		label: `Cеребряный бор`,
		direction: DirectionsNew.in,
		latLon: null,
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
