export const getLocation = (
	successCallback: PositionCallback,
	errorCallback: PositionErrorCallback | null | undefined,
	noLocatonCb: () => void,
	options?: PositionOptions | undefined,
): void => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options)
	} else {
		noLocatonCb()
	}
}
