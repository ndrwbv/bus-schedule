import { useState } from 'react'
import { useSelector } from 'react-redux'
import { AndrewLytics } from 'shared/lib'
import { busStopNewSelector } from 'shared/store/busStop/busStopInfoSlice'
import { Modal } from 'shared/ui/Modal'

import { fromMinutes, nowMinutesInTomsk, toMinutes } from '../lib/matchReports'
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

const signalTitle = (signal: LiveSignal): string => {
	if (signal.atLeast) return `Опаздывает минимум на ${signal.delay} мин`
	if (signal.delay > 1) return `Опаздывает на ~${signal.delay} мин`
	if (signal.delay < -1) return `Придёт раньше на ~${-signal.delay} мин`

	return `Идёт по расписанию`
}

/** The bus you are waiting for: what the freshest mark says about it, in plain words */
const MainSignal: React.FC<{ signal: LiveSignal; stop: string }> = ({ signal, stop }) => {
	const where = signal.fromStop === stop ? `Здесь` : `На остановке «${signal.fromStop}»`
	const who = signal.marks > 1 ? `пассажиры отметили` : `пассажир отметил`
	const source =
		signal.fromType === ComplainType.not_arrive
			? `${where} в ${fromMinutes(signal.markedAt)} его ещё не было`
			: `${where} ${who} его ${ago(signal.markedAt)}`

	return (
		<div className={`${styles.main} ${signal.delay < -1 ? styles.mainEarly : styles.mainLate}`}>
			<p className={styles.mainTitle}>{signalTitle(signal)}</p>
			<p className={styles.mainLine}>
				Рейс {signal.trip.time} будет здесь {signal.atLeast ? `не раньше` : `около`}
				{` `}
				<b>{fromMinutes(signal.expected)}</b>
			</p>
			<p className={styles.mainSource}>{source}</p>
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
	const at = fromMinutes(item.at)
	const scheduled = item.scheduledTime ? toMinutes(item.scheduledTime) : null

	switch (item.status) {
		case `arrived`:
			return `пришёл около ${at}`
		case `passedBy`:
			return `проехал мимо в ${at}`
		case `passedBefore`:
			return scheduled !== null && item.at < scheduled ? `прошёл раньше, около ${at}` : `прошёл около ${at}`
		case `cancelled`:
			return `не пришёл`
		default:
			return `в ${at} ещё не было`
	}
}

const FEED_TONE: Record<FeedItem['status'], string> = {
	arrived: styles.feedGood,
	passedBy: styles.feedBad,
	passedBefore: styles.feedLate,
	cancelled: styles.feedBad,
	notYet: styles.feedMuted,
}

/** One trip per row: «12:15 — пришёл около 12:19». Without a known trip — the time of the mark */
const FeedRow: React.FC<{ item: FeedItem }> = ({ item }) => (
	<li className={styles.feedRow}>
		<span className={item.scheduledTime ? styles.feedTrip : styles.feedTripUnknown}>
			{item.scheduledTime ?? fromMinutes(item.at)}
		</span>
		<span className={FEED_TONE[item.status]}>{feedText(item)}</span>
	</li>
)

interface Headline {
	tone: 'late' | 'early'
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
	if (signal && !signal.atLeast && Math.abs(signal.delay) <= 1) return null

	if (signal && (signal.atLeast || signal.delay > 1))
		return { tone: `late`, text: `Рейс ${signal.trip.time} ${signalTitle(signal).toLowerCase()}` }
	if (signal) return { tone: `early`, text: `Рейс ${signal.trip.time} придёт раньше на ~${-signal.delay} мин` }

	if (usual && usual.median > 1) return { tone: `late`, text: `Обычно опаздывает на ~${usual.median} мин` }
	if (usual && usual.median < -1) return { tone: `early`, text: `Обычно приходит на ~${-usual.median} мин раньше` }

	return null
}

const HEADLINE_CLASS: Record<Headline['tone'], string> = {
	late: styles.headlineLate,
	early: styles.headlineEarly,
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
			{signal && <MainSignal signal={signal} stop={stop} />}

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
