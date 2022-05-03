import styled from 'styled-components'
import { MAIN_BLUE } from 'consts/colors'

export const VoteWrapper = styled.a`
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;

	padding: 15px 30px 15px 15px;
	width: 100%;

	background: linear-gradient(100.09deg, #F3C8C8 -39.57%, #C4C7F8 124.36%);;
	box-shadow: 0px 1px 22px -4px #0000002e;
	border-radius: 18px;
`

export const VoteText = styled.div`
	font-style: normal;
	font-weight: 600;
	font-size: 16px;
	line-height: 19px;

	color: #000000;
`

export const VoteButton = styled.a`
	display: flex;
	align-items: center;
	justify-content: center;

	background: ${MAIN_BLUE};
	border-radius: 6px;
	padding: 13px 20px;

	white-space: nowrap;

	font-style: normal;
	font-weight: normal;
	color: #ffffff;
	outline: none;
	cursor: pointer;
`

export const VoteCloseButton = styled.div`
	position: absolute;
	top: -10px;
	left: -10px;

	width: 27px;
	height: 27px;

	background: rgba(255, 255, 255, 0.92);
	border-radius: 50px;
	outline: none;
	cursor: pointer;

	.closebutton {
		position: absolute;
		top: 6px;
		left: 6px;
	}
`
