/* eslint-disable @typescript-eslint/no-unsafe-call */
import { lazy, Suspense } from 'react'
import { HeaderActionsStyled, HeaderContainerBetaStyled, HeaderInnerStyled, Logo } from 'entities/Logo'
import { WriteMe } from 'entities/WriteMe'
import { BottomSheetCustom } from 'features/BottomSheet/BottomSheet'
import { DonateProvider } from 'features/Donate'
import { FavoriteStops } from 'features/FavoriteStops'
import { Info } from 'features/Info'
import { SettingsButton } from 'features/Settings'
import useSchedule from 'shared/store/schedule/useSchedule'
import { ContainerStyled } from 'shared/ui/common'
import { Footer } from 'shared/ui/Footer'
import { BottomSheetBgStyled, MainLayoutBetaStyled } from 'shared/ui/MainLayout'
import { BottomSheetHeader } from 'widget/BottomSheetHeader'
import { BusStop } from 'widget/BusStop'
import { TodaysBuses } from 'widget/TodaysBuses'

import { HomeContainerStyled } from './Home.styled'

const Map = lazy(() => import('widget/Map/ui/Map').then(m => ({ default: m.Map })))
const NearestStops = lazy(() =>
	import('features/NearestStops/NearestStops').then(m => ({ default: m.NearestStops })),
)
const Complains = lazy(() => import('features/Complains/ui/Complains').then(m => ({ default: m.Complains })))
const YandexAd = lazy(() => import('features/YandexAd/YandexAd').then(m => ({ default: m.YandexAd })))
const OtherTimeBusses = lazy(() =>
	import('features/OtherTimeBuses/OtherTimeBuses').then(m => ({ default: m.OtherTimeBusses })),
)
const DonateCard = lazy(() => import('features/Donate/ui/Donate').then(m => ({ default: m.DonateCard })))

export const Home: React.FC = () => {
	useSchedule()

	return (
		<DonateProvider>
			<HomeContainerStyled>
				<HeaderContainerBetaStyled>
					<HeaderInnerStyled>
						<Logo />

						<HeaderActionsStyled>
							<SettingsButton />
						</HeaderActionsStyled>
					</HeaderInnerStyled>
				</HeaderContainerBetaStyled>

				<Suspense fallback={<div style={{ height: '40vh', background: '#e8e8e6' }} />}>
					<Map />
				</Suspense>

				<BottomSheetCustom header={<BottomSheetHeader />}>
					<BottomSheetBgStyled>
						<MainLayoutBetaStyled>
							<Info />
							<Suspense fallback={null}>
								<NearestStops />
							</Suspense>
							<BusStop />

							<Suspense fallback={null}>
								<Complains />
							</Suspense>

							<Suspense fallback={null}>
								<YandexAd />
							</Suspense>

							<FavoriteStops />

							<TodaysBuses />

							<Suspense fallback={null}>
								<OtherTimeBusses />
							</Suspense>

							<Suspense fallback={null}>
								<DonateCard />
							</Suspense>

							<ContainerStyled>
								<WriteMe />
							</ContainerStyled>
						</MainLayoutBetaStyled>

						<Footer />
					</BottomSheetBgStyled>
				</BottomSheetCustom>
			</HomeContainerStyled>
		</DonateProvider>
	)
}
