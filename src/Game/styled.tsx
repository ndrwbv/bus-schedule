import styled from 'styled-components'

export const GameContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr 1fr;
	grid-gap: 9px;
`

const getColor = (selected: boolean, destroyed: boolean) => {
	return 'rgba(0, 0, 0, 0.74)'
}
export const GameCell = styled.button<{ selected: boolean; destroyed: boolean }>`
	position: relative;

	padding: 0.9rem;
	display: flex;
	align-items: center;
	justify-content: center;

	font-weight: 700;
	font-family: 'Inter', 'Roboto', sans-serif;
	font-size: 14px;

	max-width: 100px;

	border-radius: 8px;
	background-color: ${props => getColor(props.selected, props.destroyed)};
	opacity: ${props => (props.destroyed ? 0.7 : 1)};
	color: white;

	border: ${props => (props.selected ? '2px solid white' : '2px solid transparent')};

	&::after {
		content: ${props => (props.destroyed ? 'unset' : "''")};
		position: absolute;
		top: 3px;
		left: 0;
		width: 85%;
		height: 4px;
		margin: 0 6px;

		background: rgba(255, 255, 255, 0.14);
		border-radius: 19px;
	}

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
