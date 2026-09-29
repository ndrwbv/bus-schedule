import { DirectionsNew, IStops } from 'shared/store/busStop/Stops'
import { ITime } from 'shared/store/timeLeft/ITime'

import { pinIcon } from '../assets/icon'
import { colorDecider } from './colorDecider'
import { getLeftString } from './getLeftString'

const DIRECTION_TEXT: Record<DirectionsNew, string> = {
	[DirectionsNew.out]: `в город`,
	[DirectionsNew.inLB]: `из города`,
	[DirectionsNew.inSP]: `из города`,
}

const escapeHtml = (value: string): string => value.replace(/["&'<>]/g, ch => `&#${ch.charCodeAt(0)};`)

/**
 * Opposite platforms of one stop stand a few metres apart, so above every pin there is a label
 * saying which way the bus from it goes. The selected stop's label also carries its name.
 */
export const getPinContent = (timeLeft: ITime, stop: IStops<DirectionsNew>, selected: boolean): string => {
	const leftString = getLeftString(timeLeft)
	const color = colorDecider(timeLeft)
	const dirClass = stop.direction === DirectionsNew.out ? `pin-label--to-city` : `pin-label--from-city`
	const label = escapeHtml(stop.label)
	const name = selected ? `<span class="pin-label__name">${label}</span>` : ``

	return `
		<div class="pin-wrap${selected ? ` pin-wrap--selected` : ``}" title="${label} · ${DIRECTION_TEXT[stop.direction]}">
			<div class="pin-label ${dirClass}">
				${name}
				<span class="pin-label__dir">${DIRECTION_TEXT[stop.direction]} →</span>
			</div>

			<div class="pin">
				<div class="pin-text">
					<p class="pin-text__amount">${leftString.text}</p>
					${leftString.unit !== null ? `<p class="pin-text__unit">${leftString.unit}</p>` : ``}
				</div>

				${pinIcon(color, stop.id)}
			</div>
		</div>
	`
}
