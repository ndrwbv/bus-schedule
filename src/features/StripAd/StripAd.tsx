import { FC, useState } from 'react'
import { BottomSheet } from 'react-spring-bottom-sheet'
import { ContainerStyled } from 'shared/ui'

import {
	StipActionsStyled,
	StipBottomSheetContainerStyled,
	StipDiscountStyled,
	StipHeaderStyled,
	StipVideoHeaderStyled,
	StripActionButtonStyled,
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
						<StripVideoContainerStyled $width={575} $radius="20px 20px 0 0">
							<video src="/stripad/nastya.mp4" autoPlay muted loop />
						</StripVideoContainerStyled>

						<StipVideoHeaderStyled>
							<StipDiscountStyled>
								скидка <span>500₽</span>
							</StipDiscountStyled>

							<StipHeaderStyled>На занятия по танцам</StipHeaderStyled>
						</StipVideoHeaderStyled>

						<StipActionsStyled>
							<StripActionButtonStyled href="#">Записаться</StripActionButtonStyled>
							<a href="#">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clipPath="url(#clip0_1908_514)">
										<path
											d="M12 2.31891C15.1531 2.31891 15.5265 2.33096 16.7718 2.38777C17.9232 2.44032 18.5484 2.63265 18.9646 2.79437C19.4775 2.98367 19.9414 3.28552 20.3223 3.67772C20.7145 4.05863 21.0164 4.5226 21.2057 5.03551C21.3674 5.45162 21.5598 6.07688 21.6123 7.22823C21.6691 8.47346 21.6811 8.84691 21.6811 12.0001C21.6811 15.1533 21.6691 15.5266 21.6123 16.772C21.5597 17.9233 21.3674 18.5485 21.2057 18.9647C21.0092 19.474 20.7083 19.9365 20.3223 20.3225C19.9364 20.7085 19.4738 21.0094 18.9646 21.2058C18.5484 21.3676 17.9232 21.5599 16.7718 21.6124C15.5268 21.6692 15.1534 21.6813 12 21.6813C8.84654 21.6813 8.47322 21.6692 7.22808 21.6124C6.07674 21.5599 5.45152 21.3675 5.03536 21.2058C4.52245 21.0165 4.05849 20.7147 3.67758 20.3225C3.28538 19.9416 2.98353 19.4776 2.79422 18.9647C2.63251 18.5486 2.44013 17.9233 2.38763 16.772C2.33082 15.5268 2.31877 15.1533 2.31877 12.0001C2.31877 8.84691 2.33082 8.47355 2.38763 7.22823C2.44018 6.07688 2.63251 5.45166 2.79422 5.03551C2.98355 4.52257 3.28543 4.05859 3.67768 3.67768C4.05859 3.28548 4.52255 2.98363 5.03546 2.79432C5.45157 2.6326 6.07683 2.44022 7.22818 2.38772C8.47341 2.33091 8.84687 2.31887 12.0001 2.31887M12.0001 0.191162C8.79296 0.191162 8.39068 0.204756 7.13133 0.262225C5.87438 0.3196 5.01601 0.519193 4.26488 0.811131C3.47694 1.10764 2.76316 1.57246 2.17332 2.17318C1.57247 2.76298 1.10752 3.47677 0.810896 4.26474C0.519193 5.01591 0.3196 5.87429 0.262459 7.13124C0.204756 8.39058 0.191162 8.79287 0.191162 12C0.191162 15.2071 0.204756 15.6093 0.262459 16.8687C0.319834 18.1256 0.519428 18.984 0.811365 19.7351C1.10788 20.5231 1.5727 21.2369 2.17341 21.8267C2.76325 22.4274 3.47703 22.8922 4.26497 23.1887C5.01615 23.4807 5.87452 23.6803 7.13143 23.7376C8.39096 23.7951 8.7931 23.8087 12.0001 23.8087C15.2072 23.8087 15.6095 23.7951 16.8689 23.7376C18.1258 23.6803 18.9842 23.4807 19.7353 23.1887C20.5198 22.8853 21.2322 22.4214 21.8269 21.8267C22.4216 21.232 22.8855 20.5196 23.1889 19.7351C23.4809 18.984 23.6805 18.1256 23.7378 16.8687C23.7953 15.6091 23.8089 15.207 23.8089 12C23.8089 8.79291 23.7953 8.39058 23.7378 7.13124C23.6805 5.87429 23.4809 5.01591 23.1889 4.26479C22.8924 3.47685 22.4276 2.76307 21.8269 2.17322C21.237 1.57239 20.5232 1.10747 19.7352 0.810896C18.984 0.519193 18.1256 0.3196 16.8687 0.262459C15.6093 0.204756 15.2071 0.191162 12 0.191162H12.0001Z"
											fill="white"
										/>
										<path
											d="M12 5.93604C10.8007 5.93604 9.62827 6.29168 8.63105 6.958C7.63384 7.62432 6.8566 8.57138 6.39763 9.67943C5.93866 10.7875 5.81858 12.0067 6.05256 13.183C6.28654 14.3593 6.86407 15.4398 7.71214 16.2879C8.5602 17.136 9.6407 17.7135 10.817 17.9475C11.9933 18.1815 13.2126 18.0614 14.3206 17.6024C15.4287 17.1434 16.3757 16.3662 17.042 15.369C17.7084 14.3718 18.064 13.1994 18.064 12C18.064 10.3918 17.4251 8.84935 16.2879 7.71213C15.1507 6.57492 13.6083 5.93604 12 5.93604ZM12 15.9363C11.2215 15.9362 10.4605 15.7054 9.81318 15.2729C9.16588 14.8403 8.66137 14.2256 8.36345 13.5063C8.06553 12.7871 7.98759 11.9956 8.13947 11.2321C8.29136 10.4685 8.66625 9.76715 9.21675 9.21666C9.76724 8.66618 10.4686 8.29129 11.2322 8.13942C11.9957 7.98754 12.7872 8.06549 13.5064 8.36342C14.2257 8.66134 14.8404 9.16586 15.2729 9.81317C15.7054 10.4605 15.9363 11.2215 15.9363 12C15.9363 13.044 15.5216 14.0452 14.7834 14.7834C14.0452 15.5215 13.044 15.9363 12 15.9363Z"
											fill="white"
										/>
										<path
											d="M18.3035 7.11336C19.0861 7.11336 19.7205 6.47893 19.7205 5.69633C19.7205 4.91372 19.0861 4.2793 18.3035 4.2793C17.5209 4.2793 16.8865 4.91372 16.8865 5.69633C16.8865 6.47893 17.5209 7.11336 18.3035 7.11336Z"
											fill="white"
										/>
									</g>
									<defs>
										<clipPath id="clip0_1908_514">
											<rect width="24" height="24" fill="white" />
										</clipPath>
									</defs>
								</svg>
							</a>
						</StipActionsStyled>
					</StripBottomSheetHeaderContainerStyled>

					<StripTextContainerStyled>
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
								При записи на курс напишите, что вы с сервербаса. Акция действительна до 3 сентября 2023
								года
							</p>
						</div>

						<div>
							<p>
								<b>Контакты</b>
							</p>

							<p>Записаться можно через запрещенную соц. сеть @anastyabv или через телеграм @anastyabv</p>
						</div>
					</StripTextContainerStyled>
				</StipBottomSheetContainerStyled>
			</BottomSheet>

			<StripAdStyled onClick={() => setIsOpen(true)}>
				<StripAdVideoBlockStyled>
					<StripVideoContainerStyled $width={275} $radius="20px">
						<video src="/stripad/nastya_croped.mp4" autoPlay muted loop />
					</StripVideoContainerStyled>

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
