import React from 'react'

import styles from './styled.module.css'

export const HandWrapperStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.handWrapper}>{children}</div>
)

export const SocialLinksStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.socialLinks}>{children}</div>
)

export const SocialLinkStyled: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
	children,
	className,
	...rest
}) => (
	<a className={styles.socialLink} {...rest}>
		{children}
	</a>
)

export const SocialDescriptionStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.socialDescription}>{children}</p>
)
