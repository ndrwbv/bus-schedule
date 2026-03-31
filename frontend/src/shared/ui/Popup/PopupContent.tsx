import React from 'react'

import styles from './popup.module.css'

export const PopupContentStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.popupContent}>{children}</div>
)
