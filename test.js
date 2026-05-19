const fetch = require('node-fetch');

(async () => {
  try {
    const channelId = 'UC_x5XG1OV2P6uZZ5FSM9Ttw';
    console.log('1. Evaluating Channel...');
    await fetch('http://127.0.0.1:8080/api/evaluate-channel', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId, niche: 'Tech' })
    });

    console.log('2. Attempting PDF Download (Should fail 402)...');
    let res = await fetch(`http://127.0.0.1:8080/api/download-kit/${channelId}`);
    console.log(`Download status: ${res.status}`);

    console.log('3. Creating Payment Intent...');
    res = await fetch('http://127.0.0.1:8080/api/pay', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId })
    });
    const intent = await res.json();
    console.log('Payment Intent:', intent);

    console.log('4. Firing Webhook (Payment SUCCESS)...');
    res = await fetch('http://127.0.0.1:8080/webhook/payment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: intent.transactionId, status: 'SUCCESS' })
    });
    const webhookRes = await res.json();
    console.log('Webhook Response:', webhookRes);

    console.log('5. Attempting PDF Download Again (Should succeed 200)...');
    res = await fetch(`http://127.0.0.1:8080/api/download-kit/${channelId}`);
    console.log(`Final Download status: ${res.status}`);
  } catch (err) {
    console.error(err);
  }
})();
