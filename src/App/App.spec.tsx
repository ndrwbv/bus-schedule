import '@testing-library/jest-dom'
import { act, render } from '@testing-library/react'

import { MainPagePageObject } from 'helpers/pageObjects/MainPagePageObject'
import App from './App'

describe('<App />', () => {
	it('should render correctly', async () => {
		await act(async () => {
			const renderApp = render(<App />)

			expect(renderApp.getByText(/Andrew Boev & Friends/)).toBeInTheDocument()
		})
	})

	it('should show correct estimation', async () => {
		// jest.useFakeTimers().setSystemTime(new Date('2022-03-11T05:54:14.638Z').getTime())

		await act(async () => {
			const renderApp = render(<App />)
			const page = new MainPagePageObject(renderApp)
			await page.openBusStopList()
			await page.selectBusStop('ТГУ')

			renderApp.debug()
			// expect(renderApp.getByText(/Andrew Boev & Friends/)).toBeInTheDocument()
		})
	})
})
