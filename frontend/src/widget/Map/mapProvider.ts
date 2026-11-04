export const MAP_FALLBACK_STYLE_URL = `https://tiles.openfreemap.org/styles/liberty`
export const MAP_STYLE_URL = (import.meta.env.VITE_MAP_STYLE_URL as string | undefined) || `/tiles/style.json`
