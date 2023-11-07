import { styled } from 'styled-components'

export const StripAdStyled = styled.div`
	position: relative;
	color: white;
`

export const StripBGCardStyled = styled.div`
	border-radius: 25px 25px 0 0;
`

export const StripAdVideoBlockStyled = styled.div`
	border-radius: 20px;
	overflow: hidden;
	background-image: url('/stripad/strip-thumbnail.png');
	background-size: cover;
	min-height: 275px;
	background-position: center;

	display: flex;
	flex-direction: column;
	justify-content: flex-end;

	padding: 20px;
`

export const StipThumbnailContainerStyled = styled.div`
	position: absolute;
	top: 0;
	left: 0;
`

export const StripTextBlockStyled = styled.div`
	p + p {
		margin-top: 8px;
	}
`

export const StipDiscountStyled = styled.p`
	span {
		background-color: #f51313;
		padding: 3px 9px;
		border-radius: 14px;
	}
`
export const StipHeaderStyled = styled.p`
	font-size: 24px;
	font-weight: bold;
`

export const StipBottomSheetContainerStyled = styled.div`
	background-color: #000;
	color: #fff;
	border-radius: 25px 25px 0 0;
	min-height: 60vh;

	@media all and (min-width: 766px) {
		border-radius: 34px 34px 0 0;
	}
`

export const StripVideoContainerStyled = styled.div`
	width: 100%;
	max-height: 550px;
	overflow: hidden;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1;

	border-radius: 20px 20px 0 0;

	video {
		width: 100%;
	}
`

export const StripTextContainerStyled = styled.div`
	display: flex;
	flex-direction: column;
	padding: 35px;

	div {
		margin-top: 26px;
	}
`

export const StipVideoHeaderStyled = styled.div`
	position: absolute;
	top: 28px;
	left: 50%;
	transform: translate(-50%, 0);
	z-index: 2;
	text-align: center;

	${StipHeaderStyled} {
		white-space: nowrap;
		margin-top: 9px;
	}
`

export const StripBottomSheetHeaderContainerStyled = styled.div`
	height: 50vh;

	position: relative;
	overflow: hidden;
`

export const StipActionsStyled = styled.div`
	position: absolute;
	bottom: 40px;
	z-index: 2;
	left: 50%;
	transform: translate(-50%, 0);
`
