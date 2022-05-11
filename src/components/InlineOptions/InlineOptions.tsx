import { IStop } from 'interfaces/Stops'
import { InlineOptionsContainer, InlineOptionsItem, OverLayContainer } from './styled'

const InlineOptions: React.FC<{
	list: IStop<string | number | null>[]
	activeId: string | null
	onClick: (busStop: string | number | null) => void
	defaultColor?: string
}> = ({ list, activeId, onClick, defaultColor = undefined }) => {
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
