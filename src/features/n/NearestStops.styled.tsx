import styled from 'styled-components'

export const NearestStopStyled = styled.article`
	cursor: pointer;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	padding: 9px;
	background-color: #fff;
	border-radius: 19px;
	background: radial-gradient(50% 50% at 50% 50%, #fff 0%, rgba(255, 255, 255, 0) 100%), #f2f4f4;

	& + & {
		margin-left: 9px;
	}
`

export const NearestStopsStyled = styled.div`
	display: flex;
	overflow-x: auto;
	background-color: #fff;
`

export const NearestStopsLabelStyled = styled.span`
	display: -webkit-box;
	max-width: 115px;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin-bottom: 9px;
`

export const NearestStopsDirectionStyled = styled.span`
	opacity: 0.66;
`
