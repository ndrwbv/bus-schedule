import { useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector } from 'shared/store/busStop/busStopInfoSlice'
import { Modal } from 'shared/ui/Modal'

import { fromMinutes, nowMinutesInTomsk } from '../lib/matchReports'
import { FeedItem, LiveSignal, StopInsights, UsualDelay } from '../lib/stopInsights'
import { ComplainType } from '../model/Complains'
import { useStopInsights } from '../model/useCrowdReports'
import styles from './stopCrowdStatus.module.css'

/** «15 мин назад» — how fresh a mark is matters more than the clock time it was left at */
const ago = (at: number): string => {
	const diff = nowMinutesInTomsk() - at
	if (diff <= 0) return `только что`

	return `${diff} мин назад`
}

/** «на 5 мин позже» / «на 3 мин раньше» / «вовремя» — words, not «+5» */
export const delayPhrase = (delay: number): string => {
	if (delay > 1) return `на ${delay} мин позже`
	if (delay < -1) return `на ${-delay} мин раньше`

	return `вовремя`
}

/** The bus you are waiting for: what the freshest mark says about it, in plain words */
const MainSignal: React.FC<{ signal: LiveSignal }> = ({ signal }) => {
	const who = signal.marks > 1 ? `Пассажиры` : `Пассажир`

	if (signal.kind === `missing`) {
		return (
			<div className={`${styles.main} ${styles.mainMissing}`}>
				<p className={styles.mainTitle}>Может не прийти</p>
				<p className={styles.mainLine}>Рейс {signal.trip.time}</p>
				<p className={styles.mainSource}>
					На остановке «{signal.fromStop}» его не дождались, {ago(signal.markedAt)}
				</p>
			</div>
		)
	}

	let title = `Идёт по расписанию`
	if (signal.delay > 1) title = `Опаздывает на ~${signal.delay} мин`
	if (signal.delay < -1) title = `Придёт раньше на ~${-signal.delay} мин`

	return (
		<div className={`${styles.main} ${signal.delay < -1 ? styles.mainEarly : styles.mainLate}`}>
			<p className={styles.mainTitle}>{title}</p>
			<p className={styles.mainLine}>
				Рейс {signal.trip.time} будет здесь около <b>{fromMinutes(signal.expected)}</b>
			</p>
			<p className={styles.mainSource}>
				{who} на остановке «{signal.fromStop}» отметил{signal.marks > 1 ? `и` : ``} {ago(signal.markedAt)}
			</p>
		</div>
	)
}

const usualText = (usual: UsualDelay): string => {
	const subject = usual.scope === `trip` ? `этот рейс` : `автобус`
	const range = usual.p25 === usual.p75 ? `${usual.median}` : `${usual.p25}–${usual.p75}`

	if (usual.median > 1) return `Обычно ${subject} приходит сюда на ${range} мин позже расписания`
	if (usual.median < -1) return `Обычно ${subject} приходит сюда на ${-usual.median} мин раньше расписания`

	return `Обычно ${subject} приходит сюда по расписанию`
}

const feedText = (item: FeedItem): string => {
	if (item.type === ComplainType.arrived) {
		return item.delay === null ? `пришёл` : `пришёл ${delayPhrase(item.delay)}`
	}
	if (item.type === ComplainType.not_arrive) return `не пришёл`
	if (item.type === ComplainType.passed_by) return `проехал мимо`

	return item.type === ComplainType.earlier ? `пришёл раньше` : `пришёл позже`
}

const feedTone = (item: FeedItem): string => {
	if (item.type !== ComplainType.arrived) return styles.feedBad
	if (item.delay !== null && item.delay > 1) return styles.feedLate

	return styles.feedGood
}

/** One trip per row: «12:15 — пришёл на 5 мин позже». Without a known trip — the time of the mark */
const FeedRow: React.FC<{ item: FeedItem }> = ({ item }) => (
	<li className={styles.feedRow}>
		<span className={item.scheduledTime ? styles.feedTrip : styles.feedTripUnknown}>
			{item.scheduledTime ?? fromMinutes(item.at)}
		</span>
		<span className={feedTone(item)}>{feedText(item)}</span>
	</li>
)

interface Headline {
	tone: 'late' | 'early' | 'missing'
	text: string
}

/**
 * The one thing a passenger needs from the marks: will *their* bus be late or early. Live marks
 * about the trip due now beat the long-run «обычно»; «по расписанию» is not news and stays hidden.
 */
const pickHeadline = ({ live, usual }: StopInsights): Headline | null => {
	// The bus you are waiting for. A fresh mark about it beats any statistics — even when it says
	// «вовремя»: then there is simply no news, and «обычно опаздывает» would contradict it
	const signal = live[0] as LiveSignal | undefined
	if (signal && signal.kind === `timing` && Math.abs(signal.delay) <= 1) return null

	if (signal?.kind === `missing`) return { tone: `missing`, text: `Рейс ${signal.trip.time} может не прийти` }
	if (signal && signal.delay > 1)
		return { tone: `late`, text: `Рейс ${signal.trip.time} опаздывает на ~${signal.delay} мин` }
	if (signal) return { tone: `early`, text: `Рейс ${signal.trip.time} придёт раньше на ~${-signal.delay} мин` }

	if (usual && usual.median > 1) return { tone: `late`, text: `Обычно опаздывает на ~${usual.median} мин` }
	if (usual && usual.median < -1) return { tone: `early`, text: `Обычно приходит на ~${-usual.median} мин раньше` }

	return null
}

const HEADLINE_CLASS: Record<Headline['tone'], string> = {
	late: styles.headlineLate,
	early: styles.headlineEarly,
	missing: styles.headlineMissing,
}

const CrowdDetailsModal: React.FC<{ insights: StopInsights; stop: string; onClose: () => void }> = ({
	insights,
	stop,
	onClose,
}) => {
	const { usual, feed } = insights
	const signal = insights.live[0] as LiveSignal | undefined

	return (
		<Modal title={stop} onClose={onClose}>
			{signal && <MainSignal signal={signal} />}

			{/* A fresh mark already answered the question — «обычно» would only add noise */}
			{!signal && usual && <p className={styles.usual}>{usualText(usual)}</p>}

			<p className={styles.feedHeader}>Сегодня на этой остановке</p>

			{feed.length === 0 ? (
				<p className={styles.empty}>Ещё никто не отмечал</p>
			) : (
				<ul className={styles.feed}>
					{feed.map(item => (
						<FeedRow key={item.key} item={item} />
					))}
				</ul>
			)}
		</Modal>
	)
}

/**
 * Crowd marks in the stop card: one line — is the bus late or early — and «Подробнее» with the
 * rest (where it was marked, «обычно», today's marks here) in a modal.
 */
export const StopCrowdStatus: React.FC = () => {
	const insights = useStopInsights()
	const stop = useSelector(busStopNewSelector)
	const [isOpen, setIsOpen] = useState(false)

	if (!insights || !stop) return null

	const headline = pickHeadline(insights)
	const hasDetails = insights.live.length > 0 || insights.usual !== null || insights.feed.length > 0
	if (!headline && !hasDetails) return null

	const handleOpen = (): void => {
		setIsOpen(true)
		AndrewLytics(`crowd:details`)
	}

	return (
		<>
			<button
				className={headline ? `${styles.headline} ${HEADLINE_CLASS[headline.tone]}` : styles.headlineQuiet}
				type="button"
				onClick={handleOpen}
			>
				<span className={styles.headlineText}>{headline ? headline.text : `Отметки пассажиров`}</span>
				<span className={styles.headlineMore}>Подробнее ›</span>
			</button>

			{isOpen && (
				<CrowdDetailsModal insights={insights} stop={stop.label} onClose={(): void => setIsOpen(false)} />
			)}
		</>
	)
}
