import { useState } from 'react'
import { IOption, StopKeys } from 'shared/store/busStop/Stops'

import styles from './stopPickerModal.module.css'

interface StopPickerModalProps {
	options: IOption<StopKeys | null>[]
	value: StopKeys | null
	onChange: (stop: StopKeys) => void
	placeholder?: string
}

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

	const stopsOnly = options.filter(o => o.value !== null)

	return (
		<>
			<button className={styles.triggerButton} type="button" onClick={(): void => setIsOpen(true)}>
				{displayLabel ?? placeholder}
			</button>

			{isOpen && (
				<div className={styles.overlay} onClick={(): void => setIsOpen(false)}>
					<div className={styles.modal} onClick={(e): void => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h3 className={styles.modalTitle}>Остановка</h3>
							<button
								className={styles.closeButton}
								type="button"
								onClick={(): void => setIsOpen(false)}
							>
								&times;
							</button>
						</div>
						<div className={styles.list}>
							{stopsOnly.map(option => (
								<button
									key={option.value as string}
									className={`${styles.item} ${option.value === value ? styles.itemActive : ``}`}
									type="button"
									onClick={(): void => handleSelect(option.value)}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	)
}
