import styled from 'styled-components'

export const PassengerVisualContainerStyled = styled.div`
	position: absolute;
	top: -124px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	gap: 25px;
	align-items: flex-start;
`
export const ArrowContainerStyled = styled.div`
	position: absolute;
	left: -10px;
	right: 0;
`

export const PassengerDetailsStyled = styled.div`
	position: relative;
	font-size: 18px;
	display: flex;
	justify-content: center;
	flex-direction: column;
	padding: 10px;
`
export const MessageBlockStyled = styled.div`
	padding: 20px;
	border-radius: 20px;
	background-color: #fff;
	position: relative;
	box-shadow: -1px 2px 20.2px 0px rgba(0, 0, 0, 0.25);
`

export const DetailItemStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;

	& + & {
		margin-top: 10px;
	}
`

export const DetailLabelStyled = styled.span`
	font-size: 14px;
`

export const DetailValueStyled = styled.p``
