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
