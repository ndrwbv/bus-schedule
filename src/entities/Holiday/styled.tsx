import styled from 'styled-components'

export const HolidayContainerStyled = styled.div`
	position: relative;
	display: flex;
	margin: 12px 0 0 20px;
	color: #454545;
	font-weight: 600;

	&::before {
		content: '';
		position: absolute;
		top: 4px;
		left: -17px;
		width: 13px;
		height: 13px;
		background: linear-gradient(180deg, #38347a 0%, #336cff 100%);
		border-radius: 50%;
	}
`
