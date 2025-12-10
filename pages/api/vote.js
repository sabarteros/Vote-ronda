import path from 'path';
import fs from 'fs/promises';
import { withFileLock } from '../../lib/fileLock';

function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return header.split(';').map(v => v.split('=')).reduce((acc,[k,...rest])=>{
    acc[k.trim()] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const cookies = parseCookies(req);
  const phone = cookies.phone;
  if (!phone) return res.status(401).json({ error: 'Not authenticated' });
  const { choice } = req.body || {};
  if (!choice || typeof choice !== 'string') return res.status(400).json({ error: 'Choice required' });

  const votesPath = path.join(process.cwd(), 'public', 'votes.json');

  try {
    const result = await withFileLock(votesPath, async () => {
      let dataText = '[]';
      try {
        dataText = await fs.readFile(votesPath, 'utf8');
      } catch (e) {
        await fs.writeFile(votesPath, '[]', 'utf8');
        dataText = '[]';
      }
      let votes = [];
      try { votes = JSON.parse(dataText || '[]'); } catch (e) { votes = []; }
      if (votes.find(v => v.phone === phone)) {
        return { already: true };
      }
      const entry = { phone, choice, ts: new Date().toISOString() };
      votes.push(entry);
      await fs.writeFile(votesPath, JSON.stringify(votes, null, 2), 'utf8');
      return { added: entry };
    });
    if (result.already) return res.status(409).json({ error: 'Already voted' });
    return res.status(200).json({ ok: true, vote: result.added });
  } catch (err) {
    console.error('vote error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
