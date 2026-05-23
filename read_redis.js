const Redis = require('ioredis');

const redis = new Redis('redis://127.0.0.1:6379');

(async () => {
  try {
    console.log('Connecting to Redis...');
    const keys = await redis.keys('*');
    console.log('Keys in Redis:', keys);
    
    for (const key of keys) {
      const val = await redis.get(key);
      console.log(`Key: ${key}`);
      try {
        const obj = JSON.parse(val);
        console.log('Value (JSON):', JSON.stringify(obj, null, 2));
      } catch (e) {
        console.log('Value (Raw):', val);
      }
      console.log('-----------------------------');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    redis.disconnect();
  }
})();
