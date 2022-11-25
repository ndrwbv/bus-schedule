import process from 'node:process'
import path from 'path'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'
import { splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'

const root = process.cwd()
const appRootPath = path.join(root, `./src/App`)
const publicDir = path.join(root, `./public`)
const outDir = path.join(root, `./build`)
const app = path.join(root, `./src/App/index.html`)

// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => ({
	root: appRootPath,
	plugins: [
		react(),
		tsconfigPaths({
			root,
		}),
		splitVendorChunkPlugin(),
		checker({ typescript: mode === `production` }),
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		// visualizer({
		// 	filename: `index.html`,
		// 	open: true,
		// }),
	],
	build: {
		emptyOutDir: true,
		outDir,
		rollupOptions: {
			input: app,
			preserveEntrySignatures: `strict`,
		},
	},
	publicDir,
}))
