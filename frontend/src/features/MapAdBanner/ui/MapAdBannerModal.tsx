import React, { useCallback, useState } from 'react'
import { BannerMessage } from 'shared/api/scheduleApi'
import { AndrewLytics } from 'shared/lib'
import { Modal } from 'shared/ui/Modal'

import styles from './MapAdBanner.module.css'

const PHONE = `+79969386490`
const PHONE_DISPLAY = `+7 996 938-64-90`

interface Props {
	isOpen: boolean
	onClose: () => void
	messages: BannerMessage[]
}

export const MapAdBannerModal: React.FC<Props> = ({ isOpen, onClose, messages }) => {
	const [copied, setCopied] = useState(false)

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(PHONE)
			setCopied(true)
			AndrewLytics(`mapAdBanner.copyPhone`)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// fallback
		}
	}, [])

	if (!isOpen) return null

	return (
		<Modal title="Доска объявлений" onClose={onClose}>
			<p className={styles.modalText}>
				Привет! Меня зовут Андрей. Этот сайт я сделал для жителей района, чтобы было проще ориентироваться в
				расписании 112С.
				<br />
				<br />
				Если сервис полезен — поддержите проект донатом! За это ваше сообщение появится на рекламном щите прямо
				на карте.
			</p>

			<div className={styles.howItWorks}>
				<div className={styles.howItWorksTitle}>Как это работает?</div>
				<div className={styles.howItWorksText}>
					1. Переведите от 100 руб. на номер ниже (Т-Банк)
					<br />
					2. Напишите в комментарии к переводу ваше имя и текст для щита
					<br />
					3. Я добавлю вашу надпись вручную — она будет крутиться на щите на карте
					<br />
					<br />
					Нецензурные надписи буду корректировать на свой вкус :)
				</div>
			</div>

			<div className={styles.donatePhoneRow}>
				<div>
					<span className={styles.donatePhone}>{PHONE_DISPLAY}</span>
					<br />
					<span className={styles.donatePhoneName}>Андрей · Т-Банк</span>
				</div>
				<button type="button" className={styles.copyButton} onClick={handleCopy} title="Скопировать номер">
					{copied ? <span className={styles.copiedTooltip}>Скопировано!</span> : `📋`}
				</button>
			</div>

			<div className={styles.divider} />

			<div className={styles.messagesTitle}>Сообщения на щите ({messages.length})</div>

			{messages.length > 0 ? (
				<div className={styles.messagesList}>
					{messages.map(msg => (
						<div key={msg.id} className={styles.messageCard}>
							<div className={styles.messageAuthor}>
								{msg.author_name}
								{msg.amount != null && (
									<span className={styles.messageAmount}> — {msg.amount} руб.</span>
								)}
							</div>
							<div className={styles.messageBody}>{msg.message}</div>
						</div>
					))}
				</div>
			) : (
				<div className={styles.emptyMessages}>Пока нет сообщений. Станьте первым!</div>
			)}
		</Modal>
	)
}
