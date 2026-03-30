import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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

const OverlayStyled = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	z-index: 9999;
	display: flex;
	align-items: flex-end;
	justify-content: center;
`

const ModalStyled = styled.div`
	background: #fff;
	border-radius: 20px 20px 0 0;
	width: 100%;
	max-width: 768px;
	max-height: 70vh;
	display: flex;
	flex-direction: column;
`

const ModalHeaderStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid #f2f4f4;
	flex-shrink: 0;
`

const ModalTitleStyled = styled.h3`
	margin: 0;
	font-size: 18px;
	font-weight: 600;
`

const CloseButtonStyled = styled.button`
	background: none;
	border: none;
	font-size: 24px;
	cursor: pointer;
	padding: 0 4px;
	line-height: 1;
	color: #999;
`

const ListStyled = styled.div`
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
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

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = `hidden`
		} else {
			document.body.style.overflow = ``
		}

		return (): void => {
			document.body.style.overflow = ``
		}
	}, [isOpen])

	const stopsOnly = options.filter(o => o.value !== null)

	return (
		<>
			<TriggerButtonStyled type="button" onClick={(): void => setIsOpen(true)}>
				{displayLabel ?? placeholder}
			</TriggerButtonStyled>

			{isOpen &&
				createPortal(
					<OverlayStyled onClick={(): void => setIsOpen(false)}>
						<ModalStyled onClick={(e): void => e.stopPropagation()}>
							<ModalHeaderStyled>
								<ModalTitleStyled>Остановка</ModalTitleStyled>
								<CloseButtonStyled type="button" onClick={(): void => setIsOpen(false)}>
									&times;
								</CloseButtonStyled>
							</ModalHeaderStyled>
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
						</ModalStyled>
					</OverlayStyled>,
					document.body,
				)}
		</>
	)
}
