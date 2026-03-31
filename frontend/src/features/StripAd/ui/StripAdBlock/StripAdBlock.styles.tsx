import React from 'react'

import styles from './StripAdBlock.module.css'

export const StripAdStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.stripAd, className].filter(Boolean).join(` `)} {...props} />
)

export const StripAdVideoBlockStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.stripAdVideoBlock, className].filter(Boolean).join(` `)} {...props} />
)

export const StripTextBlockStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.stripTextBlock, className].filter(Boolean).join(` `)} {...props} />
)
