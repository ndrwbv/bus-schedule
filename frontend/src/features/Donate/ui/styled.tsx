import React from 'react'

import styles from './styled.module.css'

export const AboutBlockStyled: React.FC<{ onClick?: () => void; children?: React.ReactNode }> = ({
	onClick,
	children,
}) => (
	<button type="button" className={styles.aboutBlock} onClick={onClick}>
		{children}
	</button>
)

export const AboutBlockLeftStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.aboutBlockLeft}>{children}</div>
)

export const AboutBlockEmojiStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.aboutBlockEmoji}>{children}</span>
)

export const AboutBlockTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.aboutBlockText}>{children}</div>
)

export const AboutBlockTitleStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.aboutBlockTitle}>{children}</span>
)

export const AboutBlockSubStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.aboutBlockSub}>{children}</span>
)

export const AboutBlockArrowStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.aboutBlockArrow}>{children}</span>
)

export const ModalTitleStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<h2 className={styles.modalTitle}>{children}</h2>
)

export const ModalTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.modalText}>{children}</p>
)

export const DonatePhoneRowStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.donatePhoneRow}>{children}</div>
)

export const DonatePhoneStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.donatePhone}>{children}</span>
)

export const DonatePhoneNameStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.donatePhoneName}>{children}</span>
)

export const CopyButtonStyled: React.FC<{
	onClick?: () => void
	title?: string
	children?: React.ReactNode
}> = ({ onClick, title, children }) => (
	<button type="button" className={styles.copyButton} onClick={onClick} title={title}>
		{children}
	</button>
)

export const CopiedTooltipStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.copiedTooltip}>{children}</span>
)

export const ModalFooterStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<p className={styles.modalFooter}>{children}</p>
)

export const BannerStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<div className={styles.banner}>{children}</div>
)

export const BannerTextStyled: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<span className={styles.bannerText}>{children}</span>
)

export const BannerButtonStyled: React.FC<{ onClick?: () => void; children?: React.ReactNode }> = ({
	onClick,
	children,
}) => (
	<button type="button" className={styles.bannerButton} onClick={onClick}>
		{children}
	</button>
)

export const BannerCloseStyled: React.FC<{
	onClick?: () => void
	children?: React.ReactNode
	'aria-label'?: string
}> = ({ onClick, children, ...rest }) => (
	<button type="button" className={styles.bannerClose} onClick={onClick} {...rest}>
		{children}
	</button>
)
