import { fetchInfo, fetchSchedule } from 'api'
import { getNextDay } from 'components/Schedule/helpers'
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
		<AppContainer>
			<Schedule currentDay={c} nextDay={n} fetchInfo={fi} fetchSchedule={fs} />
		</AppContainer>
	)
}

export default App
