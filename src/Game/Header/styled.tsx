import styled from 'styled-components'

export const HeaderContainer = styled.div<{ fullHeight: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	/* height: ${props => (props.fullHeight ? '100%' : 'unset')}; */
`

export const Title = styled.h1`
	font-size: 18px;
	text-align: center;
`
