import React from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useGetFeaturesQuery } from 'shared/api/scheduleApi'
import { AndrewLytics } from 'shared/lib'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'
import { MapProvider } from 'widget/Map/mapProvider'

import { mapProviderSelector, setMapProvider, setShowLiveBus, showLiveBusSelector } from '../model/settingsSlice'
import styles from './settingsModal.module.css'

interface Props {
	onClose: () => void
}

const PROVIDER_OPTIONS: { value: MapProvider; label: string; subtitle: string }[] = [
	{ value: `openfreemap`, label: `OpenFreeMap`, subtitle: `Бесплатно, без лимитов` },
	{ value: `maptiler`, label: `MapTiler`, subtitle: `Лимит запросов, нужен API-ключ` },
]

export const SettingsModal: React.FC<Props> = ({ onClose }) => {
	const dispatch = useDispatch()
	const showLiveBus = useSelector(showLiveBusSelector)
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)
	const mapProvider = useSelector(mapProviderSelector)

	// Keep polling features to stay in sync
	useGetFeaturesQuery(undefined, { pollingInterval: 60_000 })

	const handleToggle = (): void => {
		if (!liveTrackingEnabled) return
		const newValue = !showLiveBus
		dispatch(setShowLiveBus(newValue))
		AndrewLytics(newValue ? `set_live_bus_on` : `set_live_bus_off`)
	}

	const handleProviderChange = (provider: MapProvider): void => {
		if (provider === mapProvider) return
		dispatch(setMapProvider(provider))
		AndrewLytics(`set_map_provider_${provider}`)
	}

	const isChecked = liveTrackingEnabled && showLiveBus
	const isDisabled = !liveTrackingEnabled

	return createPortal(
		<div
			className={styles.overlay}
			onClick={onClose}
			role="button"
			tabIndex={0}
			onKeyDown={e => {
				if (e.key === `Enter` || e.key === ` `) onClose()
			}}
		>
			{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
			<div
				className={styles.modal}
				onClick={e => e.stopPropagation()}
				role="dialog"
				tabIndex={-1}
				onKeyDown={e => e.stopPropagation()}
			>
				<div className={styles.header}>
					<h2 className={styles.title}>Настройки</h2>
					<button type="button" className={styles.closeButton} onClick={onClose}>
						&times;
					</button>
				</div>

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

				<div className={styles.sectionTitle}>Провайдер карт</div>
				<div className={styles.providerOptions}>
					{PROVIDER_OPTIONS.map(option => (
						<button
							key={option.value}
							type="button"
							className={[
								styles.providerOption,
								mapProvider === option.value ? styles.providerOptionActive : ``,
							]
								.filter(Boolean)
								.join(` `)}
							onClick={() => handleProviderChange(option.value)}
						>
							<span className={styles.providerName}>{option.label}</span>
							<span className={styles.providerSubtitle}>{option.subtitle}</span>
						</button>
					))}
				</div>
			</div>
		</div>,
		document.body,
	)
}
