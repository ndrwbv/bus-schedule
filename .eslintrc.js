module.exports = {
	extends: [
		`airbnb`,
		`airbnb/hooks`,
		`plugin:promise/recommended`,
		`plugin:sonarjs/recommended`,
		`plugin:prettier/recommended`,
	],
	plugins: [`optimize-regex`, `simple-import-sort`, `styled-components-varname`],
	ignorePatterns: [`**/dist/**/*.*`, `src/page/Game/*`, `vite.config.ts`],
	rules: {
		'react/prop-types': `off`,
		'sonarjs/prefer-single-boolean-return': `off`,
		'import/no-default-export': `off`,
		'no-param-reassign': `off`,
		'react/react-in-jsx-scope': `off`,
		'import/prefer-default-export': [`off`],
		'@typescript-eslint/no-unsafe-member-access': `off`,
		'@typescript-eslint/no-unsafe-assignment': `off`,
		'react/function-component-definition': [
			`error`,
			{
				namedComponents: `arrow-function`,
			},
		],
		'react/jsx-props-no-spreading': [`off`],
		'react/require-default-props': [`off`],
		'no-restricted-syntax': [`error`, `ForInStatement`, `LabeledStatement`, `WithStatement`],
		'no-plusplus': [`off`],
		'no-void': [
			`error`,
			{
				allowAsStatement: true,
			},
		],
		'func-names': [`warn`, `as-needed`, { generators: `never` }],
		curly: [`error`, `all`],
		'@typescript-eslint/no-use-before-define': [`error`, { functions: false, classes: false }],
		'simple-import-sort/imports': [
			`error`,
			{
				groups: [[`^react`, `^@?\\w`]],
			},
		],
		'optimize-regex/optimize-regex': `warn`,
		'@typescript-eslint/no-magic-numbers': [
			`warn`,
			{
				ignoreNumericLiteralTypes: true,
				ignoreEnums: true,
				enforceConst: true,
				ignoreReadonlyClassProperties: true,
				ignore: [-1, 0, 1],
			},
		],
		'@typescript-eslint/quotes': [`error`, `backtick`],
		'newline-before-return': `error`,
		'react/self-closing-comp': [
			`error`,
			{
				component: true,
				html: true,
			},
		],
		'prettier/prettier': [
			`error`,
			{
				printWidth: 120,
				tabWidth: 4,
				useTabs: true,
				semi: false,
				singleQuote: true,
				trailingComma: `all`,
				bracketSpacing: true,
				jsxBracketSameLine: false,
				arrowParens: `avoid`,
			},
			{ usePrettierrc: false },
		],
		'styled-components-varname/varname': [
			`error`,
			{
				tagStyle: {
					suffix: `Styled`,
				},
			},
		],
		'import/no-extraneous-dependencies': [
			`error`,
			{
				devDependencies: true,
			},
		],
	},
	overrides: [
		{
			files: [`*.ts`, `*.tsx`],
			extends: [
				`airbnb-typescript`,
				`plugin:@typescript-eslint/recommended`,
				`plugin:@typescript-eslint/recommended-requiring-type-checking`,
				`plugin:prettier/recommended`,
			],
			rules: {
				'@typescript-eslint/no-misused-promises': [
					`error`,
					{
						checksVoidReturn: {
							attributes: false,
							returns: false,
						},
					},
				],
				'@typescript-eslint/explicit-function-return-type': [
					`error`,
					{
						allowExpressions: true,
					},
				],
				'@typescript-eslint/no-floating-promises': [
					`error`,
					{
						ignoreIIFE: true,
						ignoreVoid: true,
					},
				],
				'@typescript-eslint/no-unnecessary-condition': [`error`],
				'import/no-extraneous-dependencies': [
					`error`,
					{
						devDependencies: true,
					},
				],
				'@typescript-eslint/quotes': [`error`, `backtick`],
				'@typescript-eslint/no-unused-vars': [`error`],
			},
		},
		{
			files: [`*.json`],
			parser: `@typescript-eslint/parser`,
			parserOptions: {
				sourceType: `module`,
				project: false,
			},
			rules: {
				'no-unused-expressions': `off`,
				'sonarjs/no-duplicate-string': `off`,
				quotes: `off`,
				'@typescript-eslint/quotes': `off`,
			},
		},
		{
			files: [`**/*.spec.ts`, `**/*.spec.tsx`, `**/dsl/**`],
			extends: [`plugin:jest/recommended`],
			rules: {
				'jest/no-focused-tests': `error`,
				'jest/no-identical-title': `error`,

				'no-shadow': `off`,
				'max-classes-per-file': `off`,

				'@typescript-eslint/no-magic-numbers': `off`,
				'@typescript-eslint/indent': `off`,
				'@typescript-eslint/explicit-function-return-type': `off`,
				'@typescript-eslint/member-ordering': `off`,
				'@typescript-eslint/no-non-null-assertion': `off`,
				'@typescript-eslint/no-empty-function': `off`,

				'sonarjs/no-duplicate-string': `off`,
				'sonarjs/no-identical-functions': `off`,
			},
		},
		{
			files: [`*.js`],
			rules: {
				'@typescript-eslint/no-var-requires': `off`,
			},
		},
	],
	parserOptions: {
		project: `tsconfig.json`,
		sourceType: `module`,
	},
	settings: {
		react: {
			version: `detect`,
		},
	},
}
