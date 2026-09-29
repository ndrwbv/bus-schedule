import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { setModalOpen } from 'features/BottomSheet/model/bottomSheetSlice'
import { getUserDirectionsForLabel } from 'shared/store/busStop/const/stops'
import { IOption, StopKeys, UserDirection } from 'shared/store/busStop/Stops'
import { getFrequentStops } from 'shared/store/busStop/stopUsage'

import styles from './stopPickerModal.module.css'

interface StopPickerModalProps {
	options: IOption<StopKeys | null>[]
	value: StopKeys | null
	onChange: (stop: StopKeys) => void
	placeholder?: string
}

const FREQUENT_LIMIT = 5

const DIRECTION_HINT: Record<UserDirection, string> = {
	[UserDirection.fromCity]: `из города`,
	[UserDirection.toCity]: `в город`,
}

const getItemClassName = (isActive: boolean): string => (isActive ? `${styles.item} ${styles.itemActive}` : styles.item)

const directionHint = (label: StopKeys): string =>
	getUserDirectionsForLabel(label)
		.map(d => DIRECTION_HINT[d])
		.join(` · `)

export const StopPickerModal: React.FC<StopPickerModalProps> = ({
	options,
	value,
	onChange,
	placeholder = `Выберите остановку`,
}) => {
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState(``)
	// read on every open: the order follows what the user picked since the last time
	const [frequent, setFrequent] = useState<StopKeys[]>([])
	const dispatch = useDispatch()

	const displayLabel = options.find(o => o.value === value)?.label

	const open = (): void => {
		setFrequent(getFrequentStops(FREQUENT_LIMIT))
		setQuery(``)
		setIsOpen(true)
		dispatch(setModalOpen(true))
	}

	const close = (): void => {
		setIsOpen(false)
		dispatch(setModalOpen(false))
	}

	const handleSelect = (stop: StopKeys | null): void => {
		if (!stop) return
		onChange(stop)
		close()
	}

	const handleOverlayKeyDown = (e: React.KeyboardEvent): void => {
		if (e.key === `Enter` || e.key === ` `) close()
	}

	const stopsOnly = useMemo(() => options.filter((o): o is IOption<StopKeys> => o.value !== null), [options])

	const needle = query.trim().toLowerCase()
	const matches = needle ? stopsOnly.filter(o => o.label.toLowerCase().includes(needle)) : stopsOnly
	const frequentOptions = needle
		? []
		: frequent.map(label => stopsOnly.find(o => o.value === label)).filter((o): o is IOption<StopKeys> => !!o)

	const renderItem = (option: IOption<StopKeys>, keyPrefix: string): JSX.Element => (
		<button
			key={`${keyPrefix}-${option.value}`}
			className={getItemClassName(option.value === value)}
			type="button"
			onClick={(): void => handleSelect(option.value)}
		>
			<span className={styles.itemLabel}>{option.label}</span>
			<span className={styles.itemHint}>{directionHint(option.value)}</span>
		</button>
	)

	return (
		<>
			<button className={styles.triggerButton} type="button" onClick={open}>
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
					>
						{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
						<div
							role="dialog"
							tabIndex={-1}
							className={styles.modal}
							onClick={(e): void => e.stopPropagation()}
							onKeyDown={(e): void => e.stopPropagation()}
							onTouchMove={(e): void => e.stopPropagation()}
						>
							<div className={styles.modalHeader}>
								<h3 className={styles.modalTitle}>Остановка</h3>
								<button className={styles.closeButton} type="button" onClick={close}>
									&times;
								</button>
							</div>
							<div className={styles.searchWrap}>
								<input
									className={styles.search}
									type="search"
									placeholder="Найти остановку"
									value={query}
									onChange={(e): void => setQuery(e.target.value)}
								/>
							</div>
							<div className={styles.list}>
								{frequentOptions.length > 0 && (
									<>
										<div className={styles.sectionTitle}>Вы часто выбираете</div>
										{frequentOptions.map(o => renderItem(o, `frequent`))}
										<div className={styles.sectionTitle}>Все остановки</div>
									</>
								)}
								{matches.map(o => renderItem(o, `all`))}
								{matches.length === 0 && <div className={styles.empty}>Ничего не нашлось</div>}
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	)
}
