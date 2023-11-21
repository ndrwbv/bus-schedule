import { Complains } from 'features/Complains/ui/Complains'

import { HolidayContainerStyled } from './styled'

export const Holiday: React.FC = () => {
	return (
		<HolidayContainerStyled>
			<Complains />
			праздничное расписание
		</HolidayContainerStyled>
	)
}
