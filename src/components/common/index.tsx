import styled from 'styled-components'

export const Container = styled.article<{ doubled?: boolean }>`
	& + & {
		margin-top: 12px;
	}
	margin: ${props => (props.doubled ? '24px 0 !important' : 'inherit')};
`

export const Card = styled.div<{ isOverflow?: boolean | undefined; isNew?: boolean }>`
	position: relative;

	background: #ffffff;
	box-shadow: 2px 2px 25px rgba(210, 210, 210, 0.25);
	border-radius: 25px;

	padding: 18px 14px 14px 14px;

	overflow: ${props => (props.isOverflow === true ? 'hidden' : 'initial')};

	&::after {
		content: ${props => (props.isNew ? "'New'" : 'unset')};
		position: absolute;
		top: -10px;
		right: 15px;
		background-color: #ff3333;
		padding: 4px 8px;
		font-size: 12px;
		color: white;
		font-weight: bold;
		border-radius: 20px;
	}
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

export type ButtonType = 'primary' | 'danger'
export const CustomButton = styled.button<{
	status: ButtonType
	mt?: string
}>`
	width: 100%;
	border: none;
	border-radius: 13px;
	background-color: ${props => (props.status === 'primary' ? '#1191FB' : '#FFB2B2')};
	color: ${props => (props.status === 'primary' ? 'white' : '#9B2727')};
	padding: 17px;

	margin-top: ${props => props.mt};
	font-weight: 600;

	cursor: pointer;

	&:disabled {
		opacity: 0.5;
	}
`

export const MiniButton = styled.button`
	font-weight: 600;
	font-size: 16px;
	padding: 8px 17px;
	background: #1191fb;
	border-radius: 14px;
	color: white;

	&:disabled {
		opacity: 0.5;
	}
`
