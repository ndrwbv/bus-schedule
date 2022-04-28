import { useTranslation } from 'react-i18next'
import { fetchInfo, fetchSchedule } from 'api'

import { LinksBlock, MainLayout, TelegramContainer } from 'components/Schedule/styled'
import Header from 'components/Header/Header'
import Logo from 'components/Logo/Logo'
import { LogoContainer, LogoInner } from 'components/Logo/styled'
import TelegramButton from 'components/TelegramButton/TelegramButton'
import Schedule from '../components/Schedule/Schedule'
import { Container, GrayText } from 'components/common'

import { AVTOTRANS, COPYRIGHT } from 'consts/strings'
import config from 'configs/base'

import Write from 'img/write.svg'

import ScheduleProvider from 'context/ScheduleContext'
import { getNextDay } from 'helpers/schedule'

import { AppContainer, Footer } from './styled'
import { AndrewLytics } from 'helpers/analytics'

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
						<Header
							text={() => (
								<>
									{t('Did you see an error?')}
									<br />
									{t('Have a suggestion for improvement?')}
								</>
							)}
							imgSrc={Write}
						/>

						<TelegramContainer>
							<TelegramButton />
						</TelegramContainer>
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
