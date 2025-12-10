import fs from 'fs/promises';
import path from 'path';

function normalize(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d]/g, '');
}

/**
 * Get allowed phones from:
 * 1) process.env.ALLOWED_PHONES (preferred)
 *    - Accepts JSON array string OR newline/comma/semicolon-separated list
 * 2) fallback to data/allowed.json (NOT public/)
 *
 * Returns array of normalized phone strings.
 */
export async function getAllowedPhones() {
  const env = process.env.ALLOWED_PHONES;
  if (env && env.trim() !== '') {
    try {
      const parsed = JSON.parse(env);
      if (Array.isArray(parsed)) {
        return parsed.map(normalize).filter(Boolean);
      }
    } catch (e) {
      // ignore JSON parse error and try split
    }
    const parts = env.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean);
    return parts.map(normalize).filter(Boolean);
  }

  // Fallback to data/allowed.json (non-public)
  try {
    const p = path.join(process.cwd(), 'data', 'allowed.json');
    const txt = await fs.readFile(p, 'utf8');
    const arr = JSON.parse(txt);
    if (Array.isArray(arr)) {
      return arr.map(normalize).filter(Boolean);
    }
  } catch (err) {
    console.warn('getAllowedPhones: no env ALLOWED_PHONES and failed to read data/allowed.json', err?.message || err);
  }

  return [];
}
