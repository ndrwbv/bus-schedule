import { FC, useEffect, useRef, useState } from 'react'
import { featureToggles } from 'shared/configs/featureToggles'
import { ContainerStyled } from 'shared/ui'

import { YANDEX_AD_BLOCK_ID, YANDEX_AD_RENDER_ID } from './const'
import { YandexAdContainerStyled } from './YandexAd.styles'

declare global {
	interface Window {
		Ya?: {
			Context: {
				AdvManager: {
					render: (params: { blockId: string; renderTo: string; type?: string; platform?: string }) => void
				}
			}
		}
		yaContextCb?: Array<() => void>
	}
}

export const YandexAd: FC = () => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [isLoaded, setIsLoaded] = useState(false)
	const [hasError, setHasError] = useState(false)
	const scriptLoadedRef = useRef(false)

	useEffect(() => {
		if (scriptLoadedRef.current) return undefined
		scriptLoadedRef.current = true

		if (!YANDEX_AD_BLOCK_ID) {
			console.error(`[YandexAd] YANDEX_AD_BLOCK_ID не задан — реклама не будет показана`)
			setHasError(true)

			return undefined
		}

		const existingScript = document.querySelector(`script[src*="context.js"]`)

		const initAd = (): void => {
			window.yaContextCb = window.yaContextCb || []
			window.yaContextCb.push(() => {
				window.Ya?.Context.AdvManager.render({
					blockId: YANDEX_AD_BLOCK_ID,
					renderTo: YANDEX_AD_RENDER_ID,
				})
				setIsLoaded(true)
			})
		}

		if (existingScript) {
			initAd()

			return undefined
		}

		const script = document.createElement(`script`)
		script.src = `https://yandex.ru/ads/system/context.js`
		script.async = true

		script.onload = (): void => {
			initAd()
		}

		script.onerror = (): void => {
			console.error(`[YandexAd] Не удалось загрузить скрипт Яндекс.Рекламы (возможно, блокировщик рекламы)`)
			setHasError(true)
		}

		document.head.appendChild(script)

		// Hide ad if it's empty after timeout (adblock case)
		const timer = setTimeout(() => {
			const adContainer = document.getElementById(YANDEX_AD_RENDER_ID)
			if (adContainer && adContainer.children.length === 0) {
				console.error(`[YandexAd] Контейнер рекламы пуст после 5с — возможно, блокировщик рекламы или неверный blockId`)
				setHasError(true)
			}
		}, 5000)

		return () => {
			clearTimeout(timer)
		}
	}, [])

	if (!featureToggles.ad || hasError || !YANDEX_AD_BLOCK_ID) return null

	return (
		<ContainerStyled>
			<YandexAdContainerStyled ref={containerRef} $isLoaded={isLoaded}>
				<div id={YANDEX_AD_RENDER_ID} />
			</YandexAdContainerStyled>
		</ContainerStyled>
	)
}
