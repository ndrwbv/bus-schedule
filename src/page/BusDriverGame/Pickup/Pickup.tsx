import { FC, useEffect, useState } from 'react'

import { IPassenger } from '../entities/Passenger/IPassenger'
import { PassengerDetails } from '../entities/Passenger/PassengerDetails/PassengerDetails'
import { PassengerList } from '../entities/Passenger/PassengerList/PassengerList'
import { PickupStyled } from './Pickup.styles'

interface IProps {
	nextState: () => void
	updatePassengersData: (accepted: IPassenger[], rejected: IPassenger[]) => void
	waitingPassengers: IPassenger[]
}

const PassengerAcceptence: FC<{
	passenger: IPassenger
	onAccept: (passenger: IPassenger) => void
	onReject: (passenger: IPassenger) => void
}> = ({ passenger, onAccept, onReject }) => {
	return (
		<div style={{ border: `1px solid red` }}>
			<PassengerDetails {...passenger} />
			<button type="button" onClick={() => onAccept(passenger)}>
				Accept
			</button>
			<button type="button" onClick={() => onReject(passenger)}>
				Reject
			</button>
		</div>
	)
}
export const Pickup: FC<IProps> = ({ nextState, updatePassengersData, waitingPassengers }) => {
	const [queue, setQueue] = useState<IPassenger[]>(waitingPassengers)
	const [accepted, setAccepted] = useState<IPassenger[]>([])
	const [rejected, setRejected] = useState<IPassenger[]>([])

	const handleAccept = (passenger: IPassenger): void => {
		setAccepted(prev => [...prev, passenger])
		setQueue(prev => prev.filter(p => p.id !== passenger.id))
	}

	const handleReject = (passenger: IPassenger): void => {
		setRejected(prev => [...prev, passenger])
		setQueue(prev => prev.filter(p => p.id !== passenger.id))
	}

	useEffect(() => {
		if (queue.length === 0) {
			updatePassengersData(accepted, rejected)
			nextState()
		}
	}, [accepted, nextState, queue.length, rejected, updatePassengersData])

	return (
		<PickupStyled>
			Pickup{` `}
			<PassengerList list={queue} />
			<PassengerAcceptence passenger={queue[0]} onAccept={handleAccept} onReject={handleReject} />
		</PickupStyled>
	)
}
