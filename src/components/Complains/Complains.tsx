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
	PopupContent,
} from './styled'

function Complains() {
	const [isOpen, setIsOpen] = useState(false)

	const { complains } = useComplainsContext()
	const contentRef = React.useRef(null)

	const latestTime = useMemo(() => {
		if(complains.length === 0) return ""
		const latest = complains[0]
		return getHumanDate(latest.date)
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
						{complains.map(c => (
							<ComplainMessage {...c} />
						))}
					</PopupWrapper>
				</PopupContent>
			</Popup>

			<ComplainsContainer onClick={handleOpenComplains}>
				<div>
					<ComplainsBlockContainer>
						<ComplainsBlockText>
							Жалобы <ComplainCount>{complains.length}</ComplainCount>
						</ComplainsBlockText>
						<ComplainsLabel>последняя {latestTime}</ComplainsLabel>
					</ComplainsBlockContainer>

					<HeaderText></HeaderText>
				</div>

				<MiniButton>смотреть</MiniButton>
			</ComplainsContainer>
		</>
	)
}

export default Complains
