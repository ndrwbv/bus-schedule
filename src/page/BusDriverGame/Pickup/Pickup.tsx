import { FC, useEffect, useState } from 'react'

import { IPassenger } from '../entities/Passenger/IPassenger'
import { PassengerDetails } from '../entities/Passenger/PassengerDetails/PassengerDetails'
import { PassengerList } from '../entities/Passenger/PassengerList/PassengerList'
import { GameButton } from '../shared/ui/GameButton/GameButton'
import {
	BgOverlayStyled,
	ButtonContaintainerStyled,
	PassengerAcceptenceStyled,
	PickupContentStyled,
	PickupStyled,
} from './Pickup.styles'

interface IProps {
	nextState: () => void
	updatePassengersData: (accepted: IPassenger[], rejected: IPassenger[]) => void
	waitingPassengers: IPassenger[]
	total: number
	limit: number
}

const PassengerAcceptence: FC<{
	passenger: IPassenger
	onAccept: (passenger: IPassenger) => void
	onReject: (passenger: IPassenger) => void
	onCancel: () => void
	limitExceed: boolean
}> = ({ passenger, onAccept, onReject, limitExceed, onCancel }) => {
	return (
		<>
			<BgOverlayStyled onClick={onCancel} />
			<PassengerAcceptenceStyled>
				<PassengerDetails {...passenger} />

				<ButtonContaintainerStyled>
					<GameButton onClick={() => onAccept(passenger)} disabled={limitExceed}>
						Принять
					</GameButton>
					<GameButton onClick={() => onReject(passenger)}>Отклонить</GameButton>
				</ButtonContaintainerStyled>
			</PassengerAcceptenceStyled>
		</>
	)
}
export const Pickup: FC<IProps> = ({ nextState, updatePassengersData, waitingPassengers, limit, total }) => {
	const [queue, setQueue] = useState<IPassenger[]>(waitingPassengers)
	const [accepted, setAccepted] = useState<IPassenger[]>([])
	const [rejected, setRejected] = useState<IPassenger[]>([])
	const [currentPassenger, setCurrentPassenger] = useState<IPassenger | null>(null)

	const handleAccept = (passenger: IPassenger): void => {
		setAccepted(prev => [...prev, passenger])
		setQueue(prev => prev.filter(p => p.id !== passenger.id))
		setCurrentPassenger(null)
	}

	const handleReject = (passenger: IPassenger): void => {
		setRejected(prev => [...prev, passenger])
		setQueue(prev => prev.filter(p => p.id !== passenger.id))
		setCurrentPassenger(null)
	}

	const updateCurrentPassenger = (passenger: IPassenger | null): void => {
		setCurrentPassenger(passenger)
	}

	const handleResetPassenger = (): void => {
		setCurrentPassenger(null)
	}

	useEffect(() => {
		if (queue.length === 0 && waitingPassengers.length !== 0) {
			updatePassengersData(accepted, rejected)
			nextState()
		}
	}, [accepted, nextState, queue.length, rejected, updatePassengersData, waitingPassengers.length])

	if (waitingPassengers.length === 0) {
		return (
			<PickupStyled>
				<h1>На этой остановке нет пассажиров</h1>
				<GameButton onClick={nextState}>Едем дальше</GameButton>
			</PickupStyled>
		)
	}

	const limitExceed = accepted.length + total >= limit

	return (
		<PickupStyled>
			<PickupContentStyled>
				<PassengerList list={queue} onClick={updateCurrentPassenger} />
			</PickupContentStyled>

			{currentPassenger ? (
				<PassengerAcceptence
					passenger={currentPassenger}
					onAccept={handleAccept}
					onReject={handleReject}
					limitExceed={limitExceed}
					onCancel={handleResetPassenger}
				/>
			) : null}
		</PickupStyled>
	)
}
