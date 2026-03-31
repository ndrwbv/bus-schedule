import { IOption } from 'shared/store/busStop/Stops'

import { InlineOptionsContainerStyled, InlineOptionsItemStyled, OverLayContainerStyled } from './styled'

type ValueType = number | string | null

interface IProps<T = ValueType> {
	list: IOption<T>[]
	activeId: T
	onClick: (value: T) => void
	disabled?: boolean
}

export const InlineOptions = <T,>({
	list,
	activeId,
	onClick,
	disabled = false,
}: React.PropsWithChildren<IProps<T | null>>): JSX.Element => {
	return (
		<OverLayContainerStyled>
			<InlineOptionsContainerStyled>
				{list.map(option => (
					<InlineOptionsItemStyled
						$active={option.value === activeId}
						$disabled={disabled}
						key={option.value as string}
						onClick={() => !disabled && onClick(option.value)}
					>
						{option.label}
					</InlineOptionsItemStyled>
				))}
			</InlineOptionsContainerStyled>
		</OverLayContainerStyled>
	)
}
