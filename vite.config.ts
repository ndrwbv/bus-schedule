import process from 'node:process'
import path from 'path'
// import visualizer from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'
import { splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

const root = process.cwd()
const appRootPath = path.join(root, `./src/App`)
const publicDir = path.join(root, `./public`)
const outDir = path.join(root, `./build`)
const app = path.join(root, `./src/App/index.html`)

// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
	let plugins = [
		react(),
		tsconfigPaths({
			root,
		}),
		splitVendorChunkPlugin(),
	]

	if (mode === `production`) {
		plugins.push(checker({ typescript: mode === `production` }))
	}

	if (mode !== `production`) {
		plugins.push(mkcert())
	}

	console.log(mode)
	return {
		root: appRootPath,
		plugins,
		build: {
			emptyOutDir: true,
			outDir,
			rollupOptions: {
				input: app,
				preserveEntrySignatures: `strict`,
			},
		},
		publicDir,
		server: {
			https: true
		  },
	}
})
