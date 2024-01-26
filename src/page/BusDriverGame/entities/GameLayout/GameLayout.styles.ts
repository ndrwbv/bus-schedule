import styled, { createGlobalStyle } from 'styled-components'

export const GameScoreItemStyled = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const GameScoreListStyled = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 20px;
`

export const GameLayoutContentStyled = styled.div`
	height: 100%;
`

export const GameLayoutStyled = styled.div`
	height: 100vh;
	display: flex;
	flex-direction: column;
	gap: 14px;
	position: relative;
`

export const GlobalGameStyles = createGlobalStyle`
	body { 
		background-color: #E4E5FF;
	}
`
