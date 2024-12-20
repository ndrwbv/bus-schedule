import { MAIN_GREY } from 'shared/theme'
import { ImageWrapperStyled } from 'shared/ui'
import styled from 'styled-components'

export const GoButtonContainerStyled = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 10px;
	flex-direction: column;
`

export const DirectionTextStyled = styled.p`
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 12px;
`

export const DirectionContainerStyled = styled.div`
	padding-left: 6px;
`
export const DirectionPlaceholderStyled = styled.span`
	font-size: 16px;
	margin-bottom: 2px;
`
export const GoButtonStyled = styled.button<{ $active?: boolean }>`
	width: 100%;
	border-radius: 13px;
	background-color: ${MAIN_GREY};
	color: #000000;
	padding: 17px 17px;
	text-align: left;
	cursor: pointer;

	@media (hover: hover) {
		&:hover {
			opacity: 0.8;
		}
	}
`

export const WebWrapper = styled(ImageWrapperStyled)`
	position: absolute;
	right: 10px;
	top: -10px;
`
