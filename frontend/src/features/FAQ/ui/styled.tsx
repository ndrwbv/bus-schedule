import React from 'react'

import styles from './styled.module.css'

export const ShareContainerStyled: React.FC<{ onClick?: () => void; children?: React.ReactNode }> = ({
	onClick,
	children,
}) => (
	<div
		className={styles.shareContainer}
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

export const ShareTitleStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<h3 className={styles.shareTitle}>{children}</h3>
)

export const CopyFieldStyled: React.FC<{ $clicked: boolean; children?: React.ReactNode }> = ({
	$clicked,
	children,
}) => (
	<div className={[styles.copyField, $clicked ? styles.copyFieldClicked : ``].filter(Boolean).join(` `)}>
		{children}
	</div>
)

export const QABlockStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<article className={styles.qaBlock}>{children}</article>
)

export const ShareItemContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.shareItemContainer}>{children}</div>
)

export const ShareContentContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.shareContentContainer}>{children}</div>
)
