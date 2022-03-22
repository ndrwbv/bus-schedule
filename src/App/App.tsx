import { fetchInfo, fetchSchedule } from 'api'
import ScheduleProvider from 'context/ScheduleContext'
import { getNextDay } from 'helpers/schedule'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Schedule from '../components/Schedule/Schedule'

const AppContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`

const currentDay = new Date().getDay()
const nextDay = getNextDay(currentDay)

function App({ c = currentDay, n = nextDay, fi = fetchInfo, fs = fetchSchedule }) {
	return (
		<ScheduleProvider currentDay={c} nextDay={n} fetchSchedule={fs} fetchInfo={fi}>
			<AppContainer>
				<Schedule />
			</AppContainer>
		</ScheduleProvider>
	)
}

export default App
