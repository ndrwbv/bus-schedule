import styled from 'styled-components'

export const Container = styled.article`
	& + & {
		margin-top: 44px;
	}
`

export const Card = styled.div`
	position: relative;

	background: #ffffff;
	box-shadow: 2px 2px 25px #e0e0e0;
	border-radius: 12px;

	padding: 22px 16px;

	overflow: hidden;
`

export const GrayText = styled.p`
	margin: 0;
	color: #a5a5a5;
	font-size: 14px;

	a {
		color: inherit;
	}

	& + & {
		margin-top: 12px;
	}
`

export const CardHeader = styled.p`
	margin-bottom: 20px;
	font-weight: 700;
    font-size: 17px;
`