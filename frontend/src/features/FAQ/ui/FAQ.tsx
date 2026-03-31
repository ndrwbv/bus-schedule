import { useState } from 'react'
import SVG from 'react-inlinesvg'
import QRCode from 'react-qr-code'
import { AVTOTRANS_LINK, BETA_TESTER_LINK, TG_LINK } from 'shared/common'
import { AndrewLytics } from 'shared/lib'
import { BottomSheetBgStyled } from 'shared/ui/MainLayout'
import { PopupContentStyled } from 'shared/ui/Popup/PopupContent'
import { Drawer } from 'vaul'

import QuestionIcon from '../img/question-icon.svg'
import styles from './FAQ.module.css'
import {
	QABlockStyled,
	ShareContainerStyled,
	ShareContentContainerStyled,
	ShareItemContainerStyled,
	ShareTitleStyled,
} from './styled'

export const FAQ: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)

	const handleOpenClick = (): void => {
		setIsOpen(true)
		AndrewLytics(`shareOpen`)
	}

	return (
		<>
			<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
				<Drawer.Portal>
					<Drawer.Overlay className={styles.overlay} />
					<Drawer.Content className={styles.content}>
						<div className={styles.handleArea}>
							<div className={styles.handle} />
						</div>
						<div className={styles.scrollArea} data-vaul-no-drag>
							<BottomSheetBgStyled $bg="#fff">
								<PopupContentStyled>
									<QABlockStyled>
										<h2>Что такое севербас</h2>
										<p>Севербас — это сайт с расписанием автобуса 112С.</p>
									</QABlockStyled>

									<QABlockStyled>
										<h2>Зачем</h2>
										<p>
											Актуальное расписание 112С публикует «Томскавтотранс» на своем{` `}
											<a href={AVTOTRANS_LINK} target="_blank" rel="noreferrer">
												сайте
											</a>
											{` `}в виде таблиц. В Яндекс Картах и 2ГИС расписание не совпадает с этими
											таблицами. Чтобы смотреть актуальное расписание в приятном формате появился
											этот сайт.
										</p>
									</QABlockStyled>

									<QABlockStyled>
										<h2>Автобус приезжает не по расписанию</h2>
										<p>
											Ситуация на дорогах всегда разная, поэтому автобус не может приезжать минута
											в минуту. Обычно, автобус приезжает +- 10 минут.
										</p>
									</QABlockStyled>

									<QABlockStyled>
										<h2>Хочу стать бета тестером</h2>
										<p>
											Великолепно! Заполните{` `}
											<a href={BETA_TESTER_LINK} target="_blank" rel="noreferrer">
												эту форму
											</a>
											.
										</p>
									</QABlockStyled>

									<QABlockStyled>
										<h2>Предложения, ошибки, сотрудничество</h2>
										<p>
											<a href={TG_LINK} target="_blank" rel="noreferrer">
												Написать в телеграм
											</a>
										</p>
									</QABlockStyled>

									<ShareContentContainerStyled>
										<ShareItemContainerStyled>
											<QRCode
												size={166}
												value="https://severbus.ru?utm=scan"
												bgColor="transparent"
											/>
										</ShareItemContainerStyled>

										<ShareItemContainerStyled>
											<ShareTitleStyled>QR код с ссылкой на сайт</ShareTitleStyled>
										</ShareItemContainerStyled>
									</ShareContentContainerStyled>
								</PopupContentStyled>
							</BottomSheetBgStyled>
						</div>
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer.Root>

			<ShareContainerStyled onClick={handleOpenClick}>
				<SVG src={QuestionIcon} width={20} height={20} uniquifyIDs style={{ display: `flex` }} />
			</ShareContainerStyled>
		</>
	)
}
