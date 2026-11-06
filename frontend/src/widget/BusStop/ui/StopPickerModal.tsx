import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setModalOpen } from 'features/BottomSheet/model/bottomSheetSlice'
import { AndrewLytics } from 'shared/lib'
import {
	busStopNewSelector,
	setBusStopNew,
	setUserDirection,
	stopsOptionsSelector,
	userDirectionSelector,
} from 'shared/store/busStop/busStopInfoSlice'
import { findStopForUserDirection, getScheduledUserDirections } from 'shared/store/busStop/const/stops'
import { IOption, StopKeys, UserDirection } from 'shared/store/busStop/Stops'
import { getFrequentStops } from 'shared/store/busStop/stopUsage'
import { currentDaySelector, scheduleSelector, serviceDateSelector } from 'shared/store/schedule/scheduleSlice'

import styles from './stopPickerModal.module.css'

const FREQUENT_LIMIT = 5

const DIRECTIONS = [
	{ value: UserDirection.fromCity, label: `Из города` },
	{ value: UserDirection.toCity, label: `В город` },
]

const getItemClassName = (isActive: boolean): string => (isActive ? `${styles.item} ${styles.itemActive}` : styles.item)

export const StopPickerModal: React.FC = () => {
	const options = useSelector(stopsOptionsSelector)
	const value = useSelector(busStopNewSelector)?.label ?? null
	const userDirection = useSelector(userDirectionSelector)
	const schedule = useSelector(scheduleSelector)
	const dayKey = useSelector(currentDaySelector)
	const serviceDate = useSelector(serviceDateSelector)
	const [isOpen, setIsOpen] = useState(false)
	const [direction, setDirection] = useState(userDirection)
	const [query, setQuery] = useState(``)
	// read on every open: the order follows what the user picked since the last time
	const [frequent, setFrequent] = useState<StopKeys[]>([])
	const dispatch = useDispatch()

	const displayLabel = options.find(o => o.value === value)?.label
	const directionLabel = DIRECTIONS.find(option => option.value === userDirection)?.label

	const open = (): void => {
		setFrequent(getFrequentStops(FREQUENT_LIMIT))
		setQuery(``)
		setDirection(userDirection)
		setIsOpen(true)
		dispatch(setModalOpen(true))
	}

	const close = (): void => {
		setIsOpen(false)
		dispatch(setModalOpen(false))
	}

	const handleSelect = (label: StopKeys): void => {
		const stop = findStopForUserDirection(label, direction)
		if (!stop) return

		dispatch(setBusStopNew(stop.id))
		if (direction !== userDirection) AndrewLytics(`changeDirection`)
		AndrewLytics(`selectBusStop`)
		close()
	}

	const handleOverlayKeyDown = (e: React.KeyboardEvent): void => {
		if (e.key === `Enter` || e.key === ` `) close()
	}

	const stopsByDirection = useMemo(() => {
		if (!isOpen) return []

		return options
			.filter((option): option is IOption<StopKeys> => option.value !== null)
			.map(option => ({
				...option,
				directions: getScheduledUserDirections(schedule, dayKey, option.value, serviceDate),
			}))
	}, [options, schedule, dayKey, serviceDate, isOpen])
	const stopsOnly = stopsByDirection.filter(option => option.directions.includes(direction))

	const handleDirectionChange = (nextDirection: UserDirection): void => {
		setDirection(nextDirection)
		if (nextDirection === userDirection) return

		const currentStop = stopsByDirection.find(option => option.value === value)
		if (currentStop && !currentStop.directions.includes(nextDirection)) return

		dispatch(setUserDirection(nextDirection))
		AndrewLytics(`changeDirection`)
	}

	const needle = query.trim().toLowerCase()
	const matches = needle ? stopsOnly.filter(o => o.label.toLowerCase().includes(needle)) : stopsOnly
	const frequentOptions = needle ? [] : frequent.flatMap(label => stopsOnly.filter(o => o.value === label))

	const renderItem = (option: IOption<StopKeys>, keyPrefix: string): JSX.Element => (
		<button
			key={`${keyPrefix}-${option.value}`}
			className={getItemClassName(option.value === value)}
			type="button"
			onClick={(): void => handleSelect(option.value)}
		>
			{option.label}
		</button>
	)

	return (
		<>
			<button className={styles.triggerButton} type="button" aria-haspopup="dialog" onClick={open}>
				<span className={styles.triggerLabel}>{displayLabel ?? `Выберите остановку`}</span>
				{displayLabel && <span className={styles.triggerDirection}>{directionLabel}</span>}
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
							<div className={styles.directions} role="group" aria-label="Направление">
								{DIRECTIONS.map(option => (
									<button
										key={option.value}
										type="button"
										aria-pressed={option.value === direction}
										onClick={(): void => handleDirectionChange(option.value)}
									>
										{option.label}
									</button>
								))}
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
