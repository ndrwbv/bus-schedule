import { Link, useSearchParams } from 'react-router-dom'
import { GameButton, GameLayoutCentred, GameUIContainer, GAME_OVER_BG, MainGameLayout, Title } from 'page/Game/common'
import { AndrewLytics } from 'shared/lib'
import { BackToSchedule } from '../styled'

function Intro() {
	// const hs = localStorage.getItem('score') ? localStorage.getItem('score') : "???";
	const [searchParams] = useSearchParams()

	return (
		<MainGameLayout isWin={false} bg={GAME_OVER_BG}>
			<GameLayoutCentred>
				<BackToSchedule>
					<Link to={`/?${searchParams.toString()}`} onClick={() => AndrewLytics('game.intro.backToSchedule')}>
						Вернуться к расписанию
					</Link>
				</BackToSchedule>
				<GameUIContainer>
					<Title>Помоги найти дубли в расписании</Title>
				</GameUIContainer>

				<GameUIContainer>
					<Link
						to={`/game/doubles?${searchParams.toString()}`}
						onClick={() => AndrewLytics('game.introPlay')}
					>
						<GameButton>Играть!</GameButton>
					</Link>
				</GameUIContainer>
			</GameLayoutCentred>
		</MainGameLayout>
	)
}

export default Intro
