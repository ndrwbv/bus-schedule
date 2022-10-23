import { useTranslation } from 'react-i18next'
import { fetchInfo, fetchSchedule } from 'shared/api'

import { LinksBlock, MainLayout } from 'widget/Schedule/ui/styled'

import { Logo } from 'entities/Logo'
import { HeaderInner, HeaderContainer, HeaderActions } from 'entities/Logo/ui/styled'

import Schedule from '../../widget/Schedule/Schedule'
import { Container, GrayText } from 'shared/ui/common'

import { ABOUT_LINK, AVTOTRANS, AVTOTRANS_LINK, COPYRIGHT } from 'shared/common'

import ScheduleProvider from 'widget/Schedule/model/ScheduleContext'
import { getNextDay } from 'widget/Schedule/helpers/schedule'

import { AndrewLytics } from 'shared/lib'
import WriteMe from 'entities/WriteMe/WriteMe'

import { AppContainer, Footer } from 'App/styled'
import { Link, useSearchParams } from 'react-router-dom'
import { Share } from '../../features/Share'
import ComplainsProvider from 'features/Complains/model/ComplainsContext'
import { HeaderScore } from 'features/HeaderScore'

const currentDay = new Date().getDay()
const nextDay = getNextDay(currentDay)

export const Home = ({ c = currentDay, n = nextDay, fi = fetchInfo, fs = fetchSchedule }: any) => {
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
