import { createGlobalStyle } from 'styled-components'

import { clusterIconsCss } from '../assets/clusterIconCSS'

export const GlobalStyle = createGlobalStyle`
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
