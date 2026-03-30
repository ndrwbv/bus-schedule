import React from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useGetFeaturesQuery } from 'shared/api/scheduleApi'
import { liveTrackingEnabledSelector } from 'shared/store/app/selectors/liveTracking'
import styled from 'styled-components'

import { setShowLiveBus, showLiveBusSelector } from '../model/settingsSlice'

const OverlayStyled = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	z-index: 9999;
	display: flex;
	align-items: flex-end;
	justify-content: center;
`

const ModalStyled = styled.div`
	background: #fff;
	border-radius: 20px 20px 0 0;
	width: 100%;
	max-width: 768px;
	padding: 20px;
	padding-bottom: max(20px, env(safe-area-inset-bottom));
`

const HeaderStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
`

const TitleStyled = styled.h2`
	font-size: 18px;
	font-weight: 700;
	margin: 0;
`

const CloseButtonStyled = styled.button`
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	color: #999;
	padding: 4px 8px;
	line-height: 1;
`

const ToggleRowStyled = styled.label<{ $disabled?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 0;
	cursor: ${p => (p.$disabled ? `default` : `pointer`)};
	opacity: ${p => (p.$disabled ? 0.5 : 1)};
`

const ToggleLabelStyled = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`

const ToggleTitleStyled = styled.span`
	font-size: 15px;
	font-weight: 500;
`

const ToggleSubtitleStyled = styled.span`
	font-size: 12px;
	color: #999;
`

const SwitchStyled = styled.div<{ $checked: boolean; $disabled?: boolean }>`
	width: 44px;
	height: 24px;
	border-radius: 12px;
	background: ${p => (p.$checked ? `#336CFF` : `#ccc`)};
	position: relative;
	flex-shrink: 0;
	transition: background 0.2s;
	pointer-events: ${p => (p.$disabled ? `none` : `auto`)};

	&::after {
		content: '';
		position: absolute;
		top: 2px;
		left: ${p => (p.$checked ? `22px` : `2px`)};
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #fff;
		transition: left 0.2s;
	}
`

interface Props {
	onClose: () => void
}

export const SettingsModal: React.FC<Props> = ({ onClose }) => {
	const dispatch = useDispatch()
	const showLiveBus = useSelector(showLiveBusSelector)
	const liveTrackingEnabled = useSelector(liveTrackingEnabledSelector)

	// Keep polling features to stay in sync
	useGetFeaturesQuery(undefined, { pollingInterval: 60_000 })

	const handleToggle = (): void => {
		if (!liveTrackingEnabled) return
		dispatch(setShowLiveBus(!showLiveBus))
	}

	return createPortal(
		<OverlayStyled onClick={onClose}>
			<ModalStyled onClick={e => e.stopPropagation()}>
				<HeaderStyled>
					<TitleStyled>Настройки</TitleStyled>
					<CloseButtonStyled onClick={onClose}>&times;</CloseButtonStyled>
				</HeaderStyled>

				<ToggleRowStyled $disabled={!liveTrackingEnabled} onClick={handleToggle}>
					<ToggleLabelStyled>
						<ToggleTitleStyled>Автобус на карте</ToggleTitleStyled>
						<ToggleSubtitleStyled>
							{liveTrackingEnabled ? `Показывать позицию 112С в реальном времени` : `Временно недоступно`}
						</ToggleSubtitleStyled>
					</ToggleLabelStyled>

					<SwitchStyled $checked={liveTrackingEnabled && showLiveBus} $disabled={!liveTrackingEnabled} />
				</ToggleRowStyled>
			</ModalStyled>
		</OverlayStyled>,
		document.body,
	)
}
