import styled from 'styled-components'

export const FeedbackLinkStyled = styled.a`
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;

	padding: 23px 32px;
	width: 100%;

	background: #caeaff;
	border-radius: 15px;

	@media (hover: hover) {
		&:hover {
			opacity: 0.8;
		}
	}
`

export const FeedbackTextStyled = styled.div`
	font-weight: 600;
	font-size: 17px;
	line-height: 19px;

	color: #000000;
`

export const BirdWrapperStyled = styled.div`
	position: relative;
`

export const BirdContainerStyled = styled.div`
	position: absolute;
	top: -44px;
	right: 9px;
`
