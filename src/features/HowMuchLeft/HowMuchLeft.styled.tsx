import styled from 'styled-components'

export const HowMuchLeftContainerStyled = styled.div<{ isFancy: boolean; defaultColor: string }>`
	display: flex;
	align-items: center;
	flex-direction: column;

	padding: 18px 17px;
	background: ${props =>
		props.isFancy
			? `linear-gradient(93.72deg, #5020CA 9.83%, #5020CA 9.84%, #8365E0 96.15%);`
			: props.defaultColor};
	color: ${props => (props.isFancy ? `white` : `black`)};
	border-radius: 13px;
`

export const NextBusContainerStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const FastReplyContainerStyled = styled.div`
	margin-top: 18px;
	width: 100%;
`

export const FastReplyButtonStyled = styled.button`
	background: #e4f5d6;
	border-radius: 13px;
	color: black;
	padding: 15px;
	width: 100%;
`
export const TextWrapperStyled = styled.div``

export const HighLightedStyled = styled.span`
	font-weight: bold;
	/* animation-duration: 2s;
	animation-name: flashing;
	animation-iteration-count: infinite;

	@keyframes flashing {
		0% {
			opacity: 1;
		}

		50% {
			opacity: 0.7;
		}

		100% {
			opacity: 1;
		}
	} */
`

export const BusEstimationStyled = styled.div`
	font-size: 18px;
	margin-left: 19px;
`

export const ComplainOptionContainerStyled = styled.div`
	margin-top: 12px;
`
