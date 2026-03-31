import React from 'react'

import styles from './timeStamp.module.css'

export const TimeStampStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.timeStamp}>{children}</div>
)
