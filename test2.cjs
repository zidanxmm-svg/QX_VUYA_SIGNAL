const text = "1. 14:41 USD/COP OTC DOWN\n2. 14:46 USD/COP OTC UP";
const http = require('http');
const req = http.request({ hostname: '127.0.0.1', port: 3000, path: '/api/future-signals/upload', method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
  let data = '';
  res.on('data', chunk => data+=chunk);
  res.on('end', () => console.log(data));
});
req.write(JSON.stringify({ text }));
req.end();
