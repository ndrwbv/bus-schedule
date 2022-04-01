import SVG from 'react-inlinesvg'

import { ImageWrapper } from 'components/ImageWrapper'
import LogoWithText from './LogoWithText.svg'

const Logo = () => {
	return (
		<ImageWrapper w={140} h={27}>
			<SVG src={LogoWithText} width={140} height={27} uniquifyIDs={true} />
		</ImageWrapper>
	)
}

export default Logo
