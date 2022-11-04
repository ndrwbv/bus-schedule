import { MAIN_GREY } from 'shared/theme'
import styled from 'styled-components'

export const MainLayout = styled.main`
	padding: 22px 8px 15px 8px;
	max-width: 768px;
	width: 100%;
	flex-grow: 1;
`

export const LinksBlock = styled.div``

export const StyledHR = styled.hr`
	opacity: 0.3;
	margin: 0;
`

export const OtherTime = styled.div`
	padding: 22px 26px;
	background-color: ${MAIN_GREY};
	border-radius: 13px;
	max-height: 200px;
	overflow-y: scroll;
`
export const TimeStamp = styled.div`
	& + & {
		margin-top: 8px;
	}
`

export const selectStyles = {
	container: (p: any, s: any) => ({
		...p,
		width: '200px',
	}),
	control: (p: any, s: any) => ({
		...p,
		borderRadius: '12px',
		border: `2px solid #D8D8D8`,
	}),
}

export const TelegramContainer = styled.div`
	padding-left: 31px;
`


