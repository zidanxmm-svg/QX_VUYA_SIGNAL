const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://127.0.0.1:3000/api/future-signals/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: "14:41 EUR/USD-OTC DOWN" })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
