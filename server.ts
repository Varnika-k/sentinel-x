import 'dotenv/config';
import { webcrypto } from 'node:crypto';

// Polyfill globalThis.crypto for legacy Node versions to prevent ReferenceError: crypto is not defined
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true
  });
}

import { sentinelBackend } from './backend/app/main';
import { logger } from './backend/app/core/logger';

sentinelBackend.start().catch(err => {
  logger.error('CRITICAL: Backend startup failed', err);
  process.exit(1);
});
