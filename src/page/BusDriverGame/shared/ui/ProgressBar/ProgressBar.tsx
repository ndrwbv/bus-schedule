import { FC, useEffect, useState } from 'react'

import * as P from './styled'

interface IProgressBarUIProps {
	bgcolor: string
	completed: number
}

export const ProgressBarUI: FC<IProgressBarUIProps> = ({ bgcolor, completed }) => {
	return (
		<P.ContainerStyled>
			<P.FillerStyled bgcolor={bgcolor} style={{ width: `${completed}%` }} />
		</P.ContainerStyled>
	)
}

export const ProgressBar: FC<{ bgcolor: string; start: boolean; speed?: number; onEnd: () => void }> = ({
	bgcolor,
	start,
	speed = 10,
	onEnd,
}) => {
	const [completed, setCompleted] = useState(0)
	const [endScheduled, setEndScheduled] = useState(false)

	useEffect(() => {
		if (!start) {
			return
		}

		if (completed === 100 && endScheduled === false) {
			setEndScheduled(true)
		}

		setTimeout(() => {
			setCompleted(prev => (prev === 100 ? prev : prev + 1))
		}, speed)
	}, [start, completed, speed, endScheduled])

	useEffect(() => {
		if (endScheduled) {
			setTimeout(() => onEnd(), 800)
		}
	}, [endScheduled, onEnd])

	return <ProgressBarUI completed={completed} bgcolor={bgcolor} />
}
