import React from 'react'

import styles from './YandexAd.module.css'

export const YandexAdContainerStyled = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { $isLoaded: boolean }
>(({ $isLoaded, className, ...props }, ref) => (
	<div
		ref={ref}
		className={[styles.container, $isLoaded ? styles.containerLoaded : ``, className].filter(Boolean).join(` `)}
		{...props}
	/>
))

YandexAdContainerStyled.displayName = `YandexAdContainerStyled`
