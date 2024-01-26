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
	character: ICharacter
	message?: string
}

export interface ICharacter {
	nose: 'rocket'
	eye: {
		left: 'default'
		right: 'default'
	}
	mouth: 'default'
	skulp: 'default'
	body: 'default'
}
