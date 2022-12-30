import { HeaderActionsStyled, HeaderContainerStyled, HeaderInnerStyled, Logo } from 'entities/Logo'
import { TranslationLink } from 'entities/TranslationLink'
import { WriteMe } from 'entities/WriteMe'
import { BottomSheetCustom } from 'features/BottomSheet/BottomSheet'
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
import { MainLayoutStyled } from 'shared/ui/MainLayout'
import { BusStop } from 'widget/BusStop'
import { Map } from 'widget/Map'
import { TodaysBuses } from 'widget/TodaysBuses'

import { Share } from '../../features/Share'
import { HomeContainerStyled } from './styled'

export const Home: React.FC = () => {
	useSchedule()

	return (
		<ComplainsProvider>
			<HomeContainerStyled>
				<HeaderContainerStyled>
					<HeaderInnerStyled>
						<Logo />

						<HeaderActionsStyled>
							<HeaderScore />
							<Share />
						</HeaderActionsStyled>
					</HeaderInnerStyled>
				</HeaderContainerStyled>

				<Map />

				<BottomSheetCustom>
					<>
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
					</>
				</BottomSheetCustom>
			</HomeContainerStyled>
		</ComplainsProvider>
	)
}
