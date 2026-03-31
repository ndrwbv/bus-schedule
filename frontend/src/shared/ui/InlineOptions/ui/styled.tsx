import React from 'react'

import styles from './styled.module.css'

export const InlineOptionsItemStyled: React.FC<{
	$active: boolean
	$disabled?: boolean
	children?: React.ReactNode
	onClick?: () => void
}> = ({ $active, $disabled, children, onClick }) => (
	<div
		className={[
			styles.inlineOptionsItem,
			$active ? styles.inlineOptionsItemActive : styles.inlineOptionsItemInactive,
			$disabled ? styles.inlineOptionsItemDisabled : ``,
		]
			.filter(Boolean)
			.join(` `)}
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

export const InlineOptionsContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.inlineOptionsContainer}>{children}</div>
)

export const OverLayContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.overlayContainer}>{children}</div>
)
