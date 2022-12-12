import { Directions, StopKeys } from 'shared/store/busStop/Stops'

export enum ComplainType {
	'earlier' = `earlier`,
	'later' = `later`,
	not_arrive = `not_arrive`,
}

export interface IComplains {
	stop: StopKeys
	direction: Directions
	date: string
	type: ComplainType
	on: number
}

export interface IComplainsResponse extends IComplains {
	id: number
}
