import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const BetaRedirect: React.FC = () => {
	const navigate = useNavigate()

	useEffect(() => {
		navigate(`/`)
	}, [navigate])

	return null
}
