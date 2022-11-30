import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	schema: `https://popooga.ru/graphql`,
	documents: `./*.graphql`,
	generates: {
		'./types.generated.ts': {
			plugins: [`typescript`],
		},
		'./': {
			preset: `near-operation-file`,
			presetConfig: {
				baseTypesPath: `./types.generated.ts`,
			},
			plugins: [`typescript`, `typescript-resolvers`, `typescript-rtk-query`, `typescript-operations`],
			config: {
				importBaseApiFrom: `./baseApi`,
				exportHooks: true,
			},
		},
	},
}
export default config
