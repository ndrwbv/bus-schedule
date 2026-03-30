import React, { useCallback, useEffect, useState } from 'react'
import { AndrewLytics } from 'shared/lib'

import { dismissBanner, getVisitDaysCount, isBannerDismissed, recordVisit } from '../lib/visitCounter'
import { BannerButtonStyled, BannerCloseStyled, BannerStyled, BannerTextStyled } from './styled'

const MIN_VISITS = 5

interface DonateBannerProps {
	onDonate: () => void
}

export const DonateBanner: React.FC<DonateBannerProps> = ({ onDonate }) => {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		recordVisit()
		const visits = getVisitDaysCount()

		if (visits >= MIN_VISITS && !isBannerDismissed()) {
			setVisible(true)
			AndrewLytics(`donate.bannerShown`)
		}
	}, [])

	const handleDismiss = useCallback(() => {
		setVisible(false)
		dismissBanner()
		AndrewLytics(`donate.bannerDismissed`)
	}, [])

	const handleDonate = useCallback(() => {
		setVisible(false)
		dismissBanner()
		onDonate()
		AndrewLytics(`donate.bannerClick`)
	}, [onDonate])

	if (!visible) return null

	return (
		<BannerStyled>
			<BannerTextStyled>Этот сервис поддерживает один человек из Томска. Нравится?</BannerTextStyled>
			<BannerButtonStyled onClick={handleDonate}>Поддержать ☕</BannerButtonStyled>
			<BannerCloseStyled onClick={handleDismiss} aria-label="Закрыть">
				✕
			</BannerCloseStyled>
		</BannerStyled>
	)
}
