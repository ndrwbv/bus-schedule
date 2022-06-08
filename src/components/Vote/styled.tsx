import styled from 'styled-components'

export const FeedbackLink = styled.a`
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;

	padding: 23px 32px;
	width: 100%;

	background: #caeaff;
	border-radius: 15px;

	&:hover {
		opacity: 0.8;
	}
`

export const FeedbackText = styled.div`
	font-weight: 600;
	font-size: 17px;
	line-height: 19px;

	color: #000000;
`

export const BirdWrapper = styled.div`
	position: relative;
`

export const BirdContainer = styled.div`
	position: absolute;
	top: -44px;
	right: 9px;
`
