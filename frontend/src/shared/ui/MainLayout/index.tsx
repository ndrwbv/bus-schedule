import styled from 'styled-components'

export const MainLayoutStyled = styled.main`
	padding: 22px 8px 15px 8px;
	max-width: 768px;
	width: 100%;
	flex-grow: 1;
`

export const MainLayoutBetaStyled = styled.main`
	max-width: 768px;
	width: 100%;
	flex-grow: 1;

	@media all and (min-width: 766px) {
		padding: 18px 18px;
	}
`

export const BottomSheetBgStyled = styled.div<{ $bg?: string }>`
	background: ${props => (props.$bg ? props.$bg : `#f4f4f2`)};
	border-radius: 25px 25px 0 0;
	min-height: 60vh;

	@media all and (min-width: 766px) {
		border-radius: 34px 34px 0 0;
	}
`
