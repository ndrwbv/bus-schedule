import React from 'react'

import styles from './StripHeader.module.css'

export const StripDiscountStyled: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
	<p className={[styles.stripDiscount, className].filter(Boolean).join(` `)} {...props} />
)

export const StripHeaderStyled: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
	<p className={[styles.stripHeader, className].filter(Boolean).join(` `)} {...props} />
)
