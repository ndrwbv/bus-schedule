import styled from 'styled-components'

export const RecordTableContainer = styled.div<{isColumn: boolean}>`
	display: flex;
	justify-content: ${props => props.isColumn ? "center" : "space-between"};
	flex-direction: ${props => props.isColumn ? "column" : "row"};
	align-items: center;
	height: 100%;
`

export const RecordItem = styled.div`
	position: relative;

	display: flex;
	flex-direction: column;
	text-align: center;

	background: rgba(0, 0, 0, 0.22);
	border-radius: 3px;
	padding: 4px;
	color: white;

	height: 43px;

	max-width: 58px;

	&::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 0;
		width: 85%;
		height: 1px;
		margin: 0 6px;

		background: rgba(255, 255, 255, 0.14);
		border-radius: 19px;
	}
`

export const RecordTitle = styled.div`
	margin-bottom: 2px;
	font-size: 13px;
	font-weight: 300;
`

export const RecordValue = styled.div`
	z-index: 4;
	font-size: 16px;
	font-weight: 900;
`
export const InfoWrapper = styled.div`
	display: flex;
	margin-top: 40px;
`