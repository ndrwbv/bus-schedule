import SVG from 'react-inlinesvg'
import { ImageWrapper } from 'shared/ui/ImageWrapper'

import LogoWithText from '../img/LogoWithText.svg'

export const Logo: React.FC = () => {
	return (
		<ImageWrapper w={140} h={27}>
			<SVG src={LogoWithText} width={140} height={27} uniquifyIDs />
		</ImageWrapper>
	)
}
