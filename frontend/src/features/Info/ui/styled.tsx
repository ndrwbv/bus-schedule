import React from 'react'

import styles from './styled.module.css'

export const InfoWrapperStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.infoWrapper, className].filter(Boolean).join(` `)} {...props} />
)

export const InfoTextStyled: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
	<p className={[styles.infoText, className].filter(Boolean).join(` `)} {...props} />
)

export const InfoLinkStyled: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ className, ...props }) => (
	// eslint-disable-next-line jsx-a11y/anchor-has-content
	<a className={[styles.infoLink, className].filter(Boolean).join(` `)} {...props} />
)

export const InfoCloseButtonStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.infoCloseButton, className].filter(Boolean).join(` `)} {...props} />
)
