import { styled } from 'styled-components'

export const StripAdStyled = styled.div`
	position: relative;
	color: white;
	height: 275px;
	padding: 30px 12px;

	&::before {
		content: '';
		height: 20px;
		width: 100%;
		position: absolute;
		left: 0;
		top: -30px;
		background: linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.31) 0%,
			rgba(0, 0, 0, 0.16) 27.08%,
			rgba(0, 0, 0, 0.07) 47.4%,
			rgba(0, 0, 0, 0.05) 67.19%,
			rgba(0, 0, 0, 0.02) 86.46%,
			rgba(0, 0, 0, 0) 100%
		);
		z-index: 0;
	}

	&::after {
		content: '';
		height: 20px;
		width: 100%;
		position: absolute;
		left: 0;
		bottom: -30px;
		background: linear-gradient(
			180deg,
			rgba(0, 0, 0, 0.31) 0%,
			rgba(0, 0, 0, 0.16) 27.08%,
			rgba(0, 0, 0, 0.07) 47.4%,
			rgba(0, 0, 0, 0.05) 67.19%,
			rgba(0, 0, 0, 0.02) 86.46%,
			rgba(0, 0, 0, 0) 100%
		);
		z-index: 1;
	}
`

export const BGOverlayStyled = styled.div`
	height: 350px;
	width: 100%;
	position: absolute;
	left: 0;
	top: -12px;
	background-color: #000;
	z-index: 0;
`

export const StripContentStyled = styled.div`
	position: absolute;
	z-index: 1;
	top: 50%;
	transform: translate(0, -50%);
`

export const StripBGCardStyled = styled.div`
	border-radius: 25px 25px 0 0;
	background-color: #000;
`

export const StripAdVideoBlockStyled = styled.div`
	border-radius: 53px;
	padding: 17px 33px;
	border: 3px solid #ffffff24;
`
