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

	.live-bus-marker {
		position: relative;
		cursor: pointer;
	}

	.live-bus-icon {
		position: relative;
		z-index: 2;
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
	}

	.live-bus-pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(255, 107, 53, 0.3);
		z-index: 1;
		animation: busPulse 2s ease-out infinite;
	}

	@keyframes busPulse {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.6;
		}
		100% {
			transform: translate(-50%, -50%) scale(2.5);
			opacity: 0;
		}
	}
`
