import { FC } from 'react'

import { GameButton } from '../shared/ui/GameButton/GameButton'
import { OnboardingStyled } from './Onboarding.styles'

interface IProps {
	startNewGame: () => void
}
export const Onboarding: FC<IProps> = ({ startNewGame }) => (
	<OnboardingStyled>
		<h1 style={{ fontSize: `20px`, fontWeight: `bold`, alignSelf: `center` }}>Автобусник</h1>
		<GameButton onClick={startNewGame}>Новая игра</GameButton>
	</OnboardingStyled>
)
