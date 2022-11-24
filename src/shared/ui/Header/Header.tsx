import { DefaultTFuncReturn } from 'i18next'

import { HeaderContainerStyled, HeaderItemStyled, HeaderTextStyled } from './styled'

interface IHeaderProps {
	text: string | JSX.Element | DefaultTFuncReturn
	children?: React.ReactNode
}

export const Header: React.FC<IHeaderProps> = ({ text: Text, children = null }) => {
	return (
		<HeaderContainerStyled>
			<HeaderItemStyled>
				<HeaderTextStyled>{Text}</HeaderTextStyled>
			</HeaderItemStyled>

			{children && <HeaderItemStyled>{children}</HeaderItemStyled>}
		</HeaderContainerStyled>
	)
}
