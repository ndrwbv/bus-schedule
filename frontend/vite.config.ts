import { execSync } from 'node:child_process'
import process from 'node:process'
import path from 'path'
// import visualizer from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'

const root = process.cwd()
const appRootPath = path.join(root, `./src/App`)
const publicDir = path.join(root, `./public`)
const outDir = path.join(root, `./build`)
const app = path.join(root, `./src/App/index.html`)

// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
	let plugins = [
		react(),
		VitePWA({
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
			registerType: 'autoUpdate',
			devOptions: {
				enabled: mode !== `production`,
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				cleanupOutdatedCaches: true,
				skipWaiting: true,
				clientsClaim: true,
				navigateFallback: 'index.html',
				runtimeCaching: [
					{
						urlPattern: /\/api\/schedule$/,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'schedule-api',
							expiration: { maxEntries: 1, maxAgeSeconds: 86400 },
						},
					},
				],
			},
		}),
	]

	if (mode === `production`) {
		plugins.push(checker({ typescript: mode === `production` }))
	}

	if (mode !== `production`) {
		plugins.push(mkcert())
	}

	return {
		define: {
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? mode),
			'process.env.YANDEX_AD_BLOCK_ID': JSON.stringify(process.env.YANDEX_AD_BLOCK_ID ?? ''),
			__APP_VERSION__: JSON.stringify(
				execSync('git rev-parse --short HEAD').toString().trim(),
			),
		},
		root: appRootPath,
		envDir: root,
		resolve: {
			tsconfigPaths: true,
		},
		plugins,
		build: {
			emptyOutDir: true,
			outDir,
			rollupOptions: {
				input: app,
				preserveEntrySignatures: `strict`,
				output: {
					manualChunks: {
						'vendor-react': ['react', 'react-dom', 'react-router-dom'],
						'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
						'vendor-maplibre': ['maplibre-gl'],
						'vendor-leaflet': ['leaflet'],
						'vendor-bottomsheet': ['react-spring-bottom-sheet'],
					},
				},
			},
		},
		publicDir,
		server: {
			https: false,
		},
	}
})
