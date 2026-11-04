import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts: tests need the `features/…`, `shared/…` imports, not PWA, mkcert
// or the type checker overlay
// eslint-disable-next-line import/no-default-export
export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		include: [`src/**/__tests__/**/*.test.ts`],
		environment: `node`,
	},
})
