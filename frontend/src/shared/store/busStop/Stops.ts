export type StopKeysInSP =
	| 'Интернационалистов'
	| 'пл. Ленина'
	| 'ТЮЗ'
	| 'Главпочтамт'
	| 'Новособорная'
	| 'ТГУ'
	| 'Библиотека ТГУ'
	| 'ТЭМЗ'
	| 'Учебная'
	| 'Лагерный Сад'
	| 'Набережная'
	| 'В. Маяковского'
	| 'Поликлиника'
	| 'ул. М. Цветаевой'
	| 'Маяк'
	| 'Анны Ахматовой'
	| 'Cеребряный бор'

export type StopKeysInLB =
	| 'Интернационалистов'
	| 'Автопарк'
	| '10-я поликлиника'
	| 'пр. Мира'
	| 'ул. Карла Ильмера'
	| 'Старокаштачная'
	| 'ул. Дальне-Ключевская'
	| 'Центральный рынок'
	| 'Речной вокзал'
	| 'ЦУМ'
	| 'пл. Ленина'
	| 'ТЮЗ'
	| 'Главпочтамт'
	| 'Новособорная'
	| 'ТГУ'
	| 'Библиотека ТГУ'
	| 'ТЭМЗ'
	| 'Учебная'
	| 'Лагерный Сад'
	| 'Левитана'
	| 'Синее небо'
	| 'Этюд'
	| 'Гармония'
	| 'Три элемента'
	| 'Cеребряный бор'

export type StopKeysOut =
	| 'Левитана'
	| 'Синее небо'
	| 'Этюд'
	| 'Гармония'
	| 'Три элемента'
	| 'Cеребряный бор'
	| 'Анны Ахматовой'
	| 'Поликлиника (Алые Паруса)'
	| 'Маяк'
	| 'ул. М. Цветаевой'
	| 'В. Маяковского'
	| 'Левобережье'
	| 'Набережная'
	| 'Лагерный Сад'
	| 'Учебная'
	| 'ТЭМЗ'
	| 'ТГУ'
	| 'Новособорная'
	| 'Главпочтамт'
	| 'ТЮЗ'
	| 'пл. Ленина'
	| 'ЦУМ'
	| 'Речной вокзал'
	| 'Центральный рынок'
	| 'ул. Дальне-Ключевская'
	| 'Старокаштачная'
	| 'ул. Карла Ильмера'
	| 'пр. Мира'
	| '10-я поликлиника'
	| 'Сбербанк'
	| 'Интернационалистов'

export type StopKeys = StopKeysInSP | StopKeysOut | StopKeysInLB
export type Directions = 'inSP' | 'out' | 'inLB'
export enum DirectionsNew {
	inSP = `inSP`,
	out = `out`,
	inLB = `inLB`,
}
export enum UserDirection {
	fromCity = `fromCity`,
	toCity = `toCity`,
}
export interface IOption<ValueType> {
	value: ValueType
	label: string
}

export interface TaggedTime {
	time: string
	via: 'park' | 'lb' | null
	/** Internal direction the trip belongs to — together with dayKey + tripIndex it identifies the trip */
	direction: DirectionsNew
	dayKey: number
	/** Index of the trip in the direction's per-stop time arrays (trips are aligned by index) */
	tripIndex: number
	interpolated?: boolean
	/** Human-readable label of the stops used for interpolation, e.g. "Набережная и В. Маяковского" */
	interpolatedFrom?: string
}

export type ICoordites = [number, number]

export interface IStops<T extends DirectionsNew> {
	id: string
	direction: T
	label: StopKeysMap[T]
	latLon: ICoordites
}

type StopKeysMap = {
	[DirectionsNew.inSP]: StopKeysInSP
	[DirectionsNew.inLB]: StopKeysInLB
	[DirectionsNew.out]: StopKeysOut
}
