import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetFeaturesQuery } from 'shared/api/scheduleApi'
import { AndrewLytics } from 'shared/lib'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'
import { Modal } from 'shared/ui/Modal'

import { setShowLiveBus, showLiveBusSelector } from '../model/settingsSlice'
import styles from './settingsModal.module.css'

interface Props {
	onClose: () => void
}

export const SettingsModal: React.FC<Props> = ({ onClose }) => {
	const dispatch = useDispatch()
	const showLiveBus = useSelector(showLiveBusSelector)
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)

	useGetFeaturesQuery()

	const handleToggle = (): void => {
		if (!liveTrackingEnabled) return
		const newValue = !showLiveBus
		dispatch(setShowLiveBus(newValue))
		AndrewLytics(newValue ? `set_live_bus_on` : `set_live_bus_off`)
	}

	const isChecked = liveTrackingEnabled && showLiveBus
	const isDisabled = !liveTrackingEnabled

	return (
		<Modal title="Настройки" onClose={onClose}>
			{/* eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/no-noninteractive-element-interactions */}
			<label
				className={[styles.toggleRow, isDisabled ? styles.toggleRowDisabled : ``].filter(Boolean).join(` `)}
				onClick={handleToggle}
				onKeyDown={e => {
					if (e.key === `Enter` || e.key === ` `) handleToggle()
				}}
			>
				<div className={styles.toggleLabel}>
					<span className={styles.toggleTitle}>Автобус на карте</span>
					<span className={styles.toggleSubtitle}>
						{liveTrackingEnabled ? `Показывать позицию 112С в реальном времени` : `Временно недоступно`}
					</span>
				</div>

				<div
					className={[
						styles.switch,
						isChecked ? styles.switchChecked : ``,
						isDisabled ? styles.switchDisabled : ``,
					]
						.filter(Boolean)
						.join(` `)}
				/>
			</label>
		</Modal>
	)
}
