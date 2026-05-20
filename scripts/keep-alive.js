/**
 * Zero-Dependency Keep-Alive Script for SponsorScout Backend
 * 
 * Usage:
 *   1. Run once:
 *      node scripts/keep-alive.js
 * 
 *   2. Run in a loop (e.g. every 10 minutes):
 *      node scripts/keep-alive.js --loop
 * 
 * Environment variables:
 *   - BACKEND_URL: The URL to ping (default: http://localhost:8080)
 *   - PING_INTERVAL_MINUTES: Interval in minutes for loop mode (default: 10)
 */

const http = require('http');
const https = require('https');

// Read config from env or command line
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
const loopMode = process.argv.includes('--loop');
const intervalMinutes = parseInt(process.env.PING_INTERVAL_MINUTES || '10', 10);

console.log(`[Keep-Alive] Configured backend URL: ${backendUrl}`);

function pingBackend() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Sending keep-awake ping to ${backendUrl}...`);

  try {
    const parsedUrl = new URL(backendUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(backendUrl, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`[${timestamp}] Success: Backend is awake! Status: ${res.statusCode}`);
          console.log(`[${timestamp}] Response: ${data.trim().slice(0, 100)}`);
        } else {
          console.error(`[${timestamp}] Warning: Backend returned status ${res.statusCode}`);
        }
      });
    });

    req.on('timeout', () => {
      console.error(`[${timestamp}] Error: Ping request timed out (10s limit)`);
      req.destroy();
    });

    req.on('error', (err) => {
      console.error(`[${timestamp}] Error pinging backend:`, err.message);
    });

  } catch (err) {
    console.error(`[${timestamp}] Configuration Error: Invalid URL "${backendUrl}"`);
    if (!loopMode) {
      process.exit(1);
    }
  }
}

// Execution flow
if (loopMode) {
  console.log(`[Keep-Alive] Starting loop mode. Ping interval: ${intervalMinutes} minutes.`);
  // Run once immediately
  pingBackend();
  // Schedule subsequent pings
  setInterval(pingBackend, intervalMinutes * 60 * 1000);
} else {
  // One-shot run
  pingBackend();
}
