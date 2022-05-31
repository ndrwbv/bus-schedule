import { MAIN_GREY } from 'consts/colors'
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

export const GoButton = styled.button<{ active?: boolean }>`
	width: 100%;
	border-radius: 13px;
	background-color: ${MAIN_GREY};
	color: #000000;
	padding: 17px 17px;
	text-align: left;
	cursor: pointer;
`

export type FavoriteButtonStatuses = 'add' | 'remove'
export const AddToFavoriteButton = styled.button<{
	status: FavoriteButtonStatuses;
	mt?: string
}>`
	width: 100%;
	border: none;
	border-radius: 13px;
	background-color: ${props => (props.status === 'add' ? '#1191FB' : '#FFB2B2')};
	color: ${props => (props.status === 'add' ? 'white' : '#9B2727')};
	padding: 17px;

	margin-top: ${props => props.mt};
	font-weight: 600;

	cursor: pointer;

	&:disabled {
		opacity: 0.5
	}
`

export const GoButtonContainer = styled.div`
	display: flex;
	align-items: flex-start;
	flex-direction: column;
`

export const TelegramContainer = styled.div`
	padding-left: 31px;
`

export const DirectionPlaceholder = styled.span`
	font-size: 16px;
	margin-bottom: 2px;
`

export const DirectionText = styled.p`
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 12px;
`

export const DirectionContainer = styled.div`
	padding-left: 6px;
`
