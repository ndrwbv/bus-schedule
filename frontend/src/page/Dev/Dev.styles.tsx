import styles from './dev.module.css'

export const DevStyled: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
	<div className={styles.dev} {...props}>
		{children}
	</div>
)
