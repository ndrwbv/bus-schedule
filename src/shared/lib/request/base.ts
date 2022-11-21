/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export const baseRequest = async <T>(input: RequestInfo, init?: RequestInit | undefined): Promise<T> => {
	let f
	let response

	try {
		f = await fetch(input, init)
		response = await f.json()
	} catch (e) {
		console.log(`Error while fetching`)
	}

	return response
}
