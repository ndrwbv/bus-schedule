import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetChangelogQuery } from 'shared/api/scheduleApi'
import { lastUpdatedAtSelector, scheduleSourceSelector } from 'shared/store/schedule/scheduleSlice'
import { CardStyled, ContainerStyled, GrayTextStyled } from 'shared/ui/common'
// ─── Styles ──────────────────────────────────────────────────────────────────
import styled from 'styled-components'

const UpdatedRowStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
`

const UpdatedLabelStyled = styled.span`
	font-size: 14px;
	color: #555;
`

const UpdatedDateStyled = styled.b`
	color: #1191fb;
`

const ToggleButtonStyled = styled.button`
	flex-shrink: 0;
	background: none;
	border: 1px solid #e0e0e0;
	border-radius: 10px;
	padding: 4px 10px;
	font-size: 13px;
	color: #888;
	cursor: pointer;

	@media (hover: hover) {
		&:hover {
			border-color: #1191fb;
			color: #1191fb;
		}
	}
`

const ChangelogListStyled = styled.div`
	margin-top: 12px;
	display: flex;
	flex-direction: column;
	gap: 8px;
`

const ChangelogItemStyled = styled.div`
	padding: 8px 0;
	border-top: 1px solid #f0f0f0;
`

const ChangelogDateStyled = styled.p`
	margin: 0 0 2px 0;
	font-size: 13px;
	font-weight: 600;
	color: #333;
`

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
	const [showChangelog, setShowChangelog] = useState(false)

	const { data: changelog } = useGetChangelogQuery({ limit: 5 }, { skip: !showChangelog })

	// Не показываем блок если расписание захардкожено и нет даты обновления
	if (source === `hardcoded` && !lastUpdatedAt) return null

	return (
		<ContainerStyled>
			<CardStyled>
				<UpdatedRowStyled>
					<UpdatedLabelStyled>
						🕐 Расписание обновлено:{` `}
						<UpdatedDateStyled>{lastUpdatedAt ? formatDate(lastUpdatedAt) : `—`}</UpdatedDateStyled>
					</UpdatedLabelStyled>

					{changelog !== undefined || showChangelog ? (
						<ToggleButtonStyled onClick={() => setShowChangelog(v => !v)}>
							{showChangelog ? `Скрыть` : `Изменения`}
						</ToggleButtonStyled>
					) : (
						<ToggleButtonStyled onClick={() => setShowChangelog(true)}>Изменения</ToggleButtonStyled>
					)}
				</UpdatedRowStyled>

				{showChangelog && changelog && (
					<ChangelogListStyled>
						{changelog.items.length === 0 ? (
							<GrayTextStyled>Изменений пока нет</GrayTextStyled>
						) : (
							changelog.items.map(entry => (
								<ChangelogItemStyled key={entry.id}>
									<ChangelogDateStyled>{formatDate(entry.createdAt)}</ChangelogDateStyled>
									<GrayTextStyled>{entry.summary}</GrayTextStyled>
								</ChangelogItemStyled>
							))
						)}
					</ChangelogListStyled>
				)}
			</CardStyled>
		</ContainerStyled>
	)
}
