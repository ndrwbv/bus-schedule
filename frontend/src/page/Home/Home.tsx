/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HeaderActionsStyled, HeaderContainerBetaStyled, HeaderInnerStyled, Logo } from 'entities/Logo'
import { WriteMe } from 'entities/WriteMe'
import { BottomSheetCustom } from 'features/BottomSheet/BottomSheet'
import { FavoriteStops } from 'features/FavoriteStops'
import { HeaderScore } from 'features/HeaderScore'
import { Info } from 'features/Info'
// import { LeaveFeedbackButton } from 'features/LeaveFeedbackButton'
import { NearestStops } from 'features/NearestStops'
import { OtherTimeBusses } from 'features/OtherTimeBuses'
import { ScheduleInfo } from 'features/ScheduleInfo'
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

// import { FAQ } from '../../features/FAQ'
import { HomeContainerStyled } from './Home.styled'

export const Home: React.FC = () => {
	useSchedule()

	return (
		<HomeContainerStyled>
			<HeaderContainerBetaStyled>
				<HeaderInnerStyled>
					<Logo />

					<HeaderActionsStyled>
						<HeaderScore />
						{/* <FAQ /> */}
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

						<StripAd />
						<YandexAd />

						<FavoriteStops />

						<TodaysBuses />

						<ScheduleInfo />

						{/* <LeaveFeedbackButton /> */}

						<OtherTimeBusses />

						<ContainerStyled>
							<WriteMe />
						</ContainerStyled>
					</MainLayoutBetaStyled>

					<Footer />
				</BottomSheetBgStyled>
			</BottomSheetCustom>
		</HomeContainerStyled>
	)
}
