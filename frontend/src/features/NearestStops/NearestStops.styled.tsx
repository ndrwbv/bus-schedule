import React from 'react'

import styles from './NearestStops.module.css'

export const NearestStopStyled: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => (
	<article className={[styles.nearestStop, className].filter(Boolean).join(` `)} {...props} />
)

export const NearestStopsStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={[styles.nearestStops, className].filter(Boolean).join(` `)} {...props} />
)

export const NearestStopsLabelStyled: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
	<span className={[styles.nearestStopsLabel, className].filter(Boolean).join(` `)} {...props} />
)

export const NearestStopsDirectionStyled: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
	className,
	...props
}) => <span className={[styles.nearestStopsDirection, className].filter(Boolean).join(` `)} {...props} />
