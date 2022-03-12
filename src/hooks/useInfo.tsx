import React from 'react'
import { FetchInfoResponse } from 'api'
import { IInfo } from 'interfaces/IInfo'

const useInfo = (fetchInfo: () => FetchInfoResponse) => {
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

	return {
		infoMessage,
	}
}

export default useInfo
