import { HeaderActionsStyled, HeaderContainerStyled, HeaderInnerStyled, Logo } from 'entities/Logo'
import { TranslationLink } from 'entities/TranslationLink'
import { WriteMe } from 'entities/WriteMe'
import { Complains } from 'features/Complains'
import { ComplainsProvider } from 'features/Complains/model/ComplainsContext'
import { DirectionChanger } from 'features/DirectionChanger'
import { FavoriteStops } from 'features/FavoriteStops'
import { HeaderScore } from 'features/HeaderScore'
// import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'
// import { useRef, useState } from 'react'
import { Info } from 'features/Info'
import { LeaveFeedbackButton } from 'features/LeaveFeedbackButton'
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

	// const sheetRef = useRef<BottomSheetRef>(null)
	// const [expandOnContentDrag, setExpandOnContentDrag] = useState(true)
	// const focusRef = useRef<HTMLButtonElement>(null)

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

				{/* <BottomSheet
					open
					skipInitialTransition
					// sibling={<CloseExample className="z-10" />}
					ref={sheetRef}
					initialFocusRef={focusRef}
					defaultSnap={({ maxHeight }) => maxHeight / 2}
					snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight / 4, maxHeight * 0.6]}
					expandOnContentDrag={expandOnContentDrag}
					blocking={false}
				> */}
				<MainLayoutStyled>
					<Info />
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
				{/* </BottomSheet> */}
			</HomeContainerStyled>
		</ComplainsProvider>
	)
}
