import styled from 'styled-components'
import { MAIN_BLUE, MAIN_GREY } from 'consts/colors'

export const InlineOptionsItem = styled.div<{
	active: boolean
	defaultColor?: string | undefined
}>`
	cursor: pointer;
	padding: 8px 17px;
	border-radius: 30px;
	background-color: ${props => (props.active ? MAIN_BLUE : props.defaultColor ?? MAIN_GREY)};
	color: ${props => (props.active ? 'white' : 'black')};
	margin-top: 12px;

	margin-left: 12px;
`

export const InlineOptionsContainer = styled.div`
	display: flex;
	align-items: center;
	flex-wrap: wrap;
`
