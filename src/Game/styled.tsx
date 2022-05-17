import styled from 'styled-components'

export const GameContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr 1fr;
	grid-gap: 12px;
`

export const GameInner = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
	padding: 8px;
`

const getColor = (selected: boolean, destroyed: boolean) => {
	if (destroyed) return '#4e4e4e2b'
	if (selected) return 'red'

	return '#4e4e4e'
}
export const GameCell = styled.button<{ selected: boolean; destroyed: boolean }>`
	padding: 20px;
	border-radius: 14px;
	background-color: ${props => getColor(props.selected, props.destroyed)};
	color: white;
`

export const GameRow = styled.div`
	display: flex;
	justify-content: space-between;

	& + & {
		margin-top: 12px;
	}
`

export const GameTitle = styled.h1`
	font-weight: bold;
	font-size: 24px;
	margin-bottom: 24px;
`

export const GameButton = styled.button`
	width: 100%;
	border-radius: 14px;
	background-color: green;
	padding: 20px;
`