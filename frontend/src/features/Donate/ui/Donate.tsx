import React, { useState } from 'react'

import { DonateBanner } from './DonateBanner'
import { DonatePopup } from './DonatePopup'

export const Donate: React.FC = () => {
	const [isDonateOpen, setIsDonateOpen] = useState(false)

	return (
		<>
			<DonateBanner onDonate={() => setIsDonateOpen(true)} />
			<DonatePopup isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />
		</>
	)
}
