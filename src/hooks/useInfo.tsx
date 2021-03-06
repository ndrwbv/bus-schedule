import React from 'react'
import { IInfo } from 'interfaces/IInfo'
import { useScheduleContext } from 'context/ScheduleContext'

const useInfo = () => {
	const { fetchInfo } = useScheduleContext()

	const [infoMessage, setInfoMessage] = React.useState<IInfo>({
		message: null,
		id: null,
		link: null,
	})

	React.useEffect(() => {
		fetchInfo().then(res => {
			if (res?.fields) {
				setInfoMessage(res?.fields)
			}
		})
	}, [fetchInfo])

	return infoMessage
}

export default useInfo
