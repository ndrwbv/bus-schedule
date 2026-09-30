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

const plural = (n: number, one: string, few: string, many: string): string => {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return one
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few

	return many
}

const minutes = (n: number): string => [n, plural(n, `минуту`, `минуты`, `минут`)].join(` `)
const people = (n: number): string => [n, plural(n, `человек`, `человека`, `человек`)].join(` `)

/** «15 мин назад» — how fresh a mark is matters more than the clock time it was left at */
const ago = (at: number): string => {
	const diff = nowMinutesInTomsk() - at
	if (diff <= 0) return `только что`

	return `${diff} мин назад`
}

export const formatDelay = (delay: number): string => {
	if (delay === 0) return `вовремя`

	return delay > 0 ? `+${delay} мин` : `−${-delay} мин`
}

const LiveSignalCard: React.FC<{ signal: LiveSignal }> = ({ signal }) => {
	const by = signal.marks > 1 ? ` · ${people(signal.marks)}` : ``

	if (signal.kind === `missing`) {
		return (
			<div className={`${styles.signal} ${styles.signalMissing}`}>
				<b>Рейс {signal.trip.time} может не прийти</b>
				<span>
					На остановке «{signal.fromStop}» отметили «не приехал» {ago(signal.markedAt)}
					{by}
				</span>
			</div>
		)
	}

	const title =
		signal.delay > 1
			? `Рейс ${signal.trip.time} опаздывает на ~${minutes(signal.delay)}`
			: signal.delay < -1
			? `Рейс ${signal.trip.time} идёт раньше на ~${minutes(-signal.delay)}`
			: `Рейс ${signal.trip.time} идёт по расписанию`

	return (
		<div className={`${styles.signal} ${signal.delay < -1 ? styles.signalEarly : styles.signalLate}`}>
			<b>{title}</b>
			<span>
				«{signal.fromStop}» — отметили {ago(signal.markedAt)}
				{by}. Здесь ждите около <b>{fromMinutes(signal.expected)}</b>
			</span>
		</div>
	)
}

const usualText = (usual: UsualDelay): string => {
	const subject = usual.scope === `trip` ? `этот рейс` : `автобус`
	const range = usual.p25 === usual.p75 ? `${usual.median}` : `${usual.p25}…${usual.p75}`

	if (usual.median > 1) return `Обычно ${subject} приходит сюда на ${range} мин позже`
	if (usual.median < -1) return `Обычно ${subject} приходит сюда на ${-usual.median} мин раньше — выходите заранее`

	return `Обычно ${subject} приходит сюда по расписанию`
}

const Usual: React.FC<{ usual: UsualDelay }> = ({ usual }) => (
	<div className={styles.usual}>
		<span className={styles.usualIcon} aria-hidden>
			≈
		</span>
		<span>
			{usualText(usual)}
			<span className={styles.muted}>
				{` `}· {usual.count} {plural(usual.count, `отметка`, `отметки`, `отметок`)} за {usual.days}
				{` `}
				{plural(usual.days, `день`, `дня`, `дней`)}
			</span>
		</span>
	</div>
)

const FEED_LABEL: Partial<Record<ComplainType, string>> = {
	[ComplainType.arrived]: `приехал`,
	[ComplainType.not_arrive]: `не приехал`,
	[ComplainType.passed_by]: `проехал мимо`,
	[ComplainType.earlier]: `приехал раньше`,
	[ComplainType.later]: `приехал позже`,
}

const FeedRow: React.FC<{ item: FeedItem }> = ({ item }) => {
	const isGood = item.type === ComplainType.arrived

	return (
		<li className={styles.feedRow}>
			<span className={styles.feedTime}>{fromMinutes(item.at)}</span>
			<span className={`${styles.feedMark} ${isGood ? styles.feedMarkGood : styles.feedMarkBad}`} aria-hidden>
				{isGood ? `✓` : `✕`}
			</span>
			<span className={styles.feedText}>
				{FEED_LABEL[item.type]}
				{item.scheduledTime && <span className={styles.muted}> · рейс {item.scheduledTime}</span>}
			</span>
			{item.delay !== null && (
				<span className={item.delay > 1 ? `${styles.delay} ${styles.delayLate}` : styles.delay}>
					{formatDelay(item.delay)}
				</span>
			)}
			{item.count > 1 && <span className={styles.count}>×{item.count}</span>}
		</li>
	)
}

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
	const { live, usual, feed } = insights

	return (
		<Modal title={stop} onClose={onClose}>
			{live.map(signal => (
				<LiveSignalCard key={`${signal.trip.direction}-${signal.trip.tripIndex}`} signal={signal} />
			))}

			{usual && <Usual usual={usual} />}

			<div className={styles.feedHeader}>
				<span>Сегодня здесь отметили</span>
				{feed.length > 0 && <span className={styles.muted}>{feed.reduce((n, i) => n + i.count, 0)}</span>}
			</div>

			{feed.length === 0 ? (
				<p className={styles.empty}>
					Пока никто. Подъехал автобус — нажмите «Приехал»: тем, кто ждёт дальше по маршруту, это подскажет,
					опаздывает ли он
				</p>
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
