import { IStop } from 'interfaces/Stops'
import { InlineOptionsContainer, InlineOptionsItem } from './styled'

const InlineOptions: React.FC<{
	list: IStop<string | number | null>[]
	activeId: string | null
	onClick: (busStop: string | number | null) => void
	defaultColor?: string
}> = ({ list, activeId, onClick, defaultColor = undefined }) => {
	return (
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
	)
}

export default InlineOptions