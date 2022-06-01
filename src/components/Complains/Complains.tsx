import React, { useMemo, useState } from 'react'
import Popup, { PopupWrapper } from 'components/Popup/Popup'
import ComplainMessage from './ComplainsMessage'
import { useComplainsContext } from 'context/ComplainsContext'
import { MiniButton } from 'components/common'

import { HeaderText } from 'components/Header/styled'
import { getHumanDate } from './helpers'
import { AndrewLytics } from 'helpers/analytics'
import {
	ComplainCount,
	ComplainsBlockContainer,
	ComplainsBlockText,
	ComplainsContainer,
	ComplainsLabel,
	InfoText,
	PopupContent,
} from './styled'

function Complains() {
	const [isOpen, setIsOpen] = useState(false)

	const { complains } = useComplainsContext()
	const contentRef = React.useRef(null)

	const latestTime = useMemo(() => {
		if (complains.length === 0) return 'сегодня ни одной жалобы'
		const latest = complains[0]
		return `последняя ${getHumanDate(latest.date)}`
	}, [complains])

	const handleOpenComplains = () => {
		setIsOpen(true)
		AndrewLytics('openComplains')
	}

	return (
		<>
			<Popup isOpen={isOpen} handleClose={() => setIsOpen(false)} contentRef={contentRef}>
				<PopupContent ref={contentRef}>
					<PopupWrapper>
						<InfoText>
							Жалобы попадают автоматически после нажатия на кнопку "Я сел в автобус". Кнопка появляется в
							секции Остановка при выбранной остановке.
						</InfoText>
						{complains.map(c => (
							<ComplainMessage {...c} key={c.id} />
						))}
					</PopupWrapper>
				</PopupContent>
			</Popup>

			<ComplainsContainer>
				<div>
					<ComplainsBlockContainer>
						<ComplainsBlockText>
							Жалобы <ComplainCount>{complains.length}</ComplainCount>
						</ComplainsBlockText>
						<ComplainsLabel>{latestTime}</ComplainsLabel>
					</ComplainsBlockContainer>

					<HeaderText></HeaderText>
				</div>

				<MiniButton disabled={complains.length === 0} onClick={handleOpenComplains}>
					Смотреть
				</MiniButton>
			</ComplainsContainer>
		</>
	)
}

export default Complains
