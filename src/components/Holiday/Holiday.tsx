import { useScheduleContext } from 'context/ScheduleContext'
import { HolidayContainer } from './styled'

const Holiday = () => {
	const { todaysHoliday } = useScheduleContext()

    if(!todaysHoliday) return <></>;

	return <HolidayContainer>праздничное расписание</HolidayContainer>
}

export default Holiday
