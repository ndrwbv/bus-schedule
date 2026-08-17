import { COPYRIGHT } from 'shared/common'
import { AndrewLytics } from 'shared/lib'

import { ContainerStyled, GrayTextStyled } from '../common'
import { SCHEDULE_SOURCE_DATE, SCHEDULE_SOURCE_IMAGES } from './scheduleSource'
import { FooterStyled, SourceLinksStyled, SourceLinkStyled } from './styled'

export const Footer: React.FC = () => (
	<FooterStyled>
		<ContainerStyled>
			<div>
				<GrayTextStyled>
					Расписание на сайте набрано с фотографий расписания от перевозчика ({SCHEDULE_SOURCE_DATE}). Открыть
					первоисточник:
				</GrayTextStyled>

				<SourceLinksStyled>
					{SCHEDULE_SOURCE_IMAGES.map(image => (
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
				</SourceLinksStyled>

				<GrayTextStyled>
					Промежуточные остановки, которых нет в расписании перевозчика, рассчитываются приблизительно — по
					времени соседних остановок.
				</GrayTextStyled>

				<GrayTextStyled>{COPYRIGHT}</GrayTextStyled>
				<GrayTextStyled>v{__APP_VERSION__}</GrayTextStyled>
			</div>
		</ContainerStyled>
	</FooterStyled>
)
