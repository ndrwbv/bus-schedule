import styled from 'styled-components'
import { MAIN_BLUE } from 'consts/colors'

export const VoteWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;

	padding: 14px;
	width: 100%;

	background: linear-gradient(91.01deg, #9803f9 -21.64%, #35e0ff 97.87%);
	box-shadow: 0px 1px 22px -4px rgba(14, 139, 251, 0.46);
	border-radius: 8px;
`

export const VoteText = styled.div`
	font-style: normal;
	font-weight: bold;
	font-size: 16px;
	line-height: 19px;

	color: #ffffff;
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