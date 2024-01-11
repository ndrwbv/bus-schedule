import { IPassenger } from '../../entities/Passenger/IPassenger'
import { IGameComplain } from './IGameComplain'

export const getComplainByPassenger = (passenger: IPassenger): null | IGameComplain => {
	if (passenger.secondName === `Бебуревшивили`) {
		return {
			passenger,
			message: `Бесишь`,
		}
	}

	return null
}
