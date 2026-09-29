import { DirectionsNew, IOption, IStops, StopKeys } from '../Stops'

/**
 * Порядок массива = физический порядок остановок на обратном плече маршрута
 * (Серебряный бор → город). От него зависит interpolateStopTimes(), поэтому
 * менять порядок можно только вместе с расписанием.
 *
 * С сентября 2026 автобус на обратном пути делает петлю через Маяк:
 * Серебряный бор → Анны Ахматовой → Маяк → ул. М. Цветаевой → В. Маяковского →
 * Набережная → мост → Лагерный Сад → пр. Ленина. `Маяк` и `ул. М. Цветаевой`
 * теперь обслуживаются только здесь: в направлении «из города» их больше нет
 * (STOPS_IN_SP пуст), так что для этих остановок «В город» — единственный вариант.
 *
 * `пл. Ленина` в этом направлении появилась вместе с сентябрьским расписанием:
 * перевозчик начал печатать её в обратном плече. Без неё ТЮЗ и ЦУМ считались бы
 * интерполяцией через весь перегон Лагерный Сад → Интернационалистов (29 минут).
 *
 * Левобережье и северные остановки (Речной вокзал … Сбербанк) перевозчик не печатает:
 * они взяты из маршрута 112С в OpenStreetMap (relation 16313536), время по ним
 * считается по соседним остановкам. Id уникальны во всех направлениях — раньше
 * 15–19 совпадали с STOPS_IN_LB, и клик по пину «в город» выбирал остановку «из города».
 */

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
		id: `33`,
		label: `Маяк`,
		direction: DirectionsNew.out,
		latLon: [56.473628, 84.898782],
	},
	{
		id: `34`,
		label: `ул. М. Цветаевой`,
		direction: DirectionsNew.out,
		latLon: [56.471773, 84.899635],
	},
	{
		id: `9`,
		label: `В. Маяковского`,
		direction: DirectionsNew.out,
		latLon: [56.464614, 84.907864],
	},
	{
		id: `57`,
		label: `Левобережье`,
		direction: DirectionsNew.out,
		latLon: [56.462626, 84.91275],
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
		id: `43`,
		label: `Новособорная`,
		direction: DirectionsNew.out,
		latLon: [56.474462, 84.950485],
	},
	{
		id: `44`,
		label: `Главпочтамт`,
		direction: DirectionsNew.out,
		latLon: [56.479882, 84.949912],
	},
	{
		id: `45`,
		label: `ТЮЗ`,
		direction: DirectionsNew.out,
		latLon: [56.48193, 84.949246],
	},
	{
		id: `42`,
		label: `пл. Ленина`,
		direction: DirectionsNew.out,
		latLon: [56.487565, 84.948678],
	},
	{
		id: `46`,
		label: `ЦУМ`,
		direction: DirectionsNew.out,
		latLon: [56.49119, 84.948318],
	},
	{
		id: `58`,
		label: `Речной вокзал`,
		direction: DirectionsNew.out,
		latLon: [56.494721, 84.948411],
	},
	{
		id: `59`,
		label: `Центральный рынок`,
		direction: DirectionsNew.out,
		latLon: [56.497763, 84.948566],
	},
	{
		id: `60`,
		label: `ул. Дальне-Ключевская`,
		direction: DirectionsNew.out,
		latLon: [56.503694, 84.949495],
	},
	{
		id: `61`,
		label: `Старокаштачная`,
		direction: DirectionsNew.out,
		latLon: [56.503347, 84.956125],
	},
	{
		id: `62`,
		label: `ул. Карла Ильмера`,
		direction: DirectionsNew.out,
		latLon: [56.507813, 84.967339],
	},
	{
		id: `63`,
		label: `пр. Мира`,
		direction: DirectionsNew.out,
		latLon: [56.510537, 84.971052],
	},
	{
		id: `64`,
		label: `10-я поликлиника`,
		direction: DirectionsNew.out,
		latLon: [56.514345, 84.976303],
	},
	{
		id: `65`,
		label: `Сбербанк`,
		direction: DirectionsNew.out,
		latLon: [56.516588, 84.980648],
	},
	{
		id: `47`,
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
