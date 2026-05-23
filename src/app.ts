import Fastify from 'fastify';
import dotenv from 'dotenv';
import './config/setup'; // Initialize external clients (Redis, YouTube)

dotenv.config();

// Build primary Fastify server instantiation with native logger enabled
const app = Fastify({
  logger: true,
});

import valuationRoutes from './routes/valuation.route';
import downloadRoutes from './routes/download.route';
import paymentRoutes from './routes/payment.route';
import instagramValuationRoutes from './routes/instagram-valuation.route';
import instagramDownloadRoutes from './routes/instagram-download.route';
import cors from '@fastify/cors';

// Register a simple health-check GET endpoint
app.get('/', async (request, reply) => {
  return { status: 'ok', message: 'Fastify server is healthy' };
});

app.register(cors, { origin: '*' });
app.register(valuationRoutes);
app.register(downloadRoutes);
app.register(paymentRoutes);
app.register(instagramValuationRoutes);
app.register(instagramDownloadRoutes);


const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080', 10);
    
    // Listen gracefully on 0.0.0.0 for local network testing
    await app.listen({ port, host: '0.0.0.0' });
    
    app.log.info(`Server is listening on http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Only listen locally if not running in Vercel
if (!process.env.VERCEL) {
  start();
}

export default app;
