import styles from './map.module.css'

export const MapContainerStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
	<div className={styles.mapContainer} {...props}>
		{children}
	</div>
)
