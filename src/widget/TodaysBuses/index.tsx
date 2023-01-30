import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { SelectBusStopText } from 'entities/SelectBusStopText'
import { FavoriteButton } from 'features/FavoriteStops'
import { DefaultTFuncReturn } from 'i18next'
import { busStopSelector } from 'shared/store/busStop/busStopInfoSlice'
import { closestTimeArraySelector } from 'shared/store/timeLeft/timeLeftSlice'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { OtherTimeStyled } from 'shared/ui/OtherTime'
import { TimeStampStyled } from 'shared/ui/TimeStamp'

console.log(23)
export const TodaysBuses: React.FC = () => {
	const closestTimeArray = useSelector(closestTimeArraySelector)
	const busStop = useSelector(busStopSelector)

	const { t } = useTranslation()

	const renderTodaysBusContent = (): DefaultTFuncReturn | JSX.Element | JSX.Element[] => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? t(`No basses`)
			: closestTimeArray.map(d => <TimeStampStyled key={d}>{d}</TimeStampStyled>)
	}

	return (
		<ContainerStyled>
			<CardStyled>
				<Header text={t(`Buses for today`)} />

				<OtherTimeStyled>{renderTodaysBusContent()}</OtherTimeStyled>

				<FavoriteButton />
			</CardStyled>
		</ContainerStyled>
	)
}
