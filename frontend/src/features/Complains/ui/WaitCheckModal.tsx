import { useEffect } from 'react'
import { Modal } from 'shared/ui/Modal'

import { fromMinutes } from '../lib/matchReports'
import { arrivedAgoOptions, BusHint, toWaitTrip, tripLabel } from '../lib/waitMachine'
import { WaitCheck, WaitStep } from '../model/useWaitCheck'
import styles from './waitCheckModal.module.css'

const THANKS_MS = 2500

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

/** «ТГУ», в город — the direction only where the stop is served both ways */
const where = (label: string, directionText: string | null): string =>
	directionText ? `«${label}», ${directionText}` : `«${label}»`

const hintText = (hint: BusHint): string | null => {
	if (!hint) return null
	if (hint.kind === `here`) return `Здесь его уже отметили в ${fromMinutes(hint.at)}`

	return `Его уже видели дальше, на «${hint.stop}» в ${fromMinutes(hint.at)}`
}

const PresenceStep: React.FC<{ check: WaitCheck; step: Extract<WaitStep, { kind: 'presence' }> }> = ({
	check,
	step,
}) => {
	const { stop, answer, close } = check
	if (!stop) return null
	const trip = tripLabel(toWaitTrip(step.trip))

	return (
		<Modal title="Вы на остановке?" onClose={close}>
			<p className={styles.text}>
				Ждёте автобус <b>{trip}</b> на {where(stop.label, stop.directionText)}?
			</p>
			<Buttons>
				{step.overdue ? (
					<>
						<Button primary onClick={(): void => answer({ kind: `presence`, answer: `sinceScheduled` })}>
							Да, жду с {trip} или раньше
						</Button>
						<Button onClick={(): void => answer({ kind: `presence`, answer: `justCame` })}>
							Да, только подошёл
						</Button>
					</>
				) : (
					<Button primary onClick={(): void => answer({ kind: `presence`, answer: `justCame` })}>
						Да, жду
					</Button>
				)}
				<Button onClick={(): void => answer({ kind: `presence`, answer: `no` })}>Нет</Button>
			</Buttons>
			<p className={styles.hint}>
				Когда подойдёт время, спросим, пришёл ли он. Это подскажет тем, кто ждёт его дальше по маршруту
			</p>
		</Modal>
	)
}

const BusStep: React.FC<{ check: WaitCheck; step: Extract<WaitStep, { kind: 'bus' }> }> = ({ check, step }) => {
	const { wait, answer, close } = check
	if (!wait) return null
	const trip = tripLabel(wait.trip)

	if (step.left) {
		return (
			<Modal title="Вы сели в автобус?" onClose={close}>
				<p className={styles.text}>
					Похоже, вы ушли с остановки {where(wait.stopLabel, wait.directionText)}. Это был автобус
					{` `}
					<b>{trip}</b>?
				</p>
				<Buttons>
					<Button primary onClick={(): void => answer({ kind: `left`, boarded: true })}>
						Да, я в нём
					</Button>
					<Button onClick={(): void => answer({ kind: `left`, boarded: false })}>Нет, просто ушёл</Button>
				</Buttons>
			</Modal>
		)
	}

	const hint = hintText(step.hint)
	const seenHereAt = step.hint?.kind === `here` ? step.hint.at : null

	return (
		<Modal title={`Автобус ${trip} пришёл?`} onClose={close}>
			<p className={styles.text}>
				{wait.asks > 0 && !hint ? `А сейчас? ` : ``}Остановка{` `}
				{where(wait.stopLabel, wait.directionText)}
				{hint && <span className={styles.context}>{hint}</span>}
			</p>
			<Buttons>
				{seenHereAt !== null ? (
					<Button primary onClick={(): void => answer({ kind: `arrivedAt`, at: seenHereAt })}>
						Да, около {fromMinutes(seenHereAt)}
					</Button>
				) : (
					<Button primary onClick={(): void => answer({ kind: `bus`, answer: `arrived` })}>
						Пришёл
					</Button>
				)}
				<Button onClick={(): void => answer({ kind: `bus`, answer: `notYet` })}>Ещё нет</Button>
				<Button onClick={(): void => answer({ kind: `bus`, answer: `passedBy` })}>Проехал мимо</Button>
			</Buttons>
			<button className={styles.link} type="button" onClick={(): void => answer({ kind: `bus`, answer: `gone` })}>
				Я уже не на остановке
			</button>
		</Modal>
	)
}

const WhenStep: React.FC<{ check: WaitCheck }> = ({ check }) => {
	const { wait, now, answer, close } = check
	if (!wait) return null

	return (
		<Modal title="Когда он пришёл?" onClose={close}>
			<Buttons>
				<Button primary onClick={(): void => answer({ kind: `arrivedAt`, at: now })}>
					Только что
				</Button>
				{arrivedAgoOptions(wait, now).map(ago => (
					<Button key={ago} onClick={(): void => answer({ kind: `arrivedAt`, at: now - ago })}>
						{ago} мин назад · {fromMinutes(now - ago)}
					</Button>
				))}
			</Buttons>
		</Modal>
	)
}

const OnTimeStep: React.FC<{ check: WaitCheck; step: Extract<WaitStep, { kind: 'onTime' }> }> = ({ check, step }) => {
	const { answer, close } = check
	const trip = tripLabel(toWaitTrip(step.trip))

	return (
		<Modal title={`Вы были здесь к ${trip}?`} onClose={close}>
			<p className={styles.text}>
				Если вы подошли позже, автобус мог уйти раньше вас. Так мы поймём, опаздывает ли он
			</p>
			<Buttons>
				<Button primary onClick={(): void => answer({ kind: `onTime`, onTime: true })}>
					Да, жду с {trip}
				</Button>
				<Button onClick={(): void => answer({ kind: `onTime`, onTime: false })}>Подошёл позже</Button>
			</Buttons>
		</Modal>
	)
}

/** One question at a time, big buttons — people answer this standing at a stop, often in gloves */
export const WaitCheckModal: React.FC<{ check: WaitCheck }> = ({ check }) => {
	const { step, close } = check

	useEffect(() => {
		if (step?.kind !== `thanks`) return undefined
		const id = setTimeout(close, THANKS_MS)

		return () => clearTimeout(id)
	}, [step, close])

	if (!step) return null

	switch (step.kind) {
		case `presence`:
			return <PresenceStep check={check} step={step} />
		case `bus`:
			return <BusStep check={check} step={step} />
		case `when`:
			return <WhenStep check={check} />
		case `onTime`:
			return <OnTimeStep check={check} step={step} />
		case `info`:
			return (
				<Modal title={step.title} onClose={close}>
					<p className={styles.text}>{step.text}</p>
					<Buttons>
						<Button primary onClick={close}>
							Понятно
						</Button>
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
