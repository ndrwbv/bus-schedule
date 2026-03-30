import { useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { IOption, StopKeys } from 'shared/store/busStop/Stops'
import { MAIN_BLUE } from 'shared/theme'
import styled from 'styled-components'

const TriggerButtonStyled = styled.button`
	background: #f2f4f4;
	border: none;
	border-radius: 12px;
	padding: 10px 14px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	max-width: 200px;
	text-align: left;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	@media (hover: hover) {
		&:hover {
			opacity: 0.8;
		}
	}
`

const ListStyled = styled.div`
	padding: 8px 0 24px;
`

const ItemStyled = styled.button<{ $active: boolean }>`
	display: block;
	width: 100%;
	border: none;
	background: ${({ $active }): string => ($active ? MAIN_BLUE : `transparent`)};
	color: ${({ $active }): string => ($active ? `#fff` : `#000`)};
	text-align: left;
	padding: 14px 20px;
	font-size: 16px;
	font-weight: ${({ $active }): number => ($active ? 600 : 400)};
	cursor: pointer;

	& + & {
		border-top: 1px solid #f2f4f4;
	}

	@media (hover: hover) {
		&:hover {
			background: ${({ $active }): string => ($active ? MAIN_BLUE : `#f2f4f4`)};
		}
	}
`

interface StopPickerModalProps {
	options: IOption<StopKeys | null>[]
	value: StopKeys | null
	onChange: (stop: StopKeys) => void
	placeholder?: string
}

export const StopPickerModal: React.FC<StopPickerModalProps> = ({
	options,
	value,
	onChange,
	placeholder = `Выберите остановку`,
}) => {
	const [isOpen, setIsOpen] = useState(false)

	const displayLabel = options.find(o => o.value === value)?.label

	const handleSelect = (stop: StopKeys | null): void => {
		if (!stop) {
			return
		}

		onChange(stop)
		setIsOpen(false)
	}

	const stopsOnly = options.filter(o => o.value !== null)

	return (
		<>
			<TriggerButtonStyled type="button" onClick={(): void => setIsOpen(true)}>
				{displayLabel ?? placeholder}
			</TriggerButtonStyled>

			<BottomSheet
				open={isOpen}
				onDismiss={(): void => setIsOpen(false)}
				defaultSnap={({ maxHeight }): number => maxHeight * 0.6}
				snapPoints={({ maxHeight }): number[] => [maxHeight - maxHeight / 10, maxHeight * 0.6]}
			>
				<ListStyled>
					{stopsOnly.map(option => (
						<ItemStyled
							key={option.value as string}
							$active={option.value === value}
							type="button"
							onClick={(): void => handleSelect(option.value)}
						>
							{option.label}
						</ItemStyled>
					))}
				</ListStyled>
			</BottomSheet>
		</>
	)
}
