/* Rows and columns have fixed carrier indices, including repeated visits. */
/* eslint-disable react/no-array-index-key */
/* Keyboard users must be able to scroll the wide timetable. */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useId, useState } from 'react'

import { isNovemberRoute, ROUTE_SOURCE, ROUTE_TABLES } from './model'
import styles from './routeSchedule.module.css'

export const RouteSchedule: React.FC = () => {
	const dayId = useId()
	const stopId = useId()
	const [expanded, setExpanded] = useState(isNovemberRoute)
	const [day, setDay] = useState(() => {
		const weekday = new Intl.DateTimeFormat(`en-US`, { timeZone: `Asia/Tomsk`, weekday: `short` }).format(
			new Date(),
		)

		return weekday === `Sat` || weekday === `Sun` ? `weekends` : `weekdays`
	})
	const [stop, setStop] = useState(``)
	const stops = [...new Set(ROUTE_TABLES.flatMap(table => table.rows.map(row => row.stop)))]

	return (
		<section className={styles.notice} aria-label="Маршрут с 7 ноября">
			<h2>С 7 ноября 112С ходит двумя путями</h2>
			<p>Через Набережную и МАЯК — обратно через Синее небо, Этюд, Гармонию и ГОАР.</p>
			<p>Через ГОАР, Гармонию и Три Элемента — обратно через Северный парк, МАЯК и Набережную.</p>
			<p>Пути чередуются. Проверяйте табличку у входа в автобус.</p>
			<p>
				<strong>
					Основные списки на сайте — по расписанию до 6 ноября включительно. Для поездок с 7 ноября смотрите
					новые таблицы ниже.
				</strong>
			</p>
			<p>
				<a href={ROUTE_SOURCE} target="_blank" rel="noreferrer">
					Схема и расписание перевозчика
				</a>
				{` `}· Диспетчерская: <a href="tel:+73822990099">99-00-99</a>
			</p>
			<button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}>
				{expanded ? `Свернуть таблицы` : `Расписание с 7 ноября`}
			</button>
			{expanded && (
				<div>
					<p>Действует с 7 ноября 2026 года. Время томское. Таблицы можно листать вбок.</p>
					<label htmlFor={dayId}>
						Дни{` `}
						<select id={dayId} value={day} onChange={event => setDay(event.target.value)}>
							<option value="weekdays">Будни</option>
							<option value="weekends">Суббота и воскресенье</option>
						</select>
					</label>
					<label htmlFor={stopId}>
						Остановка{` `}
						<select id={stopId} value={stop} onChange={event => setStop(event.target.value)}>
							<option value="">Все остановки</option>
							{stops.map(name => (
								<option key={name}>{name}</option>
							))}
						</select>
					</label>
					{ROUTE_TABLES.filter(table => table.day === day).map(table => (
						<section key={table.id}>
							<h3>{table.via === `park` ? `Через Набережную и МАЯК` : `Через ГОАР и Гармонию`}</h3>
							{table.rows.filter(row => !stop || row.stop === stop).length === 0 ? (
								<p>Эта остановка не указана для данного пути.</p>
							) : (
								<div className={styles.scroll} tabIndex={0} role="region" aria-label="Таблица рейсов">
									<table>
										<thead>
											<tr>
												<th scope="col">Остановка</th>
												{table.rows[0].times.map((_, index) => (
													<th scope="col" key={index}>
														Рейс {index + 1}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{table.rows.map(
												(row, index) =>
													(!stop || row.stop === stop) && (
														<tr key={index}>
															<th scope="row">
																{row.stop}
																<small>
																	{row.direction === `fromCity`
																		? `К Серебряному бору`
																		: `В Томск`}
																</small>
															</th>
															{row.times.map((time, trip) => (
																<td key={trip}>{time ?? `—`}</td>
															))}
														</tr>
													),
											)}
										</tbody>
									</table>
								</div>
							)}
						</section>
					))}
					<p>
						Повторные строки — повторный проезд остановки в том же рейсе. «—» означает, что рейс здесь ещё
						не начался. Времена перенесены как опубликованы перевозчиком.
					</p>
				</div>
			)}
		</section>
	)
}
