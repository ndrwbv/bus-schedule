import { BottomSheetCustom } from 'entities/BottomSheet/BottomSheet'
import { FAQ } from 'entities/FAQ'
import { HeaderActionsStyled, HeaderContainerBetaStyled, HeaderInnerStyled, Logo } from 'entities/Logo'
import { TranslationLink } from 'entities/TranslationLink'
import { WriteMe } from 'entities/WriteMe'
import { Complains } from 'features/Complains'
import { ComplainsProvider } from 'features/Complains/model/ComplainsContext'
import { DirectionChanger } from 'features/DirectionChanger'
import { FavoriteStops } from 'features/FavoriteStops'
import { HeaderScore } from 'features/HeaderScore'
import { Info } from 'features/Info'
import { LeaveFeedbackButton } from 'features/LeaveFeedbackButton'
import { NearestStops } from 'features/NearestStops'
import { OtherTimeBusses } from 'features/OtherTimeBuses'
import useSchedule from 'shared/store/schedule/useSchedule'
import { ContainerStyled } from 'shared/ui/common'
import { Footer } from 'shared/ui/Footer'
import { BottomSheetBgStyled, MainLayoutStyled } from 'shared/ui/MainLayout'
import { BottomSheetHeader } from 'widget/BottomSheetHeader'
import { BusStop } from 'widget/BusStop'
import { Map } from 'widget/Map'
import { TodaysBuses } from 'widget/TodaysBuses'

import { HomeContainerStyled } from './Home.styled'

export const Home: React.FC = () => {
	useSchedule()

	return (
		<ComplainsProvider>
			<HomeContainerStyled>
				<HeaderContainerBetaStyled>
					<HeaderInnerStyled>
						<Logo />

						<HeaderActionsStyled>
							<HeaderScore />
							<FAQ />
						</HeaderActionsStyled>
					</HeaderInnerStyled>
				</HeaderContainerBetaStyled>

				<Map />

				<BottomSheetCustom header={<BottomSheetHeader />}>
					<BottomSheetBgStyled>
						<MainLayoutStyled>
							<Info />
							<NearestStops />
							<DirectionChanger />
							<BusStop />

							<Complains />

							<TranslationLink />

							<FavoriteStops />

							<TodaysBuses />
							<LeaveFeedbackButton />

							<OtherTimeBusses />

							<ContainerStyled>
								<WriteMe />
							</ContainerStyled>
						</MainLayoutStyled>

						<Footer />
					</BottomSheetBgStyled>
				</BottomSheetCustom>
			</HomeContainerStyled>
		</ComplainsProvider>
	)
}
