import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locale/ru'

export function configureI18next() {
	i18n.use(initReactI18next).init({
		resources: {
			ru: ru,
		},
		lng: 'ru',
		fallbackLng: 'ru',

		interpolation: {
			escapeValue: false,
		},
	})

	return i18n
}
