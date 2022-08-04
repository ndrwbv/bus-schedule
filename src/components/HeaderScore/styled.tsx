import { GameCell } from 'Game/styled'
import styled from 'styled-components'

export const StyledScore = styled(GameCell)`
	min-width: 30px;
	font-size: 12px;
	padding: 8px;
	border-radius: 4px;
	border: none;

	background: linear-gradient(180.17deg, #723cb7 0.15%, #ff47e2 99.85%);
	box-shadow: 0px 2px 8px rgba(121, 61, 185, 0.15);

	&::after {
		height: 1px;
		margin: 0 2px;
		top: 2px;
		background: rgba(255, 255, 255, 0.4);
	}
`
