import { ISchedule } from './types'

const TIME_RE = /^\d{1,2}:\d{2}$/
const REQUIRED_DIRECTIONS = ['inSP', 'out', 'inLB'] as const
const ALL_DAYS = ['0', '1', '2', '3', '4', '5', '6']

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

export function validateSchedule(
  schedule: ISchedule,
  current?: ISchedule,
  changeThreshold = 0.5,
): ValidationResult {
  const errors: string[] = []

  // Все 3 направления присутствуют
  for (const dir of REQUIRED_DIRECTIONS) {
    if (!schedule[dir] || typeof schedule[dir] !== 'object') {
      errors.push(`Отсутствует направление ${dir}`)
    }
  }

  if (errors.length) return { ok: false, errors }

  // Проверяем каждое направление
  for (const dir of REQUIRED_DIRECTIONS) {
    const dirData = schedule[dir]

    // Все дни недели присутствуют
    for (const day of ALL_DAYS) {
      if (!dirData[day]) {
        errors.push(`Отсутствует день ${day} в направлении ${dir}`)
        continue
      }

      const dayData = dirData[day]
      const stopNames = Object.keys(dayData)

      // Минимум 5 остановок
      if (stopNames.length < 5) {
        errors.push(
          `Слишком мало остановок в ${dir}/${day}: ${stopNames.length} (минимум 5)`,
        )
      }

      // Проверяем времена
      for (const stop of stopNames) {
        const times = dayData[stop]
        if (!Array.isArray(times) || times.length === 0) {
          errors.push(`Пустой массив времён: ${dir}/${day}/${stop}`)
          continue
        }

        for (const t of times) {
          if (!TIME_RE.test(t)) {
            errors.push(`Некорректный формат времени "${t}" в ${dir}/${day}/${stop}`)
          } else {
            const [h, m] = t.split(':').map(Number)
            if (h < 5 || h > 23 || m < 0 || m > 59) {
              errors.push(`Время вне диапазона "${t}" в ${dir}/${day}/${stop}`)
            }
          }
        }

        // Времена должны идти по возрастанию
        const minutes = times
          .filter((t) => TIME_RE.test(t))
          .map((t) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
          })

        for (let i = 1; i < minutes.length; i++) {
          if (minutes[i] < minutes[i - 1]) {
            errors.push(
              `Времена не по возрастанию в ${dir}/${day}/${stop}: ${times[i - 1]} > ${times[i]}`,
            )
            break
          }
        }
      }
    }
  }

  // Если передано текущее расписание, проверяем порог изменений
  if (current && errors.length === 0) {
    const changeRatio = computeChangeRatio(current, schedule)
    if (changeRatio > changeThreshold) {
      errors.push(
        `Подозрительно много изменений: ${Math.round(changeRatio * 100)}% рейсов изменилось (порог ${Math.round(changeThreshold * 100)}%). Требуется подтверждение.`,
      )
    }
  }

  return { ok: errors.length === 0, errors }
}

function computeChangeRatio(before: ISchedule, after: ISchedule): number {
  let total = 0
  let changed = 0

  for (const dir of REQUIRED_DIRECTIONS) {
    const beforeDir = before[dir] || {}
    const afterDir = after[dir] || {}
    for (const day of ALL_DAYS) {
      const beforeDay = beforeDir[day] || {}
      const afterDay = afterDir[day] || {}
      const stops = new Set([...Object.keys(beforeDay), ...Object.keys(afterDay)])
      for (const stop of stops) {
        total++
        const b = JSON.stringify(beforeDay[stop] ?? [])
        const a = JSON.stringify(afterDay[stop] ?? [])
        if (b !== a) changed++
      }
    }
  }

  return total > 0 ? changed / total : 0
}
