import { fetchInfo, fetchSchedule } from 'api'
import Logo from 'components/Logo/Logo'
import { LogoContainer, LogoInner } from 'components/Logo/styled'
import ScheduleProvider from 'context/ScheduleContext'
import { getNextDay } from 'helpers/schedule'
import styled from 'styled-components'
import Schedule from '../components/Schedule/Schedule'

const AppContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`

const currentDay = new Date().getDay()
const nextDay = getNextDay(currentDay)

function App({ c = currentDay, n = nextDay, fi = fetchInfo, fs = fetchSchedule }) {
	return (
		<ScheduleProvider currentDay={c} nextDay={n} fetchSchedule={fs} fetchInfo={fi}>
			<AppContainer>
				<LogoInner>
					<LogoContainer>
						<Logo />
					</LogoContainer>
				</LogoInner>

				<Schedule />
			</AppContainer>
		</ScheduleProvider>
	)
}

export default App
