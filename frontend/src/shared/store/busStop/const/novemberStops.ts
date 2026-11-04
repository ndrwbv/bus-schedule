import { DirectionsNew, IStops } from '../Stops'
import { STOPS_IN_LB } from './stopsInLbOptions'

// Existing park locations retained with new, non-colliding ids. Extra landmark locations
// use OSM nodes 9098641981 (platform by ГОАР) and 9044845389 (platform by post office 7555697430).
export const NOVEMBER_STOPS: IStops<DirectionsNew>[] = [
	{
		id: `nov-park-1`,
		label: `Набережная`,
		direction: DirectionsNew.inSP,
		latLon: [56.45299174653839, 84.92356152809053],
	},
	{ id: `nov-park-2`, label: `В. Маяковского`, direction: DirectionsNew.inSP, latLon: [56.463818, 84.908527] },
	{ id: `nov-park-3`, label: `Поликлиника`, direction: DirectionsNew.inSP, latLon: [56.468351, 84.903903] },
	{ id: `nov-park-4`, label: `ул. М. Цветаевой`, direction: DirectionsNew.inSP, latLon: [56.471773, 84.900123] },
	{ id: `nov-park-5`, label: `Маяк`, direction: DirectionsNew.inSP, latLon: [56.473628, 84.89927] },
	{ id: `nov-park-6`, label: `Анны Ахматовой`, direction: DirectionsNew.inSP, latLon: [56.462885, 84.905252] },
	...STOPS_IN_LB.filter(stop => [`Синее небо`, `Этюд`, `Гармония`].includes(stop.label)).map(stop => ({
		...stop,
		id: `nov-out-${stop.id}`,
		direction: DirectionsNew.out,
	})),
	{ id: `nov-goar-in`, label: `ГОАР`, direction: DirectionsNew.inLB, latLon: [56.444268, 84.9258614] },
	{ id: `nov-goar-out`, label: `ГОАР`, direction: DirectionsNew.out, latLon: [56.444268, 84.9258614] },
	{ id: `nov-post`, label: `Почта`, direction: DirectionsNew.out, latLon: [56.4676678, 84.9049701] },
]
