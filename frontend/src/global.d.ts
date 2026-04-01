/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention, no-underscore-dangle */
declare const __APP_VERSION__: string
declare module '*.svg' {
	const content: string
	export default content
}

declare module '*.module.css' {
	const classes: { readonly [key: string]: string }
	export default classes
}
