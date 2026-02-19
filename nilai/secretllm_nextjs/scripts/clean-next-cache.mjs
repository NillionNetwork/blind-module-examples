import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const nextDir = resolve(process.cwd(), '.next');

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('Cleaned Next.js build cache (.next).');
} catch (error) {
  console.warn('Could not clean .next cache:', error);
}
