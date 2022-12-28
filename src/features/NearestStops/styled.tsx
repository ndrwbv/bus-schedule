import styled from 'styled-components'

export const NearestStopStyled = styled.article`
	padding: 30px;
	background-color: #fff;
	border-radius: 14px;

	& + & {
		margin-left: 4px;
	}
`

export const NearestStopsStyled = styled.div`
	display: flex;
	overflow-x: auto;
`
