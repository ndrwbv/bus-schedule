import React from 'react'

import styles from './styled.module.css'

export const HeaderContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.headerContainer}>{children}</div>
)

export const HeaderTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<h2 className={styles.headerText}>{children}</h2>
)

export const HeaderItemStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.headerItem}>{children}</div>
)
