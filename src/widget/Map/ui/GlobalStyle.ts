import { createGlobalStyle } from 'styled-components'

import { clusterIconsCss } from '../assets/clusterIconCSS'

export const GlobalStyle = createGlobalStyle`

	[data-rsbs-is-blocking='false'] [data-rsbs-overlay], [data-rsbs-scroll]{
		border-radius: 25px 25px 0 0 !important;

		@media all and (min-width: 766px) {
			border-radius: 34px 34px 0 0 !important;
		}
	}

 .pin {
	position: relative
 }

 .pin-text {
	position: absolute;
	top: 0;
	left: 0;

	width: 46px;
	height: 46px;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	
	font-weight: 400;
	color: #ffff;
 }

 .pin-text__amount {
	 font-size: 20px;
	 line-height: 14px;
 }

 .pin-text__unit {
	font-size: 13px
 }

 .maplibregl-ctrl-bottom-left, .maplibregl-ctrl-bottom-right {
	display: none !important;
 }

${clusterIconsCss}
`
