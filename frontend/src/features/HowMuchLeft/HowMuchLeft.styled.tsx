import React from 'react'
import { ArrivalStatus } from 'shared/lib/time/getArrivalStatus'

import styles from './HowMuchLeft.module.css'

export const HowMuchLeftContainerStyled: React.FC<{
	$status: ArrivalStatus
	children?: React.ReactNode
}> = ({ $status, children }) => (
	<div
		className={styles.howMuchLeftContainer}
		style={{ '--arrival-color': `var(--arrival-${$status})` } as React.CSSProperties}
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
