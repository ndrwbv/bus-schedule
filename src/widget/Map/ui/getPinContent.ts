import { ITime } from 'shared/store/timeLeft/ITime';
import { pinIcon } from '../assets/icon';
import { colorDecider } from './colorDecider';
import { getLeftString } from './getLeftString';

export const getPinContent = (timeLeft: ITime, stopId: string): string => {
	const leftString = getLeftString(timeLeft);
	const color = colorDecider(timeLeft);

	return `
		<div class="pin">
			<div class="pin-text">
				<p class="pin-text__amount">${leftString.text}</p>
				${leftString.unit !== null ? `<p class="pin-text__unit">${leftString.unit}</p>` : ``} 
			</div>

			 ${pinIcon(color, stopId)}
		</div>
	`;
};
