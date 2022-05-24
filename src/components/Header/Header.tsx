
import { HeaderContainer, HeaderItem, HeaderText } from './styled'

interface IHeaderProps {
	text: string | any
	imgSrc?: any
	children?: React.ReactNode
}
 
const Header: React.FC<IHeaderProps> = ({ text: Text, imgSrc, children = null }) => {

	return (
		<HeaderContainer>
			<HeaderItem>
				<HeaderText>{typeof Text === 'string' ? Text : <Text />}</HeaderText>
			</HeaderItem>

			{children && <HeaderItem>{children}</HeaderItem>}
		</HeaderContainer>
	)
}

export default Header
