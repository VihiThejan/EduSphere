/**
 * bootstrap.ts — MUST be the process entry point.
 *
 * Node 20 on Windows uses OpenSSL 3, which sends a TLS 1.3 ClientHello that
 * MongoDB Atlas rejects with SSL alert 80 (internal_error).
 *
 * Setting tls.DEFAULT_MAX_VERSION here — BEFORE any other import — ensures
 * every subsequent TLS socket (including the mongoose connection) is capped
 * at TLS 1.2, which Atlas handles without issue.
 *
 * This avoids the Windows quoting problem with NODE_OPTIONS="--tls-max-v1.2"
 * and the race condition of setting these values inside database.ts.
 */

// ⚠️  These two lines MUST come before any other imports.
import tls from 'tls';
tls.DEFAULT_MAX_VERSION = 'TLSv1.2';
tls.DEFAULT_MIN_VERSION = 'TLSv1.2';

// Now safe to start the real server — all TLS sockets will use TLS 1.2.
await import('./server.js');
