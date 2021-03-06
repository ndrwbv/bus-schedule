import styled from 'styled-components'

export const ShareContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;

	border-radius: 7px;
	padding: 6px;
`

export const ShareTitle = styled.h3`
	font-size: 24px;
`

export const QRCodeContainer = styled.div`
	background: #f2f4f4;
	border-radius: 34px;
	padding: 40px;
	width: 248px;
`

export const CopyField = styled.div<{ clicked: boolean }>`
	padding: 13px 18px;
	color: ${props => (props.clicked ? 'green' : '#336cff')};
	font-weight: 500;
	border-radius: 15px;
	background: #f2f4f4;
	text-align: left;
	width: 100%;

	display: flex;
	justify-content: space-between;
`

export const ShareItemContainer = styled.div`
	display: flex;
	justify-content: center;

	& + & {
		margin-top: 35px;
	}
`
