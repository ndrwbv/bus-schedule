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
	| 'Марины Цветаевой (Торта)'
	| 'Маяк'
	| 'Марины Цветаевой'
	| 'Анны Ахматовой'
	| 'Cеребряный бор'

export type StopKeysInLB =
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

export type StopKeys = StopKeysInSP | StopKeysOut | StopKeysInLB
export type Directions = 'inSP' | 'out' | 'inLB'
export enum DirectionsNew {
	inSP = `inSP`,
	out = `out`,
	inLB = `inLB`,
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
	[DirectionsNew.inSP]: StopKeysInSP
	[DirectionsNew.inLB]: StopKeysInLB
	[DirectionsNew.out]: StopKeysOut
}
