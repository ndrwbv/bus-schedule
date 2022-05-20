import { GameButton, GameLayoutCentred, GameUIContainer, GAME_OVER_BG, MainGameLayout, Title } from 'Game/common'
import { Link } from 'react-router-dom'

function Intro() {
	// const hs = localStorage.getItem('score') ? localStorage.getItem('score') : "???";

	return (
		<MainGameLayout isWin={false} bg={GAME_OVER_BG}>
			<GameLayoutCentred>
				<GameUIContainer>
					<Title>Помоги работнику томскавтотранс найти дубли в рассписании</Title>
				</GameUIContainer>


				<GameUIContainer>
					<Link to="/game/doubles">
						<GameButton>Играть!</GameButton>
					</Link>
				</GameUIContainer>
			</GameLayoutCentred>
		</MainGameLayout>
	)
}

export default Intro
