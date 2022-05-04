import styled from 'styled-components'

export const HowMuchLeftContainer = styled.div<{ isFancy: boolean }>`
	display: flex;
	align-items: center;
	flex-direction: column;

	padding: 18px 17px;
	background: ${props =>
		props.isFancy ? 'linear-gradient(93.72deg, #5020CA 9.83%, #5020CA 9.84%, #8365E0 96.15%);' : '#e7edec'};
	color: ${props => (props.isFancy ? 'white' : 'black')};
	border-radius: 13px;
`

export const NextBusContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`

export const FastReplyContainer = styled.div`
	margin-top: 18px;
	width: 100%;
`

export const TextWrapper = styled.p``

export const HighLighted = styled.span`
	font-weight: bold;
`

export const BusEstimation = styled.div`
	font-size: 18px;
	margin-left: 19px;
`
