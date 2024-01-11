export interface IPassenger {
	id: string
	name: string
	secondName: string
	zodiakSign: string
	occupation: string
	travel: {
		fromStopIndex: number
		toStopIndex: number
	}
}
