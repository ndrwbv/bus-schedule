/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { MyLocation } from 'features/MyLocation'
import styled from 'styled-components'
import { BusStop } from 'widget/BusStop'

const ContainerStyled = styled.div<{ isFullHeight: boolean }>`
	position: absolute;
	top: ${props => (props.isFullHeight ? -192 : -63)}px;
	/* left: 10px; */
	padding: 0 10px;
`
export const BottomSheetHeader: React.FC = () => {
	const isBusStopSelected = true

	return (
		<ContainerStyled isFullHeight={isBusStopSelected}>
			<MyLocation />
			{isBusStopSelected && <BusStop />}
		</ContainerStyled>
	)
}
