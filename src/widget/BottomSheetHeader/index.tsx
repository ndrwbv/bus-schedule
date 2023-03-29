import { MyLocation } from 'features/MyLocation'
import styled from 'styled-components'

const ContainerStyled = styled.div`
	position: absolute;
	top: -63px;
	padding: 0 10px;
`
export const BottomSheetHeader: React.FC = () => {
	return (
		<ContainerStyled>
			<MyLocation />
		</ContainerStyled>
	)
}
