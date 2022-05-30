import { useState } from 'react'
import Popup, { PopupWrapper } from 'components/Popup/Popup'
import ComplainMessage from './ComplainsMessage'
import { ComplainsContainer } from './styled'
import { useComplainsContext } from 'context/ComplainsContext'
import React from 'react'

function Complains() {
	const [isOpen, setIsOpen] = useState(false)

	const { complains, addComplain } = useComplainsContext()
	const contentRef = React.useRef(null)

	return (
		<>
			<Popup isOpen={isOpen} handleClose={() => setIsOpen(false)} contentRef={contentRef}>
				<div ref={contentRef} style={{ overflow: 'scroll' }}>
					<PopupWrapper>
						{complains.map(c => (
							<ComplainMessage {...c} />
						))}

						<button
							onClick={() => {
								const d = new Date().toISOString()
								console.log('d', d)
								addComplain({
									stop: 'В. Маяковского',
									direction: 'in',
									date: d,
									type: 'earlier',
									on: 15,
								})
							}}
						>
							Жаловаться
						</button>
					</PopupWrapper>
				</div>
			</Popup>

			<ComplainsContainer onClick={() => setIsOpen(true)}>Жалобы сегодня 2</ComplainsContainer>
		</>
	)
}

export default Complains
