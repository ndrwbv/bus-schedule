import { FC } from 'react'

import { Character } from '../Character/Character'
import { IPassenger } from '../IPassenger'
import {
	ArrowContainerStyled,
	DetailItemStyled,
	DetailLabelStyled,
	DetailValueStyled,
	MessageBlockStyled,
	PassengerDetailsStyled,
	PassengerVisualContainerStyled,
} from './PassengerDetails.styles'

const DetailItem: FC<{ label: string; value: string }> = ({ label, value }) => {
	return (
		<DetailItemStyled>
			<DetailLabelStyled>{label}</DetailLabelStyled>

			<DetailValueStyled>{value}</DetailValueStyled>
		</DetailItemStyled>
	)
}

export const PassengerDetails: FC<IPassenger> = ({ name, secondName, zodiakSign, occupation, character, message }) => {
	return (
		<PassengerDetailsStyled>
			<PassengerVisualContainerStyled>
				<Character size="l" data={character} />

				{message ? (
					<MessageBlockStyled>
						<ArrowContainerStyled>
							<svg
								width="15"
								height="17"
								viewBox="0 0 15 17"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M0.16195 8.49943L14.5501 0.516307L14.2696 16.9684L0.16195 8.49943Z"
									fill="white"
								/>
							</svg>
						</ArrowContainerStyled>

						<div>{message}</div>
					</MessageBlockStyled>
				) : null}
			</PassengerVisualContainerStyled>

			<DetailItem label="имя" value={`${name} ${secondName}`} />
			<DetailItem label="знак" value={zodiakSign} />
			<DetailItem label="род деятельности" value={occupation} />
		</PassengerDetailsStyled>
	)
}
