export const clusterIconSVG = `
<svg width="60" height="71" viewBox="0 0 60 71" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.3 2.3C-7.15256e-07 4.7 0 8.5 0 16V44.4C0 51.9 -7.15256e-07 55.7 2.3 58C4.7 60.4 8.5 60.4 16 60.4H21.4C23.822 61.5466 25.7422 63.5379 26.8 66L28.5 70C28.6 70.5 29.2 70.5 29.4 70L31.1 66C32.1 63.5 34.1 61.5 36.4 60.4H44C51.5 60.4 55.3 60.4 57.7 58C60 55.7 60 52 60 44.4V16C60 8.5 60 4.7 57.7 2.3C55.3 -7.15256e-07 51.5 0 44 0H16C8.5 0 4.7 -7.15256e-07 2.3 2.3Z" fill="white"/>
<path d="M49.7 4.2998H10.3C6.98634 4.2998 4.30005 6.9861 4.30005 10.2998V50.0998C4.30005 53.4135 6.98634 56.0998 10.3 56.0998H49.7C53.0138 56.0998 55.7 53.4135 55.7 50.0998V10.2998C55.7 6.9861 53.0138 4.2998 49.7 4.2998Z" fill="#FF6900"/>
</svg>
`

export const getMarkerHtml = (amount: number): string => `	<div class="cluster-icon">
	<div class="cluster-icon__amount-container">
		<div class="cluster-icon__amount-text">${amount}</div>
	</div>

	<div class="cluster-icon__icon">
		${clusterIconSVG}
	</div>
</div>`
