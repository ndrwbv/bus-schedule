import React from 'react'

import styles from './styled.module.css'

export const ComplainsContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.complainsContainer}>{children}</div>
)

export const MessageContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<article className={styles.messageContainer}>{children}</article>
)

export const MessageDateStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.messageDate}>{children}</span>
)

export const ComplainsStopStyled: React.FC<{ $isCurrentStop?: boolean; children?: React.ReactNode }> = ({
	$isCurrentStop,
	children,
}) => (
	<p className={[styles.complainsStop, $isCurrentStop ? styles.complainsStopCurrent : ``].filter(Boolean).join(` `)}>
		{children}
	</p>
)

export const ComplainsDirectionStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.complainsDirection}>{children}</p>
)

export const ComplainsLabelStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.complainsLabel}>{children}</span>
)

export const ComplainsBlockContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.complainsBlockContainer}>{children}</div>
)

export const ComplainsBlockTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.complainsBlockText}>{children}</p>
)

export const ComplainCountStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.complainCount}>{children}</span>
)

export const InfoTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.infoText}>{children}</p>
)
