import '@testing-library/jest-dom'
import { act, render, waitFor } from '@testing-library/react'
import { COPYRIGHT } from 'shared/common'
import { createMockApi } from 'shared/lib/test/mocks/mockApi'

import { MainPageObject } from 'shared/lib/test/pageObjects/MainPageObject'
import { configureI18next } from 'shared/lib'
import { MemoryRouter } from 'react-router-dom'
import { Home } from '../page/Home/Home'

jest.useFakeTimers('modern')
jest.setSystemTime(new Date('Fri Mar 11 2022 13:44:27 GMT+0700 (GMT+07:00)'))

configureI18next() // since we don't have backend for translations it's fine

const api = createMockApi()
const CustomApp = () => (
	<MemoryRouter>
		<Home fi={api.fetchInfo} fs={api.fetchSchedule} />
	</MemoryRouter>
)

describe('<Home />', () => {
	it('should render correctly', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />, { legacyRoot: true })

			expect(renderApp.getByText(new RegExp(COPYRIGHT))).toBeInTheDocument()
		})
	})

	it('should show correct left time', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />, { legacyRoot: true })

			const page = new MainPageObject(renderApp)
			await page.openBusStopList()
			await page.selectBusStop('ТГУ')

			const leftTime = await waitFor(() => renderApp.getByText(/2м/))

			expect(leftTime).toBeInTheDocument()
		})
	})

	it('should add stop in favorite', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />, { legacyRoot: true })

			const page = new MainPageObject(renderApp)
			await page.openBusStopList()
			await page.selectBusStop('ТГУ')
			await waitFor(() => renderApp.getByText(/2м/))

			await page.addBusStopInFavorite()

			const removeBusStopText = page.removeBusStopButton
			const myBusStopText = renderApp.getAllByText(/ТГУ/)

			expect(myBusStopText.length).toBe(2)
			expect(removeBusStopText).toBeInTheDocument()
		})
	})

	it('should remove stop in favorite', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />, { legacyRoot: true })

			const page = new MainPageObject(renderApp)
			await page.openBusStopList()
			await page.selectBusStop('Интернационалистов')
			await page.addBusStopInFavorite()

			await page.removeBusStopFromFavorite()

			const myBusStopText = renderApp.getAllByText(/Интернационалистов/)
			const addBusStopButton = page.addBusStopButton

			expect(myBusStopText.length).toBe(1)
			expect(addBusStopButton).toBeInTheDocument()
		})
	})

	it('should render info block', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />, { legacyRoot: true })

			const infoBlockText = await waitFor(() => renderApp.getByText(/Leave your feedback/))

			expect(infoBlockText).toBeInTheDocument()
		})
	})

	it('should hide info block', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />, { legacyRoot: true })

			const page = new MainPageObject(renderApp)

			page.hideInfoBlock()

			const infoBlockText = await waitFor(() => renderApp.queryByText(/Leave your feedback/))
			expect(infoBlockText).not.toBeInTheDocument()
		})
	})
})
