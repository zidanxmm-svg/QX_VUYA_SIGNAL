const http = require('http');
const req = http.request({ hostname: '127.0.0.1', port: 3000, path: '/api/future-signals/upload', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
  res.on('data', d => process.stdout.write(d));
});
req.write(JSON.stringify({ text: "14:41 EUR/USD-OTC DOWN" }));
req.end();
