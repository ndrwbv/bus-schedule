import { FC, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'
import { ContainerStyled } from 'shared/ui'

import { StripAdBlock } from './ui/StripAdBlock/StripAdBlock'
import { StripAdBottomSheet } from './ui/StripAdBottomSheet/StripAdBottomSheet'

const toggle = true
export const StripAd: FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [searchParams, setSearchParams] = useSearchParams()

	const handleOpen = (): void => {
		searchParams.set(`stripad`, `open`)
		setSearchParams(searchParams)
		setIsOpen(true)
	}

	const handleClose = (): void => {
		searchParams.delete(`stripad`)
		setSearchParams(searchParams)
		setIsOpen(false)
	}

	useEffect(() => {
		const parsed = queryString.parse(window.location.search) as { stripad?: string }
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (parsed?.stripad) {
			setIsOpen(true)
		}
	}, [])

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (toggle === false) {
		return null
	}

	return (
		<ContainerStyled>
			<StripAdBottomSheet open={isOpen} onClose={handleClose} />
			<StripAdBlock onOpen={handleOpen} />
		</ContainerStyled>
	)
}
