import { fireEvent, RenderResult, waitFor } from '@testing-library/react'

export class MainPageObject {
	constructor(private readonly renderApp: RenderResult) {}

	get busStopSelect() {
		return this.renderApp.getByText(/Не выбрано/)
	}

	get removeBusStopButton() {
		return this.renderApp.getByText(/Удалить остановку из избранного/)
	}

	get addBusStopButton() {
		return this.renderApp.getByText(/Добавить остановку в избранное/)
	}

	get infoBlock() {
		return this.renderApp.getByText(/Leave your feedback/)
	}

	get infoBlockCross() {
		return this.renderApp.getByTestId(/hide-btn/)
	}

	async hideInfoBlock() {
		await waitFor(() => this.infoBlock)
		fireEvent.click(this.infoBlockCross)
	}

	async addBusStopInFavorite() {
		fireEvent.click(this.addBusStopButton)
	}

	async removeBusStopFromFavorite() {
		fireEvent.click(this.removeBusStopButton)
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
