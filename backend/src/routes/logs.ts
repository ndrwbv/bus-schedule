import { Router, Request, Response } from 'express';
import { getDb } from '../services/db';

export const logsRouter = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/** Auth middleware: Bearer token or Basic auth (same as health) */
function adminAuth(req: Request, res: Response, next: () => void): void {
  // Bearer token
  const auth = req.headers.authorization;
  if (auth && auth === `Bearer ${ADMIN_TOKEN}`) {
    next();
    return;
  }

  // Also support ?token= query param for the viewer page
  if (req.query.token && req.query.token === ADMIN_TOKEN) {
    next();
    return;
  }

  // Basic auth fallback
  if (auth && auth.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString();
    const [, pass] = decoded.split(':');
    if (pass === ADMIN_TOKEN) {
      next();
      return;
    }
  }

  if (!ADMIN_TOKEN) {
    res.status(500).json({ error: 'ADMIN_TOKEN не настроен' });
    return;
  }

  res.set('WWW-Authenticate', 'Basic realm="Logs"');
  res.status(401).json({ error: 'Authentication required' });
}

/** GET /api/logs — JSON API for log entries */
logsRouter.get('/logs', adminAuth, (req: Request, res: Response) => {
  try {
    const db = getDb();

    const level = req.query.level as string | undefined;
    const status = req.query.status ? Number(req.query.status) : undefined;
    const since = req.query.since as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 100, 1000);
    const offset = Number(req.query.offset) || 0;
    const search = req.query.search as string | undefined;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (level) {
      conditions.push('level = ?');
      params.push(level);
    }

    if (status) {
      conditions.push('status_code = ?');
      params.push(status);
    }

    if (since) {
      // Support: "1h", "2d", "30m"
      const match = since.match(/^(\d+)([mhd])$/);
      if (match) {
        const [, num, unit] = match;
        const unitMap: Record<string, string> = { m: 'minutes', h: 'hours', d: 'days' };
        conditions.push(`created_at > datetime('now', ?)`);
        params.push(`-${num} ${unitMap[unit]}`);
      }
    }

    if (search) {
      conditions.push('(url LIKE ? OR error_message LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db.prepare(
      `SELECT COUNT(*) as total FROM request_logs ${where}`
    ).get(...params) as { total: number };

    const rows = db.prepare(
      `SELECT * FROM request_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    res.json({
      total: countRow.total,
      limit,
      offset,
      logs: rows,
    });
  } catch (err) {
    console.error('[logs] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/** GET /api/logs/stats — quick summary */
logsRouter.get('/logs/stats', adminAuth, (_req: Request, res: Response) => {
  try {
    const db = getDb();

    const total = db.prepare(
      `SELECT COUNT(*) as cnt FROM request_logs WHERE created_at > datetime('now', '-24 hours')`
    ).get() as { cnt: number };

    const errors = db.prepare(
      `SELECT COUNT(*) as cnt FROM request_logs WHERE level = 'error' AND created_at > datetime('now', '-24 hours')`
    ).get() as { cnt: number };

    const warns = db.prepare(
      `SELECT COUNT(*) as cnt FROM request_logs WHERE level = 'warn' AND created_at > datetime('now', '-24 hours')`
    ).get() as { cnt: number };

    const topErrors = db.prepare(
      `SELECT url, status_code, error_message, COUNT(*) as cnt
       FROM request_logs
       WHERE level = 'error' AND created_at > datetime('now', '-24 hours')
       GROUP BY url, status_code, error_message
       ORDER BY cnt DESC LIMIT 10`
    ).all();

    res.json({
      last24h: {
        total: total.cnt,
        errors: errors.cnt,
        warnings: warns.cnt,
      },
      topErrors,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

/** GET /api/logs/viewer — HTML log viewer page */
logsRouter.get('/logs/viewer', adminAuth, (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.send(VIEWER_HTML);
});

const VIEWER_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>severbus — Логи</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; background: #0d1117; color: #c9d1d9; padding: 16px; }
  h1 { font-size: 18px; margin-bottom: 12px; color: #58a6ff; }
  .controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; align-items: center; }
  .controls select, .controls input, .controls button {
    background: #161b22; border: 1px solid #30363d; color: #c9d1d9; padding: 6px 10px; border-radius: 6px; font-size: 13px;
  }
  .controls button { cursor: pointer; background: #21262d; }
  .controls button:hover { background: #30363d; }
  .controls button.active { background: #1f6feb; border-color: #1f6feb; }
  .stats { display: flex; gap: 16px; margin-bottom: 12px; font-size: 13px; }
  .stats .stat { padding: 6px 12px; border-radius: 6px; background: #161b22; border: 1px solid #30363d; }
  .stats .stat.errors { border-color: #f85149; }
  .stats .stat.warnings { border-color: #d29922; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px; background: #161b22; border-bottom: 1px solid #30363d; color: #8b949e; font-weight: 600; position: sticky; top: 0; }
  td { padding: 6px 8px; border-bottom: 1px solid #21262d; vertical-align: top; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  tr:hover td { background: #161b22; }
  .level-error { color: #f85149; font-weight: 600; }
  .level-warn { color: #d29922; font-weight: 600; }
  .level-info { color: #3fb950; }
  .status-5xx { color: #f85149; font-weight: 600; }
  .status-4xx { color: #d29922; }
  .error-detail { white-space: pre-wrap; word-break: break-all; max-width: 600px; font-size: 11px; color: #f85149; padding: 8px; background: #1c1118; border-radius: 4px; margin-top: 4px; }
  .expandable { cursor: pointer; }
  .expandable:hover { text-decoration: underline; }
  .footer { margin-top: 12px; font-size: 12px; color: #484f58; display: flex; justify-content: space-between; }
  .pagination { display: flex; gap: 8px; }
  #autoRefreshIndicator { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-left: 6px; }
  #autoRefreshIndicator.on { background: #3fb950; }
  #autoRefreshIndicator.off { background: #484f58; }
</style>
</head>
<body>
<h1>📋 Логи сервера <span id="autoRefreshIndicator" class="on"></span></h1>

<div class="stats" id="stats"></div>

<div class="controls">
  <select id="levelFilter">
    <option value="">Все уровни</option>
    <option value="error">error</option>
    <option value="warn">warn</option>
    <option value="info">info</option>
  </select>
  <select id="sinceFilter">
    <option value="1h">1 час</option>
    <option value="6h">6 часов</option>
    <option value="24h" selected>24 часа</option>
    <option value="3d">3 дня</option>
    <option value="7d">7 дней</option>
  </select>
  <input type="text" id="searchFilter" placeholder="Поиск по URL или ошибке..." style="width:220px">
  <button onclick="loadLogs()">Обновить</button>
  <button id="autoBtn" class="active" onclick="toggleAuto()">Авто 10с</button>
</div>

<table>
  <thead>
    <tr>
      <th>Время</th>
      <th>Уровень</th>
      <th>Метод</th>
      <th>URL</th>
      <th>Статус</th>
      <th>Время (мс)</th>
      <th>Ошибка</th>
    </tr>
  </thead>
  <tbody id="logsBody"></tbody>
</table>

<div class="footer">
  <span id="totalInfo"></span>
  <div class="pagination">
    <button id="prevBtn" onclick="prevPage()">← Назад</button>
    <button id="nextBtn" onclick="nextPage()">Вперёд →</button>
  </div>
</div>

<script>
const TOKEN = new URLSearchParams(location.search).get('token') || '';
const LIMIT = 100;
let currentOffset = 0;
let autoRefresh = true;
let autoTimer = null;

function apiUrl(path, params = {}) {
  const url = new URL(path, location.origin);
  if (TOKEN) url.searchParams.set('token', TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  return url.toString();
}

async function loadStats() {
  try {
    const res = await fetch(apiUrl('/api/logs/stats'));
    const data = await res.json();
    document.getElementById('stats').innerHTML =
      '<div class="stat">Запросов (24ч): <b>' + data.last24h.total + '</b></div>' +
      '<div class="stat errors">Ошибок: <b>' + data.last24h.errors + '</b></div>' +
      '<div class="stat warnings">Предупреждений: <b>' + data.last24h.warnings + '</b></div>';
  } catch {}
}

async function loadLogs() {
  const level = document.getElementById('levelFilter').value;
  const since = document.getElementById('sinceFilter').value;
  const search = document.getElementById('searchFilter').value;

  try {
    const res = await fetch(apiUrl('/api/logs', { level, since, search, limit: LIMIT, offset: currentOffset }));
    const data = await res.json();

    const tbody = document.getElementById('logsBody');
    tbody.innerHTML = data.logs.map(log => {
      const time = new Date(log.created_at + 'Z').toLocaleString('ru-RU');
      const levelClass = 'level-' + log.level;
      const statusClass = log.status_code >= 500 ? 'status-5xx' : log.status_code >= 400 ? 'status-4xx' : '';
      const errorHtml = log.error_message
        ? '<span class="expandable" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\\'none\\'?\\'block\\':\\'none\\'">' + escHtml(log.error_message.substring(0, 80)) + '</span><div class="error-detail" style="display:none">' + escHtml((log.error_message || '') + '\\n\\n' + (log.error_stack || '')) + '</div>'
        : '';
      return '<tr>' +
        '<td>' + time + '</td>' +
        '<td class="' + levelClass + '">' + log.level + '</td>' +
        '<td>' + (log.method || '') + '</td>' +
        '<td title="' + escAttr(log.url || '') + '">' + escHtml(log.url || '') + '</td>' +
        '<td class="' + statusClass + '">' + (log.status_code || '') + '</td>' +
        '<td>' + (log.duration_ms ?? '') + '</td>' +
        '<td>' + errorHtml + '</td>' +
        '</tr>';
    }).join('');

    document.getElementById('totalInfo').textContent = 'Показано ' + data.logs.length + ' из ' + data.total;
    document.getElementById('prevBtn').disabled = currentOffset === 0;
    document.getElementById('nextBtn').disabled = currentOffset + LIMIT >= data.total;
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function nextPage() { currentOffset += LIMIT; loadLogs(); }
function prevPage() { currentOffset = Math.max(0, currentOffset - LIMIT); loadLogs(); }
function toggleAuto() {
  autoRefresh = !autoRefresh;
  document.getElementById('autoBtn').classList.toggle('active', autoRefresh);
  document.getElementById('autoRefreshIndicator').className = autoRefresh ? 'on' : 'off';
  if (autoRefresh) startAuto(); else stopAuto();
}
function startAuto() { stopAuto(); autoTimer = setInterval(() => { loadLogs(); loadStats(); }, 10000); }
function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

// Init
loadStats();
loadLogs();
if (autoRefresh) startAuto();

document.getElementById('levelFilter').addEventListener('change', () => { currentOffset = 0; loadLogs(); });
document.getElementById('sinceFilter').addEventListener('change', () => { currentOffset = 0; loadLogs(); });
let searchTimeout;
document.getElementById('searchFilter').addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { currentOffset = 0; loadLogs(); }, 300);
});
</script>
</body>
</html>`;
