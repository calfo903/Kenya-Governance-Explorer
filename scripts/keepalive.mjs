// Simple HTTP keep-alive pinger to prevent OOM garbage collection pauses
// from being misinterpreted as dead connections
import http from 'http';

const TARGET = 'http://127.0.0.1:3000/api/health';
const INTERVAL = 30_000; // ping every 30s

setInterval(() => {
  http.get(TARGET, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const mem = process.memoryUsage();
      console.log(`[keepalive] ${res.statusCode} | RSS ${(mem.rss/1024/1024).toFixed(0)}MB | Heap ${(mem.heapUsed/1024/1024).toFixed(0)}/${(mem.heapTotal/1024/1024).toFixed(0)}MB`);
    });
  }).on('error', (err) => {
    console.error(`[keepalive] ping failed: ${err.message}`);
  });
}, INTERVAL);

console.log(`[keepalive] pinging ${TARGET} every ${INTERVAL/1000}s`);
