import styled from 'styled-components'

export const HandWrapperStyled = styled.div`
	position: absolute;
	right: -10px;
	bottom: 0;
`

export const SocialLinksStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`

export const SocialLinkStyled = styled.a`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 16px;
	background: #f5f5f5;
	border-radius: 14px;
	text-decoration: none;
	color: #333;
	font-weight: 500;
	font-size: 16px;
	transition: background 0.2s;

	&:hover {
		background: #ebebeb;
	}

	span {
		font-size: 20px;
	}
`

export const SocialDescriptionStyled = styled.p`
	margin: -12px 0 16px;
	color: #a5a5a5;
	font-size: 14px;
`
