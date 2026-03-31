import React from 'react'

import styles from './common.module.css'

export const ContainerStyled: React.FC<{
	$doubled?: boolean
	children?: React.ReactNode
	className?: string
}> = ({ $doubled, children, className }) => (
	<article
		className={[styles.container, $doubled ? styles.containerDoubled : ``, className].filter(Boolean).join(` `)}
	>
		{children}
	</article>
)

export const CardStyled: React.FC<{
	$isOverflow?: boolean
	$isNew?: boolean
	children?: React.ReactNode
	className?: string
}> = ({ $isOverflow, $isNew, children, className }) => (
	<div
		className={[styles.card, $isOverflow ? styles.cardOverflow : ``, $isNew ? styles.cardNew : ``, className]
			.filter(Boolean)
			.join(` `)}
	>
		{children}
	</div>
)

export const GrayTextStyled: React.FC<{
	children?: React.ReactNode
	className?: string
}> = ({ children, className }) => <p className={[styles.grayText, className].filter(Boolean).join(` `)}>{children}</p>

export const CardHeaderStyled: React.FC<{
	children?: React.ReactNode
	className?: string
}> = ({ children, className }) => <p className={[styles.cardHeader, className].filter(Boolean).join(` `)}>{children}</p>

export type ButtonType = 'primary' | 'danger'

export const CustomButtonStyled: React.FC<{
	$status: ButtonType
	$mt?: string
	children?: React.ReactNode
	className?: string
	disabled?: boolean
	onClick?: () => void
}> = ({ $status, $mt, children, className, disabled, onClick }) => (
	<button
		type="button"
		className={[
			styles.customButton,
			$status === `primary` ? styles.customButtonPrimary : styles.customButtonDanger,
			className,
		]
			.filter(Boolean)
			.join(` `)}
		style={$mt ? { marginTop: $mt } : undefined}
		disabled={disabled}
		onClick={onClick}
	>
		{children}
	</button>
)

export const MiniButtonStyled: React.FC<{
	children?: React.ReactNode
	className?: string
	disabled?: boolean
	onClick?: () => void
}> = ({ children, className, disabled, onClick }) => (
	<button
		type="button"
		className={[styles.miniButton, className].filter(Boolean).join(` `)}
		disabled={disabled}
		onClick={onClick}
	>
		{children}
	</button>
)
