import { useTranslation } from 'react-i18next'
import { fetchInfo, fetchSchedule } from 'api'

import { LinksBlock, MainLayout } from 'components/Schedule/styled'

import Logo from 'components/Logo/Logo'
import { LogoContainer, LogoInner } from 'components/Logo/styled'

import Schedule from '../components/Schedule/Schedule'
import { Container, GrayText } from 'components/common'

import { AVTOTRANS, COPYRIGHT } from 'consts/strings'
import config from 'configs/base'

import ScheduleProvider from 'context/ScheduleContext'
import { getNextDay } from 'helpers/schedule'

import { AppContainer, Footer } from './styled'
import { AndrewLytics } from 'helpers/analytics'
import WriteMe from 'components/WriteMe/WriteMe'

const currentDay = new Date().getDay()
const nextDay = getNextDay(currentDay)

function App({ c = currentDay, n = nextDay, fi = fetchInfo, fs = fetchSchedule }) {
	const { t } = useTranslation()

	return (
		<ScheduleProvider currentDay={c} nextDay={n} fetchSchedule={fs} fetchInfo={fi}>
			<AppContainer>
				<LogoInner>
					<LogoContainer>
						<Logo />
					</LogoContainer>
				</LogoInner>

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
								{t('Schedule taken from website')}{' '}
								<a href={config.AVTOTRANS_LINK} target="_blank" rel="noreferrer">
									{AVTOTRANS}
								</a>
							</GrayText>

							<GrayText>{COPYRIGHT}</GrayText>

							<GrayText>
								<a
									href={config.ABOUT_LINK}
									target="_blank"
									rel="noreferrer"
									onClick={() => AndrewLytics('aboutLink')}
								>
									{t('About')}
								</a>
							</GrayText>
						</LinksBlock>
					</Container>
				</Footer>
			</AppContainer>
		</ScheduleProvider>
	)
}

export default App
