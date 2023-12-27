export type StopKeysIn =
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
	| 'Марины Цветаевой (Торта)'
	| 'Маяк'
	| 'Марины Цветаевой'
	| 'Анны Ахматовой'
	| 'Cеребряный бор'

export type StopKeysOut =
	| 'Cеребряный бор'
	| 'Анны Ахматовой'
	| 'Поликлиника (Алые Паруса)'
	| 'В. Маяковского'
	| 'Набережная'
	| 'Лагерный Сад'
	| 'Учебная'
	| 'ТЭМЗ'
	| 'ТГУ'
	| 'Новособорная'
	| 'Главпочтамт'
	| 'ТЮЗ'
	| 'ЦУМ'
	| 'Интернационалистов'

export type StopKeys = StopKeysIn | StopKeysOut
export type Directions = 'in' | 'out'
export enum DirectionsNew {
	in = `in`,
	out = `out`,
}
export interface IOption<ValueType> {
	value: ValueType
	label: string
}

export type ICoordites = [number, number]

export interface IStops<T extends DirectionsNew> {
	id: string
	direction: T
	label: StopKeysMap[T]
	latLon: ICoordites
}

type StopKeysMap = {
	[DirectionsNew.in]: StopKeysIn
	[DirectionsNew.out]: StopKeysOut
}
