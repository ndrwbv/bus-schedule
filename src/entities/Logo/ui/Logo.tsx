import SVG from 'react-inlinesvg'
import { Link } from 'react-router-dom'
import { ImageWrapperStyled } from 'shared/ui/ImageWrapper'

import LogoWithText from '../img/LogoWithText.svg'

export const Logo: React.FC = () => {
	return (
		<Link to="/">
			<ImageWrapperStyled $w={140} $h={27}>
				<SVG src={LogoWithText} width={140} height={27} uniquifyIDs />
			</ImageWrapperStyled>
		</Link>
	)
}
