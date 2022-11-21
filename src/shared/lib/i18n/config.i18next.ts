import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'

import ru from './locale/ru'

export const configureI18next = (): typeof i18n => {
	void i18n.use(initReactI18next).init({
		resources: {
			ru,
		},
		lng: `ru`,
		fallbackLng: `ru`,

		interpolation: {
			escapeValue: false,
		},
	})

	return i18n
}
