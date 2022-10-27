import { MAIN_GREY } from 'shared/theme'
import { ImageWrapper } from 'shared/ui'
import styled from 'styled-components'

export const GoButtonContainer = styled.div`
	display: flex;
	align-items: flex-start;
	flex-direction: column;
`

export const DirectionText = styled.p`
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 12px;
`

export const DirectionContainer = styled.div`
	padding-left: 6px;
`
export const DirectionPlaceholder = styled.span`
	font-size: 16px;
	margin-bottom: 2px;
`
export const GoButton = styled.button<{ active?: boolean }>`
	width: 100%;
	border-radius: 13px;
	background-color: ${MAIN_GREY};
	color: #000000;
	padding: 17px 17px;
	text-align: left;
	cursor: pointer;

	&:hover {
		opacity: 0.8;
	}
`

export const WebWrapper = styled(ImageWrapper)`
	position: absolute;
	right: 10px;
	top: -10px;
`