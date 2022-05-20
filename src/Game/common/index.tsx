import { Link } from 'react-router-dom'
import styled from 'styled-components'

const GAME_BG = 'linear-gradient(180.17deg, #723CB7 0.15%, #7C86E7 65.58%, #336CFF 99.85%)'
const GAME_WIN_BG = 'linear-gradient(180.17deg, #723CB7 0.15%, #FF47E2 99.85%)'
export const GameLink = styled(Link)<{ lowLight: boolean }>`
	color: #0364f6;
	text-decoration: underline;
	opacity: ${props => (props.lowLight ? '0.5' : '1')};
`
export const GAME_OVER_BG = 'linear-gradient(180.17deg, #5F55FF 0.15%, #6070FF 56.75%, #BB78F0 99.85%);'

export const GameUIContainer = styled.div<{ marginBottom?: number }>`
	margin-bottom: ${props => (props.marginBottom ? `${props.marginBottom} px` : '32px')};
`

export const Title = styled.h1`
	font-weight: 700;
	font-size: 23px;

	text-align: center;
	color: #ffffff;

	text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.13);
`

export const GameButton = styled.button`
	position: relative;
	width: 100%;

	padding: 20px;

	font-weight: 600;
	font-size: 20px;
	color: #ffffff;

	background: linear-gradient(89.43deg, #0f2fff 0.93%, #7a31cf 80.37%);
	box-shadow: 0px 2px 0px 1px rgba(0, 0, 0, 0.27);
	border-radius: 8px;

	&::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 0;
		width: 95%;
		height: 4px;
		margin: 0 6px;

		background: rgba(255, 255, 255, 0.14);
		border-radius: 19px;
	}
`
export const MainGameLayout = styled.div<{ isWin: boolean; bg?: string }>`
	display: flex;
	justify-content: center;
	background: ${props => (props.bg ? props.bg : GAME_BG)};
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

	font-family: 'Inter', 'Roboto', sans-serif;
`

export const GameLayoutCentred = styled(GameLayout)`
	justify-content: space-between;
`
