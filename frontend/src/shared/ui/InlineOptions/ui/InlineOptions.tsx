import { IOption } from 'shared/store/busStop/Stops'

import { InlineOptionsContainerStyled, InlineOptionsItemStyled, OverLayContainerStyled } from './styled'

type ValueType = number | string | null

interface IProps<T = ValueType> {
	list: IOption<T>[]
	activeId: T
	onClick: (value: T) => void
	defaultColor?: string
}

export const InlineOptions = <T,>({
	list,
	activeId,
	onClick,
	defaultColor = undefined,
}: React.PropsWithChildren<IProps<T | null>>): JSX.Element => {
	return (
		<OverLayContainerStyled>
			<InlineOptionsContainerStyled>
				{list.map(option => (
					<InlineOptionsItemStyled
						$active={option.value === activeId}
						$defaultColor={defaultColor}
						key={option.value as string}
						onClick={() => onClick(option.value)}
					>
						{option.label}
					</InlineOptionsItemStyled>
				))}
			</InlineOptionsContainerStyled>
		</OverLayContainerStyled>
	)
}
