import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AndrewLytics } from 'shared/lib'

import { StyledScore } from './styled'

export const HeaderScore: React.FC = () => {
	const [searchParams] = useSearchParams()
	const [score, setScore] = useState<undefined | string>(undefined)

	useEffect(() => {
		const scoreToChange = localStorage.getItem(`score`)
		if (scoreToChange && !Number.isNaN(Number(scoreToChange))) {
			setScore(scoreToChange)
		}
	}, [])

	if (!score) return null

	return (
		<Link to={`/game?${searchParams.toString()}`} onClick={() => AndrewLytics(`game.headerScore`)}>
			<StyledScore $selected={false} $destroyed={false}>
				{score}
			</StyledScore>
		</Link>
	)
}
