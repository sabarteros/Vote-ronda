import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

const LOCK_RETRY = 12;
const LOCK_DELAY_MS = 100;

export async function withFileLock(targetPath, fn) {
  const lockPath = `${targetPath}.lock`;
  const absLock = path.resolve(lockPath);
  let locked = false;
  for (let attempt = 0; attempt < LOCK_RETRY; attempt++) {
    try {
      const fd = fsSync.openSync(absLock, 'wx'); // fail if exists
      fsSync.closeSync(fd);
      locked = true;
      break;
    } catch (err) {
      // exists, wait
      await new Promise((r) => setTimeout(r, LOCK_DELAY_MS));
    }
  }
  if (!locked) {
    throw new Error('Could not acquire file lock');
  }
  try {
    const result = await fn();
    return result;
  } finally {
    try {
      await fs.unlink(absLock).catch(()=>{});
    } catch {}
  }
}
