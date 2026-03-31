import React from 'react'

import styles from './styled.module.css'

export const FooterStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<footer className={styles.footer}>{children}</footer>
)
