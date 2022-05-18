import { GameButton, GameLayoutCentred, GameUIContainer, Title } from 'Game/common'
import { Link } from 'react-router-dom'

function Intro() {
	return (
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
	)
}

export default Intro
