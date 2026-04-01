/* eslint-disable @typescript-eslint/no-explicit-any */
declare const __APP_VERSION__: string
declare module '*.svg' {
	const content: string
	export default content
}

declare module '*.module.css' {
	const classes: { readonly [key: string]: string }
	export default classes
}
