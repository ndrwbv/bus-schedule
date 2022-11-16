import { Logo } from 'entities/Logo'
import { HeaderInner, HeaderContainer, HeaderActions } from 'entities/Logo'

import { Container } from 'shared/ui/common'

import { WriteMe } from 'entities/WriteMe'

import { HomeContainer } from './styled'
import { Share } from '../../features/Share'
import { HeaderScore } from 'features/HeaderScore'
import { Footer } from 'shared/ui/Footer'
import { Map } from 'widget/Map'
// import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'
// import { useRef, useState } from 'react'
import { Info } from 'features/Info'
import { DirectionChanger } from 'features/DirectionChanger'
import { BusStop } from 'widget/BusStop'
import { Complains } from 'features/Complains'
import { TranslationLink } from 'entities/TranslationLink'
import { FavoriteStops } from 'features/FavoriteStops'
import { TodaysBuses } from 'widget/TodaysBuses'
import { LeaveFeedbackButton } from 'features/LeaveFeedbackButton'
import { OtherTimeBusses } from 'features/OtherTimeBuses'
import { MainLayout } from 'shared/ui/MainLayout'
import useSchedule from 'shared/store/schedule/useSchedule'
import ComplainsProvider from 'features/Complains/model/ComplainsContext'

export const Home = () => {
	useSchedule()

	// const sheetRef = useRef<BottomSheetRef>(null)
	// const [expandOnContentDrag, setExpandOnContentDrag] = useState(true)
	// const focusRef = useRef<HTMLButtonElement>(null)

	return (
		<ComplainsProvider>
			<HomeContainer>
				<HeaderContainer>
					<HeaderInner>
						<Logo />

						<HeaderActions>
							<HeaderScore />
							<Share />
						</HeaderActions>
					</HeaderInner>
				</HeaderContainer>

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
				<MainLayout>
					<Info />
					<DirectionChanger />
					<BusStop />

					<Complains />

					<TranslationLink />

					<FavoriteStops />

					<TodaysBuses />
					<LeaveFeedbackButton />

					<OtherTimeBusses />

					<Container>
						<WriteMe />
					</Container>
				</MainLayout>

				<Footer />
				{/* </BottomSheet> */}
			</HomeContainer>
		</ComplainsProvider>
	)
}
