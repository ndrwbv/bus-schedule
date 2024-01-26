import styled, { createGlobalStyle } from 'styled-components'

export const GameScoreItemStyled = styled.div`
	display: flex;
	flex-direction: column;
`

export const GameScoreListStyled = styled.div`
	display: flex;
	justify-content: space-between;
`

export const GameLayoutContentStyled = styled.div`
	height: 100%;
`

export const GameLayoutStyled = styled.div`
	height: 100vh;
	display: flex;
	flex-direction: column;
	gap: 14px;
`

export const GlobalGameStyles = createGlobalStyle`
	body { 
		background-color: #E4E5FF;
	}
`
