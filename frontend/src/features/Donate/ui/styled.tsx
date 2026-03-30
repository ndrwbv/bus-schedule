import styled from 'styled-components'

export const DonateCardStyled = styled.div`
	background: #ffffff;
	box-shadow: 2px 2px 25px rgba(210, 210, 210, 0.25);
	border-radius: 25px;
	padding: 18px 14px 14px 14px;
`

export const DonateHeaderStyled = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

export const DonateTitleStyled = styled.p`
	font-size: 20px;
	font-weight: 600;
	padding-left: 6px;
`

export const DonateTextStyled = styled.p`
	font-size: 14px;
	line-height: 20px;
	color: #555;
	margin-top: 12px;
	padding: 0 6px;
`

export const DonatePopupContentStyled = styled.div`
	padding: 20px 16px;
	text-align: center;
`

export const DonatePopupTitleStyled = styled.h2`
	font-size: 20px;
	font-weight: 600;
	margin-bottom: 12px;
`

export const DonatePopupTextStyled = styled.p`
	font-size: 14px;
	line-height: 22px;
	color: #555;
	margin-bottom: 20px;
`

export const DonatePhoneRowStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	background: #f2f4f4;
	border-radius: 14px;
	padding: 14px 16px;
	margin-bottom: 12px;
`

export const DonatePhoneStyled = styled.span`
	font-size: 18px;
	font-weight: 600;
	letter-spacing: 0.5px;
`

export const DonatePhoneNameStyled = styled.span`
	font-size: 14px;
	color: #a5a5a5;
`

export const CopyButtonStyled = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	padding: 4px;
	display: flex;
	align-items: center;
	color: #1191fb;
	font-size: 18px;
	border-radius: 8px;
	transition: background 0.15s;

	&:active {
		background: rgba(17, 145, 251, 0.1);
	}

	@media (hover: hover) {
		&:hover {
			background: rgba(17, 145, 251, 0.1);
		}
	}
`

export const CopiedTooltipStyled = styled.span`
	font-size: 12px;
	color: #1191fb;
	font-weight: 500;
`

export const DonatePopupFooterStyled = styled.p`
	font-size: 20px;
	margin-top: 16px;
`

export const BannerStyled = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	background: #fff;
	box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
	padding: 12px 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	font-size: 14px;
`

export const BannerTextStyled = styled.span`
	color: #333;
	line-height: 20px;
`

export const BannerButtonStyled = styled.button`
	background: #1191fb;
	color: white;
	border: none;
	border-radius: 10px;
	padding: 8px 14px;
	font-weight: 600;
	font-size: 14px;
	cursor: pointer;
	white-space: nowrap;

	@media (hover: hover) {
		&:hover {
			opacity: 0.8;
		}
	}
`

export const BannerCloseStyled = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	font-size: 18px;
	color: #a5a5a5;
	padding: 4px;
	line-height: 1;
`

export const AboutTextStyled = styled.p`
	font-size: 14px;
	line-height: 22px;
	color: #555;
	margin-bottom: 16px;
	padding: 0 6px;

	&:last-of-type {
		margin-bottom: 20px;
	}
`

export const AboutTitleStyled = styled.h2`
	font-size: 20px;
	font-weight: 600;
	margin-bottom: 16px;
	padding: 0 6px;
`
