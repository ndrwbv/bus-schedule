import React from 'react'
import { IInfo } from 'features/Info/types/IInfo'
import { useScheduleContext } from 'widget/Schedule/model/ScheduleContext'

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
