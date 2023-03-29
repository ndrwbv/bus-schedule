interface IColors {
	leg: string
	mainGradientStart: string
	mainGradientStop: string
}

type TColorTypes = 'RED' | 'GREEN' | 'BLUE' | 'BLACK'
const PinColors: Record<TColorTypes, IColors> = {
	RED: {
		leg: `#D80000`,
		mainGradientStart: `#E07C20`,
		mainGradientStop: `#D80000`,
	},
	GREEN: {
		leg: `#1CA338`,
		mainGradientStart: `#79D800`,
		mainGradientStop: `#2DC658`,
	},
	BLUE: {
		leg: `#2D73C6`,
		mainGradientStart: `#00CBD8`,
		mainGradientStop: `#2D73C6`,
	},
	BLACK: {
		leg: `#000000`,
		mainGradientStart: `#2E2E2E`,
		mainGradientStop: `#000000`,
	},
}

export const pinIcon = (
	color: TColorTypes,
): string => `<svg width="46" height="89" viewBox="0 0 46 89" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="23" cy="77" rx="17" ry="12" fill="url(#paint0_radial_1410_1100)" fill-opacity="0.57"/>
<line x1="22.5" y1="73.5" x2="22.5" y2="45.5" stroke="url(#paint1_linear_1410_1100)" stroke-width="5" stroke-linecap="round"/>
<mask id="mask0_1410_1100" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="46" height="46">
<circle cx="22.9765" cy="22.9765" r="22.9765" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_1410_1100)">
<g filter="url(#filter0_d_1410_1100)">
<circle cx="22.9765" cy="22.9765" r="22.9765" fill="url(#paint2_linear_1410_1100)"/>
<circle cx="22.9765" cy="22.9765" r="22.9765" fill="url(#paint3_radial_1410_1100)" fill-opacity="0.2"/>
</g>
<circle cx="6" cy="12" r="31" fill="url(#paint4_radial_1410_1100)"/>
</g>
<defs>
<filter id="filter0_d_1410_1100" x="-4" y="0" width="53.9531" height="53.9531" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1410_1100"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1410_1100" result="shape"/>
</filter>
<radialGradient id="paint0_radial_1410_1100" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(23 77) rotate(90) scale(12 17)">
<stop stop-opacity="0.38"/>
<stop offset="0.244792" stop-opacity="0.33"/>
<stop offset="0.526042" stop-opacity="0.25"/>
<stop offset="0.791667" stop-opacity="0.09"/>
<stop offset="1" stop-opacity="0"/>
</radialGradient>
<linearGradient id="paint1_linear_1410_1100" x1="8" y1="59.5" x2="33.5" y2="59.5" gradientUnits="userSpaceOnUse">
<stop offset="0.248998" stop-color="white"/>
<stop offset="0.578399" stop-color="${PinColors[color].leg}"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
<linearGradient id="paint2_linear_1410_1100" x1="8" y1="-2.5" x2="23" y2="46" gradientUnits="userSpaceOnUse">
<stop offset="0.234375" stop-color="${PinColors[color].mainGradientStart}"/>
<stop offset="1" stop-color="${PinColors[color].mainGradientStop}"/>
</linearGradient>
<radialGradient id="paint3_radial_1410_1100" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22.9765 22.9765) rotate(90) scale(22.9765)">
<stop offset="0.781226" stop-color="white" stop-opacity="0"/>
<stop offset="0.90723" stop-color="white"/>
<stop offset="1" stop-color="white"/>
<stop offset="1" stop-color="white"/>
</radialGradient>
<radialGradient id="paint4_radial_1410_1100" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6 12) rotate(90) scale(31)">
<stop offset="0.229167" stop-color="#FFCE00" stop-opacity="0.34"/>
<stop offset="1" stop-color="#D9D9D9" stop-opacity="0"/>
</radialGradient>
</defs>
</svg>

`
