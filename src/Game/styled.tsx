import styled from 'styled-components'

export const GameContainer = styled.div<{ animate: boolean }>`
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr 1fr;
	grid-gap: 9px;

	animation-duration: 2s;
	animation-name: ${props => (props.animate ? 'fadeup' : 'inherit')};

	@keyframes fadeup {
		0% {
			opacity: 0.6;
		}

		100% {
			opacity: 1;
		}
	}
`

const getColor = (selected: boolean, destroyed: boolean) => {
	return `rgba(0, 0, 0, ${destroyed ? '0.54' : '0.74'})`
}
export const GameCell = styled.button<{ selected: boolean; destroyed: boolean }>`
	position: relative;

	padding: 0.9rem;
	display: flex;
	align-items: center;
	justify-content: center;

	font-weight: 700;

	font-size: 14px;

	max-width: 100px;

	border-radius: 8px;
	background-color: ${props => getColor(props.selected, props.destroyed)};

	color: ${props => (props.destroyed ? 'rgba(255, 255, 255, 0.64)' : 'white')};

	border: ${props => (props.selected ? '2px solid white' : '2px solid transparent')};

	&::after {
		content: ${props => (props.destroyed ? 'unset' : "''")};
		position: absolute;
		top: 3px;
		left: 0;
		width: 85%;
		height: 4px;
		margin: 0 6px;

		background: rgba(255, 255, 255, 0.14);
		border-radius: 19px;
	}

	&::before {
		content: '';
		padding-bottom: 100%;
		display: block;
	}
`

export const GameRow = styled.div`
	display: flex;
	justify-content: space-between;

	& + & {
		margin-top: 12px;
	}
`

export const GameTitle = styled.h1`
	font-weight: bold;
	font-size: 24px;
	margin-bottom: 24px;
`

export const WhiteTextBlock = styled.div`
	font-weight: 600;
	line-height: 22px;
	font-size: 14px;

	color: #ffffff;

	background: rgba(0, 0, 0, 0.25);
	border-radius: 14px;

	padding: 11px 12px;
`

export const GameReaction = styled.div<{ animate: boolean; bg: string }>`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;

	opacity: 0;
	animation-duration: 1s;
	animation-name: ${props => (props.animate ? 'reaction' : 'inherit')};

	background: ${props => props.bg};

	z-index: 0;
	@keyframes reaction {
		0% {
			opacity: 0;
		}

		50% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}
`
