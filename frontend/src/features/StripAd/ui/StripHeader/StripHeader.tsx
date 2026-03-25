import { FC } from 'react'

import { StripDiscountStyled, StripHeaderStyled } from './StripHeader.styles'

const Arrow: FC = () => {
	return (
		<svg
			style={{ marginLeft: `6px` }}
			width="21"
			height="16"
			viewBox="0 0 21 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M20.7071 8.70711C21.0976 8.31658 21.0976 7.68342 20.7071 7.2929L14.3431 0.928933C13.9526 0.538409 13.3195 0.538409 12.9289 0.928933C12.5384 1.31946 12.5384 1.95262 12.9289 2.34315L18.5858 8L12.9289 13.6569C12.5384 14.0474 12.5384 14.6805 12.9289 15.0711C13.3195 15.4616 13.9526 15.4616 14.3431 15.0711L20.7071 8.70711ZM-8.74228e-08 9L20 9L20 7L8.74228e-08 7L-8.74228e-08 9Z"
				fill="white"
			/>
		</svg>
	)
}

export const StripHeader: FC<{ arrow?: boolean }> = ({ arrow }) => {
	return (
		<>
			<StripDiscountStyled>
				скидка <span>500₽</span>
			</StripDiscountStyled>

			<StripHeaderStyled>
				На занятия по танцам
				{arrow ? <Arrow /> : null}
			</StripHeaderStyled>
		</>
	)
}
