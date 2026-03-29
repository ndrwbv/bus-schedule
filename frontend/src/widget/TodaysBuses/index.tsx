import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { SelectBusStopText } from 'entities/SelectBusStopText'
import { FavoriteButton } from 'features/FavoriteStops'
import { DefaultTFuncReturn } from 'i18next'
import { busStopSelector } from 'shared/store/busStop/busStopInfoSlice'
import { TaggedTime } from 'shared/store/busStop/Stops'
import { closestTimeArraySelector } from 'shared/store/timeLeft/timeLeftSlice'
import { CardStyled, ContainerStyled } from 'shared/ui'
import { Header } from 'shared/ui/Header'
import { OtherTimeStyled } from 'shared/ui/OtherTime'
import { TimeStampStyled } from 'shared/ui/TimeStamp'

const VIA_LABELS: Record<string, string> = {
	park: `через парк`,
	lb: `через ЛБ`,
}

const TaggedTimeStamp: React.FC<{ item: TaggedTime }> = ({ item }) => (
	<TimeStampStyled>
		{item.interpolated ? `~` : ``}
		{item.time}
		{item.via && <span style={{ color: `#a5a5a5`, fontSize: 13, marginLeft: 6 }}>{VIA_LABELS[item.via]}</span>}
		{item.interpolated && (
			<span style={{ color: `#c4a02c`, fontSize: 11, marginLeft: 4 }} title="Примерное время">
				прим.
			</span>
		)}
	</TimeStampStyled>
)

export const TodaysBuses: React.FC = () => {
	const closestTimeArray = useSelector(closestTimeArraySelector)
	const busStop = useSelector(busStopSelector)

	const { t } = useTranslation()

	const renderTodaysBusContent = (): DefaultTFuncReturn | JSX.Element | JSX.Element[] => {
		if (!busStop) return <SelectBusStopText />

		return closestTimeArray.length === 0
			? t(`No basses`)
			: closestTimeArray.map((d, i) => <TaggedTimeStamp key={`${d.time}-${i}`} item={d} />)
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
