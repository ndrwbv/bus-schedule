import React from 'react'

import styles from './styled.module.css'

export const TelegramContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<button type="button" className={styles.telegramContainer}>
		{children}
	</button>
)

export const TelegramTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.telegramText}>{children}</p>
)
