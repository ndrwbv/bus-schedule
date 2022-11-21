import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { FetchInfoResponse, INFO_URL } from 'shared/api'

import { IInfo } from '../types/IInfo'

// Define a service using a base URL and expected endpoints
export const infoApi = createApi({
	reducerPath: `infoApi`,
	baseQuery: fetchBaseQuery({ baseUrl: INFO_URL }),
	endpoints: builder => ({
		getInfo: builder.query<IInfo, void>({
			query: () => ``,
			transformResponse: (response: FetchInfoResponse) => response.fields,
		}),
	}),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetInfoQuery } = infoApi
