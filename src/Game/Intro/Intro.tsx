import { GameButton, GameLayoutCentred, GameUIContainer, GAME_OVER_BG, MainGameLayout, Title } from 'Game/common'
import { Link, useSearchParams } from 'react-router-dom'

function Intro() {
	// const hs = localStorage.getItem('score') ? localStorage.getItem('score') : "???";
	const [searchParams] = useSearchParams()

	return (
		<MainGameLayout isWin={false} bg={GAME_OVER_BG}>
			<GameLayoutCentred>
				<GameUIContainer>
					<Title>Помоги работнику томскавтотранс найти дубли в расписании</Title>
				</GameUIContainer>

				<GameUIContainer>
					<Link to={`/game/doubles?${searchParams.toString()}`}>
						<GameButton>Играть!</GameButton>
					</Link>
				</GameUIContainer>
			</GameLayoutCentred>
		</MainGameLayout>
	)
}

export default Intro
