import { FC, PropsWithChildren } from 'react'

import {
	GameLayoutContentStyled,
	GameLayoutStyled,
	GameScoreItemStyled,
	GameScoreListStyled,
	GlobalGameStyles,
} from './GameLayout.styles'

export interface IGameScoreItem {
	label: string
	value: string | number
}
const GameScoreItem: FC<IGameScoreItem> = ({ label, value }) => {
	return (
		<GameScoreItemStyled>
			<span>{label}</span>
			<span>{value}</span>
		</GameScoreItemStyled>
	)
}

interface IProps {
	items?: IGameScoreItem[]
}
export const GameLayout: FC<PropsWithChildren<IProps>> = ({ items, children }) => (
	<GameLayoutStyled>
		{items ? (
			<GameScoreListStyled>
				{items.map(item => (
					<GameScoreItem value={item.value} label={item.label} key={item.label} />
				))}
			</GameScoreListStyled>
		) : null}

		<GameLayoutContentStyled>{children}</GameLayoutContentStyled>
		<GlobalGameStyles />
	</GameLayoutStyled>
)
