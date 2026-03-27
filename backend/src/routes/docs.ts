import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'SeverBus API',
    version: '1.0.0',
    description: 'Бэкенд сайта severbus.ru — расписание маршрута 112С (Томск — Северный парк)',
  },
  servers: [{ url: '/api', description: 'Current server' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Токен из ADMIN_TOKEN в .env. Генерация: `openssl rand -hex 32`',
      },
    },
    schemas: {
      ISchedule: {
        type: 'object',
        description: 'Расписание по направлениям, дням недели и остановкам',
        properties: {
          inSP: { $ref: '#/components/schemas/DirectionSchedule' },
          out:  { $ref: '#/components/schemas/DirectionSchedule' },
          inLB: { $ref: '#/components/schemas/DirectionSchedule' },
        },
        required: ['inSP', 'out', 'inLB'],
      },
      DirectionSchedule: {
        type: 'object',
        description: 'День недели (0=вс, 1=пн … 6=сб) → остановка → массив времён',
        additionalProperties: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: { type: 'string', example: '8:15' },
          },
        },
      },
      ScheduleMeta: {
        type: 'object',
        properties: {
          updatedAt:   { type: 'string', format: 'date-time' },
          parseMethod: { type: 'string', example: 'deterministic' },
          fileHash:    { type: 'string', example: 'a1b2c3d4' },
        },
      },
      ChangelogEntry: {
        type: 'object',
        properties: {
          id:          { type: 'integer' },
          createdAt:   { type: 'string', format: 'date-time' },
          summary:     { type: 'string', example: 'изменено 3 рейса' },
          parseMethod: { type: 'string' },
          diff: {
            type: 'object',
            properties: {
              added:   { type: 'array', items: { $ref: '#/components/schemas/DiffEntry' } },
              removed: { type: 'array', items: { $ref: '#/components/schemas/DiffEntry' } },
              changed: { type: 'array', items: { $ref: '#/components/schemas/DiffEntryChanged' } },
            },
          },
        },
      },
      DiffEntry: {
        type: 'object',
        properties: {
          direction: { type: 'string', enum: ['inSP', 'out', 'inLB'] },
          day:       { type: 'string', example: '1' },
          stop:      { type: 'string', example: 'Интернационалистов' },
          times:     { type: 'array', items: { type: 'string' } },
        },
      },
      DiffEntryChanged: {
        type: 'object',
        properties: {
          direction: { type: 'string', enum: ['inSP', 'out', 'inLB'] },
          day:       { type: 'string', example: '1' },
          stop:      { type: 'string' },
          before:    { type: 'array', items: { type: 'string' } },
          after:     { type: 'array', items: { type: 'string' } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error:   { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Healthcheck',
        responses: {
          '200': {
            description: 'Сервер жив',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:   { type: 'string', example: 'ok' },
                    uptime:   { type: 'integer', example: 3600 },
                    memoryMb: { type: 'integer', example: 128 },
                    db:       { type: 'string', example: 'ok' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/schedule': {
      get: {
        tags: ['Schedule'],
        summary: 'Получить активное расписание',
        description: 'Поддерживает условные запросы через `If-None-Match` (ETag = file_hash). Кэш 1 час.',
        parameters: [
          {
            in: 'header',
            name: 'If-None-Match',
            schema: { type: 'string' },
            description: 'ETag предыдущего ответа для получения 304',
          },
        ],
        responses: {
          '200': {
            description: 'Расписание с метаданными',
            headers: {
              ETag:          { schema: { type: 'string' } },
              'Cache-Control': { schema: { type: 'string' } },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    schedule: { $ref: '#/components/schemas/ISchedule' },
                    meta:     { $ref: '#/components/schemas/ScheduleMeta' },
                  },
                },
              },
            },
          },
          '304': { description: 'Расписание не изменилось (ETag совпал)' },
          '500': { description: 'Ошибка сервера', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/schedule/refresh': {
      post: {
        tags: ['Schedule'],
        summary: 'Запустить парсинг вручную',
        description: [
          'Запускает полный пайплайн: скрейпинг → скачивание → парсинг → валидация → сохранение.',
          '',
          '**Варианты вызова:**',
          '- Без body — скрейпит сайт перевозчика и скачивает последний файл',
          '- `{ "url": "..." }` — скачивает файл напрямую с Cloud Mail.ru (пропускает скрейпинг)',
          '- `{ "force": true }` — перепарсить даже если хеш файла не изменился',
          '- Multipart `file` — загрузить `.docx` напрямую (пропускает скачивание)',
        ].join('\n'),
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url:   { type: 'string', example: 'https://cloud.mail.ru/public/XXXX/yyyy' },
                  force: { type: 'boolean', default: false },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary', description: '.docx файл с расписанием' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Результат парсинга',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:         { type: 'string', enum: ['updated', 'no_changes'] },
                    parseMethod:    { type: 'string' },
                    fileHash:       { type: 'string' },
                    stopsCount:     { type: 'integer' },
                    tripsCount:     { type: 'integer' },
                    changesSummary: { type: 'string' },
                    durationMs:     { type: 'integer' },
                    message:        { type: 'string', description: 'Только при status=no_changes' },
                  },
                },
              },
            },
          },
          '401': { description: 'Неверный токен', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '422': {
            description: 'Валидация не прошла',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error:      { type: 'string' },
                    message:    { type: 'string' },
                    details:    { type: 'string' },
                    errorStage: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/schedule/changelog': {
      get: {
        tags: ['Schedule'],
        summary: 'История изменений расписания',
        parameters: [
          { in: 'query', name: 'limit',  schema: { type: 'integer', default: 10, maximum: 50 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          '200': {
            description: 'Список изменений',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items:  { type: 'array', items: { $ref: '#/components/schemas/ChangelogEntry' } },
                    total:  { type: 'integer' },
                    limit:  { type: 'integer' },
                    offset: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export const docsRouter = Router()

docsRouter.use('/docs', swaggerUi.serve)
docsRouter.get('/docs', swaggerUi.setup(spec, {
  customSiteTitle: 'SeverBus API Docs',
}))
