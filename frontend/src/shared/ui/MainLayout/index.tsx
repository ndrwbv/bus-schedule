import React from 'react'

import styles from './mainLayout.module.css'

export const MainLayoutStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<main className={styles.mainLayout}>{children}</main>
)

export const MainLayoutBetaStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<main className={styles.mainLayoutBeta}>{children}</main>
)

export const BottomSheetBgStyled: React.FC<{ $bg?: string; children?: React.ReactNode }> = ({ $bg, children }) => (
	<div className={[styles.bottomSheetBg, $bg === `#fff` ? styles.bottomSheetBgWhite : ``].filter(Boolean).join(` `)}>
		{children}
	</div>
)
