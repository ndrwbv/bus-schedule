import { AndrewLytics } from 'shared/lib'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { StyledScore } from './styled'

const HeaderScore = () => {
	const [searchParams] = useSearchParams()
	const [score, setScore] = useState<undefined | string>(undefined)

	useEffect(() => {
		const score = localStorage.getItem('score')
		if (score && !isNaN(Number(score))) {
			setScore(score)
		}
	}, [])

	if (!score) return null

	return (
		<Link to={`/game?${searchParams.toString()}`} onClick={() => AndrewLytics('game.headerScore')}>
			<StyledScore selected={false} destroyed={false}>
				{score}
			</StyledScore>
		</Link>
	)
}

export default HeaderScore
