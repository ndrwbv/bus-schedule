import { useEffect } from 'react'
import { Modal } from 'shared/ui/Modal'

import { fromMinutes, nowMinutesInTomsk } from '../lib/matchReports'
import { WaitCheck } from '../model/useWaitCheck'
import styles from './waitCheckModal.module.css'

const THANKS_MS = 2500

const WHEN_OPTIONS = [
	{ ago: 2, label: `Пару минут назад` },
	{ ago: 5, label: `Минут 5 назад` },
]

const Buttons: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className={styles.buttons}>{children}</div>
)

const Button: React.FC<{ primary?: boolean; onClick: () => void; children: React.ReactNode }> = ({
	primary = false,
	onClick,
	children,
}) => (
	<button className={primary ? `${styles.button} ${styles.primary}` : styles.button} type="button" onClick={onClick}>
		{children}
	</button>
)

/** One question at a time, big buttons — people answer this standing at a stop, often in gloves */
export const WaitCheckModal: React.FC<{ check: WaitCheck }> = ({ check }) => {
	const { step, wait, close } = check

	useEffect(() => {
		if (step?.kind !== `thanks`) return undefined
		const id = setTimeout(close, THANKS_MS)

		return () => clearTimeout(id)
	}, [step, close])

	if (!step) return null

	const now = nowMinutesInTomsk()
	const tripTime = wait?.trip.time ?? (`trip` in step ? step.trip.time : ``)

	switch (step.kind) {
		case `presence`:
			return (
				<Modal title="Вы на остановке?" onClose={close}>
					<p className={styles.text}>
						Ждёте автобус <b>{step.trip.time}</b> на остановке «{check.stopLabel}»?
					</p>
					<Buttons>
						<Button primary onClick={(): void => check.confirmPresence(true)}>
							Да, жду
						</Button>
						<Button onClick={(): void => check.confirmPresence(false)}>Нет</Button>
					</Buttons>
					<p className={styles.hint}>
						Когда подойдёт время, спросим, пришёл ли он. Это подскажет тем, кто ждёт его дальше по маршруту
					</p>
				</Modal>
			)

		case `bus`:
			if (step.left) {
				return (
					<Modal title="Вы сели в автобус?" onClose={close}>
						<p className={styles.text}>
							Похоже, вы ушли с остановки «{wait?.stopLabel}». Это был автобус <b>{tripTime}</b>?
						</p>
						<Buttons>
							<Button primary onClick={(): void => check.answerLeft(true)}>
								Да, я в нём
							</Button>
							<Button onClick={(): void => check.answerLeft(false)}>Нет, просто ушёл</Button>
						</Buttons>
					</Modal>
				)
			}

			return (
				<Modal title={`Автобус ${tripTime} пришёл?`} onClose={close}>
					<p className={styles.text}>
						{wait && wait.asks > 0 ? `А сейчас? ` : ``}Остановка «{wait?.stopLabel}»
					</p>
					<Buttons>
						<Button primary onClick={(): void => check.answerBus(`arrived`)}>
							Пришёл
						</Button>
						<Button onClick={(): void => check.answerBus(`notYet`)}>Ещё нет</Button>
						<Button onClick={(): void => check.answerBus(`passedBy`)}>Проехал мимо</Button>
					</Buttons>
					<button className={styles.link} type="button" onClick={(): void => check.answerBus(`gone`)}>
						Я уже не на остановке
					</button>
				</Modal>
			)

		case `when`: {
			// Not before the last «Ещё нет»: then it had not come yet
			const notYetAt = wait?.notYetAt ?? null
			const options = WHEN_OPTIONS.filter(o => notYetAt === null || now - o.ago > notYetAt)

			return (
				<Modal title="Когда он пришёл?" onClose={close}>
					<Buttons>
						<Button primary onClick={(): void => check.answerWhen(0)}>
							Только что
						</Button>
						{options.map(o => (
							<Button key={o.ago} onClick={(): void => check.answerWhen(o.ago)}>
								{o.label} · {fromMinutes(now - o.ago)}
							</Button>
						))}
					</Buttons>
				</Modal>
			)
		}

		case `onTime`:
			return (
				<Modal title={`Вы были здесь к ${step.trip.time}?`} onClose={close}>
					<p className={styles.text}>
						Если вы подошли позже, автобус мог уйти раньше вас. Так мы поймём, опаздывает ли он
					</p>
					<Buttons>
						<Button primary onClick={(): void => check.answerOnTime(true)}>
							Да, жду с {step.trip.time}
						</Button>
						<Button onClick={(): void => check.answerOnTime(false)}>Подошёл позже</Button>
					</Buttons>
				</Modal>
			)

		default:
			return (
				<Modal title="Спасибо!" onClose={close}>
					<p className={styles.text}>{step.text}</p>
				</Modal>
			)
	}
}
