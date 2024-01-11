import { IPassenger } from '../../entities/Passenger/IPassenger'
import { getComplainByPassenger } from './getComplainByPassenger'
import { IGameComplain } from './IGameComplain'

export const calculateComplains = (passengers: IPassenger[]): IGameComplain[] => {
	const complains = passengers.map(p => getComplainByPassenger(p))

	return complains.filter((complain: IGameComplain | null): complain is IGameComplain => complain !== null)
}
