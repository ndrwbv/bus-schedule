import { YMInitializer } from 'react-yandex-metrika'
import { config } from 'shared/configs'

export const YM = (): JSX.Element | null => {
	if (process.env.NODE_ENV !== `production`) return null

	return <YMInitializer accounts={[config.YANDEX_ID]} options={{ webvisor: true }} />
}
