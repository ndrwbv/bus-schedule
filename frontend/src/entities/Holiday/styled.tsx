import React from 'react'

import styles from './styled.module.css'

export const HolidayContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.holidayContainer}>{children}</div>
)
