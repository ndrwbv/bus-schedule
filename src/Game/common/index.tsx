import { Link } from 'react-router-dom'
import styled from 'styled-components'

const GAME_BG = 'linear-gradient(180.17deg, #723CB7 0.15%, #7C86E7 65.58%, #336CFF 99.85%)'
const GAME_WIN_BG = 'linear-gradient(180.17deg, #723CB7 0.15%, #FF47E2 99.85%)'
export const GameLink = styled(Link)<{ lowLight: boolean }>`
	color: #0364f6;
	text-decoration: underline;
	opacity: ${props => (props.lowLight ? '0.5' : '1')};
`

export const GameUIContainer = styled.div<{ marginBottom?: number }>`
	margin-bottom: ${props => (props.marginBottom ? `${props.marginBottom} px` : '32px')};
`

export const Title = styled.h1`
	font-size: 18px;
	text-align: center;
`

export const GameButton = styled.button`
	width: 100%;
	border-radius: 14px;
	background-color: green;
	padding: 20px;
`
export const MainGameLayout = styled.div<{ isWin: boolean }>`
	display: flex;
	justify-content: center;
	background: ${GAME_BG};
	height: 100%;

	animation-duration: 2s;
	animation-name: ${props => (props.isWin ? 'win' : 'inherit')};

	@keyframes win {
		0% {
			background: ${GAME_BG};
		}

		50% {
			background: ${GAME_WIN_BG};
		}

		100% {
			background: ${GAME_BG};
		}
	}
`

export const GameLayout = styled.div`
	max-width: 550px;
	width: 100%;

	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 32px;
`

export const GameLayoutCentred = styled(GameLayout)`
	justify-content: center;
`
