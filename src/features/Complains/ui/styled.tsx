import styled from 'styled-components'

export const ComplainsContainer = styled.div`
	font-weight: bold;
	display: flex;
	justify-content: space-between;
`

export const MessageContainer = styled.article`
	background: #e7edec;
	border-radius: 14px;
	padding: 11px 16px;
	text-align: left;
	display: grid;
	grid-template-columns: 2fr 1fr;
	grid-template-rows: 20px 20px;
	grid-row-gap: 5px;

	& + & {
		margin-top: 12px;
	}
`

export const MessageDate = styled.span`
	color: #737776;
	font-weight: 400;
	font-size: 12px;
	text-align: right;
	white-space: nowrap;
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
`

export const ComplainsStop = styled.p<{ isCurrentStop?: boolean }>`
	color: ${props => (props.isCurrentStop ? '#1191FB' : 'black')};
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`

export const ComplainsDirection = styled.p`
	text-align: right;
`

export const ComplainsLabel = styled.span`
	font-weight: 400;
	font-size: 12px;
	color: #a5a5a5;
`

export const ComplainsBlockContainer = styled.div`
	padding-left: 6px;
`

export const ComplainsBlockText = styled.p`
	font-size: 20px;
	font-weight: 600;
`

export const ComplainCount = styled.span`
	color: #717171;
`

export const InfoText = styled.p`
	text-align: left;
	font-size: 12px;
	line-height: 20px;
	color: #808080;
	margin-bottom: 12px;
	padding: 0 3px;
`
