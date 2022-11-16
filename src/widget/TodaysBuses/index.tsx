import { SelectBusStopText } from 'entities/SelectBusStopText'
import { FavoriteButton } from 'features/FavoriteStops'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Card, Container } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { OtherTime } from 'shared/ui/OtherTime'
import { TimeStamp } from 'shared/ui/TimeStamp'
import { busStopSelector } from 'shared/store/busStop/busStopInfoSlice'
import { closestTimeArraySelector } from 'shared/store/timeLeft/timeLeftSlice'

export const TodaysBuses = () => {
	const closestTimeArray = useSelector(closestTimeArraySelector)
	const busStop = useSelector(busStopSelector)

	const { t } = useTranslation()

	const renderTodaysBusContent = () => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? t('No basses')
			: closestTimeArray.map((d, index) => <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>)
	}

	return (
		<Container>
			<Card>
				<Header text={t('Buses for today')} />

				<OtherTime>{renderTodaysBusContent()}</OtherTime>

				<FavoriteButton />
			</Card>
		</Container>
	)
}