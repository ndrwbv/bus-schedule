import { useTranslation } from 'react-i18next'
import { fetchInfo, fetchSchedule } from 'shared/api'

import { LinksBlock, MainLayout } from 'components/Schedule/styled'

import Logo from 'components/Logo/Logo'
import { HeaderInner, HeaderContainer, HeaderActions } from 'components/Logo/styled'

import Schedule from '../components/Schedule/Schedule'
import { Container, GrayText } from 'components/common'

import { ABOUT_LINK, AVTOTRANS, AVTOTRANS_LINK, COPYRIGHT } from 'shared/common'

import ScheduleProvider from 'context/ScheduleContext'
import { getNextDay } from 'helpers/schedule'

import { AndrewLytics } from 'shared/lib'
import WriteMe from 'components/WriteMe/WriteMe'

import { AppContainer, Footer } from './styled'
import { Link, useSearchParams } from 'react-router-dom'
import Share from 'components/Share/Share'
import ComplainsProvider from 'context/ComplainsContext'
import HeaderScore from 'components/HeaderScore/HeaderScore'

const currentDay = new Date().getDay()
const nextDay = getNextDay(currentDay)

function App({ c = currentDay, n = nextDay, fi = fetchInfo, fs = fetchSchedule }) {
	const { t } = useTranslation()
	const [searchParams] = useSearchParams()

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
					<MainLayout>
						<Schedule />

						<Container>
							<WriteMe />
						</Container>
					</MainLayout>

					<Footer>
						<Container>
							<LinksBlock>
								<GrayText>
									<a
										href={ABOUT_LINK}
										target="_blank"
										rel="noreferrer"
										onClick={() => AndrewLytics('aboutLink')}
									>
										{t('About')}
									</a>
								</GrayText>

								<GrayText>
									<Link
										to={`/game?${searchParams.toString()}`}
										onClick={() => AndrewLytics('game.footerPlay')}
									>
										Играть
									</Link>
								</GrayText>
								<GrayText>
									{t('Schedule taken from website')}{' '}
									<a href={AVTOTRANS_LINK} target="_blank" rel="noreferrer">
										{AVTOTRANS}
									</a>
								</GrayText>
								<GrayText>{COPYRIGHT}</GrayText>
							</LinksBlock>
						</Container>
					</Footer>
				</AppContainer>
			</ComplainsProvider>
		</ScheduleProvider>
	)
}

export default App
