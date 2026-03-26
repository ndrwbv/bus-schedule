import { styled } from 'styled-components'

export const StripAdStyled = styled.div`
	position: relative;
	color: white;
`

export const StripAdVideoBlockStyled = styled.div`
	border-radius: 25px;
	overflow: hidden;
	background-image: url('/stripad/strip-thumbnail.png');
	background-size: cover;
	min-height: 92px;
	background-position-y: 160%;
	background-position-x: 50px;

	display: flex;
	flex-direction: column;
	justify-content: flex-end;

	padding: 20px;
`

export const StripTextBlockStyled = styled.div`
	position: absolute;
	z-index: 3;

	p + p {
		margin-top: 4px;
	}
`
