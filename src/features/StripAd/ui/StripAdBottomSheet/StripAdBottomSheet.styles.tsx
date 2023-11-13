import { styled } from 'styled-components'

import { StripHeaderStyled } from '../StripHeader/StripHeader.styles'

export const StripBottomSheetHeaderContainerStyled = styled.div`
	height: 50vh;

	position: relative;
	overflow: hidden;

	background-image: url('/stripad/strip-thumbnail.png');
	background-size: cover;
	background-position-y: 50%;
`

export const StripVideoContainerStyled = styled.div<{ $width: number; $radius: string }>`
	width: 100%;
	max-height: ${props => props.$width}px;
	overflow: hidden;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1;

	border-radius: ${props => props.$radius};

	video {
		width: 100%;
	}
`

export const StripActionsStyled = styled.div`
	position: absolute;
	bottom: 40px;
	z-index: 6;
	left: 50%;
	transform: translate(-50%, 0);
	display: flex;
	gap: 40px;
	align-items: center;
`

export const StripBottomSheetContainerStyled = styled.div`
	background-color: #000;
	color: #fff;
	border-radius: 25px 25px 0 0;
	min-height: 60vh;

	overflow: hidden;

	@media all and (min-width: 766px) {
		border-radius: 34px 34px 0 0;
	}
`

export const StripVideoHeaderStyled = styled.div`
	position: absolute;
	top: 28px;
	left: 50%;
	transform: translate(-50%, 0);
	z-index: 2;
	text-align: center;

	${StripHeaderStyled} {
		white-space: nowrap;
		margin-top: 9px;
	}
`

export const StripActionButtonStyled = styled.a`
	border: 1px solid #fff;
	border-radius: 23px;
	color: #fff;
	padding: 6px 14px;
`

export const StripTextContainerStyled = styled.div`
	display: flex;
	flex-direction: column;
	padding: 35px;

	div {
		margin-top: 26px;
	}

	a {
		color: #fff;
		text-decoration: underline;
	}
`
