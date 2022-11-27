import styled from 'styled-components'

export const HeaderInnerStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	padding: 11px 15px;
	max-width: 768px;
	width: 100%;
`

export const HeaderContainerStyled = styled.nav`
	position: absolute;
	top: 0;
	left: 0;
	z-index: 2;

	display: flex;
	align-items: center;
	justify-content: center;

	width: 100%;
`

export const HeaderActionsStyled = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	gap: 4px;
`
