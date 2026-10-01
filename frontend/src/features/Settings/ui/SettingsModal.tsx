import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetFeaturesQuery } from 'shared/api/scheduleApi'
import { AndrewLytics } from 'shared/lib'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'
import { Modal } from 'shared/ui/Modal'

import {
	setShowBusDirection,
	setShowLiveBus,
	showBusDirectionSelector,
	showLiveBusSelector,
} from '../model/settingsSlice'
import styles from './settingsModal.module.css'

interface Props {
	onClose: () => void
}

interface ToggleRowProps {
	title: string
	subtitle: string
	checked: boolean
	disabled: boolean
	onToggle: () => void
}

const ToggleRow: React.FC<ToggleRowProps> = ({ title, subtitle, checked, disabled, onToggle }) => (
	// eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/no-noninteractive-element-interactions
	<label
		className={[styles.toggleRow, disabled ? styles.toggleRowDisabled : ``].filter(Boolean).join(` `)}
		onClick={onToggle}
		onKeyDown={e => {
			if (e.key === `Enter` || e.key === ` `) onToggle()
		}}
	>
		<div className={styles.toggleLabel}>
			<span className={styles.toggleTitle}>{title}</span>
			<span className={styles.toggleSubtitle}>{subtitle}</span>
		</div>

		<div
			className={[styles.switch, checked ? styles.switchChecked : ``, disabled ? styles.switchDisabled : ``]
				.filter(Boolean)
				.join(` `)}
		/>
	</label>
)

export const SettingsModal: React.FC<Props> = ({ onClose }) => {
	const dispatch = useDispatch()
	const showLiveBus = useSelector(showLiveBusSelector)
	const showBusDirection = useSelector(showBusDirectionSelector)
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)

	const { data: features } = useGetFeaturesQuery()
	// Бета-переключатель виден, только пока на бэке включён флаг liveDirection
	const liveDirectionAvailable = features?.liveDirection === true

	const handleLiveBusToggle = (): void => {
		if (!liveTrackingEnabled) return
		const newValue = !showLiveBus
		dispatch(setShowLiveBus(newValue))
		AndrewLytics(newValue ? `set_live_bus_on` : `set_live_bus_off`)
	}

	const directionDisabled = !liveTrackingEnabled || !showLiveBus

	const handleDirectionToggle = (): void => {
		if (directionDisabled) return
		const newValue = !showBusDirection
		dispatch(setShowBusDirection(newValue))
		AndrewLytics(newValue ? `set_bus_direction_on` : `set_bus_direction_off`)
	}

	return (
		<Modal title="Настройки" onClose={onClose}>
			<ToggleRow
				title="Автобус на карте"
				subtitle={liveTrackingEnabled ? `Показывать позицию 112С в реальном времени` : `Временно недоступно`}
				checked={liveTrackingEnabled && showLiveBus}
				disabled={!liveTrackingEnabled}
				onToggle={handleLiveBusToggle}
			/>

			{liveDirectionAvailable && (
				<ToggleRow
					title="Направление автобуса (бета)"
					subtitle="Стрелка и подпись «в город» / «из города»"
					checked={!directionDisabled && showBusDirection}
					disabled={directionDisabled}
					onToggle={handleDirectionToggle}
				/>
			)}
		</Modal>
	)
}
