import { IOption } from 'interfaces/Stops'
import { InlineOptionsContainer, InlineOptionsItem, OverLayContainer } from './styled'

interface IProps {
	list: IOption<any>[]
	activeId: any
	onClick: (value: any) => void
	defaultColor?: string
}

const InlineOptions: React.FC<IProps> = ({ list, activeId, onClick, defaultColor = undefined }) => {
	return (
		<OverLayContainer>
			<InlineOptionsContainer>
				{list.map(option => (
					<InlineOptionsItem
						active={option.value === activeId}
						defaultColor={defaultColor}
						key={option.value}
						onClick={() => onClick(option.value)}
					>
						{option.label}
					</InlineOptionsItem>
				))}
			</InlineOptionsContainer>
		</OverLayContainer>
	)
}

export default InlineOptions
