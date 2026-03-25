import * as P from './styled'

const ProgressBar: React.FC<{ bgcolor: string; completed: number }> = ({ bgcolor, completed }) => {
	return (
		<P.Cotainer>
			<P.Filler bgcolor={bgcolor} style={{ width: `${completed}%` }}></P.Filler>
		</P.Cotainer>
	)
}

export default ProgressBar
