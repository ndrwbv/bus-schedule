import styled from 'styled-components'

export const RecordTableContainer = styled.div`
	display: flex;
	justify-content: space-between;
`

export const RecordItem = styled.div`
	position: relative;

	display: flex;
	flex-direction: column;
	text-align: center;

	background: rgba(0, 0, 0, 0.22);
	border-radius: 3px;
	padding: 4px;
	color: white;

	&::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 0;
		width: 85%;
		height: 4px;
		margin: 0 6px;

		background: rgba(255, 255, 255, 0.14);
		border-radius: 19px;
	}
`

export const Score = styled.div`
	position: relative;

	width: 61px;
	height: 61px;
	display: flex;
	align-items: center;
	justify-content: center;

	color: white;

	border-radius: 50%;
	background: rgba(0, 0, 0, 0.2);

	font-weight: 900;
	font-size: 22px;
	line-height: 26px;
	z-index: 0;

	&::after {
		content: '';
		position: absolute;
		width: 41px;
		height: 41px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.2);
		z-index: 0;
	}
`

export const PlusOne = styled.span<{animate: boolean}>`
	position: absolute;
	bottom: -20px;
	right: -20px;
	font-weight: 700;
	font-size: 22px;
	line-height: 27px;
	color: rgba(255, 255, 255, 0.8);

	animation-duration: 0.5s;
	animation-name:  ${props => props.animate ? "fadeup" : "inherit"}; ;

	@keyframes fadeup {
		0% {
			color: rgba(255, 255, 255, 0);
		}

		50% {
			color: rgba(255, 255, 255, 0.8);
		}

		100% {
			color: rgba(255, 255, 255, 0);
		}
	}
`

export const RecordTitle = styled.div`
	margin-bottom: 9px;
`

export const RecordValue = styled.div`
	z-index: 4;
`
