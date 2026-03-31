import React from 'react'

import styles from './HowMuchLeft.module.css'

export type TimeColor = 'default' | 'soon' | 'imminent'

const TIME_COLOR_MAP: Record<TimeColor, string> = {
	default: styles.colorDefault,
	soon: styles.colorSoon,
	imminent: styles.colorImminent,
}

export const HowMuchLeftContainerStyled: React.FC<{
	$isFancy: boolean
	$timeColor?: TimeColor
	children?: React.ReactNode
}> = ({ $isFancy, $timeColor = `default`, children }) => (
	<div
		className={`${styles.howMuchLeftContainer} ${
			$isFancy ? styles.fancy : `${styles.notFancy} ${TIME_COLOR_MAP[$timeColor]}`
		}`}
	>
		{children}
	</div>
)

export const NextBusContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.nextBusContainer}>{children}</div>
)

export const FastReplyContainerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.fastReplyContainer}>{children}</div>
)

export const FastReplyButtonStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<button type="button" className={styles.fastReplyButton}>
		{children}
	</button>
)

export const TextWrapperStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.textWrapper}>{children}</div>
)

export const HighLightedStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.highlighted}>{children}</span>
)

export const BusEstimationStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.busEstimation}>{children}</div>
)
