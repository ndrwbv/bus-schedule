export type MapProvider = `maptiler` | `openfreemap`

const getMapTilerApiKey = (attempt: number): string => {
	console.info(
		`trying MAPTILER_KEY_${attempt} ${
			process.env[`MAPTILER_KEY_${attempt}`] ? `KEY exists` : `KEY does not exists`
		}`,
	)

	if (process.env[`MAPTILER_KEY_${attempt}`]) {
		return process.env[`MAPTILER_KEY_${attempt}`] ?? ``
	}

	// eslint-disable-next-line no-console
	console.info(`MAPTILER_KEY is not set. Attempt: `, attempt)

	return ``
}

export const getStyleUrl = (provider: MapProvider, maptilerKeyIndex: number): string => {
	if (provider === `openfreemap`) {
		return `https://tiles.openfreemap.org/styles/liberty`
	}

	const apiKey = getMapTilerApiKey(maptilerKeyIndex)

	return `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`
}
