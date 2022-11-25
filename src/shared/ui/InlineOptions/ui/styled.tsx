import { MAIN_BLUE, MAIN_GREY } from 'shared/theme'
import styled from 'styled-components'

export const InlineOptionsItemStyled = styled.div<{
	active: boolean
	defaultColor?: string | undefined
}>`
	cursor: pointer;
	padding: 17px 17px;

	border-radius: 16px;
	background-color: ${props => (props.active ? MAIN_BLUE : props.defaultColor ?? MAIN_GREY)};
	color: ${props => (props.active ? `white` : `black`)};

	font-weight: 600;
	white-space: nowrap;

	& + & {
		margin-left: 12px;
	}

	@media (hover: hover) {
		&:hover {
			opacity: 0.8;
		}
	}
`

export const InlineOptionsContainerStyled = styled.div`
	display: flex;
	align-items: center;

	overflow: auto;
	padding: 0 40px 0 13px;

	::-webkit-scrollbar {
		@media all and (max-width: 766px) {
			width: 0;
			background: transparent;
		}
	}

	::-webkit-scrollbar-thumb {
		background-color: transparent;
	}
`

export const OverLayContainerStyled = styled.div`
	position: relative;
	margin: 0 -12px;

	&::before {
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		background: linear-gradient(270deg, #ffffff -11%, rgba(255, 255, 255, 0) 100%);
		width: 16px;
		height: 53px;
	}

	&::after {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		background: linear-gradient(90deg, #ffffff -11%, rgba(255, 255, 255, 0) 100%);
		width: 16px;
		height: 53px;
	}
`
