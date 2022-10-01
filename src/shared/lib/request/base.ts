export const baseRequest = async <T>(input: RequestInfo | URL, init?: RequestInit | undefined): Promise<T> => {
	const f = await fetch(input, init)
    const response = await f.json();

    return response
}
