import { FC, useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { ContainerStyled } from 'shared/ui'

import {
	StipBottomSheetContainerStyled,
	StipDiscountStyled,
	StipHeaderStyled,
	StipVideoHeaderStyled,
	StripAdStyled,
	StripAdVideoBlockStyled,
	StripBottomSheetHeaderContainerStyled,
	StripTextBlockStyled,
	StripTextContainerStyled,
	StripVideoContainerStyled,
} from './StripAd.styles'

export const StripAd: FC = () => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<ContainerStyled>
			<BottomSheet
				open={isOpen}
				onDismiss={() => setIsOpen(false)}
				defaultSnap={({ maxHeight }) => maxHeight / 2}
				snapPoints={({ maxHeight }) => [maxHeight - maxHeight / 10, maxHeight / 4, maxHeight * 0.6]}
			>
				<StipBottomSheetContainerStyled>
					<StripBottomSheetHeaderContainerStyled>
						<StripVideoContainerStyled>
							<video src="/stripad/nastya.mp4" autoPlay muted loop />
						</StripVideoContainerStyled>

						<StipVideoHeaderStyled>
							<StipDiscountStyled>
								скидка <span>500₽</span>
							</StipDiscountStyled>

							<StipHeaderStyled>На занятия по танцам</StipHeaderStyled>
						</StipVideoHeaderStyled>
					</StripBottomSheetHeaderContainerStyled>

					<StripTextContainerStyled>
						<div>
							<p>Скидка 500₽ на курс по FRAME UP STRIP из 8 занятий.</p>

							<div>
								<p>
									<b>Расписание </b>
								</p>
								<p> вт, чт в 19:30</p>
							</div>

							<div>
								<p>
									<b>Адрес</b>
								</p>
								<p>ул. Розы Люксембург 16</p>
							</div>

							<div>
								<p>
									<b>Условия</b>
								</p>
								<p>
									При записи на курс напишите, что вы с сервербаса. Акция действительна до 3 сентября
									2023 года
								</p>
							</div>

							<div>
								<p>
									<b>Контакты</b>
								</p>

								<p>
									Записаться можно через запрещенную соц. сеть @anastyabv или через телеграм
									@anastyabv
								</p>
							</div>
						</div>
					</StripTextContainerStyled>
				</StipBottomSheetContainerStyled>
			</BottomSheet>

			<StripAdStyled onClick={() => setIsOpen(true)}>
				<StripAdVideoBlockStyled>
					<StripTextBlockStyled>
						<StipDiscountStyled>
							скидка <span>500₽</span>
						</StipDiscountStyled>
						<StipHeaderStyled>
							На занятия по танцам{` `}
							<svg
								width="21"
								height="16"
								viewBox="0 0 21 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M20.7071 8.70711C21.0976 8.31658 21.0976 7.68342 20.7071 7.2929L14.3431 0.928933C13.9526 0.538409 13.3195 0.538409 12.9289 0.928933C12.5384 1.31946 12.5384 1.95262 12.9289 2.34315L18.5858 8L12.9289 13.6569C12.5384 14.0474 12.5384 14.6805 12.9289 15.0711C13.3195 15.4616 13.9526 15.4616 14.3431 15.0711L20.7071 8.70711ZM-8.74228e-08 9L20 9L20 7L8.74228e-08 7L-8.74228e-08 9Z"
									fill="white"
								/>
							</svg>
						</StipHeaderStyled>
					</StripTextBlockStyled>
				</StripAdVideoBlockStyled>
			</StripAdStyled>
		</ContainerStyled>
	)
}
