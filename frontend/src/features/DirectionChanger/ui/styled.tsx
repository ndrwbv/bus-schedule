import React from 'react'

import styles from './styled.module.css'

export const GoButtonContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.goButtonContainer}>{children}</div>
)

export const DirectionTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.directionText}>{children}</p>
)

export const DirectionContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.directionContainer}>{children}</div>
)

export const DirectionPlaceholderStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.directionPlaceholder}>{children}</span>
)

export const GoButtonStyled: React.FC<{
	$active?: boolean
	onClick?: () => void
	children?: React.ReactNode
}> = ({ $active, onClick, children }) => (
	<button
		type="button"
		className={[styles.goButton, $active ? styles.goButtonActive : ``].filter(Boolean).join(` `)}
		onClick={onClick}
	>
		{children}
	</button>
)

export const WebWrapper: React.FC<{
	$w: number
	$h: number
	children?: React.ReactNode
	onClick?: () => void
}> = ({ $w, $h, children, onClick }) => (
	<div
		className={styles.webWrapper}
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
