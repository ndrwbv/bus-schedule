import styled from 'styled-components'

export const PickupStyled = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
	padding: 20px;
`

export const PickupContentStyled = styled.div`
	height: 100%;
`

export const ButtonContaintainerStyled = styled.div`
	display: flex;
	gap: 4px;
`

export const PassengerAcceptenceStyled = styled.div`
	position: absolute;
	bottom: 0;
	right: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
	background-color: #fff;
	border-radius: 46px 46px 0 0;
	padding: 16px;
`

export const BgOverlayStyled = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgb(0 0 0 / 57%);
`
