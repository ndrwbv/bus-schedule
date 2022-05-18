import styled from 'styled-components'

export const GameContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr 1fr;
	grid-gap: 9px;
`

const getColor = (selected: boolean, destroyed: boolean) => {
	if (destroyed) return 'rgb(233, 237, 233, 0.5)'
	if (selected) return '#A4FFA4'

	return '#EAEDE9'
}
export const GameCell = styled.button<{ selected: boolean; destroyed: boolean }>`
	padding: 1rem;

	display: flex;
	align-items: center;
	justify-content: center;

	border-radius: 8px;
	background-color: ${props => getColor(props.selected, props.destroyed)};
	color: black;

	font-size: 14px;

	max-width: 100px;

	&::before {
		content: '';
		padding-bottom: 100%;
		display: block;
	}
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
