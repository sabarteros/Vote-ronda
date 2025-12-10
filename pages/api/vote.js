import { redisCommand } from '../../lib/upstash.js';

function jsonResponse(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

// sanitize and limit length to avoid abuse
function sanitizeSegment(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[^A-Za-z0-9_\-:.]/g, '_').slice(0, 200);
}

export default async function handler(req, res) {
  try {
    // Debug info for troubleshooting (remove or route to logger in production)
    // console.info('Content-Type:', req.headers['content-type']);
    // console.info('Raw body type:', typeof req.body, 'body:', req.body);

    let body = req.body || {};

    // Fallback: sometimes req.body arrives as a JSON string (missing body parsing upstream)
    if (typeof body === 'string' && body.trim()) {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // If not JSON, try urlencoded parsing
        const parsed = {};
        body.split('&').forEach((pair) => {
          const [k, v] = pair.split('=');
          if (k) parsed[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
        body = parsed;
      }
    }

    if (req.method === 'POST') {
      const { id, option } = body || {};
      let { delta } = body || {};

      if (!id || typeof id !== 'string' || !option || typeof option !== 'string') {
        return jsonResponse(res, 400, { error: 'Invalid payload. Required: id (string), option (string).' });
      }

      // default delta = +1, allow negative to decrement (bounded)
      if (delta === undefined) delta = 1;
      if (typeof delta === 'string' && /^\-?\d+$/.test(delta)) delta = Number(delta);
      if (!Number.isInteger(delta) || Math.abs(delta) > 1000) {
        return jsonResponse(res, 400, { error: 'delta must be integer and between -1000 and 1000' });
      }

      const safeId = sanitizeSegment(id);
      const safeOption = sanitizeSegment(option);
      const key = `vote:${safeId}:${safeOption}`;

      // Atomic increment on Upstash via Redis INCRBY
      const result = await redisCommand(['INCRBY', key, String(delta)]);
      const count = Number(result || 0);

      return jsonResponse(res, 200, { key, count });
    }

    if (req.method === 'GET') {
      const key = (req.query.key || '').toString();
      if (!key) return jsonResponse(res, 400, { error: 'Provide ?key=vote:<id>:<option>' });

      const result = await redisCommand(['GET', key]);
      const count = Number(result || 0);
      return jsonResponse(res, 200, { key, count });
    }

    res.setHeader('Allow', 'GET,POST');
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('vote error', err && (err.stack || err.message || err));
    return jsonResponse(res, 503, { error: 'Service unavailable', details: err && err.message });
  }
}
