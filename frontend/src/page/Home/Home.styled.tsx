import styles from './home.module.css'

export const HomeContainerStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
	<div className={styles.homeContainer} {...props}>
		{children}
	</div>
)
