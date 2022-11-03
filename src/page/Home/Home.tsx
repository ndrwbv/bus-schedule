import { fetchInfo, fetchSchedule } from 'shared/api'

import { MainLayout } from 'widget/Schedule/ui/styled'

import { Logo } from 'entities/Logo'
import { HeaderInner, HeaderContainer, HeaderActions } from 'entities/Logo/ui/styled'

import Schedule from '../../widget/Schedule/Schedule'
import { Container } from 'shared/ui/common'

import ScheduleProvider from 'widget/Schedule/model/ScheduleContext'
import { getNextDay } from 'widget/Schedule/helpers/schedule'

import WriteMe from 'entities/WriteMe/WriteMe'

import { AppContainer } from 'App/styled'
import { Share } from '../../features/Share'
import ComplainsProvider from 'features/Complains/model/ComplainsContext'
import { HeaderScore } from 'features/HeaderScore'
import { Footer } from 'shared/ui/Footer'
import { Map } from 'widget/Map'
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'
import { useRef, useState } from 'react'

const currentDay = new Date().getDay()
const nextDay = getNextDay(currentDay)

export const Home = ({ c = currentDay, n = nextDay, fi = fetchInfo, fs = fetchSchedule }: any) => {
	const sheetRef = useRef<BottomSheetRef>(null)
	const [expandOnContentDrag, setExpandOnContentDrag] = useState(true)
	const focusRef = useRef<HTMLButtonElement>(null)

	return (
		<ScheduleProvider currentDay={c} nextDay={n} fetchSchedule={fs} fetchInfo={fi}>
			<ComplainsProvider>
				<AppContainer>
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

					<BottomSheet
						open
						skipInitialTransition
						// sibling={<CloseExample className="z-10" />}
						ref={sheetRef}
						initialFocusRef={focusRef}
						defaultSnap={({ maxHeight }) => maxHeight / 2}
						snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight / 4, maxHeight * 0.6]}
						expandOnContentDrag={expandOnContentDrag}
						blocking={false}
					>
						<MainLayout>
							<Schedule />

							<Container>
								<WriteMe />
							</Container>
						</MainLayout>

						<Footer />
					</BottomSheet>
				</AppContainer>
			</ComplainsProvider>
		</ScheduleProvider>
	)
}
