import React from 'react'

import styles from './styled.module.css'

export const HeaderInnerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.headerInner}>{children}</div>
)

export const HeaderContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<nav className={styles.headerContainer}>{children}</nav>
)

export const HeaderContainerBetaStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<nav className={styles.headerContainerBeta}>{children}</nav>
)

export const HeaderActionsStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.headerActions}>{children}</div>
)
