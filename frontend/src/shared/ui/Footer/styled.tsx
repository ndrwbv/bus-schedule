import React from 'react'

import styles from './styled.module.css'

export const FooterStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<footer className={styles.footer}>{children}</footer>
)

export const SourceLinksStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.sourceLinks}>{children}</div>
)

export const SourceLinkStyled: React.FC<{
	children?: React.ReactNode
	href: string
	target?: string
	rel?: string
	onClick?: () => void
}> = ({ children, href, target, rel, onClick }) => (
	<a className={styles.sourceLink} href={href} target={target} rel={rel} onClick={onClick}>
		{children}
	</a>
)
