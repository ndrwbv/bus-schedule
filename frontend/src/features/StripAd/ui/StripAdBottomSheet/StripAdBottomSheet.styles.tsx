import React from 'react'

import styles from './StripAdBottomSheet.module.css'

export const StripBottomSheetHeaderContainerStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	...props
}) => <div className={[styles.bottomSheetHeaderContainer, className].filter(Boolean).join(` `)} {...props} />

export const StripVideoContainerStyled: React.FC<React.HTMLAttributes<HTMLDivElement> & { $rounded?: boolean }> = ({
	className,
	$rounded,
	...props
}) => (
	<div
		className={[styles.videoContainer, $rounded ? styles.videoContainerRounded : ``, className]
			.filter(Boolean)
			.join(` `)}
		{...props}
	/>
)

export const StripActionsStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.actions, className].filter(Boolean).join(` `)} {...props} />
)

export const StripBottomSheetContainerStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	...props
}) => <div className={[styles.bottomSheetContainer, className].filter(Boolean).join(` `)} {...props} />

export const StripVideoHeaderStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.videoHeader, className].filter(Boolean).join(` `)} {...props} />
)

export { styles as stripAdBottomSheetStyles }

export const StripActionButtonStyled: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
	className,
	...props
	// eslint-disable-next-line jsx-a11y/anchor-has-content
}) => <a className={[styles.actionButton, className].filter(Boolean).join(` `)} {...props} />

export const StripTextContainerStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.textContainer, className].filter(Boolean).join(` `)} {...props} />
)
