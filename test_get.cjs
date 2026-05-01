const http = require('http');
http.get('http://127.0.0.1:3000/api/future-signals/batches', (res) => {
  let d = '';
  res.on('data', chunk => d+=chunk);
  res.on('end', () => console.log(d));
});
