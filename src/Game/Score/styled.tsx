import styled from 'styled-components'

export const Score = styled.div<{ isBig: boolean }>`
	position: relative;

	display: flex;
	align-items: center;
	justify-content: center;

	color: white;
	width: ${props => (props.isBig ? '110px' : '60px')};
	height: ${props => (props.isBig ? '110px' : '60px')};

	border-radius: 50%;
	background: rgba(0, 0, 0, 0.4);

	font-weight: 900;
	font-size: ${props => (props.isBig ? '46px' : '26px')};
	line-height: 26px;
	z-index: 0;

	&::after {
		content: '';
		position: absolute;
		width: ${props => (props.isBig ? '140px' : '75px')};
		height: ${props => (props.isBig ? '140px' : '75px')};

		border-radius: 50%;
		background: rgba(0, 0, 0, 0.2);
		z-index: 0;
	}
`

export const ScoreValue = styled.div`
	z-index: 4;
`

export const PlusOne = styled.span<{ animate: boolean }>`
	position: absolute;
	bottom: -20px;
	right: -20px;
	font-weight: 700;
	font-size: 22px;
	line-height: 27px;
	color: rgba(255, 255, 255, 0.8);

	animation-duration: 0.5s;
	animation-name: ${props => (props.animate ? 'fadeup' : 'inherit')};

	@keyframes fadeup {
		0% {
			color: rgba(255, 255, 255, 0);
		}

		50% {
			color: rgba(255, 255, 255, 0.8);
		}

		100% {
			color: rgba(255, 255, 255, 0);
		}
	}
`

export const StartContainer = styled.div<{ isBig: boolean }>`
	position: absolute;
	top: 10px;
	right: ${props => (props.isBig ? '-55px' : '-31px')};
	z-index: 4;

	animation: ${props => (props.isBig ? 'scale infinite 2s' : 'unset')};

	@keyframes scale {
		0% {
			transform: scale(1.1);
		}

		50% {
			transform: scale(1);
		}

		100% {
			transform: scale(1.1);
		}
	}
`
