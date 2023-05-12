import styled from 'styled-components'

export const ShareContainerStyled = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;

	border-radius: 7px;
	padding: 6px;
`

export const ShareTitleStyled = styled.h3`
	margin-top: 24px;
`

export const CopyFieldStyled = styled.div<{ clicked: boolean }>`
	padding: 13px 18px;
	color: ${props => (props.clicked ? `green` : `#336cff`)};
	font-weight: 500;
	border-radius: 15px;
	background: #f2f4f4;
	text-align: left;

	display: flex;
	justify-content: space-between;
`

export const QABlockStyled = styled.article`
	h2 {
		font-size: 19px;
		font-weight: 600;
		line-height: 30px;
	}

	p {
		margin-top: 4px;
		line-height: 26px;
	}

	a {
		color: #336cff;

		&:visited {
			color: #2859d5;
		}
	}

	& + & {
		margin-top: 24px;
	}
`
export const ShareItemContainerStyled = styled.div`
	display: flex;
	justify-content: center;
`

export const ShareContentContainerStyled = styled.div`
	margin-top: 56px;
`
