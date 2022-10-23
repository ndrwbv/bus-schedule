import React from 'react'

const useEveryMinuteUpdater = () => {
	const [_everyMinuteUpdate, _setUpdate] = React.useState(0)

	React.useEffect(() => {
		const int = setInterval(() => _setUpdate(Date.now()), 10000)

		return () => {
			clearInterval(int)
		}
	}, [_everyMinuteUpdate])

	return _everyMinuteUpdate
}

export default useEveryMinuteUpdater
