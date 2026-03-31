/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HeaderActionsStyled, HeaderContainerBetaStyled, HeaderInnerStyled, Logo } from 'entities/Logo'
import { WriteMe } from 'entities/WriteMe'
import { BottomSheetCustom } from 'features/BottomSheet/BottomSheet'
import { Complains } from 'features/Complains'
import { DonateCard, DonateProvider } from 'features/Donate'
import { FavoriteStops } from 'features/FavoriteStops'
import { Info } from 'features/Info'
import { NearestStops } from 'features/NearestStops'
import { OtherTimeBusses } from 'features/OtherTimeBuses'
import { SettingsButton } from 'features/Settings'
import { StripAd } from 'features/StripAd/StripAd'
import { YandexAd } from 'features/YandexAd'
import useSchedule from 'shared/store/schedule/useSchedule'
import { ContainerStyled } from 'shared/ui/common'
import { Footer } from 'shared/ui/Footer'
import { BottomSheetBgStyled, MainLayoutBetaStyled } from 'shared/ui/MainLayout'
import { BottomSheetHeader } from 'widget/BottomSheetHeader'
import { BusStop } from 'widget/BusStop'
import { Map } from 'widget/Map'
import { TodaysBuses } from 'widget/TodaysBuses'

import { HomeContainerStyled } from './Home.styled'

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

				<Map />

				<BottomSheetCustom header={<BottomSheetHeader />}>
					<BottomSheetBgStyled>
						<MainLayoutBetaStyled>
							<Info />
							<NearestStops />
							<BusStop />

							<Complains />

							<StripAd />
							<YandexAd />

							<FavoriteStops />

							<TodaysBuses />

							<OtherTimeBusses />

							<DonateCard />

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
