import React from 'react'

const useEverySecondUpdater = (): number => {
	const [everyMinuteUpdate, setUpdate] = React.useState(0)

	React.useEffect(() => {
		const int = setInterval(() => setUpdate(Date.now()), 10000)

		return () => {
			clearInterval(int)
		}
	}, [everyMinuteUpdate])

	return everyMinuteUpdate
}

export default useEverySecondUpdater
