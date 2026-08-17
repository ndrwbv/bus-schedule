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
				// Без denylist SPA-фолбэк глотает реальные файлы: открыть
				// /schedule/112s-weekdays-2026-08.jpg (ввод в адресную строку или клик по
				// ссылке из футера) — это navigate-запрос, и workbox отдавал на него
				// index.html вместо картинки. Получалась пустая страница: React грузился
				// на несуществующий роут, а сам JPEG даже не запрашивался.
				// Правило «в последнем сегменте пути есть точка» покрывает фото
				// перевозчика и заодно robots.txt / sitemap.xml / manifest.json.
				navigateFallbackDenylist: [/^\/api\//, /\.[^/]*$/],
				runtimeCaching: [
					{
						// NetworkFirst, а не StaleWhileRevalidate: SWR всегда отдаёт кеш
						// первым, поэтому обновлённое расписание доезжало до пользователя
						// только со второго открытия сайта.
						// networkTimeoutSeconds — страховка для Томска, где интернет
						// периодически глушат: если сеть не ответила за 3 секунды, отдаём
						// кеш вместо бесконечного ожидания.
						urlPattern: /\/api\/schedule$/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'schedule-api',
							networkTimeoutSeconds: 3,
							// Кеш здесь — только офлайн-фолбэк, свежесть даёт сеть.
							// Поэтому окно большое: старое расписание полезнее пустого экрана.
							expiration: { maxEntries: 1, maxAgeSeconds: 604800 },
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
					// Vite 8 uses rolldown, which only accepts the function form of manualChunks
					manualChunks(id) {
						if (!id.includes(`node_modules`)) return undefined

						if (id.includes(`maplibre-gl`)) return `vendor-maplibre`
						if (id.includes(`leaflet`)) return `vendor-leaflet`
						if (id.includes(`react-spring-bottom-sheet`) || id.includes(`react-spring`) || id.includes(`@react-spring`))
							return `vendor-bottomsheet`
						if (id.includes(`@reduxjs/toolkit`) || id.includes(`react-redux`)) return `vendor-redux`
						if (
							id.includes(`/react/`) ||
							id.includes(`/react-dom/`) ||
							id.includes(`/react-router`) ||
							id.includes(`scheduler`)
						)
							return `vendor-react`

						return undefined
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
