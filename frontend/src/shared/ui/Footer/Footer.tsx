import { useSelector } from 'react-redux'
import { COPYRIGHT } from 'shared/common'
import { AndrewLytics } from 'shared/lib'
import { scheduleSelector, serviceDateSelector } from 'shared/store/schedule/scheduleSlice'

import { ContainerStyled, GrayTextStyled } from '../common'
import { SCHEDULE_SOURCE_DATE, SCHEDULE_SOURCE_IMAGES } from './scheduleSource'
import { FooterStyled, SourceLinksStyled, SourceLinkStyled } from './styled'

export const Footer: React.FC = () => {
	const schedule = useSelector(scheduleSelector)
	const date = useSelector(serviceDateSelector)
	const { circuits } = schedule
	const isNew = !!circuits && date >= circuits.effectiveFrom

	return (
		<FooterStyled>
			<ContainerStyled>
				<div>
					<GrayTextStyled>
						{isNew
							? `Расписание с 7 ноября 2026 года. Первоисточник:`
							: `Расписание от перевозчика (${SCHEDULE_SOURCE_DATE}). Первоисточник:`}
					</GrayTextStyled>

					<SourceLinksStyled>
						{!isNew &&
							SCHEDULE_SOURCE_IMAGES.map(image => (
								<SourceLinkStyled
									key={image.url}
									href={image.url}
									target="_blank"
									rel="noreferrer"
									onClick={() => AndrewLytics(image.analyticsKey)}
								>
									{image.label}
								</SourceLinkStyled>
							))}
						{circuits && (
							<SourceLinkStyled href={circuits.source} target="_blank" rel="noreferrer">
								С 7 ноября: два пути движения
							</SourceLinkStyled>
						)}
					</SourceLinksStyled>

					<GrayTextStyled>
						Промежуточные остановки, которых нет в расписании перевозчика, рассчитываются приблизительно —
						по времени соседних остановок.
					</GrayTextStyled>

					<GrayTextStyled>{COPYRIGHT}</GrayTextStyled>
					<GrayTextStyled>v{__APP_VERSION__}</GrayTextStyled>
				</div>
			</ContainerStyled>
		</FooterStyled>
	)
}
