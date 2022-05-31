import React, { useState } from 'react'
import Popup, { PopupWrapper } from 'components/Popup/Popup'
import ComplainMessage from './ComplainsMessage'
import { useComplainsContext } from 'context/ComplainsContext'
import { MiniButton } from 'components/common'

import { HeaderText } from 'components/Header/styled'
import { ComplainsBlockContainer, ComplainsBlockText, ComplainsContainer, ComplainsLabel } from './styled'

function Complains() {
	const [isOpen, setIsOpen] = useState(false)

	const { complains } = useComplainsContext()
	const contentRef = React.useRef(null)

	return (
		<>
			<Popup isOpen={isOpen} handleClose={() => setIsOpen(false)} contentRef={contentRef}>
				<div ref={contentRef} style={{ overflow: 'scroll' }}>
					<PopupWrapper>
						{complains.map(c => (
							<ComplainMessage {...c} />
						))}
					</PopupWrapper>
				</div>
			</Popup>

			<ComplainsContainer onClick={() => setIsOpen(true)}>
				<div>
					<ComplainsBlockContainer>
						<ComplainsBlockText>Жалобы сегодня {complains.length}</ComplainsBlockText>
						<ComplainsLabel>последняя 10 минут назад</ComplainsLabel>
					</ComplainsBlockContainer>

					<HeaderText></HeaderText>
				</div>

				<MiniButton>смотреть</MiniButton>
			</ComplainsContainer>
		</>
	)
}

export default Complains
