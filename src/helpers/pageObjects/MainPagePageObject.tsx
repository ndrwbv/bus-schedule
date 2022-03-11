import { fireEvent, RenderResult, waitFor } from '@testing-library/react'

export class MainPagePageObject {
	constructor(private readonly renderApp: RenderResult) {}

	get busStopSelect() {
		return this.renderApp.getByText(/Не выбрано/)
	}

	async openBusStopList() {
		fireEvent.mouseDown(this.busStopSelect)
	}

	async selectBusStop(name: string) {
		const { getByText } = this.renderApp
		const stop = await waitFor(() => getByText(new RegExp(name)))

		fireEvent.click(stop)
	}
}
