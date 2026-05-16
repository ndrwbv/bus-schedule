import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { setModalOpen } from 'features/BottomSheet/model/bottomSheetSlice'

import styles from './modal.module.css'

interface ModalProps {
	title: string
	onClose: () => void
	children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setModalOpen(true))

		return () => {
			dispatch(setModalOpen(false))
		}
	}, [dispatch])

	const handleOverlayKeyDown = (e: React.KeyboardEvent): void => {
		if (e.key === `Enter` || e.key === ` `) onClose()
	}

	return createPortal(
		<div role="button" tabIndex={0} className={styles.overlay} onClick={onClose} onKeyDown={handleOverlayKeyDown}>
			{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
			<div
				role="dialog"
				tabIndex={-1}
				className={styles.modal}
				onClick={(e): void => e.stopPropagation()}
				onKeyDown={(e): void => e.stopPropagation()}
				onTouchMove={(e): void => e.stopPropagation()}
			>
				<div className={styles.header}>
					<h2 className={styles.title}>{title}</h2>
					<button className={styles.closeButton} type="button" onClick={onClose}>
						&times;
					</button>
				</div>
				<div className={styles.body}>{children}</div>
			</div>
		</div>,
		document.body,
	)
}
