import styled from 'styled-components'
import { MAIN_BLUE, MAIN_GREY } from 'consts/colors'

export const InlineOptionsItem = styled.div<{
	active: boolean
	defaultColor?: string | undefined
}>`
	cursor: pointer;
	padding: 17px 17px;

	border-radius: 16px;
	background-color: ${props => (props.active ? MAIN_BLUE : props.defaultColor ?? MAIN_GREY)};
	color: ${props => (props.active ? 'white' : 'black')};

	font-weight: 600;
	white-space: nowrap;

	& + & {
		margin-left: 12px;
	}
`

export const InlineOptionsContainer = styled.div`
	display: flex;
	align-items: center;

	overflow: auto;
	padding-right: 40px;

	::-webkit-scrollbar {
		@media all and (max-width: 766px) {
			width: 0;
			background: transparent;
		}
	}

	::-webkit-scrollbar-thumb {
	}
`
export const OverLay = styled.div`
	position: absolute;
	right: 13px;
	background: linear-gradient(270deg, #ffffff -11%, rgba(255, 255, 255, 0) 100%);
	width: 24px;
	height: 53px;
`
