import { DirectionsNew, IOption, IStops, StopKeys } from '../Stops'

/**
 * Порядок массива = физический порядок остановок на плече «из города»
 * (Интернационалистов → Левобережный → Cеребряный бор). От него и от координат
 * зависит interpolateStopTimes(), поэтому порядок меняется только вместе с расписанием.
 *
 * Перевозчик печатает только Интернационалистов, пл. Ленина, Лагерный Сад и
 * Левобережный. Остальные остановки взяты из маршрута 112С в OpenStreetMap
 * (relation 16313537) — их время считается по соседним остановкам.
 *
 * Id уникальны во всех направлениях: карта и `?stop=` ищут остановку по id.
 */

export const STOPS_IN_LB: IStops<DirectionsNew.inLB>[] = [
	{
		id: `15`,
		label: `Интернационалистов`,
		direction: DirectionsNew.inLB,
		latLon: [56.513582, 84.989332],
	},
	{
		id: `48`,
		label: `Автопарк`,
		direction: DirectionsNew.inLB,
		latLon: [56.516815, 84.978774],
	},
	{
		id: `49`,
		label: `10-я поликлиника`,
		direction: DirectionsNew.inLB,
		latLon: [56.514602, 84.97577],
	},
	{
		id: `50`,
		label: `пр. Мира`,
		direction: DirectionsNew.inLB,
		latLon: [56.511798, 84.971992],
	},
	{
		id: `51`,
		label: `ул. Карла Ильмера`,
		direction: DirectionsNew.inLB,
		latLon: [56.508897, 84.968026],
	},
	{
		id: `52`,
		label: `Старокаштачная`,
		direction: DirectionsNew.inLB,
		latLon: [56.503244, 84.959101],
	},
	{
		id: `53`,
		label: `ул. Дальне-Ключевская`,
		direction: DirectionsNew.inLB,
		latLon: [56.504154, 84.950422],
	},
	{
		id: `54`,
		label: `Центральный рынок`,
		direction: DirectionsNew.inLB,
		latLon: [56.499326, 84.948191],
	},
	{
		id: `55`,
		label: `Речной вокзал`,
		direction: DirectionsNew.inLB,
		latLon: [56.494177, 84.947994],
	},
	{
		id: `56`,
		label: `ЦУМ`,
		direction: DirectionsNew.inLB,
		latLon: [56.489982, 84.947945],
	},
	{
		id: `16`,
		label: `пл. Ленина`,
		direction: DirectionsNew.inLB,
		latLon: [56.487565, 84.948113],
	},
	{
		id: `17`,
		label: `ТЮЗ`,
		direction: DirectionsNew.inLB,
		latLon: [56.483271, 84.948648],
	},
	{
		id: `18`,
		label: `Главпочтамт`,
		direction: DirectionsNew.inLB,
		latLon: [56.47866, 84.949825],
	},
	{
		id: `19`,
		label: `Новособорная`,
		direction: DirectionsNew.inLB,
		latLon: [56.475608, 84.949855],
	},
	{
		id: `20`,
		label: `ТГУ`,
		direction: DirectionsNew.inLB,
		latLon: [56.471262, 84.950286],
	},
	{
		id: `21`,
		label: `Библиотека ТГУ`,
		direction: DirectionsNew.inLB,
		latLon: [56.468215, 84.950393],
	},
	{
		id: `22`,
		label: `ТЭМЗ`,
		direction: DirectionsNew.inLB,
		latLon: [56.463891, 84.950634],
	},
	{
		id: `23`,
		label: `Учебная`,
		direction: DirectionsNew.inLB,
		latLon: [56.460093, 84.950776],
	},
	{
		id: `24`,
		label: `Лагерный Сад`,
		direction: DirectionsNew.inLB,
		latLon: [56.45532, 84.950723],
	},
	{
		id: `25`,
		label: `Левитана`,
		direction: DirectionsNew.inLB,
		latLon: [56.446951, 84.921565],
	},
	{
		id: `26`,
		label: `Синее небо`,
		direction: DirectionsNew.inLB,
		latLon: [56.445827, 84.917034],
	},
	{
		id: `27`,
		label: `Этюд`,
		direction: DirectionsNew.inLB,
		latLon: [56.441423, 84.916935],
	},
	{
		id: `28`,
		label: `Гармония`,
		direction: DirectionsNew.inLB,
		latLon: [56.441418, 84.919334],
	},
	{
		id: `29`,
		label: `Три элемента`,
		direction: DirectionsNew.inLB,
		latLon: [56.444195, 84.919244],
	},
	{
		id: `30`,
		label: `Cеребряный бор`,
		direction: DirectionsNew.inLB,
		latLon: [56.459504, 84.906008],
	},
]

export const StopsInLbOptions: IOption<StopKeys | null>[] = [
	{
		label: `Не выбрано`,
		value: null,
	},
	...STOPS_IN_LB.map(stop => ({
		label: stop.label,
		value: stop.label,
	})),
]
