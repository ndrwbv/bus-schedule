import { useTranslation } from 'react-i18next'

import styles from './SelectBusStopText.module.css'

export const SelectBusStopText: React.FC = () => {
	const { t } = useTranslation()

	return <p className={styles.textContainer}>{t(`Select bus stop to see schedule`)}</p>
}
