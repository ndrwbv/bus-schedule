import React, { useState } from 'react'
import styled from 'styled-components'

import { SettingsModal } from './SettingsModal'

const ButtonStyled = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	padding: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: background 0.2s;

	@media (hover: hover) {
		&:hover {
			background: rgba(0, 0, 0, 0.05);
		}
	}

	svg {
		width: 22px;
		height: 22px;
		fill: #666;
	}
`

export const SettingsButton: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<ButtonStyled onClick={() => setIsOpen(true)} aria-label="Настройки">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
				</svg>
			</ButtonStyled>

			{isOpen && <SettingsModal onClose={() => setIsOpen(false)} />}
		</>
	)
}
