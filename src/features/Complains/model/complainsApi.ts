import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { IComplains, IComplainsResponse } from './Complains'

export type ComplainMutationResponse = {
	__typename?: 'Mutation'
	createComplain: { __typename?: 'Complains'; id: string }
}

export type FindComplainReponse = {
	data: {
		findComplains: IComplainsResponse[]
	}
}

export type ComplainMutationVariables = {
	data: IComplains
}

export const ComlainQuery = `
    mutation Complain($data: ComplainsInputDTO!) {
  createComplain(data: $data) {
    id
  }
}
    `
export const FindComplainQuery = `
query FindComplains {
	findComplains {
		id
		stop
		direction
		date
		type
		on
	}
}
`

// Define a service using a base URL and expected endpoints
export const complainsApi = createApi({
	reducerPath: `complainsApi`,
	baseQuery: fetchBaseQuery({ baseUrl: `https://popooga.ru/graphql` }),

	endpoints: builder => ({
		Complain: builder.mutation<ComplainMutationResponse, ComplainMutationVariables>({
			query(variables) {
				return {
					url: ``,
					method: `POST`,
					body: { query: ComlainQuery, variables },
				}
			},
		}),
		FindComplain: builder.mutation<IComplainsResponse[], void>({
			query() {
				return {
					url: ``,
					method: `POST`,
					body: { query: FindComplainQuery, variables: {} },
				}
			},
			
			transformResponse: (res: FindComplainReponse) => res.data.findComplains,
		}),
	}),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useComplainMutation, useFindComplainMutation } = complainsApi
