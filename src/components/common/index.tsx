import styled from 'styled-components'

export const Container = styled.article<{ doubled?: boolean }>`
	& + & {
		margin-top: 12px;
	}
	margin: ${props => (props.doubled ? '24px 0 !important' : 'inherit')};
`

export const Card = styled.div<{ overflow?: boolean }>`
	position: relative;

	background: #ffffff;
	box-shadow: 2px 2px 25px rgba(210, 210, 210, 0.25);
	border-radius: 25px;

	padding: 22px 14px 14px 14px;

	overflow: ${props => (props.overflow ? 'hidden' : 'initial')};
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
	font-weight: 600;
	font-size: 20px;
`
