import { FC } from 'react'
import { STOPS } from 'shared/store/busStop/const/stops'

import { randomInt } from '../entities/Passenger/helpers/randomInt'
import { IPassenger } from '../entities/Passenger/IPassenger'
import { PassengerList } from '../entities/Passenger/PassengerList/PassengerList'
import { ProgressBar } from '../shared/ui/ProgressBar/ProgressBar'
import { RidingPassengersStyled, RidingStyled } from './Riding.styles'

interface IProps {
	nextState: () => void
	passengers: IPassenger[]
	stopIndex: number
}
export const Riding: FC<IProps> = ({ nextState, passengers, stopIndex }) => {
	return (
		<RidingStyled>
			<h1 style={{ fontSize: `20px`, fontWeight: `bold`, alignSelf: `center` }}>
				Едем до {STOPS[stopIndex].label}-{stopIndex}
			</h1>

			<RidingPassengersStyled>
				<PassengerList list={passengers} />
			</RidingPassengersStyled>

			<ProgressBar bgcolor="red" start speed={randomInt(5, 100)} onEnd={nextState} />
		</RidingStyled>
	)
}
