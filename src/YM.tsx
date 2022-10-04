import config from 'shared/configs'
import { YMInitializer } from 'react-yandex-metrika'

const YM = () => {
	if (process.env.NODE_ENV !== 'production') return null

	return <YMInitializer accounts={[config.YANDEX_ID]} options={{ webvisor: true }} />
}

export default YM
