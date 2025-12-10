// Lightweight Upstash Redis REST wrapper for Vercel serverless
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  throw new Error('Environment variables UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
}

const DEFAULT_RETRIES = 2;
const DEFAULT_BACKOFF_MS = 150;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Execute an Upstash Redis REST command.
 * cmdArray: e.g. ['INCRBY', 'vote:poll-1:A', '1']
 * returns Promise<any>
 */
async function redisCommand(cmdArray, { retries = DEFAULT_RETRIES } = {}) {
  if (!Array.isArray(cmdArray) || cmdArray.length === 0) {
    throw new TypeError('cmdArray must be a non-empty array');
  }

  let attempt = 0;
  let lastErr = null;

  while (attempt <= retries) {
    try {
      const res = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
        body: JSON.stringify(cmdArray),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data && data.error ? data.error : `Upstash responded ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      // Upstash returns { result: ... } usually
      return data && Object.prototype.hasOwnProperty.call(data, 'result') ? data.result : data;
    } catch (err) {
      lastErr = err;
      attempt += 1;
      if (attempt > retries) break;
      const backoff = DEFAULT_BACKOFF_MS * attempt + Math.floor(Math.random() * 50);
      await sleep(backoff);
    }
  }

  const e = new Error('Upstash Redis command failed: ' + (lastErr && lastErr.message));
  e.cause = lastErr;
  throw e;
}

module.exports = { redisCommand };
