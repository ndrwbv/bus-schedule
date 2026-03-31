import React from 'react'

import styles from './imageWrapper.module.css'

export const ImageWrapperStyled: React.FC<{
	$w: number
	$h: number
	children?: React.ReactNode
	onClick?: () => void
}> = ({ $w, $h, children, onClick }) => (
	<div
		className={styles.imageWrapper}
		style={{ width: `${$w}px`, height: `${$h}px` }}
		onClick={onClick}
		role="button"
		tabIndex={0}
		onKeyDown={e => {
			if (e.key === `Enter` || e.key === ` `) onClick?.()
		}}
	>
		{children}
	</div>
)
