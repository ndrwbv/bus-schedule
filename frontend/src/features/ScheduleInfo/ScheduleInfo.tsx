import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetChangelogQuery } from 'shared/api/scheduleApi'
import {
	lastCheckedAtSelector,
	lastUpdatedAtSelector,
	scheduleSourceSelector,
} from 'shared/store/schedule/scheduleSlice'
import { CardStyled, ContainerStyled, GrayTextStyled } from 'shared/ui/common'

import styles from './ScheduleInfo.module.css'

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleString(`ru-RU`, {
			day: `numeric`,
			month: `long`,
			year: `numeric`,
		})
	} catch {
		return iso
	}
}

export const ScheduleInfo: React.FC = () => {
	const source = useSelector(scheduleSourceSelector)
	const lastUpdatedAt = useSelector(lastUpdatedAtSelector)
	const lastCheckedAt = useSelector(lastCheckedAtSelector)
	const [showChangelog, setShowChangelog] = useState(false)

	const { data: changelog } = useGetChangelogQuery({ limit: 5 }, { skip: !showChangelog })

	// Не показываем блок если расписание захардкожено и нет даты обновления
	if (source === `hardcoded` && !lastUpdatedAt) return null

	// Показываем «проверено» если дата проверки отличается от даты обновления
	const showCheckedAt = lastCheckedAt && lastCheckedAt !== lastUpdatedAt

	return (
		<ContainerStyled>
			<CardStyled>
				<div className={styles.updatedRow}>
					<span className={styles.updatedLabel}>
						{showCheckedAt ? (
							<>
								✅ Проверено:{` `}
								<b className={styles.checkedDate}>{formatDate(lastCheckedAt)}</b>
								<br />
								🔄 Обновлено:{` `}
								<b className={styles.updatedDate}>{lastUpdatedAt ? formatDate(lastUpdatedAt) : `—`}</b>
							</>
						) : (
							<>
								✅ Обновлено:{` `}
								<b className={styles.updatedDate}>{lastUpdatedAt ? formatDate(lastUpdatedAt) : `—`}</b>
							</>
						)}
					</span>

					{changelog !== undefined || showChangelog ? (
						<button type="button" className={styles.toggleButton} onClick={() => setShowChangelog(v => !v)}>
							{showChangelog ? `Скрыть` : `Изменения`}
						</button>
					) : (
						<button type="button" className={styles.toggleButton} onClick={() => setShowChangelog(true)}>
							Изменения
						</button>
					)}
				</div>

				{showChangelog && changelog && (
					<div className={styles.changelogList}>
						{changelog.items.length === 0 ? (
							<GrayTextStyled>Изменений пока нет</GrayTextStyled>
						) : (
							changelog.items.map(entry => (
								<div className={styles.changelogItem} key={entry.id}>
									<p className={styles.changelogDate}>{formatDate(entry.createdAt)}</p>
									<GrayTextStyled>{entry.summary}</GrayTextStyled>
								</div>
							))
						)}
					</div>
				)}
			</CardStyled>
		</ContainerStyled>
	)
}
