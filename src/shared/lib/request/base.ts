export const baseRequest = async <T>(input: RequestInfo, init?: RequestInit | undefined): Promise<T> => {
	let f = undefined
	let response = undefined

	try {
		f = await fetch(input, init)
		response = await f.json()
	} catch (e) {
		console.log('Error while fetching')
	}

	return response
}
