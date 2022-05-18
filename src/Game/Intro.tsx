import { Link } from 'react-router-dom'

function Intro() {
	return (
		<div>
			<h1>Помоги работнику томскавтотранс найти дубли в рассписании</h1>
			<Link to="/game/doubles">Играть!</Link>
		</div>
	)
}

export default Intro
