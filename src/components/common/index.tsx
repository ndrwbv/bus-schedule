import styled from "styled-components";

export const Container = styled.div`
	& + & {
		margin-top: 44px;
	}
`

export const GrayText = styled.p`
	margin: 0;
	color: #A5A5A5;
	font-size: 14px;
	
	a {
		color: inherit;
	}

	& + & {
		margin-top: 12px;
	}
`
