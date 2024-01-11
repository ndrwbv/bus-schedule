import { FC } from 'react'

import { OnboardingStyled } from './Onboarding.styles'

interface IProps {
	startNewGame: () => void
}
export const Onboarding: FC<IProps> = ({ startNewGame }) => (
	<OnboardingStyled>
		Onboarding
		<button type="button" onClick={startNewGame}>
			Новая игра
		</button>
	</OnboardingStyled>
)
