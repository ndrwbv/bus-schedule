import '@testing-library/jest-dom'
import { act, render, waitFor } from '@testing-library/react'
import { createMockApi } from 'helpers/test/mocks/mockApi'

import { MainPagePageObject } from 'helpers/test/pageObjects/MainPagePageObject'
import App from './App'

jest.useFakeTimers('modern')
jest.setSystemTime(new Date('Fri Mar 11 2022 13:44:27 GMT+0700 (GMT+07:00)'))

const api = createMockApi()
const CustomApp = () => <App fi={api.fetchInfo} fs={api.fetchSchedule} />

describe('<App />', () => {
	it('should render correctly', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />)

			expect(renderApp.getByText(/Andrew Boev & Friends/)).toBeInTheDocument()
		})
	})

	it('should show correct left time', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />)
			const page = new MainPagePageObject(renderApp)
			await page.openBusStopList()
			await page.selectBusStop('ТГУ')

			const leftTime = await waitFor(() => renderApp.getByText(/2м/))

			expect(leftTime).toBeInTheDocument()
		})
	})

	it.skip('should add stop in favorite', async () => {
		await act(async () => {
			const renderApp = render(<CustomApp />)
			const page = new MainPagePageObject(renderApp)
			await page.openBusStopList()
			await page.selectBusStop('ТГУ')
		})
	})
})
