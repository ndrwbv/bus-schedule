import React from 'react'

import styles from './otherTime.module.css'

export const OtherTimeStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.otherTime}>{children}</div>
)
