import { useState } from 'react'
import { createPortal } from 'react-dom'
import { IOption, StopKeys } from 'shared/store/busStop/Stops'

import styles from './stopPickerModal.module.css'

interface StopPickerModalProps {
	options: IOption<StopKeys | null>[]
	value: StopKeys | null
	onChange: (stop: StopKeys) => void
	placeholder?: string
}

const stopTouchPropagation = (e: React.TouchEvent): void => e.stopPropagation()

const getItemClassName = (isActive: boolean): string =>
	isActive ? `${styles.item} ${styles.itemActive}` : styles.item

export const StopPickerModal: React.FC<StopPickerModalProps> = ({
	options,
	value,
	onChange,
	placeholder = `Выберите остановку`,
}) => {
	const [isOpen, setIsOpen] = useState(false)

	const displayLabel = options.find(o => o.value === value)?.label

	const handleSelect = (stop: StopKeys | null): void => {
		if (!stop) return
		onChange(stop)
		setIsOpen(false)
	}

	const close = (): void => setIsOpen(false)

	const handleOverlayKeyDown = (e: React.KeyboardEvent): void => {
		if (e.key === `Enter` || e.key === ` `) close()
	}

	const stopsOnly = options.filter(o => o.value !== null)

	return (
		<>
			<button className={styles.triggerButton} type="button" onClick={(): void => setIsOpen(true)}>
				{displayLabel ?? placeholder}
			</button>

			{isOpen &&
				createPortal(
					<div
						role="button"
						tabIndex={0}
						className={styles.overlay}
						onClick={close}
						onKeyDown={handleOverlayKeyDown}
						onTouchStart={stopTouchPropagation}
						onTouchMove={stopTouchPropagation}
					>
						<div
							role="dialog"
							tabIndex={-1}
							className={styles.modal}
							onClick={(e): void => e.stopPropagation()}
							onKeyDown={(e): void => e.stopPropagation()}
						>
							<div className={styles.modalHeader}>
								<h3 className={styles.modalTitle}>Остановка</h3>
								<button className={styles.closeButton} type="button" onClick={close}>
									&times;
								</button>
							</div>
							<div className={styles.list}>
								{stopsOnly.map(option => (
									<button
										key={option.value as string}
										className={getItemClassName(option.value === value)}
										type="button"
										onClick={(): void => handleSelect(option.value)}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	)
}
