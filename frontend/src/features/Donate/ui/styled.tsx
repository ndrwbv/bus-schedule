import styled from 'styled-components'

// About block

export const AboutBlockStyled = styled.button`
	width: 100%;
	background: #ffffff;
	box-shadow: 2px 2px 25px rgba(210, 210, 210, 0.25);
	border: none;
	border-radius: 25px;
	padding: 14px 18px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	transition: transform 0.15s;

	&:active {
		transform: scale(0.98);
	}

	@media (hover: hover) {
		&:hover {
			opacity: 0.85;
		}
	}
`

export const AboutBlockLeftStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
`

export const AboutBlockEmojiStyled = styled.span`
	font-size: 22px;
`

export const AboutBlockTextStyled = styled.div`
	text-align: left;
`

export const AboutBlockTitleStyled = styled.span`
	font-size: 14px;
	font-weight: 600;
	color: #333;
	display: block;
`

export const AboutBlockSubStyled = styled.span`
	font-size: 12px;
	color: #888;
`

export const AboutBlockArrowStyled = styled.span`
	font-size: 16px;
	color: #bbb;
`

// Modal

export const ModalOverlayStyled = styled.div`
	position: fixed;
	inset: 0;
	z-index: 1100;
	background: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
`

export const ModalContentStyled = styled.div`
	position: relative;
	background: #fff;
	border-radius: 20px;
	padding: 28px 20px 24px;
	max-width: 400px;
	width: 100%;
	text-align: center;
`

export const ModalCloseStyled = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	background: none;
	border: none;
	cursor: pointer;
	font-size: 20px;
	color: #a5a5a5;
	line-height: 1;
	padding: 4px;

	@media (hover: hover) {
		&:hover {
			color: #555;
		}
	}
`

export const ModalTitleStyled = styled.h2`
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 12px;
`

export const ModalTextStyled = styled.p`
	font-size: 14px;
	line-height: 21px;
	color: #555;
	margin-bottom: 20px;
`

export const DonatePhoneRowStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	background: #f2f4f4;
	border-radius: 14px;
	padding: 14px 16px;
`

export const DonatePhoneStyled = styled.span`
	font-size: 18px;
	font-weight: 600;
	letter-spacing: 0.5px;
`

export const DonatePhoneNameStyled = styled.span`
	font-size: 13px;
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

export const ModalFooterStyled = styled.p`
	font-size: 18px;
	margin-top: 16px;
`

// Banner

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
